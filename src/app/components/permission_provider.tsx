"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";

import {
  hasAllPermissions,
  hasAnyPermission,
} from "@/app/lib/permissions/access";

import type {
  Permission,
  PermissionContextValue,
  PermissionSet,
} from "@/app/lib/permissions/types";

type Props = {
  children: React.ReactNode;
  permissions: Permission[];
};

const PermissionContext =
  createContext<PermissionContextValue | null>(null);

export default function PermissionProvider({
  children,
  permissions,
}: Props) {
  const permissionSet = useMemo<PermissionSet>(
    () => new Set(permissions),
    [permissions],
  );

  const value = useMemo<PermissionContextValue>(
    () => ({
      permissions: permissionSet,

      can: (permission: Permission) =>
        permissionSet.has(permission),

      canAny: (requiredPermissions: Permission[]) =>
        hasAnyPermission(
          permissionSet,
          requiredPermissions,
        ),

      canAll: (requiredPermissions: Permission[]) =>
        hasAllPermissions(
          permissionSet,
          requiredPermissions,
        ),
    }),
    [permissionSet],
  );

  console.log(
  "CURRENT USER PERMISSIONS:",
  permissions,
);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error(
      "usePermissions must be used inside PermissionProvider.",
    );
  }

  return context;
}