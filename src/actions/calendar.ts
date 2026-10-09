
"use server";

import { revalidatePath } from "next/cache";

import {
    createCalendarEvent,
    updateCalendarEvent,
} from "@/services/calendar";

import type {
    CreateCalendarEventInput,
} from "@/services/calendar";

import type {
    CalendarParticipant,
} from "@/actions/searchCalendarParticipants";

const ALLOWED_EVENT_TYPES = [
    "meeting",
    "site_visit",
    "deadline",
] as const;

type SupportedEventType =
    (typeof ALLOWED_EVENT_TYPES)[number];

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
    value: string,
): value is SupportedEventType {
    return ALLOWED_EVENT_TYPES.some(
        (type) => type === value,
    );
}

function validateEventDates(
    startAt: string,
    endAt: string,
): string | null {
    if (!startAt || !endAt) {
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

export async function createCalendarEventAction(
    input: CreateCalendarEventInput,
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
            input.end_at!,
        );

        if (dateError) {
            return {
                success: false,
                error: dateError,
            };
        }

        await createCalendarEvent({
            title: input.title.trim(),
            description: input.description || null,
            event_type: input.event_type,
            start_at: input.start_at,
            end_at: input.end_at,
            location: input.location || null,
            all_day: false,
        });

        revalidatePath("/management/calendar");
        revalidatePath("/management");

        return {
            success: true,
            error: null,
        };
    } catch (error) {
        console.error("Erro ao criar evento:", error);

        return {
            success: false,
            error: "Não foi possível guardar o evento. Tente novamente.",
        };
    }
}

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
            location: input.location || null,
            description: input.description || null,
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
            error: "Não foi possível actualizar o evento. Tente novamente.",
        };
    }
}

export async function searchCalendarParticipants(
    query: string,
): Promise<CalendarParticipant[]> {
    const search = query.trim();

    if (search.length < 2) {
        return [];
    }

    try {
        const { createClient } = await import(
            "@/app/lib/supabase/server"
        );
        const { cookies } = await import("next/headers");

        const supabase = await createClient(await cookies());

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return [];
        }

        const { data, error } = await supabase
            .from("profiles")
            .select(
                "profile_id, first_name, last_name, email, profile_picture",
            )
            .or(
                `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
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