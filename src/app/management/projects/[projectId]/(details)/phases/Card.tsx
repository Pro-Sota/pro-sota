"use client";
/* ---------- Derived data ---------- */
/* ---------- Shared pieces ---------- */
export function Card({
  children, className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}
    >
      {children}
    </div>
  );
}
