"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import {
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from "@/services/calendar";

import type {
    CalendarParticipant,
    CreateCalendarEventInput,
} from "@/services/calendar";

/* -------------------------------------------------------------------------- */
/* Constants & types                                                          */
/* -------------------------------------------------------------------------- */

const ALLOWED_EVENT_TYPES = [
    "meeting",
    "site_visit",
    "deadline",
] as const;

type SupportedEventType = (typeof ALLOWED_EVENT_TYPES)[number];

/**
 * Columns of calendar_event_participants, one per participant category.
 * Each row fills exactly one of them.
 * Adjust the strings if your column names differ.
 */
const PARTICIPANT_COLUMNS = {
    team: "profile_id",
    clients: "client_id",
    suppliers: "supplier_id",
} as const;

type ParticipantCategory = keyof typeof PARTICIPANT_COLUMNS;
type ParticipantColumn = (typeof PARTICIPANT_COLUMNS)[ParticipantCategory];

type ParticipantLists = Partial<Record<ParticipantCategory, string[]>>;

/** Matches the payload built by buildEventPayload() in the form. */
export type CreateCalendarEventActionInput = Omit<
    CreateCalendarEventInput,
    "event_type"
> & {
    event_type: SupportedEventType;

    /** Team members (profile ids). */
    participantIds?: string[];
    clientIds?: string[];
    supplierIds?: string[];
};

export type UpdateCalendarEventActionInput = {
    event_id: string;
    title: string;
    event_type: SupportedEventType;
    start_at: string;
    end_at: string;
    location: string | null;
    description: string | null;

    /**
     * For each list below: omit the property to preserve the existing
     * participants, pass [] to remove all participants of that category.
     */
    participantIds?: string[];
    clientIds?: string[];
    supplierIds?: string[];
};

type ActionResult = {
    success: boolean;
    error: string | null;
    eventId?: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
    return createClient(await cookies());
}

function revalidateCalendar() {
    revalidatePath("/management/calendar");
    revalidatePath("/management");
}

function isSupportedEventType(
    value: unknown,
): value is SupportedEventType {
    return (
        typeof value === "string" &&
        ALLOWED_EVENT_TYPES.some((type) => type === value)
    );
}

function validateEventDates(
    startAt: unknown,
    endAt: unknown,
): string | null {
    if (
        typeof startAt !== "string" ||
        !startAt.trim() ||
        typeof endAt !== "string" ||
        !endAt.trim()
    ) {
        return "Indique datas e horas válidas.";
    }

    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return "Indique datas e horas válidas.";
    }

    if (end <= start) {
        return "A hora de fim deve ser posterior à hora de início.";
    }

    return null;
}

/**
 * Validation shared by create and update.
 * Returns an error message, or null when the input is valid.
 */
function validateEventFields(input: {
    title: unknown;
    event_type: unknown;
    start_at: unknown;
    end_at: unknown;
}): string | null {
    if (typeof input.title !== "string" || !input.title.trim()) {
        return "Indique o título do evento.";
    }

    if (!isSupportedEventType(input.event_type)) {
        return "Tipo de evento inválido.";
    }

    return validateEventDates(input.start_at, input.end_at);
}

function normalizeOptionalText(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    return value.trim() || null;
}

function normalizeIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return [
        ...new Set(
            value
                .filter(
                    (id): id is string =>
                        typeof id === "string" &&
                        id.trim().length > 0,
                )
                .map((id) => id.trim()),
        ),
    ];
}

/* -------------------------------------------------------------------------- */
/* Permissions                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Admins (role_id = 1) can manage all events.
 * Other users can manage only events they created.
 */
async function canManageCalendarEvent(
    eventId: string,
): Promise<boolean> {
    try {
        const supabase = await getSupabase();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return false;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("profile_id, role_id")
            .eq("profile_id", user.id)
            .maybeSingle();

        if (profileError || !profile) {
            return false;
        }

        if (profile.role_id === 1) {
            return true;
        }

        const { data: event, error: eventError } = await supabase
            .from("calendar_events")
            .select("created_by")
            .eq("event_id", eventId)
            .maybeSingle();

        if (eventError || !event) {
            return false;
        }

        return event.created_by === profile.profile_id;
    } catch (error) {
        console.error(
            "Erro ao verificar permissões do evento:",
            error,
        );

        return false;
    }
}

