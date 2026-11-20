
import type { ReactNode } from "react";

interface KpiCardProps {
  icon: ReactNode;
  title: string;
  value: string;
}

export default function KpiCard({
  icon,
  title,
  value,
}: KpiCardProps) {
  const hasPercentage = title.toLowerCase() === "progresso";

  const percentage = hasPercentage
    ? Math.max(0, Math.min(100, Number.parseFloat(value) || 0))
    : 0;

  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
          {icon}
        </span>
      </div>

      <p className="mt-5 text-sm text-gray-500">{title}</p>

      <h2 className="mt-1 text-2xl font-bold text-gray-900">
        {value}
      </h2>

      {hasPercentage && (
        <div className="mt-4">
          <div
            role="progressbar"
            aria-label="Progresso do projecto"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            className="h-1.5 overflow-hidden rounded-full bg-gray-100"
          >
            <div
              className="h-full rounded-full bg-[#002950] transition-[width] duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
