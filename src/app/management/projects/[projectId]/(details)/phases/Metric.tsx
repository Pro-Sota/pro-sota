"use client";
export function Metric({ title, value }: { title: string; value: string; }) {
  return (
    <div className="rounded-lg p-4 border bg-white border-slate-200">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
        {value}
      </p>
    </div>
  );
}
