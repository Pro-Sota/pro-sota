"use client";

import {
  formatMessageDate,
} from "../utils/message_date";

interface Props {
  timestamp: string;
}

export default function MessageDateDivider({
  timestamp,
}: Props) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />

      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
        {formatMessageDate(timestamp)}
      </span>

      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}