"use client";

export function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#002950]/10 bg-white p-5 transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,41,80,0.04)]">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F7F7F5] text-[#002950]">
          {icon}
        </span>

        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#BD9655]" />
      </div>

      <div className="mt-7 space-y-1">
        <p className="text-[13px] tracking-wide text-gray-500">
          {title}
        </p>

        <h2 className="text-3xl tracking-tight text-[#002950]">
          {value}
        </h2>
      </div>
    </div>
  );
}