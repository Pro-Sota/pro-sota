"use client";

export function StatusPill({label,  color }: { label:string; color:string }) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border h-fit whitespace-nowrap ${color}`}
    >
      {label}
    </span>
  );
}
