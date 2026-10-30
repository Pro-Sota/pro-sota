
import Image from "next/image";
import Link from "next/link";

const FOUNDING_YEAR = 1997;

export default function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-[#F7F7F5]"
    >
      <div className="mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-[1600px] lg:grid-cols-[0.9fr_1.1fr]">
        {/* LEFT: EDITORIAL INTRODUCTION */}
        <div className="relative z-10 flex flex-col justify-between px-6 py-16 md:px-12 md:py-20 lg:px-16 lg:py-24">
          <div>
            <p className="mb-12 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#002950]/60">
              <span className="h-px w-9 bg-[#BD9655]" />
              Angola · Desde {FOUNDING_YEAR}
            </p>

            <h1 className="text-[clamp(4rem,8vw,7.5rem)] font-semibold leading-[0.82] tracking-[-0.075em] text-[#002950]">
              PRO
              <br />
              SOTA<span className="text-[#BD9655]">.</span>
            </h1>

            <div className="mt-12 max-w-lg">
              <h2 className="text-3xl font-medium leading-[1.15] tracking-[-0.04em] text-[#002950] md:text-4xl">
                Pensamos espaços.
                <br />
                <span className="text-[#002950]/40">
                  Construímos possibilidades.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-sm leading-7 text-[#666D73] md:text-base">
                Unimos arquitectura, engenharia e construção para
                desenvolver soluções integradas, funcionais e duradouras.
                Cada projecto reflecte o nosso compromisso com a qualidade,
                o rigor e a excelência.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link
                  href="/portfolio"
                  className="group inline-flex h-12 items-center gap-4 bg-[#002950] px-6 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#BD9655]"
                >
                  Explorar projectos
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/#contacto"
                  className="text-xs font-semibold uppercase tracking-wider text-[#002950] underline decoration-[#BD9655] decoration-2 underline-offset-8 transition-colors hover:text-[#BD9655]"
                >
                  Fale connosco
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-between border-t border-[#002950]/15 pt-5">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#777D82]">
              Arquitectura · Engenharia · Construção
            </span>

            <span className="text-[10px] font-medium tracking-wider text-[#777D82]">
              01 / 04
            </span>
          </div>
        </div>

        {/* RIGHT: ARCHITECTURAL IMAGE */}
        <div className="relative min-h-[480px] overflow-hidden bg-[#D9D9D5] lg:min-h-full">
          <Image
            src="images/planta-arquitectonica.svg"
            alt="Projecto de arquitectura da PRO SOTA"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#002950]/35 via-transparent to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white md:bottom-12 md:left-12 md:right-12">
            <div>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                A nossa visão
              </span>

              <p className="max-w-xs text-xl font-medium leading-tight md:text-2xl">
                Espaços concebidos para permanecer.
              </p>
            </div>

            <span className="hidden text-xs tracking-wider text-white/70 sm:block">
              LUANDA, ANGOLA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
