"use client";
export function EmptyState({ message }: { message: string; }) {
  return <p className="text-sm text-slate-400">{message}</p>;
}
