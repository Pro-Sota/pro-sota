
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    type ReactNode,
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
    children: ReactNode;
    permissions: readonly Permission[];
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

    const can = useCallback(
        (permission: Permission): boolean =>
            permissionSet.has(permission),
        [permissionSet],
    );

    const canAny = useCallback(
        (requiredPermissions: readonly Permission[]): boolean =>
            hasAnyPermission(
                permissionSet,
                requiredPermissions,
            ),
        [permissionSet],
    );

    const canAll = useCallback(
        (requiredPermissions: readonly Permission[]): boolean =>
            hasAllPermissions(
                permissionSet,
                requiredPermissions,
            ),
        [permissionSet],
    );

    const value = useMemo<PermissionContextValue>(
        () => ({
            permissions: permissionSet,
            can,
            canAny,
            canAll,
        }),
        [permissionSet, can, canAny, canAll],
    );

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissions(): PermissionContextValue {
    const context = useContext(PermissionContext);

    if (context === null) {
        throw new Error(
            "usePermissions must be used inside PermissionProvider.",
        );
    }

    return context;
}
