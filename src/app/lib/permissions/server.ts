import { redirect } from "next/navigation";
import { createClient} from "@/app/lib/supabase/server";

import {
  getRolePermissions,
  hasPermission,
} from "./access";

import type {
  Permission,
  PermissionSet,
  SystemRole,
} from "./types";
import { cookies } from "next/headers";

/*
 * ============================================================
 * ROLE NORMALIZATION
 * ============================================================
 * 
 * 
 */


const getSupabase = async () => {
  const cookiesStore = await cookies();
  return createClient(cookiesStore)
}

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
 * CURRENT USER
 * ============================================================
 */

export async function getCurrentUserPermissions(): Promise<{
  userId: string;
  role: SystemRole;
  permissions: PermissionSet;
  department: string | null;
}> {
  const supabase = await getSupabase();

  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("profile_id, role_id, department")
      .eq("profile_id", user.id)
      .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  /*
   * Current project role mapping:
   *
   * 1 = Superadmin
   * 2 = Admin
   * 3 = Director
   * 4 = Utilizador
   */

  const role = normalizeRole(
    profile.role_id === 1
      ? "Superadmin"
      : profile.role_id === 2
        ? "Admin"
        : profile.role_id === 3
          ? "Director"
          : "Utilizador",
  );

  const permissions = getRolePermissions(role);
  const department =profile.department;

  return {
    userId: profile.profile_id,
    role:role,
    permissions: permissions,
    department: department,
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
}> {
  const auth = await getCurrentUserPermissions();

  if (
    auth.role !== "Superadmin" &&
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
 */

export async function checkPermission(
  permission: Permission,
): Promise<boolean> {
  const auth = await getCurrentUserPermissions();

  if (auth.role === "Superadmin") {
    return true;
  }

  return hasPermission(
    auth.permissions,
    permission,
  );
}