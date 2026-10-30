
import "server-only";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import {
    createPermissionSet,
    hasPermission,
} from "./access";

import { ALL_PERMISSIONS } from "./constants";

import type {
    Permission,
    PermissionSet,
    SystemRole,
    PermissionOverride,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Supabase                                                                   */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

/* -------------------------------------------------------------------------- */
/* Permission validation                                                      */
/* -------------------------------------------------------------------------- */

const VALID_PERMISSIONS = new Set<string>(ALL_PERMISSIONS);

function isPermission(value: unknown): value is Permission {
    return (
        typeof value === "string" &&
        VALID_PERMISSIONS.has(value)
    );
}

/* -------------------------------------------------------------------------- */
/* Role normalization                                                         */
/* -------------------------------------------------------------------------- */

function normalizeRole(role?: string | null): SystemRole {
    const normalized = role?.trim().toLowerCase();

    switch (normalized) {
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
            // Unknown roles never receive administrative privileges.
            return "Utilizador";
    }
}

/* -------------------------------------------------------------------------- */
/* Load all known permissions                                                 */
/* -------------------------------------------------------------------------- */

async function getAllPermissions(): Promise<PermissionSet> {
    // The TypeScript catalogue is the application's source of valid keys.
    return createPermissionSet([...ALL_PERMISSIONS]);
}

/* -------------------------------------------------------------------------- */
/* Load permissions assigned to a role                                       */
/* -------------------------------------------------------------------------- */

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
        .filter(isPermission);

    return createPermissionSet(permissionKeys);
}

/* -------------------------------------------------------------------------- */
/* Load individual user overrides                                            */
/* -------------------------------------------------------------------------- */

async function getUserPermissionOverrides(
    profileId: string,
): Promise<PermissionOverride[]> {
    const supabase = await getSupabase();

    const {
        data,
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

        throw new Error(
            "Não foi possível validar as permissões individuais.",
        );
    }

    return (data ?? []).flatMap((row) => {
        const relation = row.permissions as unknown as
            | { key: string }
            | { key: string }[]
            | null;

        const permissionRecord = Array.isArray(relation)
            ? relation[0]
            : relation;

        if (
            !permissionRecord ||
            !isPermission(permissionRecord.key)
        ) {
            return [];
        }

        if (
            row.effect !== "allow" &&
            row.effect !== "deny"
        ) {
            return [];
        }

        return [{
            permissionKey: permissionRecord.key,
            effect: row.effect,
        }];
    });
}

/* -------------------------------------------------------------------------- */
/* Current authenticated user permissions                                    */
/* -------------------------------------------------------------------------- */

export async function getCurrentUserPermissions(): Promise<{
    userId: string;
    role: SystemRole;
    permissions: PermissionSet;
    department: string | null;
}> {
    const supabase = await getSupabase();

    /* AUTH USER */

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect("/login");
    }

    /* PROFILE */

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

    /* ROLE */

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

    /* PERMISSIONS */

    let permissions: PermissionSet;

    if (role === "Admin") {
        // Admin always receives the complete application catalogue.
        // Individual overrides do not restrict Admin.
        permissions = await getAllPermissions();
    } else {
        const rolePermissions = await getPermissionsForRole(
            profile.role_id,
        );

        const overrides = await getUserPermissionOverrides(
            profile.profile_id,
        );

        const effectivePermissions = new Set<Permission>(
            rolePermissions,
        );

        // Apply explicit grants.
        for (const override of overrides) {
            if (override.effect === "allow") {
                effectivePermissions.add(
                    override.permissionKey,
                );
            }
        }

        // Apply explicit restrictions last.
        for (const override of overrides) {
            if (override.effect === "deny") {
                effectivePermissions.delete(
                    override.permissionKey,
                );
            }
        }

        permissions = createPermissionSet(
            [...effectivePermissions],
        );
    }

    return {
        userId: profile.profile_id,
        role,
        permissions,
        department: profile.department,
    };
}

/* -------------------------------------------------------------------------- */
/* Require permission                                                         */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Check permission                                                           */
/* -------------------------------------------------------------------------- */

export async function checkPermission(
    permission: Permission,
): Promise<boolean> {
    const auth = await getCurrentUserPermissions();

    if (auth.role === "Admin") {
        return true;
    }

    return hasPermission(auth.permissions, permission);
}
