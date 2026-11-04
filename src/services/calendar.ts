import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { formatDate } from "./project_overview";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type EventType =
    | "project"
    | "task"
    | "meeting"
    | "site_visit"
    | "deadline";

export type CalendarEventParticipantIds = {
    /** Team members (profile ids). */
    participant_ids: string[];
    client_ids: string[];
    supplier_ids: string[];
};

export type CalendarEvent = {
    event_id: string;
    title: string;
    description: string | null;
    event_type: EventType;
    start_at: string;
    end_at: string | null;
    all_day: boolean;
    location: string | null;

    project_id: string | null;
    task_id: string | null;
    client_id: string | null;

    created_by: string;
    created_at: string;
    updated_at: string;

    participant_ids?: string[];
    client_ids?: string[];
    supplier_ids?: string[];

    project?: {
        project_id: string;
        title: string;
        start_date: string | null;
        end_date: string | null;
    } | null;

    task?: {
        task_id: string;
        title: string;
        start_date: string | null;
        due_date: string | null;
    } | null;
    client?: {
        client_id: string;
        name: string;
    } | null;

    creator?: {
        profile_id: string;
        first_name: string;
        last_name: string;
    } | null;
};

export type CreateCalendarEventInput = {
    title: string;
    description?: string | null;
    event_type: EventType;
    start_at: string;
    end_at?: string | null;
    all_day?: boolean;
    location?: string | null;
    project_id?: string | null;
    task_id?: string | null;
    client_id?: string | null;
};

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;

export type CalendarParticipant = {
    profile_id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const EVENT_COLUMNS = `
    event_id,
    title,
    description,
    event_type,
    start_at,
    end_at,
    all_day,
    location,
    project_id,
    task_id,
    client_id,
    created_by,
    created_at,
    updated_at
`;

function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "object" && error !== null) {
        const value = error as Record<string, unknown>;

        return (
            String(value.message ?? "") ||
            String(value.details ?? "") ||
            String(value.hint ?? "") ||
            String(value.code ?? "") ||
            JSON.stringify(value)
        );
    }

    return String(error);
}

function normalizeRelation<T>(
    relation: T | T[] | null | undefined,
): T | null {
    if (Array.isArray(relation)) {
        return relation[0] ?? null;
    }

    return relation ?? null;
}

