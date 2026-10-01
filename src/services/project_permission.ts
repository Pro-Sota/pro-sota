// src/services/project_permissions.ts

import { createClient } from "@/app/lib/supabase/server";
import type { Permission } from "@/app/lib/permissions/types";
import { cookies } from "next/headers";

export async function getProjectMemberPermissions(
  projectId: number,
  profileId: string,
): Promise<Permission[]> {
  const cookiesStore = await cookies();
  const supabase = createClient(cookiesStore);

  const { data, error } = await supabase
    .from("project_permissions")
    .select(`
      permission_id,
      permissions (
        key
      )
    `)
    .eq("project_id", projectId)
    .eq("profile_id", profileId);

  if (error) {
    console.error(
      "getProjectMemberPermissions:",
      error,
    );

    throw new Error(
      "Não foi possível carregar as permissões.",
    );
  }

  const permissions: Permission[] = [];

  for (const row of data ?? []) {
    const relation = row.permissions;

    const permission = Array.isArray(relation)
      ? relation[0]
      : relation;

    if (permission?.key) {
      permissions.push(
        permission.key as Permission,
      );
    }
  }

  return permissions;
}