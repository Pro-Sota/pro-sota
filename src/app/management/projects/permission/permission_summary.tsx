// src/app/components/management/projects/permissions/permission_summary.tsx

"use client";

import type { Permission } from "@/app/lib/permissions/types";
import { PROJECT_PERMISSION_GROUPS } from "./types";

type Props = {
  selected: Set<Permission>;
};

export default function PermissionSummary({
  selected,
}: Props) {
  const total = PROJECT_PERMISSION_GROUPS.reduce(
    (count, group) =>
      count + group.permissions.length,
    0,
  );

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E5E5E0] bg-white px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-[#002950]">
          Permissões do projecto
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Apenas as permissões atribuídas neste projecto.
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-semibold text-[#002950]">
          {selected.size}
        </p>

        <p className="text-xs text-gray-500">
          de {total}
        </p>
      </div>
    </div>
  );
}