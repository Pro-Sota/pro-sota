import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import {
  createPermissionSet,
  hasPermission,
} from "./access";

import type {
  Permission,
  PermissionSet,
  SystemRole,
} from "./types";

/*
 * ============================================================
 * SUPABASE
 * ============================================================
 */

const getSupabase = async () => {
  const cookiesStore = await cookies();

  return createClient(cookiesStore);
};

/*
 * ============================================================
 * ROLE NORMALIZATION
 * ============================================================
 */

function normalizeRole(
  role?: string | null,
): SystemRole {
  if (!role) {
    return "Utilizador";
  }

  const normalized = role
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "superadmin":
    case "super admin":
    case "super_administrator":
    case "super administrator":
      return "Superadmin";

    case "admin":
    case "administrador":
    case "administrator":
      return "Admin";

    case "director":
    case "diretor":
      return "Director";

    case "utilizador":
    case "user":
    case "employee":
    case "utilizador normal":
      return "Utilizador";

    default:
      return "Utilizador";
  }
}

/*
 * ============================================================
 * LOAD PERMISSIONS FOR ROLE
 * ============================================================
 */

async function getPermissionsForRole(
  roleId: number,
): Promise<PermissionSet> {
  const supabase = await getSupabase();

  /*
   * First get the permission IDs assigned to the role.
   */
  const {
    data: rolePermissions,
    error: rolePermissionsError,
  } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);

  if (rolePermissionsError) {
    console.error(
      "Error loading role_permissions:",
      rolePermissionsError,
    );

    return createPermissionSet([]);
  }

  if (!rolePermissions?.length) {
    console.warn(
      `No permissions assigned to role_id ${roleId}.`,
    );

    return createPermissionSet([]);
  }

  const permissionIds = rolePermissions.map(
    (item) => item.permission_id,
  );

  /*
   * Then load the actual permission keys.
   */
  const {
    data: permissionRows,
    error: permissionsError,
  } = await supabase
    .from("permissions")
    .select("permission_id, key")
    .in("permission_id", permissionIds);

  if (permissionsError) {
    console.error(
      "Error loading permissions:",
      permissionsError,
    );

    return createPermissionSet([]);
  }

  const permissionKeys = (permissionRows ?? [])
    .map((permission) => permission.key)
    .filter(
      (key): key is Permission =>
        typeof key === "string",
    );

  console.log(
    `Permissions for role ${roleId}:`,
    permissionKeys,
  );

  return createPermissionSet(permissionKeys);
}

/*
 * ============================================================
 * CURRENT USER PERMISSIONS
 * ============================================================
 */

export async function getCurrentUserPermissions(): Promise<{
  userId: string;
  role: SystemRole;
  permissions: PermissionSet;
  department: string | null;
}> {
  const supabase = await getSupabase();

  /*
   * ========================================================
   * AUTH USER
   * ========================================================
   */

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /*
   * ========================================================
   * PROFILE
   * ========================================================
   */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "profile_id, role_id, department",
    )
    .eq("profile_id", user.id)
    .single();

  if (profileError || !profile) {
    console.error(
      "Error loading current profile:",
      profileError,
    );

    redirect("/login");
  }

  /*
   * ========================================================
   * ROLE
   * ========================================================
   */

  const {
    data: roleRecord,
    error: roleError,
  } = await supabase
    .from("roles")
    .select("role_id, name")
    .eq("role_id", profile.role_id)
    .single();

  if (roleError || !roleRecord) {
    console.error(
      "Error loading current role:",
      roleError,
    );

    redirect("/login");
  }

  const role = normalizeRole(
    roleRecord.name,
  );

  /*
   * ========================================================
   * PERMISSIONS
   * ========================================================
   */

  const permissions =
    await getPermissionsForRole(
      profile.role_id,
    );

  /*
   * ========================================================
   * DEBUG
   * ========================================================
   */

  console.log("CURRENT USER PERMISSION DATA:", {
    userId: profile.profile_id,
    roleId: profile.role_id,
    roleName: roleRecord.name,
    normalizedRole: role,
    department: profile.department,
    permissions: Array.from(permissions),
  });

  /*
   * ========================================================
   * RESULT
   * ========================================================
   */

  return {
    userId: profile.profile_id,
    role,
    permissions,
    department: profile.department,
  };
}

/*
 * ============================================================
 * REQUIRE PERMISSION
 * ============================================================
 */

export async function requirePermission(
  permission: Permission,
): Promise<{
  userId: string;
  role: SystemRole;
  permissions: PermissionSet;
  department: string | null;
}> {
  const auth =
    await getCurrentUserPermissions();

  if (
    auth.role !== "Superadmin" &&
    !hasPermission(
      auth.permissions,
      permission,
    )
  ) {
    redirect("/management");
  }

  return auth;
}

/*
 * ============================================================
 * CHECK PERMISSION
 * ============================================================
 */

export async function checkPermission(
  permission: Permission,
): Promise<boolean> {
  const auth =
    await getCurrentUserPermissions();

  if (auth.role === "Superadmin") {
    return true;
  }

  return hasPermission(
    auth.permissions,
    permission,
  );
}