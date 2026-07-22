"use client";
export function ProgressBar({ percent }: { percent: number; }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className="h-2.5 bg-slate-100 rounded-full overflow-hidden"
      role="progressbar"
      aria-label="Progresso da fase atual"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
        style={{ width: `${clamped}%` }} />
    </div>
  );
}
