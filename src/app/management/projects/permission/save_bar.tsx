// src/app/components/management/projects/permissions/permission_save_bar.tsx

"use client";

import { Check, Loader2 } from "lucide-react";

type Props = {
  saving: boolean;
  dirty: boolean;
  onSave: () => void;
};

export default function PermissionSaveBar({
  saving,
  dirty,
  onSave,
}: Props) {
  return (
    <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-xl border border-[#E5E5E0] bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
      <div>
        <p className="text-sm font-medium text-[#002950]">
          {dirty
            ? "Existem alterações por guardar."
            : "Todas as alterações estão guardadas."}
        </p>

        {dirty && (
          <p className="mt-1 text-xs text-gray-500">
            As permissões serão aplicadas apenas a este projecto.
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={!dirty || saving}
        onClick={onSave}
        className={[
          "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5",
          "text-sm font-medium text-white transition",
          "bg-[#002950] hover:bg-[#003B70]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        {saving ? (
          <Loader2
            size={16}
            className="animate-spin"
          />
        ) : (
          <Check size={16} />
        )}

        {saving ? "A guardar..." : "Guardar alterações"}
      </button>
    </div>
  );
}