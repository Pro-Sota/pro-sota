import { createClient } from "@/app/lib/supabase/server";
import type { TaskMember } from "@/app/components/kanban_board/types";
import { cookies } from "next/headers";

export async function getTaskMembers(): Promise<TaskMember[]> {
  const supabase = createClient();

  const { data, error } = await (await supabase)
    .from("profiles")
    .select(`
      profile_id,
      first_name,
      last_name, 
      profile_picture
    `)
    .order("first_name", { ascending: true });

 if (error) {
  console.error("Erro ao carregar membros das tarefas:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  throw new Error(
    `Não foi possível carregar os membros das tarefas: ${error.message}`,
  );
}


  return (data ?? []).map((profile) => ({
    profileId: profile.profile_id,
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    picture: profile.profile_picture
  }));
}