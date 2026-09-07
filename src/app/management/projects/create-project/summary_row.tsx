"use client";
export function SummaryRow({
  label, value, emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  filled?:boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd
        className={`truncate text-right ${emphasize
          ? "font-mono font-semibold text-[#1B3A5C]"
          : "font-medium text-slate-700"}`}
      >
        {value}
      </dd>
    </div>
  );
}
