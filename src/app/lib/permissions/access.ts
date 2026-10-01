import {
  ROLE_PERMISSIONS,
} from "./constants";

import type {
  Permission,
  PermissionSet,
  SystemRole,
} from "./types";

export function createPermissionSet(
  permissions: Permission[],
): PermissionSet {
  return new Set(permissions);
}

export function getRolePermissions(
  role: SystemRole,
): PermissionSet {
  return createPermissionSet(
    ROLE_PERMISSIONS[role] ?? [],
  );
}

export function hasPermission(
  permissions: PermissionSet,
  permission: Permission,
): boolean {
  return permissions.has(permission);
}

export function hasAnyPermission(
  permissions: PermissionSet,
  requiredPermissions: Permission[],
): boolean {
  return requiredPermissions.some((permission) =>
    permissions.has(permission),
  );
}

export function hasAllPermissions(
  permissions: PermissionSet,
  requiredPermissions: Permission[],
): boolean {
  return requiredPermissions.every((permission) =>
    permissions.has(permission),
  );
}