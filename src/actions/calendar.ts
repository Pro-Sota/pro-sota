
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import {
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from "@/services/calendar";

import type { CreateCalendarEventInput } from "@/services/calendar";
import type { CalendarParticipant } from "@/actions/searchCalendarParticipants";

const ALLOWED_EVENT_TYPES = [
    "meeting",
    "site_visit",
    "deadline",
] as const;

type SupportedEventType = (typeof ALLOWED_EVENT_TYPES)[number];

export type CreateCalendarEventActionInput = Omit<
    CreateCalendarEventInput,
    "event_type"
> & {
    event_type: SupportedEventType;
    participantIds?: string[];
};

export type UpdateCalendarEventActionInput = {
    event_id: string;
    title: string;
    event_type: SupportedEventType;
    start_at: string;
    end_at: string;
    location: string | null;
    description: string | null;
    all_day: boolean;
};

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

function normalizeOptionalText(
    value: unknown,
): string | null {
    if (typeof value !== "string") {
        return null;
    }

    return value.trim() || null;
}

function normalizeParticipantIds(
    value: unknown,
): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return [
        ...new Set(
            value.filter(
                (id): id is string =>
                    typeof id === "string" && id.trim().length > 0,
            ).map((id) => id.trim()),
        ),
    ];
}

/**
 * Creates a calendar event and saves its participants.
 */
export async function createCalendarEventAction(
    input: CreateCalendarEventActionInput,
) {
    try {
        if (
            !input ||
            typeof input.title !== "string" ||
            !input.title.trim()
        ) {
            return {
                success: false,
                error: "Indique o título do evento.",
            };
        }

        if (!isSupportedEventType(input.event_type)) {
            return {
                success: false,
                error: "Tipo de evento inválido.",
            };
        }

        const dateError = validateEventDates(
            input.start_at,
            input.end_at,
        );

        if (dateError) {
            return {
                success: false,
                error: dateError,
            };
        }

        const participantIds = normalizeParticipantIds(
            input.participantIds,
        );

        const event = await createCalendarEvent({
            title: input.title.trim(),
            description: normalizeOptionalText(input.description),
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at,
            location: normalizeOptionalText(input.location),
            all_day: input.all_day ?? false,
            project_id: input.project_id ?? null,
            task_id: input.task_id ?? null,
            client_id: input.client_id ?? null,
        });

        if (participantIds.length > 0) {
            const supabase = await createClient(await cookies());

            const { error: participantsError } = await supabase
                .from("calendar_event_participants")
                .insert(
                    participantIds.map((profileId) => ({
                        event_id: event.event_id,
                        profile_id: profileId,
                    })),
                );

            if (participantsError) {
                console.error(
                    "Erro ao guardar participantes do evento:",
                    participantsError,
                );

                // Best-effort rollback. The database foreign key
                // also removes participant rows when an event is deleted.
                try {
                    await deleteCalendarEvent(event.event_id);
                } catch (cleanupError) {
                    console.error(
                        "Erro ao reverter a criação do evento:",
                        cleanupError,
                    );
                }

                revalidatePath("/management/calendar");
                revalidatePath("/management");

                return {
                    success: false,
                    error:
                        "Não foi possível guardar os participantes. " +
                        "O evento não foi concluído.",
                };
            }
        }

        revalidatePath("/management/calendar");
        revalidatePath("/management");

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

/**
 * Updates an existing calendar event.
 * Access control must also be enforced by Supabase RLS
 * or by the service layer.
 */
export async function updateCalendarEventAction(
    input: UpdateCalendarEventActionInput,
) {
    try {
        if (
            !input ||
            typeof input.event_id !== "string" ||
            !input.event_id.trim()
        ) {
            return {
                success: false,
                error: "Evento inválido.",
            };
        }

        if (
            typeof input.title !== "string" ||
            !input.title.trim()
        ) {
            return {
                success: false,
                error: "Indique o título do evento.",
            };
        }

        if (!isSupportedEventType(input.event_type)) {
            return {
                success: false,
                error: "Tipo de evento inválido.",
            };
        }

        if (typeof input.all_day !== "boolean") {
            return {
                success: false,
                error: "Indique se o evento dura o dia inteiro.",
            };
        }

        const dateError = validateEventDates(
            input.start_at,
            input.end_at,
        );

        if (dateError) {
            return {
                success: false,
                error: dateError,
            };
        }

        await updateCalendarEvent(input.event_id, {
            title: input.title.trim(),
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at,
            location: normalizeOptionalText(input.location),
            description: normalizeOptionalText(input.description),
            all_day: input.all_day,
        });

        revalidatePath("/management/calendar");
        revalidatePath("/management");

        return {
            success: true,
            error: null,
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
        const supabase = await createClient(await cookies());

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


/**
 * Deletes an existing calendar event.
 * Access control must be enforced by Supabase RLS
 * or by the service layer.
 */
export async function deleteCalendarEventAction(eventId: string) {
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

        await deleteCalendarEvent(eventId.trim());

        revalidatePath("/management/calendar");
        revalidatePath("/management");

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

async function canManageCalendarEvent(eventId: string): Promise<boolean> {
    const supabase = await createClient(await cookies());

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

    // Admin can manage every event.
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
}