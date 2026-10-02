"use client";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function InfoCard({
  icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-[#BD9955]/50 hover:shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#BD9955]/10 text-[#BD9955] transition-colors duration-200 group-hover:bg-[#BD9955]/15">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-[#002950]">
          {value}
        </p>
      </div>
    </div>
  );
}