function uniqueIds(values: (string | null | undefined)[]): string[] {
    return [
        ...new Set(
            values.filter((value): value is string => Boolean(value)),
        ),
    ];
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function getSupabase(): Promise<SupabaseServerClient> {
    return createClient(await cookies());
}

/**
 * Get the currently authenticated profile id.
 */
async function getCurrentProfileId() {
    const supabase = await getSupabase();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw new Error(
            `Erro ao obter utilizador autenticado: ${authError.message}`,
        );
    }

    if (!user) {
        throw new Error("Utilizador não autenticado.");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("profile_id")
        .eq("profile_id", user.id)
        .maybeSingle();

    if (profileError) {
        throw new Error(`Erro ao obter perfil: ${profileError.message}`);
    }

    if (!profile) {
        throw new Error("Perfil do utilizador não encontrado.");
    }

    return profile.profile_id;
}

async function getCurrentCalendarAccess(supabase: SupabaseServerClient) {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Utilizador não autenticado.");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("profile_id, role_id")
        .eq("profile_id", user.id)
        .maybeSingle();

    if (profileError || !profile) {
        throw new Error("Não foi possível validar o perfil do utilizador.");
    }

    return {
        profileId: profile.profile_id,
        isAdmin: profile.role_id === 1,
    };
}

/* -------------------------------------------------------------------------- */
/* Read                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Get calendar events.
 *
 * The base query only reads calendar_events. Related project / task /
 * client / profile / participant data is fetched separately so a
 * relationship problem cannot break the whole calendar.
 */

export async function getCalendarEvents(options?: {
    startAt?: string;
    endAt?: string;
    eventType?: EventType;
    projectId?: string;
}) {
    const supabase = await getSupabase();

    const { profileId, isAdmin } =
        await getCurrentCalendarAccess(supabase);

    let participantEventIds: string[] = [];
    let memberProjectIds: string[] = [];

    if (!isAdmin) {
        const [
            participationsResult,
            membershipsResult,
        ] = await Promise.all([
            supabase
                .from("calendar_event_participants")
                .select("event_id")
                .eq("profile_id", profileId),

            supabase
                .from("project_members")
                .select("project_id")
                .eq("profile_id", profileId),
        ]);

        if (participationsResult.error) {
            throw new Error(
                `Erro ao carregar participações: ${participationsResult.error.message}`,
            );
        }

        if (membershipsResult.error) {
            throw new Error(
                `Erro ao carregar projectos atribuídos: ${membershipsResult.error.message}`,
            );
        }

        participantEventIds = uniqueIds(
            (participationsResult.data ?? []).map(
                (item) => item.event_id,
            ),
        );

        memberProjectIds = uniqueIds(
            (membershipsResult.data ?? []).map(
                (item) => item.project_id,
            ),
        );
    }

    try {
        let query = supabase
            .from("calendar_events")
            .select(EVENT_COLUMNS)
            .order("start_at", { ascending: true });

        // Date filters
        if (options?.startAt) {
            query = query.gte("start_at", options.startAt);
        }

        if (options?.endAt) {
            query = query.lte("start_at", options.endAt);
        }

        // Event type filter
        if (options?.eventType) {
            query = query.eq("event_type", options.eventType);
        }

        // Project filter
        if (options?.projectId) {
            query = query.eq("project_id", options.projectId);
        }

        /**
         * Non-admin visibility:
         *
         * 1. Events created by the current user.
         * 2. Events where the current user is a participant.
         * 3. Events associated with projects where the user
         *    is a member through project_members.
         */
        if (!isAdmin) {
            const conditions = [
                `created_by.eq.${profileId}`,
            ];

            if (participantEventIds.length > 0) {
                conditions.push(
                    `event_id.in.(${participantEventIds.join(",")})`,
                );
            }

            if (memberProjectIds.length > 0) {
                conditions.push(
                    `project_id.in.(${memberProjectIds.join(",")})`,
                );
            }

            query = query.or(conditions.join(","));
        }

        const { data: events, error } = await query;

        if (error) {
            console.error("getCalendarEvents database error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });

            throw new Error(
                `Erro ao carregar eventos do calendário: ${error.message}`,
            );
        }

        if (!events?.length) {
            return [];
        }

        // Collect relationship IDs
        const projectIds = uniqueIds(
            events.map((event) => event.project_id),
        );

        const taskIds = uniqueIds(
            events.map((event) => event.task_id),
        );

        const clientIds = uniqueIds(
            events.map((event) => event.client_id),
        );

        const creatorIds = uniqueIds(
            events.map((event) => event.created_by),
        );

        const eventIds = events.map((event) => event.event_id);

        // Fetch related data
        const [
            projectsResult,
            tasksResult,
            clientsResult,
            profilesResult,
            participantsResult,
        ] = await Promise.all([
            projectIds.length > 0
                ? supabase
                    .from("projects")
                    .select(`
                        project_id,
                        project_name:title,
                        start_date,
                        end_date
                    `)
                    .in("project_id", projectIds)
                : Promise.resolve({ data: [], error: null }),

            taskIds.length > 0
                ? supabase
                    .from("tasks")
                    .select(`
                        task_id,
                        title,
                        start_date,
                        due_date
                    `)
                    .in("task_id", taskIds)
                : Promise.resolve({ data: [], error: null }),

            clientIds.length > 0
                ? supabase
                    .from("clients")
                    .select("client_id, name")
                    .in("client_id", clientIds)
                : Promise.resolve({ data: [], error: null }),

            creatorIds.length > 0
                ? supabase
                    .from("profiles")
                    .select("profile_id, first_name, last_name")
                    .in("profile_id", creatorIds)
                : Promise.resolve({ data: [], error: null }),

            supabase
                .from("calendar_event_participants")
                .select("event_id, profile_id, client_id, supplier_id")
                .in("event_id", eventIds),
        ]);

        // Log relationship errors without breaking the main query
        if (projectsResult.error) {
            console.error(
                "Calendar projects error:",
                projectsResult.error,
            );
        }

        if (tasksResult.error) {
            console.error(
                "Calendar tasks error:",
                tasksResult.error,
            );
        }

        if (clientsResult.error) {
            console.error(
                "Calendar clients error:",
                clientsResult.error,
            );
        }

        if (profilesResult.error) {
            console.error(
                "Calendar profiles error:",
                profilesResult.error,
            );
        }

        if (participantsResult.error) {
            console.error(
                "Calendar participants error:",
                participantsResult.error,
            );
        }

        // Build relationship maps
        const projectMap = new Map(
            (projectsResult.data ?? []).map((project) => [
                project.project_id,
                project,
            ]),
        );

        const taskMap = new Map(
            (tasksResult.data ?? []).map((task) => [
                task.task_id,
                task,
            ]),
        );

        const clientMap = new Map(
            (clientsResult.data ?? []).map((client) => [
                client.client_id,
                client,
            ]),
        );

        const profileMap = new Map(
            (profilesResult.data ?? []).map((profile) => [
                profile.profile_id,
                profile,
            ]),
        );

        // Group participants by event
        const participantsByEvent = new Map<
            string,
            CalendarEventParticipantIds
        >();

        for (const row of participantsResult.data ?? []) {
            const entry = participantsByEvent.get(row.event_id) ?? {
                participant_ids: [],
                client_ids: [],
                supplier_ids: [],
            };

            if (row.profile_id) {
                entry.participant_ids.push(row.profile_id);
            }

            if (row.client_id) {
                entry.client_ids.push(row.client_id);
            }

            if (row.supplier_id) {
                entry.supplier_ids.push(row.supplier_id);
            }

            participantsByEvent.set(row.event_id, entry);
        }

        // Return enriched calendar events
        return events.map((event) => {
            const participants = participantsByEvent.get(
                event.event_id,
            );

            return {
                ...event,

                event_type: event.event_type as EventType,

                project: event.project_id
                    ? projectMap.get(event.project_id) ?? null
                    : null,

                task: event.task_id
                    ? taskMap.get(event.task_id) ?? null
                    : null,

                client: event.client_id
                    ? clientMap.get(event.client_id) ?? null
                    : null,

                creator: event.created_by
                    ? profileMap.get(event.created_by) ?? null
                    : null,

                participant_ids:
                    participants?.participant_ids ?? [],

                client_ids:
                    participants?.client_ids ?? [],

                supplier_ids:
                    participants?.supplier_ids ?? [],
            };
        });
    } catch (error) {
        console.error(
            "getCalendarEvents error:",
            getErrorMessage(error),
        );

        throw error instanceof Error
            ? error
            : new Error(
                "Erro ao carregar eventos do calendário.",
            );
    }
}


/**
 * Get a single calendar event.
 */
export async function getCalendarEvent(eventId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("calendar_events")
        .select(EVENT_COLUMNS)
        .eq("event_id", eventId)
        .maybeSingle();

    if (error) {
        console.error("getCalendarEvent error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw new Error(`Erro ao carregar evento: ${error.message}`);
    }

    return data ?? null;
}

/* -------------------------------------------------------------------------- */
/* Create / update / delete                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Create a calendar event.
 * Participants are saved by the server action, not here.
 */
export async function createCalendarEvent(input: CreateCalendarEventInput) {
    const supabase = await getSupabase();

    if (!input.title?.trim()) {
        throw new Error("O título do evento é obrigatório.");
    }

    if (!input.start_at) {
        throw new Error("A data de início é obrigatória.");
    }

    if (
        input.end_at &&
        new Date(input.end_at) < new Date(input.start_at)
    ) {
        throw new Error(
            "A data de fim não pode ser anterior à data de início.",
        );
    }

    const profileId = await getCurrentProfileId();

    const { data, error } = await supabase
        .from("calendar_events")
        .insert({
            title: input.title.trim(),
            description: input.description ?? null,
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at ?? null,
            all_day: input.all_day ?? false,
            location: input.location?.trim() || null,
            project_id: input.project_id ?? null,
            task_id: input.task_id ?? null,
            client_id: input.client_id ?? null,
            created_by: profileId,
        })
        .select(EVENT_COLUMNS)
        .single();

    if (error) {
        console.error("createCalendarEvent error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw new Error(`Erro ao criar evento: ${error.message}`);
    }

    return data;
}

/**
 * Update a calendar event.
 * Participants are synchronized by the server action, not here.
 */
export async function updateCalendarEvent(
    eventId: string,
    input: UpdateCalendarEventInput,
) {
    const supabase = await getSupabase();

    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) {
        if (!input.title.trim()) {
            throw new Error("O título do evento é obrigatório.");
        }

        updateData.title = input.title.trim();
    }

    if (input.description !== undefined) {
        updateData.description = input.description ?? null;
    }

    if (input.event_type !== undefined) {
        updateData.event_type = input.event_type;
    }

    if (input.start_at !== undefined) {
        updateData.start_at = input.start_at;
    }

    if (input.end_at !== undefined) {
        updateData.end_at = input.end_at ?? null;
    }

    if (input.all_day !== undefined) {
        updateData.all_day = input.all_day;
    }

    if (input.location !== undefined) {
        updateData.location = input.location?.trim() || null;
    }

    if (input.project_id !== undefined) {
        updateData.project_id = input.project_id ?? null;
    }

    if (input.task_id !== undefined) {
        updateData.task_id = input.task_id ?? null;
    }

    if (input.client_id !== undefined) {
        updateData.client_id = input.client_id ?? null;
    }

    updateData.updated_at = new Date().toISOString();

    if (updateData.start_at && updateData.end_at) {
        if (
            new Date(String(updateData.end_at)) <
            new Date(String(updateData.start_at))
        ) {
            throw new Error(
                "A data de fim não pode ser anterior à data de início.",
            );
        }
    }

    const { data, error } = await supabase
        .from("calendar_events")
        .update(updateData)
        .eq("event_id", eventId)
        .select(EVENT_COLUMNS)
        .single();

    if (error) {
        console.error("updateCalendarEvent error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw new Error(`Erro ao atualizar evento: ${error.message}`);
    }

    return data;
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(eventId: string) {
    const supabase = await getSupabase();

    const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("event_id", eventId);

    if (error) {
        console.error("deleteCalendarEvent error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });

        throw new Error(`Erro ao eliminar evento: ${error.message}`);
    }

    return { success: true };
}

/* -------------------------------------------------------------------------- */
/* Participants                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Team members that can be invited to events.
 */
export async function getCalendarParticipants(): Promise<
    CalendarParticipant[]
> {
    const supabase = await getSupabase(); // was missing "await" before

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Sessão inválida. Inicie sessão novamente.");
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("profile_id, first_name, last_name, email, profile_picture")
        .order("first_name", { ascending: true });

    if (error) {
        console.error("getCalendarParticipants:", error);
        throw new Error("Não foi possível carregar os membros da equipa.");
    }

    return (data ?? []) as CalendarParticipant[];
}

/**
 * Team, client and supplier participants of one event.
 */
export async function getCalendarEventParticipants(
    eventId: string,
): Promise<CalendarEventParticipantIds> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("calendar_event_participants")
        .select("profile_id, client_id, supplier_id")
        .eq("event_id", eventId);

    if (error) {
        console.error("Erro ao carregar participantes do evento:", error);

        throw new Error(
            "Não foi possível carregar os participantes do evento.",
        );
    }

    const rows = data ?? [];

    return {
        participant_ids: uniqueIds(rows.map((row) => row.profile_id)),
        client_ids: uniqueIds(rows.map((row) => row.client_id)),
        supplier_ids: uniqueIds(rows.map((row) => row.supplier_id)),
    };
}

/**
 * Team member ids only. Kept so existing imports keep working.
 */
export async function getCalendarEventParticipantIds(
    eventId: string,
): Promise<string[]> {
    return (await getCalendarEventParticipants(eventId)).participant_ids;
}


export type CalendarRangeSource = "project" | "task" | "submission";

export type CalendarRangeRecord = {
    id: string;
    title: string;
    type: CalendarRangeSource;
    source: CalendarRangeSource;
    sourceId: string;
    startDate: string;
    endDate: string;
    projectId?: string;
    description?: string;
};

export async function getCalendarRangeEvents(): Promise<CalendarRangeRecord[]> {
    const supabase = await createClient(await cookies());

    const [projectsResult, tasksResult, submissionsResult] =
        await Promise.all([
            supabase
                .from("projects")
                .select(`
                    project_id,
                    title,
                    start_date,
                    end_date
                `)
                .not("start_date", "is", null)
                .order("start_date", { ascending: true }),

            supabase
                .from("tasks")
                .select(`
                    task_id,
                    project_id,
                    title,
                    description,
                    start_date,
                    due_date
                `)
                .or("start_date.not.is.null,due_date.not.is.null")
                .order("start_date", { ascending: true }),

            supabase
                .from("submissions")
                .select(`
                    submission_id,
                    project_id,
                    title,
                    description,
                    status,
                    type,
                    submitted_at,
                    due_date
                `)
                .order("submitted_at", { ascending: true }),
        ]);

    if (projectsResult.error) {
        throw new Error(
            `Failed to fetch calendar projects: ${projectsResult.error.message}`,
        );
    }

    if (tasksResult.error) {
        throw new Error(
            `Failed to fetch calendar tasks: ${tasksResult.error.message}`,
        );
    }

    if (submissionsResult.error) {
        throw new Error(
            `Failed to fetch calendar submissions: ${submissionsResult.error.message}`,
        );
    }

    const projects: CalendarRangeRecord[] = (
        projectsResult.data ?? []
    )
        .filter((project) => project.start_date || project.end_date)
        .map((project) => {
            const startDate = project.start_date ?? project.end_date!;
            const endDate = project.end_date ?? project.start_date!;

            return {
                id: `project-${project.project_id}`,
                title: project.title,
                type: "project",
                source: "project",
                sourceId: project.project_id,
                startDate,
                endDate,
                projectId: project.project_id,
            };
        });

    const tasks: CalendarRangeRecord[] = (tasksResult.data ?? [])
        .map((task): CalendarRangeRecord | null => {
            const startDate = task.start_date ?? task.due_date;
            const endDate = task.due_date ?? task.start_date;

            if (!startDate || !endDate) return null;

            return {
                id: `task-${task.task_id}`,
                title: task.title,
                type: "task",
                source: "task",
                sourceId: task.task_id,
                startDate,
                endDate,
                projectId: task.project_id ?? undefined,
                description: task.description ?? undefined,
            };
        })
        .filter((task): task is CalendarRangeRecord => task !== null);

    const submissions: CalendarRangeRecord[] = (
        submissionsResult.data ?? []
    ).map((submission) => {
        const startDate = formatDate(submission.submitted_at);
        const endDate = submission.due_date ?? startDate;

        return {
            id: `submission-${submission.submission_id}`,
            title: submission.title,
            type: "submission",
            source: "submission",
            sourceId: submission.submission_id,
            startDate,
            endDate,
            projectId: submission.project_id,
            description: submission.description ?? undefined,
        };
    });

    return [...projects, ...tasks, ...submissions];
}