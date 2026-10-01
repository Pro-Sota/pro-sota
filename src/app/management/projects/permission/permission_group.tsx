// src/app/components/management/projects/permissions/permission_group.tsx

"use client";

import type { Permission } from "@/app/lib/permissions/types";
import PermissionRow from "./permission_row";
import type {
  ProjectPermissionGroup,
} from "./types";

type PermissionGroupProps = {
  group: ProjectPermissionGroup;
  selected: Set<Permission>;
  disabled?: boolean;
  onChange: (
    permission: Permission,
    checked: boolean,
  ) => void;
};

export default function PermissionGroup({
  group,
  selected,
  disabled = false,
  onChange,
}: PermissionGroupProps) {
  const enabledCount = group.permissions.filter(
    (permission) => selected.has(permission.key),
  ).length;

  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E5E0] bg-white">
      <div className="flex items-center justify-between border-b border-[#E8E8E4] bg-[#FAFAF8] px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-[#002950]">
            {group.label}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {enabledCount} de {group.permissions.length} permissões
          </p>
        </div>
      </div>

      <div className="px-5">
        {group.permissions.map((permission) => (
          <PermissionRow
            key={permission.key}
            permission={permission}
            checked={selected.has(permission.key)}
            disabled={disabled}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}