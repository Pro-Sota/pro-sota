
import type {
    Permission,
    PermissionSet,
    PermissionOverride,
    SystemRole,
} from "./types";

import { ROLE_PERMISSIONS } from "./constants";

/* -------------------------------------------------------------------------- */
/* Permission set                                                             */
/* -------------------------------------------------------------------------- */

export function createPermissionSet(
    permissions: Permission[],
): PermissionSet {
    return new Set(permissions);
}

/* -------------------------------------------------------------------------- */
/* Individual permission checks                                               */
/* -------------------------------------------------------------------------- */

export function hasPermission(
    permissions: PermissionSet,
    permission: Permission,
): boolean {
    return permissions.has(permission);
}

export function hasAnyPermission(
    permissions: PermissionSet,
    requiredPermissions: readonly Permission[],
): boolean {
    return requiredPermissions.some((permission) =>
        permissions.has(permission),
    );
}

export function hasAllPermissions(
    permissions: PermissionSet,
    requiredPermissions: readonly Permission[],
): boolean {
    return requiredPermissions.every((permission) =>
        permissions.has(permission),
    );
}

/* -------------------------------------------------------------------------- */
/* Role permissions                                                           */
/* -------------------------------------------------------------------------- */

export function getRolePermissions(
    role: SystemRole,
): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
}

/* -------------------------------------------------------------------------- */
/* Effective permissions                                                      */
/* -------------------------------------------------------------------------- */

export function resolvePermissions({
    role,
    overrides = [],
}: {
    role: SystemRole;
    overrides?: PermissionOverride[];
}): PermissionSet {
    const effectivePermissions = new Set<Permission>(
        getRolePermissions(role),
    );

    // Explicit grants.
    for (const override of overrides) {
        if (override.effect === "allow") {
            effectivePermissions.add(override.permissionKey);
        }
    }

    // Explicit restrictions always take precedence.
    for (const override of overrides) {
        if (override.effect === "deny") {
            effectivePermissions.delete(override.permissionKey);
        }
    }

    return effectivePermissions;
}

/* -------------------------------------------------------------------------- */
/* Settings permission helpers                                                */
/* -------------------------------------------------------------------------- */

export function canViewSettings(
    permissions: PermissionSet,
): boolean {
    return hasPermission(permissions, "settings.view");
}

export function canManageRolePermissions(
    permissions: PermissionSet,
): boolean {
    return hasPermission(permissions, "settings.roles.manage");
}

export function canViewRolePermissions(
    permissions: PermissionSet,
): boolean {
    return hasAnyPermission(permissions, [
        "settings.roles.view",
        "settings.roles.manage",
    ]);
}

export function canManageGlobalNotifications(
    permissions: PermissionSet,
): boolean {
    return hasPermission(
        permissions,
        "settings.notifications.manage",
    );
}

export function canViewGlobalNotifications(
    permissions: PermissionSet,
): boolean {
    return hasAnyPermission(permissions, [
        "settings.notifications.view",
        "settings.notifications.manage",
    ]);
}

export function canManageOperationalSettings(
    permissions: PermissionSet,
): boolean {
    return hasPermission(
        permissions,
        "settings.operational.manage",
    );
}

export function canViewOperationalSettings(
    permissions: PermissionSet,
): boolean {
    return hasAnyPermission(permissions, [
        "settings.operational.view",
        "settings.operational.manage",
    ]);
}

export function canViewSettingsAudit(
    permissions: PermissionSet,
): boolean {
    return hasPermission(permissions, "settings.audit.view");
}
