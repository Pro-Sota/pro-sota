// src/app/components/management/projects/permissions/permission_row.tsx

"use client";

import type { Permission } from "@/app/lib/permissions/types";
import { ACTION_LABELS } from "./types";
import type {
  ProjectPermissionDefinition,
} from "./types";

type PermissionRowProps = {
  permission: ProjectPermissionDefinition;
  checked: boolean;
  disabled?: boolean;
  onChange: (permission: Permission, checked: boolean) => void;
};

export default function PermissionRow({
  permission,
  checked,
  disabled = false,
  onChange,
}: PermissionRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E8E8E4] py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#002950]">
          {permission.label}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {ACTION_LABELS[permission.action]}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${permission.label}: ${
          checked ? "activo" : "inactivo"
        }`}
        disabled={disabled}
        onClick={() =>
          onChange(permission.key, !checked)
        }
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition",
          "focus:outline-none focus:ring-2 focus:ring-[#BD9655]/40",
          checked
            ? "bg-[#002950]"
            : "bg-[#D8D8D3]",
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}