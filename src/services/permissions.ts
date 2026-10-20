import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

import type {
  Member,
  Overrides,
  Permission,
  Role,
} from "@/app/management/team/permissions/types";

type PermissionPageData = {
  members: Member[];
  permissions: Permission[];
  roleDefaults: Record<Role, string[]>;
  initialOverrides: Record<string, Overrides>;
};

type RoleRow = {
  role_id: number;
  name: string;
};

type PermissionRow = {
  permission_id: number;
  key: string;
  name: string;
  module: string;
};

type ProfileRow = {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  department: string | null;
  role_id: number | null;
};

type RolePermissionRow = {
  role_id: number;
  permission_id: number;
};

type PermissionOverrideRow = {
  profile_id: string;
  permission_id: number;
  effect: "allow" | "deny";
};

/**
 * Maps database role names to the internal UI role identifiers.
 *
 * "user" is an internal identifier only. The database role is
 * expected to be named "Utilizador" or "User".
 */
function toRole(name: string): Role | null {
  switch (name.trim().toLowerCase()) {
    case "admin":
      return "admin";

    case "director":
    case "director(a)":
    case "diretor":
    case "diretor(a)":
      return "director";

    case "utilizador":
    case "user":
      return "user";

    default:
      return null;
  }
}

function toInitials(name: string | null): string {
  const initials = (name ?? "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? "")
    .join("");

  return initials || "U";
}

function getFullName(profile: ProfileRow): string {
  return [profile.first_name, profile.last_name]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ");
}

export async function getPermissionsPageData(): Promise<PermissionPageData> {
  const supabase = await createClient(await cookies());

  const [
    profilesResult,
    rolesResult,
    permissionsResult,
    rolePermissionsResult,
    overridesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("profile_id, first_name, last_name, email, department, role_id")
      .order("first_name"),

    supabase
      .from("roles")
      .select("role_id, name")
      .order("role_id"),

    supabase
      .from("permissions")
      .select("permission_id, key, name, module")
      .order("module")
      .order("name"),

    supabase
      .from("role_permissions")
      .select("role_id, permission_id"),

    supabase
      .from("user_permission_overrides")
      .select("profile_id, permission_id, effect"),
  ]);

  if (profilesResult.error) {
    throw new Error(
      `Erro ao carregar membros: ${profilesResult.error.message}`,
    );
  }

  if (rolesResult.error) {
    throw new Error(
      `Erro ao carregar cargos: ${rolesResult.error.message}`,
    );
  }

  if (permissionsResult.error) {
    throw new Error(
      `Erro ao carregar permissões: ${permissionsResult.error.message}`,
    );
  }

  if (rolePermissionsResult.error) {
    throw new Error(
      `Erro ao carregar permissões dos cargos: ${rolePermissionsResult.error.message}`,
    );
  }

  if (overridesResult.error) {
    throw new Error(
      `Erro ao carregar exceções: ${overridesResult.error.message}`,
    );
  }

  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const roles = (rolesResult.data ?? []) as RoleRow[];
  const permissionRows = (permissionsResult.data ?? []) as PermissionRow[];
  const rolePermissionRows = (rolePermissionsResult.data ??
    []) as RolePermissionRow[];
  const overrideRows = (overridesResult.data ?? []) as PermissionOverrideRow[];

  // Keep only database roles that are explicitly supported by the UI.
  const roleById = new Map<number, Role>();

  for (const role of roles) {
    const mappedRole = toRole(role.name);

    if (mappedRole) {
      roleById.set(role.role_id, mappedRole);
    }
  }

  const permissionKeyById = new Map<number, string>(
    permissionRows.map((permission) => [
      permission.permission_id,
      permission.key,
    ]),
  );

  const permissions: Permission[] = permissionRows.map((permission) => ({
    key: permission.key,
    label: permission.name,
    module: permission.module,
  }));

  const members: Member[] = profiles.map((profile) => {
    const fullName = getFullName(profile);
    const mappedRole =
      profile.role_id === null
        ? undefined
        : roleById.get(profile.role_id);

    return {
      id: profile.profile_id,
      profile_id: profile.profile_id,
      first_name: profile.first_name ?? "",
      name: fullName || "Utilizador",
      email: profile.email ?? "",
      department: profile.department ?? "Sem departamento",

      // Do not pretend an unknown database role is a valid user role.
      // "user" is only a UI fallback because Member currently requires Role.
      role: mappedRole ?? "user",

      initials: toInitials(fullName || profile.first_name),
    };
  });

  const roleDefaults: Record<Role, string[]> = {
    admin: permissions.map((permission) => permission.key),
    director: [],
    user: [],
  };

  for (const row of rolePermissionRows) {
    const role = roleById.get(row.role_id);
    const permissionKey = permissionKeyById.get(row.permission_id);

    if (!role || !permissionKey || role === "admin") {
      continue;
    }

    if (!roleDefaults[role].includes(permissionKey)) {
      roleDefaults[role].push(permissionKey);
    }
  }

  const initialOverrides: Record<string, Overrides> = {};

  for (const row of overrideRows) {
    const permissionKey = permissionKeyById.get(row.permission_id);

    if (!permissionKey) {
      continue;
    }

    initialOverrides[row.profile_id] ??= {};

    // Database effect is "allow" or "deny"; UI overrides use booleans.
    initialOverrides[row.profile_id][permissionKey] =
      row.effect === "allow";
  }

  return {
    members,
    permissions,
    roleDefaults,
    initialOverrides,
  };
}