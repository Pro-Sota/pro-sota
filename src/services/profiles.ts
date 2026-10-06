import { createClient } from "@/app/lib/supabase/server";
import type { TaskMember } from "@/app/components/kanban_board/types";
import { cookies } from "next/headers";

export async function getTaskMembers(): Promise<TaskMember[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      profile_id,
      first_name,
      last_name
    `)
    .order("first_name", { ascending: true });

  if (error) {
    console.error(
      "Erro ao carregar membros das tarefas:",
      error,
    );

    return [];
  }

  console.log("Profiles: ", data)

  return (data ?? []).map((profile) => ({
    profileId: profile.profile_id,
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
  }));
}