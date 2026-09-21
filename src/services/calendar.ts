import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export type EventType =
    | "project"
    | "task"
    | "meeting"
    | "site_visit"
    | "deadline";

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

export type UpdateCalendarEventInput = Partial<
    CreateCalendarEventInput
>;

function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    if (
        typeof error === "object" &&
        error !== null
    ) {
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

/**
 * Get the currently authenticated profile.
 */
async function getCurrentProfileId() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

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
        throw new Error(
            "Utilizador não autenticado.",
        );
    }

    const {
        data: profile,
        error: profileError,
    } = await supabase
        .from("profiles")
        .select("profile_id")
        .eq("profile_id", user.id)
        .maybeSingle();

    if (profileError) {
        throw new Error(
            `Erro ao obter perfil: ${profileError.message}`,
        );
    }

    if (!profile) {
        throw new Error(
            "Perfil do utilizador não encontrado.",
        );
    }

    return profile.profile_id;
}

/**
 * Get calendar events.
 *
 * The base calendar query intentionally only reads
 * calendar_events. Related project/task/client/profile
 * data is fetched separately so a relationship/configuration
 * problem cannot break the entire calendar query.
 */
export async function getCalendarEvents(options?: {
    startAt?: string;
    endAt?: string;
    eventType?: EventType;
    projectId?: string;
}) {
     const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    try {
        let query = supabase
            .from("calendar_events")
            .select(`
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
            `)
            .order("start_at", {
                ascending: true,
            });

        if (options?.startAt) {
            query = query.gte(
                "start_at",
                options.startAt,
            );
        }

        if (options?.endAt) {
            query = query.lte(
                "start_at",
                options.endAt,
            );
        }

        if (options?.eventType) {
            query = query.eq(
                "event_type",
                options.eventType,
            );
        }

        if (options?.projectId) {
            query = query.eq(
                "project_id",
                options.projectId,
            );
        }

        const {
            data: events,
            error,
        } = await query;

        if (error) {
            console.error(
                "getCalendarEvents database error:",
                {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                },
            );

            throw new Error(
                `Erro ao carregar eventos do calendário: ${error.message}`,
            );
        }

        if (!events || events.length === 0) {
            return [];
        }

        /*
         * Fetch related data separately.
         *
         * This prevents PostgREST relationship errors from
         * breaking the main calendar query.
         */

        const projectIds = [
            ...new Set(
                events
                    .map((event) => event.project_id)
                    .filter(
                        (
                            id,
                        ): id is string =>
                            Boolean(id),
                    ),
            ),
        ];

        const taskIds = [
            ...new Set(
                events
                    .map((event) => event.task_id)
                    .filter(
                        (
                            id,
                        ): id is string =>
                            Boolean(id),
                    ),
            ),
        ];

        const clientIds = [
            ...new Set(
                events
                    .map((event) => event.client_id)
                    .filter(
                        (
                            id,
                        ): id is string =>
                            Boolean(id),
                    ),
            ),
        ];

        const profileIds = [
            ...new Set(
                events
                    .map((event) => event.created_by)
                    .filter(
                        (
                            id,
                        ): id is string =>
                            Boolean(id),
                    ),
            ),
        ];

        const [
            projectsResult,
            tasksResult,
            clientsResult,
            profilesResult,
        ] = await Promise.all([
            projectIds.length > 0
                ? supabase
                      .from("projects")
                      .select(
                          "project_id, project_name",
                      )
                      .in(
                          "project_id",
                          projectIds,
                      )
                : Promise.resolve({
                      data: [],
                      error: null,
                  }),

            taskIds.length > 0
                ? supabase
                      .from("tasks")
                      .select(
                          "task_id, title",
                      )
                      .in(
                          "task_id",
                          taskIds,
                      )
                : Promise.resolve({
                      data: [],
                      error: null,
                  }),

            clientIds.length > 0
                ? supabase
                      .from("clients")
                      .select(
                          "client_id, name",
                      )
                      .in(
                          "client_id",
                          clientIds,
                      )
                : Promise.resolve({
                      data: [],
                      error: null,
                  }),

            profileIds.length > 0
                ? supabase
                      .from("profiles")
                      .select(
                          "profile_id, first_name, last_name",
                      )
                      .in(
                          "profile_id",
                          profileIds,
                      )
                : Promise.resolve({
                      data: [],
                      error: null,
                  }),
        ]);

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

        const projects = projectsResult.data ?? [];
        const tasks = tasksResult.data ?? [];
        const clients = clientsResult.data ?? [];
        const profiles = profilesResult.data ?? [];

        const projectMap = new Map(
            projects.map((project) => [
                project.project_id,
                project,
            ]),
        );

        const taskMap = new Map(
            tasks.map((task) => [
                task.task_id,
                task,
            ]),
        );

        const clientMap = new Map(
            clients.map((client) => [
                client.client_id,
                client,
            ]),
        );

        const profileMap = new Map(
            profiles.map((profile) => [
                profile.profile_id,
                profile,
            ]),
        );

        return events.map((event) => ({
            ...event,

            event_type:
                event.event_type as EventType,

            project: normalizeRelation(
                event.project_id
                    ? projectMap.get(
                          event.project_id,
                      )
                    : null,
            ),

            task: normalizeRelation(
                event.task_id
                    ? taskMap.get(
                          event.task_id,
                      )
                    : null,
            ),

            client: normalizeRelation(
                event.client_id
                    ? clientMap.get(
                          event.client_id,
                      )
                    : null,
            ),

            creator: normalizeRelation(
                event.created_by
                    ? profileMap.get(
                          event.created_by,
                      )
                    : null,
            ),
        }));
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
export async function getCalendarEvent(
    eventId: string,
) {
      const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const {
        data,
        error,
    } = await supabase
        .from("calendar_events")
        .select(`
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
        `)
        .eq("event_id", eventId)
        .maybeSingle();

    if (error) {
        console.error(
            "getCalendarEvent error:",
            {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            },
        );

        throw new Error(
            `Erro ao carregar evento: ${error.message}`,
        );
    }

    if (!data) {
        return null;
    }

    return data;
}

/**
 * Create a calendar event.
 */
export async function createCalendarEvent(
    input: CreateCalendarEventInput,
) {
      const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    if (!input.title?.trim()) {
        throw new Error(
            "O título do evento é obrigatório.",
        );
    }

    if (!input.start_at) {
        throw new Error(
            "A data de início é obrigatória.",
        );
    }

    if (
        input.end_at &&
        new Date(input.end_at) <
            new Date(input.start_at)
    ) {
        throw new Error(
            "A data de fim não pode ser anterior à data de início.",
        );
    }

    const profileId =
        await getCurrentProfileId();

    const {
        data,
        error,
    } = await supabase
        .from("calendar_events")
        .insert({
            title: input.title.trim(),
            description:
                input.description ?? null,
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at ?? null,
            all_day: input.all_day ?? false,
            location:
                input.location?.trim() || null,
            project_id:
                input.project_id ?? null,
            task_id:
                input.task_id ?? null,
            client_id:
                input.client_id ?? null,
            created_by: profileId,
        })
        .select(`
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
        `)
        .single();

    if (error) {
        console.error(
            "createCalendarEvent error:",
            {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            },
        );

        throw new Error(
            `Erro ao criar evento: ${error.message}`,
        );
    }

    return data;
}

/**
 * Update a calendar event.
 */
export async function updateCalendarEvent(
    eventId: string,
    input: UpdateCalendarEventInput,
) {
      const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const updateData: Record<
        string,
        unknown
    > = {};

    if (input.title !== undefined) {
        if (!input.title.trim()) {
            throw new Error(
                "O título do evento é obrigatório.",
            );
        }

        updateData.title =
            input.title.trim();
    }

    if (
        input.description !== undefined
    ) {
        updateData.description =
            input.description ?? null;
    }

    if (
        input.event_type !== undefined
    ) {
        updateData.event_type =
            input.event_type;
    }

    if (
        input.start_at !== undefined
    ) {
        updateData.start_at =
            input.start_at;
    }

    if (input.end_at !== undefined) {
        updateData.end_at =
            input.end_at ?? null;
    }

    if (input.all_day !== undefined) {
        updateData.all_day =
            input.all_day;
    }

    if (input.location !== undefined) {
        updateData.location =
            input.location?.trim() || null;
    }

    if (
        input.project_id !== undefined
    ) {
        updateData.project_id =
            input.project_id ?? null;
    }

    if (
        input.task_id !== undefined
    ) {
        updateData.task_id =
            input.task_id ?? null;
    }

    if (
        input.client_id !== undefined
    ) {
        updateData.client_id =
            input.client_id ?? null;
    }

    updateData.updated_at =
        new Date().toISOString();

    if (
        updateData.start_at &&
        updateData.end_at
    ) {
        if (
            new Date(
                String(
                    updateData.end_at,
                ),
            ) <
            new Date(
                String(
                    updateData.start_at,
                ),
            )
        ) {
            throw new Error(
                "A data de fim não pode ser anterior à data de início.",
            );
        }
    }

    const {
        data,
        error,
    } = await supabase
        .from("calendar_events")
        .update(updateData)
        .eq("event_id", eventId)
        .select(`
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
        `)
        .single();

    if (error) {
        console.error(
            "updateCalendarEvent error:",
            {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            },
        );

        throw new Error(
            `Erro ao atualizar evento: ${error.message}`,
        );
    }

    return data;
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(
    eventId: string,
) {
      const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const {
        error,
    } = await supabase
        .from("calendar_events")
        .delete()
        .eq("event_id", eventId);

    if (error) {
        console.error(
            "deleteCalendarEvent error:",
            {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            },
        );

        throw new Error(
            `Erro ao eliminar evento: ${error.message}`,
        );
    }

    return {
        success: true,
    };
}
