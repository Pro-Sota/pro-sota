
import "server-only";

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

async function getSupabase() {
  const cookiesStore = await cookies();
  return createClient(cookiesStore);
}

/*
 * ============================================================
 * ROLE NORMALIZATION
 * ============================================================
 */

function normalizeRole(role?: string | null): SystemRole {
  const normalized = role?.trim().toLowerCase();

  switch (normalized) {
    case "admin":
    case "administrador":
    case "administrator":
      return "Admin";

    case "utilizador":
    case "user":
    case "employee":
    case "utilizador normal":
      return "Utilizador";

    default:
      // Unknown roles must not receive administrative privileges.
      return "Utilizador";
  }
}

/*
 * ============================================================
 * LOAD ALL PERMISSIONS
 * ============================================================
 *
 * Admin has full access to the permission catalogue.
 * New permissions are included automatically.
 */

async function getAllPermissions(): Promise<PermissionSet> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("permissions")
    .select("key");

  if (error) {
    console.error("Error loading permission catalogue:", error);
    throw new Error("Não foi possível carregar as permissões.");
  }

  const permissionKeys = (data ?? [])
    .map((row) => row.key)
    .filter(
      (key): key is Permission =>
        typeof key === "string",
    );

  return createPermissionSet(permissionKeys);
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

    throw new Error(
      "Não foi possível carregar as permissões da função.",
    );
  }

  if (!rolePermissions?.length) {
    return createPermissionSet([]);
  }

  const permissionIds = rolePermissions.map(
    (item) => item.permission_id,
  );

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

    throw new Error(
      "Não foi possível carregar as permissões.",
    );
  }

  const permissionKeys = (permissionRows ?? [])
    .map((permission) => permission.key)
    .filter(
      (key): key is Permission =>
        typeof key === "string",
    );

  return createPermissionSet(permissionKeys);
}

/*
 * ============================================================
 * APPLY USER-SPECIFIC OVERRIDES
 * ============================================================
 *
 * Requires:
 * public.user_permission_overrides
 *
 * effect = "allow" grants a permission.
 * effect = "deny" removes a permission.
 *
 * Overrides are applied after role permissions.
 */

async function applyUserPermissionOverrides(
  profileId: string,
  basePermissions: PermissionSet,
): Promise<PermissionSet> {
  const supabase = await getSupabase();

  const {
    data: overrides,
    error,
  } = await supabase
    .from("user_permission_overrides")
    .select("effect, permissions!inner(key)")
    .eq("profile_id", profileId);

  if (error) {
    console.error(
      "Error loading user permission overrides:",
      error,
    );

    // Do not continue with potentially incomplete authorization.
    throw new Error(
      "Não foi possível validar as permissões individuais.",
    );
  }

  const effectivePermissions = new Set<Permission>(
    Array.from(basePermissions),
  );

  for (const override of overrides ?? []) {
    const permission = override.permissions as unknown as {
      key: string;
    };

    const key = permission.key as Permission;

    if (override.effect === "deny") {
      effectivePermissions.delete(key);
    } else if (override.effect === "allow") {
      effectivePermissions.add(key);
    }
  }

  return createPermissionSet([...effectivePermissions]);
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
   * AUTH USER
   */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /*
   * PROFILE
   */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("profile_id, role_id, department")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error(
      "Error loading current profile:",
      profileError,
    );

    redirect("/login");
  }

  /*
   * ROLE
   */

  const {
    data: roleRecord,
    error: roleError,
  } = await supabase
    .from("roles")
    .select("role_id, name")
    .eq("role_id", profile.role_id)
    .maybeSingle();

  if (roleError || !roleRecord) {
    console.error(
      "Error loading current role:",
      roleError,
    );

    throw new Error(
      "Não foi possível determinar a função do utilizador.",
    );
  }

  const role = normalizeRole(roleRecord.name);

  /*
   * ROLE PERMISSIONS
   */

  let permissions: PermissionSet;

  if (role === "Admin") {
    // Admin bypasses individual denies and has full system access.
    permissions = await getAllPermissions();
  } else {
    permissions = await getPermissionsForRole(
      profile.role_id,
    );

    permissions = await applyUserPermissionOverrides(
      profile.profile_id,
      permissions,
    );
  }

  /*
   * RESULT
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
 *
 * Redirects to the management dashboard if the authenticated
 * user lacks the requested permission.
 *
 * Use server-side resource and project membership checks too.
 */

export async function requirePermission(
  permission: Permission,
): Promise<{
  userId: string;
  role: SystemRole;
  permissions: PermissionSet;
  department: string | null;
}> {
  const auth = await getCurrentUserPermissions();

  if (
    auth.role !== "Admin" &&
    !hasPermission(auth.permissions, permission)
  ) {
    redirect("/management");
  }

  return auth;
}

/*
 * ============================================================
 * CHECK PERMISSION
 * ============================================================
 *
 * Returns a boolean for conditional rendering.
 * Authentication is still required.
 */

export async function checkPermission(
  permission: Permission,
): Promise<boolean> {
  const auth = await getCurrentUserPermissions();

  if (auth.role === "Admin") {
    return true;
  }

  return hasPermission(auth.permissions, permission);
}
