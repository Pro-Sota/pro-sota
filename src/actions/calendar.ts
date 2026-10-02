"use server";

import { revalidatePath } from "next/cache";
import { createCalendarEvent } from "@/services/calendar";
import type { CreateCalendarEventInput } from "@/services/calendar";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function createCalendarEventAction(
  input: CreateCalendarEventInput
) {
  try {
    if (!input || typeof input.title !== "string" || !input.title.trim()) {
      return {
        success: false,
        error: "Indique o título do evento.",
      };
    }

    const allowedTypes = ["meeting", "site_visit", "deadline"];

    if (!allowedTypes.includes(input.event_type)) {
      return {
        success: false,
        error: "Tipo de evento inválido.",
      };
    }

    const start = new Date(input.start_at).getTime();
    const end = input.end_at
      ? new Date(input.end_at).getTime()
      : Number.NaN;

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return {
        success: false,
        error: "Indique datas e horas válidas.",
      };
    }

    if (end <= start) {
      return {
        success: false,
        error: "A hora de fim deve ser posterior à hora de início.",
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
  } catch (error) {
    console.error("Erro ao criar evento:", error);

    return {
      success: false,
      error: "Não foi possível guardar o evento. Tente novamente.",
    };
  }

  revalidatePath("/management/calendar");
  revalidatePath("/management");

  return { success: true, error: null };
}





export type CalendarParticipant = {
  profile_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  profile_picture?: string | null;
};

export async function searchCalendarParticipants(
  query: string,
): Promise<CalendarParticipant[]> {
  const supabase = await createClient(await cookies());

  const search = query.trim();

  if (!search) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
                profile_id,
                first_name,
                last_name,
                email,
                profile_picture
            `,
    )
    .or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
    )
    .order("first_name", {
      ascending: true,
    })
    .limit(8);

  if (error) {
    console.error(
      "searchCalendarParticipants:",
      error,
    );

    throw new Error(
      "Não foi possível pesquisar os participantes.",
    );
  }

  return (data ?? []) as CalendarParticipant[];
}