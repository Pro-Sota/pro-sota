// src/app/not-found.tsx

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import BackButton from "./components/back_button";

export default function NotFound() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#151515] text-[#F7F7F5]">
      {/* Subtle architectural grid */}
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
        className="pointer-events-none absolute right-[6%] top-[10%] hidden h-28 w-28 border border-[#BD9655]/20 lg:block"
      >
        <div className="absolute -left-px top-1/2 h-px w-14 bg-[#BD9655]/30" />
        <div className="absolute -top-px left-1/2 h-14 w-px bg-[#BD9655]/30" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col px-6 py-6 sm:px-8 sm:py-8 lg:px-10">
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between border-t border-white/10 pt-5 sm:pt-6">
          <Image
            src="/images/logo_black.png"
            alt="Pro-Sota"
            width={160}
            height={48}
            className="h-auto w-32 brightness-0 invert sm:w-36"
            priority
          />

          <span className="hidden text-[10px] uppercase tracking-[0.25em] text-white/30 sm:block">
            Erro 404
          </span>
        </header>

        {/* Main */}
        <div className="flex min-h-0 flex-1 items-center">
          <div className="w-full">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
              {/* Content */}
              <div className="max-w-2xl">
                <div className="mb-5 flex items-center gap-3 sm:mb-6">
                  <span className="h-px w-6 bg-[#BD9655] sm:w-8" />

                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#BD9655] sm:text-xs sm:tracking-[0.2em]">
                    Página não encontrada
                  </span>
                </div>

                <p className="text-[clamp(5.5rem,15vw,10rem)] font-semibold leading-[0.75] tracking-[-0.09em] text-[#F7F7F5]">
                  404
                </p>

                <h1 className="mt-7 max-w-xl text-2xl font-medium tracking-[-0.03em] text-[#F7F7F5] sm:mt-9 sm:text-3xl md:text-4xl lg:text-5xl">
                  Parece que tomou um caminho que não existe.
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/45 sm:mt-4 sm:text-base sm:leading-7">
                  A página que procura pode ter sido movida, removida ou o
                  endereço introduzido pode estar incorrecto.
                </p>
              </div>

              {/* Actions */}
              <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-48">
                <Link
                  href="/"
                  className="group inline-flex h-11 w-full items-center justify-between rounded-md bg-[#BD9655] px-4 text-sm font-medium text-[#151515] transition-colors hover:bg-[#CAA66A]"
                >
                  <span>Página inicial</span>

                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>

                <BackButton />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-white/10 pt-4 sm:pt-5">
          <div className="flex flex-col gap-1.5 text-[10px] uppercase tracking-[0.12em] text-white/25 sm:flex-row sm:items-center sm:justify-between sm:text-[11px]">
            <span>Pro-Sota</span>

            <span>Gestão de Arquitectura &amp; Engenharia</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
