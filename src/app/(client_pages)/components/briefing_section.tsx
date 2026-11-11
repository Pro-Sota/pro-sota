
import Link from "next/link";

export default function BriefingSection() {
  return (
    <section
      id="briefing"
      aria-labelledby="briefing-title"
      className="relative overflow-hidden bg-[#F7F7F5] text-[#002950]"
    >
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-12 px-6 py-24 md:px-12 md:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20 lg:px-20">

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-8 bg-[#BD9655]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#BD9655]">
              O próximo passo começa aqui
            </span>
          </div>

          <h2
            id="briefing-title"
            className="max-w-3xl text-[clamp(3rem,6.5vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.055em]"
          >
            Tem um projecto
            <br />
            <span className="font-light text-[#BD9655]">
              em mente?
            </span>
          </h2>

          <p className="mt-8 max-w-xl text-base leading-8 text-[#002950]/70 md:text-lg">
            Cada projecto começa com uma ideia. Partilhe connosco a sua visão,
            as características do espaço e os seus objectivos. Queremos
            compreender as suas necessidades para encontrar a melhor solução.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/project-briefing"
              className="group inline-flex min-h-[56px] items-center gap-8 bg-[#002950] px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#BD9655]"
            >
              <span>Iniciar briefing</span>
              <span
                aria-hidden="true"
                className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              >
                <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-white" />
                <span className="absolute bottom-[2px] right-0 h-px w-3 -rotate-45 origin-right bg-white" />
              </span>
            </Link>

            <span className="text-xs text-[#002950]/55">
              Um primeiro passo para concretizar a sua ideia.
            </span>
          </div>
        </div>

        {/* Architectural visual */}
        <div className="relative min-h-[340px] overflow-hidden border border-[#002950]/10 bg-white md:min-h-[440px]">
          {/* Technical grid */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#002950 1px, transparent 1px), linear-gradient(90deg, #002950 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="absolute left-6 top-6 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#BD9655]" />
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#002950]/60">
              PRO SOTA · PROJECT BRIEF
            </span>
          </div>

          {/* Architectural composition */}
          <div className="absolute inset-0 flex items-center justify-center px-8 pt-8">
            <svg
              viewBox="0 0 500 390"
              role="img"
              aria-label="Desenho técnico arquitectónico ilustrativo"
              className="h-auto w-full max-w-[470px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g stroke="#002950" strokeWidth="1.2">
                <path d="M75 300 L75 145 L190 80 L305 145 L305 300" />
                <path d="M75 145 L190 210 L305 145" />
                <path d="M190 80 L190 210" />
                <path d="M75 300 L190 365 L305 300" />
                <path d="M190 210 L190 365" />
                <path d="M305 145 L420 80 L420 235 L305 300" />
                <path d="M305 145 L420 210 L420 365 L305 300" />
                <path d="M190 80 L305 145 L420 80" opacity=".4" />
                <path d="M75 145 L190 80 L305 145" opacity=".4" />
                <path d="M110 165 L110 275 L155 301 L155 190 Z" opacity=".65" />
                <path d="M225 166 L225 276 L270 250 L270 140 Z" opacity=".65" />
                <path d="M340 166 L340 276 L385 250 L385 140 Z" opacity=".65" />
              </g>

              <g stroke="#BD9655" strokeWidth="1.5">
                <path d="M190 80 L190 32" />
                <path d="M182 40 L190 32 L198 40" />
                <path d="M75 320 L305 320" />
                <path d="M75 314 L75 326 M305 314 L305 326" />
              </g>

              <g fill="#BD9655">
                <circle cx="190" cy="80" r="3" />
                <circle cx="305" cy="145" r="3" />
                <circle cx="190" cy="210" r="3" />
              </g>

              <g stroke="#002950" strokeWidth=".8" opacity=".35">
                <path d="M55 80 L55 300 M48 80 L62 80 M48 300 L62 300" />
                <path d="M75 345 L305 345" />
                <path d="M75 339 L75 351 M305 339 L305 351" />
              </g>
            </svg>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between border-t border-[#002950]/15 pt-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#002950]/50">
                Da ideia à realidade
              </p>
              <p className="mt-1 text-xs font-medium text-[#002950]">
                Arquitectura · Engenharia · Construção
              </p>
            </div>
            <span className="text-[10px] tracking-widest text-[#BD9655]">
              PS — 01
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