/* -------------------------------------------------------------------------- */
/* Participants                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Rows to insert in calendar_event_participants
 * for all three participant categories.
 */
function buildParticipantRows(
    eventId: string,
    lists: ParticipantLists,
): Record<string, string>[] {
    const rows: Record<string, string>[] = [];

    (Object.keys(PARTICIPANT_COLUMNS) as ParticipantCategory[]).forEach(
        (category) => {
            const column = PARTICIPANT_COLUMNS[category];

            normalizeIds(lists[category]).forEach((id) => {
                rows.push({ event_id: eventId, [column]: id });
            });
        },
    );

    return rows;
}

/**
 * Synchronizes one participant category with the database:
 * inserts the new ids and removes the missing ones.
 */
async function syncParticipantColumn(
    eventId: string,
    column: ParticipantColumn,
    ids: string[],
): Promise<void> {
    const supabase = await getSupabase();
    const selectedIds = normalizeIds(ids);

    const { data: existing, error: fetchError } = await supabase
        .from("calendar_event_participants")
        .select(column)
        .eq("event_id", eventId)
        .not(column, "is", null);

    if (fetchError) {
        console.error(
            "Erro ao consultar participantes do evento:",
            fetchError,
        );

        throw new Error(
            "Não foi possível consultar os participantes do evento.",
        );
    }

    const existingIds = new Set(
        ((existing ?? []) as unknown as Record<string, string>[]).map(
            (row) => row[column],
        ),
    );

    const selectedIdSet = new Set(selectedIds);

    const toInsert = selectedIds.filter((id) => !existingIds.has(id));
    const toRemove = [...existingIds].filter(
        (id) => !selectedIdSet.has(id),
    );

    if (toInsert.length > 0) {
        const { error: insertError } = await supabase
            .from("calendar_event_participants")
            .insert(
                toInsert.map((id) => ({
                    event_id: eventId,
                    [column]: id,
                })),
            );

        if (insertError) {
            console.error(
                "Erro ao adicionar participantes ao evento:",
                insertError,
            );

            throw new Error(
                "Não foi possível adicionar os participantes ao evento.",
            );
        }
    }

    if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
            .from("calendar_event_participants")
            .delete()
            .eq("event_id", eventId)
            .in(column, toRemove);

        if (deleteError) {
            console.error(
                "Erro ao remover participantes do evento:",
                deleteError,
            );

            throw new Error(
                "Não foi possível remover os participantes do evento.",
            );
        }
    }
}

/**
 * Synchronizes team, client and supplier participants.
 * A category whose list is undefined is left untouched.
 *
 * Not transactional: if a later category fails, earlier ones stay saved.
 * Use a PostgreSQL RPC if event updates and participant changes must
 * be atomic.
 */
