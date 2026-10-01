// src/app/actions/project_permissions.ts

"use server";

import {
  getCurrentUserPermissions,
} from "@/app/lib/permissions/server";
import type { Permission } from "@/app/lib/permissions/types";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

async function getSupabase(){
    const cookiesStore = await cookies();
    return createClient(cookiesStore);
}

export async function updateProjectPermissions(
  projectId: string,
  profileId: string,
  permissions: Permission[],
) {
  const auth = await getCurrentUserPermissions();

  if (
    auth.role !== "Superadmin" &&
    auth.role !== "Admin"
  ) {
    throw new Error(
      "Não tem permissão para gerir permissões de projecto.",
    );
  }

  const supabase = await getSupabase();

  const { data: member, error: memberError } =
    await supabase
      .from("project_members")
      .select("project_members_id")
      .eq("project_id", projectId)
      .eq("profile_id", profileId)
      .maybeSingle();

  if (memberError) {
    console.error(memberError);
    throw new Error(
      "Não foi possível verificar o membro do projecto.",
    );
  }

  if (!member) {
    throw new Error(
      "Este utilizador não pertence ao projecto.",
    );
  }

  const { data: permissionRows, error: permissionError } =
    await supabase
      .from("permissions")
      .select("permission_id, key")
      .in("key", permissions);

  if (permissionError) {
    console.error(permissionError);
    throw new Error(
      "Não foi possível carregar as permissões.",
    );
  }

  const { error: deleteError } = await supabase
    .from("project_permissions")
    .delete()
    .eq("project_id", projectId)
    .eq("profile_id", profileId);

  if (deleteError) {
    console.error(deleteError);
    throw new Error(
      "Não foi possível actualizar as permissões.",
    );
  }

  if (!permissionRows?.length) {
    return {
      success: true,
    };
  }

  const rows = permissionRows.map((permission) => ({
    project_id: projectId,
    profile_id: profileId,
    permission_id: permission.permission_id,
    created_by: auth.userId,
  }));

  const { error: insertError } = await supabase
    .from("project_permissions")
    .insert(rows);

  if (insertError) {
    console.error(insertError);
    throw new Error(
      "Não foi possível guardar as permissões.",
    );
  }

  return {
    success: true,
  };
}