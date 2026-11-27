import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

export type CalendarParticipant = {
  profile_id: string;
  first_name: string | null;
  email: string | null;
};

export async function getCalendarParticipants(): Promise<
  CalendarParticipant[]
> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !user) {
    throw new Error("Sessão inválida. Inicie sessão novamente.");
  }

  const { data, error } = await (await supabase)
    .from("profiles")
    .select("profile_id, first_name, email")
    .order("first_name", { ascending: true });

  if (error) {
    console.error("getCalendarParticipants:", error);
    throw new Error("Não foi possível carregar os membros da equipa.");
  }

  return (data ?? []) as CalendarParticipant[];
}