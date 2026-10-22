
"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, RefreshCw } from "lucide-react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Pro-Sota application error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#151515] text-[#F7F7F5] selection:bg-[#BD9655]/30">
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-[#BD9655]/[0.045] blur-[120px]"
      />

      {/* Architectural linework */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[22%] hidden h-80 w-64 border border-[#BD9655]/10 lg:block"
      >
        <div className="absolute left-1/2 top-0 h-full w-px bg-[#BD9655]/10" />
        <div className="absolute left-0 top-1/3 h-px w-full bg-[#BD9655]/10" />
        <div className="absolute left-0 top-2/3 h-px w-full bg-[#BD9655]/10" />
        <div className="absolute bottom-0 left-0 h-1/3 w-1/2 border-r border-t border-[#BD9655]/15" />
        <div className="absolute right-0 top-0 h-1/3 w-1/2 border-b border-l border-[#BD9655]/15" />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 sm:px-10 lg:px-16">
        <a
          href="/"
          aria-label="Pro-Sota — página inicial"
          className="inline-flex items-center rounded-sm outline-none transition-opacity hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[#BD9655]"
        >
          <Image
            src="/images/logo_black.png"
            alt="Pro-Sota"
            width={160}
            height={48}
            priority
            className="h-auto w-32 brightness-0 invert sm:w-36"
          />
        </a>

        <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-white/35 sm:block">
          Arquitectura · Engenharia
        </span>

        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#BD9655] sm:hidden">
          Pro-Sota
        </span>
      </header>

      {/* Main content */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pb-20 pt-12 sm:px-10 sm:pb-28 sm:pt-16 lg:px-16">
        <div className="w-full max-w-2xl">
          {/* Error identifier */}
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#BD9655]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#BD9655]">
              Erro inesperado
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-8 text-[2.65rem] font-medium leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Algo não correu
            <span className="text-white/40">
              {" "} como planeado.
            </span>
          </h1>

          <p className="mt-7 max-w-md text-sm leading-7 text-white/50 sm:text-base sm:leading-8">
            Não foi possível carregar esta página. Pode tentar novamente ou
            regressar à página anterior para continuar o seu trabalho.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={reset}
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-sm bg-[#BD9655] px-6 text-sm font-medium text-[#151515] transition-colors hover:bg-[#CAA66A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151515]"
            >
              <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
              Tentar novamente
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.assign("/");
                }
              }}
              className="group inline-flex h-12 items-center justify-center gap-3 rounded-sm border border-white/10 px-6 text-sm font-medium text-white/65 transition-colors hover:border-[#BD9655]/40 hover:bg-white/[0.03] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Voltar atrás
            </button>
          </div>

          {/* Technical reference */}
          {error.digest && (
            <p className="mt-8 text-xs text-white/30">
              Referência do erro:{" "}
              <span className="font-mono text-white/45">
                {error.digest}
              </span>
            </p>
          )}

          {/* Small status detail */}
          <div className="mt-16 flex items-center gap-3 border-t border-white/[0.08] pt-5 sm:mt-20">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#BD9655]"
            />
            <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">
              Sistema de gestão Pro-Sota
            </span>
            <span className="ml-auto text-[10px] text-white/20">
              Código 500
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
            Pro-Sota © {new Date().getFullYear()}
          </p>

          <a
            href="/"
            className="group inline-flex w-fit items-center gap-2 text-xs text-white/40 transition-colors hover:text-[#BD9655]"
          >
            Página inicial
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </footer>
    </main>
  );
}
