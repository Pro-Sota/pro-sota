
import type {
  Permission,
  PermissionSet,
} from "@/app/lib/permissions/types";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function isProjectMember(
  projectId: number,
  profileId: string,
): Promise<boolean> {
  
    const supabase = createClient();

  const { data, error } = await (await supabase)
    .from("project_members")
    .select("project_members_id")
    .eq("project_id", projectId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error("isProjectMember:", error);
    throw new Error("Não foi possível verificar o acesso ao projecto.");
  }

  return !!data;
}