async function syncCalendarEventParticipants(
    eventId: string,
    lists: ParticipantLists,
): Promise<void> {
    for (const category of Object.keys(
        PARTICIPANT_COLUMNS,
    ) as ParticipantCategory[]) {
        const ids = lists[category];

        if (ids !== undefined) {
            await syncParticipantColumn(
                eventId,
                PARTICIPANT_COLUMNS[category],
                ids,
            );
        }
    }
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Creates a calendar event and saves its participants
 * (team members, clients and suppliers).
 */
export async function createCalendarEventAction(
    input: CreateCalendarEventActionInput,
): Promise<ActionResult> {
    try {
        if (!input) {
            return {
                success: false,
                error: "Evento inválido.",
            };
        }

        const validationError = validateEventFields({
            title: input.title,
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at,
        });

        if (validationError) {
            return {
                success: false,
                error: validationError,
            };
        }

        const event = await createCalendarEvent({
            title: input.title.trim(),
            description: normalizeOptionalText(input.description),
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at,
            location: normalizeOptionalText(input.location),
            project_id: input.project_id ?? null,
            task_id: input.task_id ?? null,
            client_id: input.client_id ?? null,
        });

        const participantRows = buildParticipantRows(event.event_id, {
            team: input.participantIds,
            clients: input.clientIds,
            suppliers: input.supplierIds,
        });

        if (participantRows.length > 0) {
            const supabase = await getSupabase();

            const { error: participantsError } = await supabase
                .from("calendar_event_participants")
                .insert(participantRows);

            if (participantsError) {
                console.error(
                    "Erro ao guardar participantes do evento:",
                    participantsError,
                );

                // Best-effort rollback if participant insertion fails.
                try {
                    await deleteCalendarEvent(event.event_id);
                } catch (cleanupError) {
                    console.error(
                        "Erro ao reverter a criação do evento:",
                        cleanupError,
                    );
                }

                revalidateCalendar();

                return {
                    success: false,
                    error:
                        "Não foi possível guardar os participantes. " +
                        "O evento não foi concluído.",
                };
            }
        }

        revalidateCalendar();

        return {
            success: true,
            error: null,
            eventId: event.event_id,
        };
    } catch (error) {
        console.error("Erro ao criar evento:", error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível guardar o evento. Tente novamente.",
        };
    }
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Updates an existing calendar event and, for each category provided,
 * synchronizes its participants.
 */
export type UpdateCalendarEventPayload = {
    title: string;
    event_type: SupportedEventType;
    start_at: string;
    end_at: string;
    location: string | null;
    description: string | null;

    /**
     * For each list below: omit the property to preserve the existing
     * participants, pass [] to remove all participants of that category.
     */
    participantIds?: string[];
    clientIds?: string[];
    supplierIds?: string[];
};


export async function updateCalendarEventAction(
    eventId: string,
    input: UpdateCalendarEventPayload,
): Promise<ActionResult> {
    try {
        if (typeof eventId !== "string" || !eventId.trim()) {
            return {
                success: false,
                error: "Evento inválido.",
            };
        }

        if (!input) {
            return {
                success: false,
                error: "Dados do evento inválidos.",
            };
        }

        const validationError = validateEventFields({
            title: input.title,
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at,
        });

        if (validationError) {
            return {
                success: false,
                error: validationError,
            };
        }

        const normalizedEventId = eventId.trim();

        if (!(await canManageCalendarEvent(normalizedEventId))) {
            return {
                success: false,
                error: "Não tem autorização para editar este evento.",
            };
        }

        await updateCalendarEvent(normalizedEventId, {
            title: input.title.trim(),
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at,
            location: normalizeOptionalText(input.location),
            description: normalizeOptionalText(input.description),
        });

        // undefined = preserve existing, [] = remove all of that category.
        await syncCalendarEventParticipants(normalizedEventId, {
            team: input.participantIds,
            clients: input.clientIds,
            suppliers: input.supplierIds,
        });

        revalidateCalendar();

        return {
            success: true,
            error: null,
            eventId: normalizedEventId,
        };
    } catch (error) {
        console.error("Erro ao actualizar evento:", error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível actualizar o evento. Tente novamente.",
        };
    }
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Searches profiles that can be invited to calendar events.
 */
export async function searchCalendarParticipants(
    query: string,
): Promise<CalendarParticipant[]> {
    if (typeof query !== "string") {
        return [];
    }

    const search = query.trim();

    if (search.length < 2) {
        return [];
    }

    try {
        const supabase = await getSupabase();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return [];
        }

        // Escape PostgREST filter punctuation in user input.
        const safeSearch = search.replace(
            /[%_,().\\]/g,
            (character) => `\\${character}`,
        );

        const { data, error } = await supabase
            .from("profiles")
            .select(
                "profile_id, first_name, last_name, email, profile_picture",
            )
            .or(
                [
                    `first_name.ilike.%${safeSearch}%`,
                    `last_name.ilike.%${safeSearch}%`,
                    `email.ilike.%${safeSearch}%`,
                ].join(","),
            )
            .limit(10);

        if (error) {
            console.error(
                "Erro ao pesquisar participantes:",
                error,
            );

            return [];
        }

        return (data ?? []) as CalendarParticipant[];
    } catch (error) {
        console.error(
            "Erro ao pesquisar participantes:",
            error,
        );

        return [];
    }
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Deletes an existing calendar event.
 */
export async function deleteCalendarEventAction(
    eventId: string,
): Promise<ActionResult> {
    try {
        if (
            typeof eventId !== "string" ||
            !eventId.trim()
        ) {
            return {
                success: false,
                error: "Evento inválido.",
            };
        }

        const normalizedEventId = eventId.trim();

        if (!(await canManageCalendarEvent(normalizedEventId))) {
            return {
                success: false,
                error: "Não tem autorização para eliminar este evento.",
            };
        }

        await deleteCalendarEvent(normalizedEventId);

        revalidateCalendar();

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        console.error("Erro ao eliminar evento:", error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível eliminar o evento. Tente novamente.",
        };
    }
}