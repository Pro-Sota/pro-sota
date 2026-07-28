"use client";

export function ProgressBar({ value }: { value: number; }) {
  return (
    <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100 sm:w-56">
      <div
        className={`h-full rounded-full transition-all duration-500 ${value === 100 ? "bg-emerald-500" : "bg-[#1B3A5C]"}`}
        style={{ width: `${value}%` }} />
    </div>
  );
}
