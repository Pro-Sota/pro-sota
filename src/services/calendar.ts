import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

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
        project_name: string;
    } | null;

    task?: {
        task_id: string;
        title: string;
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

    if (!isAdmin) {
        const { data: participations, error: participantError } =
            await supabase
                .from("calendar_event_participants")
                .select("event_id")
                .eq("profile_id", profileId);

        if (participantError) {
            throw new Error(
                `Erro ao carregar participações: ${participantError.message}`,
            );
        }

        participantEventIds = uniqueIds(
            (participations ?? []).map((item) => item.event_id),
        );
    }

    try {
        let query = supabase
            .from("calendar_events")
            .select(EVENT_COLUMNS)
            .order("start_at", { ascending: true });

        if (options?.startAt) {
            query = query.gte("start_at", options.startAt);
        }

        if (options?.endAt) {
            query = query.lte("start_at", options.endAt);
        }

        if (options?.eventType) {
            query = query.eq("event_type", options.eventType);
        }

        if (options?.projectId) {
            query = query.eq("project_id", options.projectId);
        }

        // Non-admins see events they created or were invited to as team
        // members. Clients and suppliers are not app users.
        if (!isAdmin) {
            if (participantEventIds.length > 0) {
                const eventIds = participantEventIds
                    .map((id) => `"${id}"`)
                    .join(",");

                query = query.or(
                    `created_by.eq.${profileId},event_id.in.(${eventIds})`,
                );
            } else {
                query = query.eq("created_by", profileId);
            }
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

        if (!events || events.length === 0) {
            return [];
        }

        const projectIds = uniqueIds(events.map((e) => e.project_id));
        const taskIds = uniqueIds(events.map((e) => e.task_id));
        const clientIds = uniqueIds(events.map((e) => e.client_id));
        const profileIds = uniqueIds(events.map((e) => e.created_by));
        const eventIdList = events.map((e) => e.event_id);

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
                    .select("project_id, project_name")
                    .in("project_id", projectIds)
                : Promise.resolve({ data: [], error: null }),

            taskIds.length > 0
                ? supabase
                    .from("tasks")
                    .select("task_id, title")
                    .in("task_id", taskIds)
                : Promise.resolve({ data: [], error: null }),

            clientIds.length > 0
                ? supabase
                    .from("clients")
                    .select("client_id, name")
                    .in("client_id", clientIds)
                : Promise.resolve({ data: [], error: null }),

            profileIds.length > 0
                ? supabase
                    .from("profiles")
                    .select("profile_id, first_name, last_name")
                    .in("profile_id", profileIds)
                : Promise.resolve({ data: [], error: null }),

            supabase
                .from("calendar_event_participants")
                .select("event_id, profile_id, client_id, supplier_id")
                .in("event_id", eventIdList),
        ]);

        if (projectsResult.error) {
            console.error("Calendar projects error:", projectsResult.error);
        }

        if (tasksResult.error) {
            console.error("Calendar tasks error:", tasksResult.error);
        }

        if (clientsResult.error) {
            console.error("Calendar clients error:", clientsResult.error);
        }

        if (profilesResult.error) {
            console.error("Calendar profiles error:", profilesResult.error);
        }

        if (participantsResult.error) {
            console.error(
                "Calendar participants error:",
                participantsResult.error,
            );
        }

        const projectMap = new Map(
            (projectsResult.data ?? []).map((p) => [p.project_id, p]),
        );
        const taskMap = new Map(
            (tasksResult.data ?? []).map((t) => [t.task_id, t]),
        );
        const clientMap = new Map(
            (clientsResult.data ?? []).map((c) => [c.client_id, c]),
        );
        const profileMap = new Map(
            (profilesResult.data ?? []).map((p) => [p.profile_id, p]),
        );

        // Participants grouped per event.
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

            if (row.profile_id) entry.participant_ids.push(row.profile_id);
            if (row.client_id) entry.client_ids.push(row.client_id);
            if (row.supplier_id) entry.supplier_ids.push(row.supplier_id);

            participantsByEvent.set(row.event_id, entry);
        }

        return events.map((event) => {
            const participants = participantsByEvent.get(event.event_id);

            return {
                ...event,

                event_type: event.event_type as EventType,

                project: normalizeRelation(
                    event.project_id
                        ? projectMap.get(event.project_id)
                        : null,
                ),

                task: normalizeRelation(
                    event.task_id ? taskMap.get(event.task_id) : null,
                ),

                client: normalizeRelation(
                    event.client_id ? clientMap.get(event.client_id) : null,
                ),

                creator: normalizeRelation(
                    event.created_by
                        ? profileMap.get(event.created_by)
                        : null,
                ),

                participant_ids: participants?.participant_ids ?? [],
                client_ids: participants?.client_ids ?? [],
                supplier_ids: participants?.supplier_ids ?? [],
            };
        });
    } catch (error) {
        console.error("getCalendarEvents error:", getErrorMessage(error));

        throw error instanceof Error
            ? error
            : new Error("Erro ao carregar eventos do calendário.");
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