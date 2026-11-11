
import Link from "next/link";

export default function BriefingSection() {
  return (
    <section
      id="briefing"
      aria-labelledby="briefing-title"
      className="relative overflow-hidden bg-[#F7F7F5] text-[#002950]"
    >
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-10 px-6 py-20 md:px-12 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20 lg:px-20">

        {/* Architectural visual — first on mobile */}
        <div className="relative order-1 min-h-[300px] overflow-hidden border border-[#002950]/10 bg-[#FDFCFA] sm:min-h-[380px] lg:order-2 lg:min-h-[480px]">

          {/* Technical drawing grid */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(#002950 1px, transparent 1px), linear-gradient(90deg, #002950 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Soft architectural atmosphere */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 48%, rgba(189,150,85,0.10), transparent 65%)",
            }}
          />

          {/* Drawing label */}
          <div className="absolute left-5 top-5 z-10 flex items-center gap-2 sm:left-7 sm:top-7">
            <span className="h-1.5 w-1.5 rounded-full bg-[#BD9655]" />
            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#002950]/65">
              PRO SOTA · ESTUDO ARQUITECTÓNICO
            </span>
          </div>

          {/* Architectural illustration */}
          <div className="absolute inset-0 flex items-center justify-center px-3 pb-5 pt-10 sm:px-8 sm:pb-8 sm:pt-12">
            <svg
              viewBox="0 0 620 460"
              role="img"
              aria-label="Ilustração técnica de um edifício contemporâneo"
              className="h-auto w-full max-w-[560px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="briefingFacade" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#002950" stopOpacity=".025" />
                  <stop offset="1" stopColor="#002950" stopOpacity=".12" />
                </linearGradient>
                <linearGradient id="briefingGlass" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#BD9655" stopOpacity=".06" />
                  <stop offset="1" stopColor="#002950" stopOpacity=".13" />
                </linearGradient>
              </defs>

              {/* Ground and construction guides */}
              <g stroke="#002950" strokeWidth="1" opacity=".2">
                <path d="M55 374 L310 424 L565 374" />
                <path d="M85 391 L310 435 L535 391" strokeDasharray="3 5" />
                <path d="M310 55 V425" strokeDasharray="3 7" />
                <path d="M55 225 H565" strokeDasharray="3 7" />
              </g>

              {/* Building roof */}
              <path
                d="M115 188 L310 82 L505 188 L310 295 Z"
                fill="#002950"
                fillOpacity=".035"
                stroke="#002950"
                strokeWidth="1.7"
              />

              {/* Main building volume */}
              <path
                d="M115 188 L310 295 L310 391 L115 284 Z"
                fill="url(#briefingFacade)"
                stroke="#002950"
                strokeWidth="1.5"
              />
              <path
                d="M310 295 L505 188 L505 284 L310 391 Z"
                fill="#002950"
                fillOpacity=".065"
                stroke="#002950"
                strokeWidth="1.5"
              />

              {/* Upper volume */}
              <path
                d="M176 150 L310 78 L444 150 L310 223 Z"
                fill="#FDFCFA"
                stroke="#002950"
                strokeWidth="1.5"
              />
              <path
                d="M176 150 L310 223 L310 292 L176 219 Z"
                fill="url(#briefingFacade)"
                stroke="#002950"
                strokeWidth="1.3"
              />
              <path
                d="M310 223 L444 150 L444 219 L310 292 Z"
                fill="#002950"
                fillOpacity=".055"
                stroke="#002950"
                strokeWidth="1.3"
              />

              {/* Upper left windows */}
              <path
                d="M194 155 L242 181 L242 229 L194 203 Z"
                fill="url(#briefingGlass)"
                stroke="#002950"
                strokeWidth="1.1"
              />
              <path
                d="M251 186 L293 209 L293 257 L251 234 Z"
                fill="url(#briefingGlass)"
                stroke="#002950"
                strokeWidth="1.1"
              />

              {/* Upper right windows */}
              <path
                d="M329 209 L376 184 L376 232 L329 257 Z"
                fill="url(#briefingGlass)"
                stroke="#002950"
                strokeWidth="1.1"
              />
              <path
                d="M389 176 L427 155 L427 203 L389 224 Z"
                fill="url(#briefingGlass)"
                stroke="#002950"
                strokeWidth="1.1"
              />

              {/* Lower left facade divisions */}
              <path
                d="M137 219 L180 242 L180 319 L137 296 Z"
                fill="url(#briefingGlass)"
                stroke="#002950"
                strokeWidth="1.1"
              />
              <path
                d="M193 250 L265 289 L265 365 L193 326 Z"
                fill="url(#briefingGlass)"
                stroke="#002950"
                strokeWidth="1.1"
              />
              <path d="M229 270 V346" stroke="#002950" strokeWidth="1" opacity=".65" />

              {/* Lower right facade divisions */}
              <path
                d="M334 308 L382 282 L382 359 L334 385 Z"
                fill="url(#briefingGlass)"
                stroke="#002950"
                strokeWidth="1.1"
              />
              <path
                d="M400 272 L482 228 L482 305 L400 350 Z"
                fill="url(#briefingGlass)"
                stroke="#002950"
                strokeWidth="1.1"
              />
              <path d="M441 250 V327" stroke="#002950" strokeWidth="1" opacity=".65" />

              {/* Structural details */}
              <g stroke="#002950" strokeWidth="1.1" opacity=".65">
                <path d="M115 188 L115 204 L310 311 L505 204 L505 188" />
                <path d="M176 219 L310 292 L444 219" />
                <path d="M310 295 V391" />
                <path d="M153 207 L153 302" strokeDasharray="2 4" />
                <path d="M465 210 L465 314" strokeDasharray="2 4" />
              </g>

              {/* Gold architectural details */}
              <g stroke="#BD9655" strokeWidth="1.8">
                <path d="M115 188 L310 82 L505 188" />
                <path d="M176 150 L310 223 L444 150" />
                <path d="M310 82 V48" />
                <path d="M304 56 L310 48 L316 56" />
                <path d="M310 424 V442" />
                <path d="M303 435 L310 442 L317 435" />
              </g>

              {/* Dimension line */}
              <g stroke="#BD9655" strokeWidth="1">
                <path d="M75 188 V284" />
                <path d="M68 188 H82 M68 284 H82" />
                <path d="M115 414 L310 460 L505 414" opacity=".8" />
              </g>

              {/* Technical reference points */}
              <g fill="#BD9655">
                <circle cx="310" cy="82" r="3" />
                <circle cx="115" cy="188" r="3" />
                <circle cx="505" cy="188" r="3" />
                <circle cx="310" cy="295" r="3" />
              </g>

              {/* Annotation leaders */}
              <g stroke="#BD9655" strokeWidth="1" opacity=".8">
                <path d="M444 150 L500 115 H550" />
                <path d="M115 284 L65 314 H35" />
              </g>

              <g
                fill="#002950"
                fontSize="9"
                fontFamily="Arial, sans-serif"
                letterSpacing="1.5"
              >
                <text x="502" y="106">FACHADA</text>
                <text x="20" y="308">VOLUME</text>
              </g>
            </svg>
          </div>

          {/* Bottom drawing information */}
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between border-t border-[#002950]/15 pt-4 sm:bottom-7 sm:left-7 sm:right-7">
            <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-[#002950]/45">
                Da ideia à realidade
              </p>
              <p className="mt-1 text-[10px] font-medium text-[#002950] sm:text-xs">
                Arquitectura · Engenharia · Construção
              </p>
            </div>
            <span className="text-[9px] tracking-widest text-[#BD9655]">
              PS — 01
            </span>
          </div>
        </div>

        {/* Content — second on mobile */}
        <div className="relative z-10 order-2 lg:order-1">
          <div className="mb-7 flex items-center gap-3">
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

          <p className="mt-7 max-w-xl text-base leading-8 text-[#002950]/70 md:text-lg">
            Cada projecto começa com uma ideia. Partilhe connosco a sua visão,
            as características do espaço e os seus objectivos. Queremos
            compreender as suas necessidades para encontrar a melhor solução.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              href="/project-briefing"
              className="group inline-flex min-h-[56px] items-center gap-8 bg-[#002950] px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#BD9655] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BD9655]"
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

            <span className="text-xs leading-5 text-[#002950]/55">
              Um primeiro passo para concretizar a sua ideia.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
