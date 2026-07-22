"use client";
import { config } from "./page";

export function StatusPill({ status }: { status: string; }) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full border h-fit whitespace-nowrap ${config.color}`}
    >
      {config.label}
    </span>
  );
}
