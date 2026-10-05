"use client";

import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="group inline-flex h-11 w-full items-center justify-between rounded-md border border-white/10 bg-transparent px-4 text-sm font-medium text-white/60 transition-colors hover:border-[#BD9655]/40 hover:bg-white/[0.03] hover:text-[#F7F7F5]"
    >
      <span className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Voltar atrás
      </span>
    </button>
  );
}