import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value?: string | null;
};

export function DetailItem({
  icon: Icon,
  label,
  value,
}: Props) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

      <div className="min-w-0">
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-[#002950]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}