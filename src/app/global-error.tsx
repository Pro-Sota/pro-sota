// src/app/error.tsx

"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#151515] px-6 text-[#F7F7F5]">
      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Architectural accent */}
      <div
        aria-hidden="true"
        className="absolute right-[8%] top-[12%] hidden h-28 w-28 border border-[#BD9655]/20 md:block"
      >
        <div className="absolute left-1/2 top-0 h-14 w-px bg-[#BD9655]/30" />
        <div className="absolute left-0 top-1/2 h-px w-14 bg-[#BD9655]/30" />
      </div>

      <div className="relative w-full max-w-3xl">
        {/* Header */}
        <div className="border-t border-white/10 pt-6">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#BD9655]">
            Pro-Sota
          </span>
        </div>

        {/* Content */}
        <div className="mt-20">
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            Erro inesperado
          </span>

          <h1 className="mt-6 max-w-2xl text-4xl font-medium tracking-[-0.035em] md:text-6xl">
            Esta página não pôde ser carregada.
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-white/45 md:text-base">
            Ocorreu um problema ao carregar esta página. Tente novamente ou
            volte para a página anterior.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#BD9655] px-5 text-sm font-medium text-[#151515] transition-colors hover:bg-[#CAA66A]"
            >
              <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Tentar novamente
            </button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-5 text-sm font-medium text-white/60 transition-colors hover:border-[#BD9655]/40 hover:bg-white/[0.03] hover:text-[#F7F7F5]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Voltar atrás
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-2 text-[10px] uppercase tracking-[0.12em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <span>Erro 500</span>
            <span>Gestão de Arquitectura &amp; Engenharia</span>
          </div>
        </div>
      </div>
    </main>
  );
}