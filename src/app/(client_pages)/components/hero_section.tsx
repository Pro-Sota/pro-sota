import Image from "next/image";
import Link from "next/link";

const FOUNDING_YEAR = 1997;

const DISCIPLINES = [
  {
    title: "Arquitectura",
    text: "Concepção de projectos que unem forma, função e contexto.",
  },
  {
    title: "Engenharia",
    text: "Estruturas, instalações e fiscalização com rigor técnico.",
  },
  {
    title: "Construção",
    text: "Execução em obra com controlo de prazos, custos e qualidade.",
  },
];

export default function Hero() {
  const years = new Date().getFullYear() - FOUNDING_YEAR;

  return (
    <section
      id="top"
      className="relative isolate bg-paper text-navy"
    >
      <div className="mx-auto flex min-h-[calc(100svh-76px)] w-full max-w-[1600px] flex-col px-6 md:px-12 lg:px-16">
        {/* MAIN ROW */}
        <div className="grid flex-1 gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-12 lg:py-16">
          {/* LEFT: MESSAGE */}
          <div className="relative z-10 flex min-w-0 flex-col justify-center">
            <div className="mb-8 flex items-center gap-3 text-sm font-medium text-navy/70">
              <span aria-hidden className="h-0.5 w-10 bg-gold" />
              Luanda, Angola
            </div>

            <h1 className="text-[clamp(2.25rem,3.4vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.04em] [overflow-wrap:anywhere] sm:[overflow-wrap:normal]">
              Pensamos espaços.
              <span className="block text-navy/40">
                Construímos possibilidades.
              </span>
            </h1>

            <p className="mt-8 max-w-md text-base leading-7 text-gray-400">
              Unimos arquitectura, engenharia e construção para desenvolver
              soluções integradas, funcionais e duradouras, com qualidade e
              rigor em cada projecto.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/portfolio"
                className="inline-flex h-12 items-center bg-navy px-7 text-sm font-semibold !text-white transition-colors hover:bg-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Ver projectos
              </Link>

              <Link
                href="/#contacto"
                className="text-sm font-semibold underline decoration-gold decoration-2 underline-offset-8 transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Fale connosco
              </Link>
            </div>
          </div>

          {/* RIGHT: IMAGE */}
          <div className="relative z-0 min-h-[360px] min-w-0 overflow-hidden bg-stone sm:min-h-[460px] lg:min-h-0">
            <Image
              src="/images/planta-arquitectonica.svg"
              alt="Planta arquitectónica de um projecto da PRO SOTA"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />

            {/* Subtle blueprint grid */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink/80 via-navy/10 to-transparent"
            />

            {/* Experience badge */}
            <div className="absolute right-0 top-0 bg-paper px-5 py-4 text-navy">
              <p className="text-3xl font-semibold leading-none tracking-tight">
                {years}
                <span className="text-gold"> anos</span>
              </p>
              <p className="mt-1.5 text-xs text-gray-400">
                a construir em Angola desde {FOUNDING_YEAR}
              </p>
            </div>

            {/* Vision caption */}
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
              <div className="mb-4 h-0.5 w-10 bg-gold" aria-hidden />
              <p className="max-w-sm text-xl font-medium leading-snug md:text-2xl">
                Espaços concebidos para permanecer.
              </p>
            </div>
          </div>
        </div>

        {/* DISCIPLINES */}
        <ul className="grid border-t border-navy/15 md:grid-cols-3">
          {DISCIPLINES.map((item, i) => (
            <li
              key={item.title}
              className={`py-6 md:py-8 ${
                i > 0
                  ? "border-t border-navy/15 md:border-l md:border-t-0 md:pl-8"
                  : ""
              } ${i < DISCIPLINES.length - 1 ? "md:pr-8" : ""}`}
            >
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-gray-400">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}