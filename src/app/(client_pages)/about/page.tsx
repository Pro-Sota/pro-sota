import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "../components/nav";

const FOUNDED = 1997;

// Recalculate the "years" stat once a day instead of freezing it at build time.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Desde 1997, a PRO SOTA desenvolve projectos de arquitectura, engenharia, construção e fiscalização em Angola.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Sobre nós | PRO SOTA",
    description:
      "Arquitectura, engenharia, construção e fiscalização em Angola, desde 1997.",
    url: "/about",
    siteName: "PRO SOTA",
    locale: "pt_AO",
    type: "website",
    // Social platforms need a raster image (JPG/PNG), not SVG.
    images: [{ url: "/og-about.jpg", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PRO SOTA",
  foundingDate: String(FOUNDED),
  areaServed: "AO",
  description:
    "Empresa multidisciplinar de arquitectura, engenharia, construção e fiscalização.",
};

const values = [
  {
    title: "Rigor",
    description:
      "Trabalhamos com precisão, responsabilidade e atenção ao detalhe em todas as fases de cada projecto.",
  },
  {
    title: "Compromisso",
    description:
      "Assumimos cada desafio com dedicação, transparência e responsabilidade perante os nossos clientes.",
  },
  {
    title: "Excelência",
    description:
      "Procuramos soluções que conciliam qualidade técnica, funcionalidade e valor arquitectónico.",
  },
  {
    title: "Visão",
    description:
      "Pensamos no futuro, desenvolvendo espaços e infra-estruturas preparados para responder às necessidades de amanhã.",
  },
];

const expertise = [
  {
    title: "Arquitectura",
    description:
      "Concepção arquitectónica, planeamento e desenvolvimento de espaços que equilibram estética, funcionalidade e contexto.",
    image: "/images/arquitectura.svg",
    alt: "Desenho de alçado de um edifício moderno com palas verticais e um volume dourado.",
    span: "md:col-span-7",
    ratio: "aspect-[16/11]",
  },
  {
    title: "Engenharia",
    description:
      "Soluções de engenharia integradas, sustentadas pelo rigor técnico e pela eficiência construtiva.",
    image: "/images/engenharia.svg",
    alt: "Desenho de uma ponte atirantada com cabos dourados.",
    span: "md:col-span-5",
    ratio: "aspect-[4/3]",
  },
  {
    title: "Construção",
    description:
      "Execução e gestão de obras, assegurando qualidade, coordenação e controlo em todas as etapas.",
    image: "/images/construcao.svg",
    alt: "Desenho de uma estrutura em betão em construção, com andaimes e grua.",
    span: "md:col-span-5",
    ratio: "aspect-[4/3]",
  },
  {
    title: "Fiscalização e Consultoria",
    description:
      "Acompanhamento técnico, fiscalização e consultoria para garantir o cumprimento dos requisitos de cada projecto.",
    image: "/images/fiscalizacao.svg",
    alt: "Corte construtivo de um edifício com cotas de nível e uma lupa sobre uma ligação estrutural.",
    span: "md:col-span-7",
    ratio: "aspect-[16/11]",
  },
];

const pad = "px-6 md:px-12 lg:px-20";
const wrap = "mx-auto w-full max-w-[1600px]";

export default function AboutPage() {
  const years = new Date().getFullYear() - FOUNDED;

  const stats = [
    { value: `${years}+`, label: "Anos de experiência" },
    { value: "11+", label: "Grandes projectos" },
    { value: "3", label: "Cidades de presença" },
    { value: "4", label: "Áreas de especialidade" },
  ];

  return (
    <main className="bg-paper text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* One orchestrated moment: the hero headline rises in, and the
          drawing inside hero.svg draws itself. Nothing else auto-animates. */}
      <style>{`
        @keyframes rise{from{opacity:0;transform:translateY(1.5rem)}to{opacity:1;transform:none}}
        .rise{animation:rise .9s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,0s)}
        @media (prefers-reduced-motion:reduce){.rise{animation:none}}
      `}</style>

      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-navy text-paper">
        <Image
          src="/images/hero.svg"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="-z-20 object-cover object-[72%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/60 to-navy/10 md:bg-gradient-to-r md:from-navy md:via-navy/55 md:to-transparent"
        />

        <Nav />

        <div className={`${pad} mt-auto pb-10 pt-40 md:pb-14`}>
          <div className={wrap}>
            <h1 className="font-display text-[clamp(2.75rem,9vw,8.5rem)] font-medium leading-[0.95] tracking-tight">
              <span
                className="rise block"
                style={{ "--d": "0.1s" } as React.CSSProperties}
              >
                Construímos
              </span>
              <span
                className="rise block"
                style={{ "--d": "0.28s" } as React.CSSProperties}
              >
                com visão.
              </span>
            </h1>

            <div
              className="rise mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
              style={{ "--d": "0.6s" } as React.CSSProperties}
            >
              <p className="max-w-lg text-base leading-7 text-paper/80 md:text-lg">
                Somos uma empresa multidisciplinar que transforma ideias em
                projectos, projectos em realidade e desafios em oportunidades
                para construir o futuro.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="#competencias"
                  className="bg-gold px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
                >
                  Ver o que fazemos
                </Link>
                <Link
                  href="#nossa-historia"
                  className="border border-paper/40 px-6 py-3.5 text-sm font-semibold transition-colors hover:border-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
                >
                  A nossa história
                </Link>
              </div>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-paper/20 pt-5 text-sm md:max-w-2xl">
              <div>
                <dt className="text-paper/55">Sede</dt>
                <dd className="mt-1 font-medium">Angola</dd>
              </div>
              <div>
                <dt className="text-paper/55">Fundada em</dt>
                <dd className="mt-1 font-medium">{FOUNDED}</dd>
              </div>
              <div>
                <dt className="text-paper/55">Disciplinas</dt>
                <dd className="mt-1 font-medium">4</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section id="nossa-historia" className={`${pad} py-24 md:py-36`}>
        <div className={`${wrap} grid gap-14 lg:grid-cols-12 lg:gap-x-16`}>
          <div className="lg:col-span-6">
            <p className="text-sm font-medium text-gold-ink">Quem somos</p>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,5.5vw,5rem)] font-medium leading-[1.02] tracking-tight">
              Experiência que constrói. Visão que transforma.
            </h2>

            <div className="relative mt-12 aspect-[4/3] overflow-hidden bg-stone">
              <Image
                src="/images/plan.svg"
                alt="Planta de uma habitação com cotas de 24 por 16,5 metros."
                fill
                unoptimized
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:pt-36">
            <p className="font-display text-2xl leading-snug md:text-3xl">
              Desde {FOUNDED}, a PRO SOTA participa na transformação do
              ambiente construído, desenvolvendo soluções nas áreas da
              arquitectura, engenharia, construção e fiscalização.
            </p>

            <p className="mt-8 max-w-xl text-base leading-8 text-navy/70">
              A nossa abordagem assenta na integração de diferentes
              especialidades, permitindo acompanhar os projectos de forma
              abrangente — desde a ideia inicial até à concretização da obra.
              Valorizamos o conhecimento técnico, a colaboração e a capacidade
              de encontrar soluções adequadas a cada contexto.
            </p>

            <p className="mt-5 max-w-xl text-base leading-8 text-navy/70">
              Mais do que construir edifícios e infra-estruturas, procuramos
              criar valor duradouro para os nossos clientes, parceiros e para
              as comunidades onde trabalhamos.
            </p>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className={`${pad} pb-24 md:pb-32`}>
        <dl className={`${wrap} grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4`}>
          {stats.map((s) => (
            <div key={s.label} className="border-t-2 border-gold pt-5">
              <dd className="font-display text-6xl font-medium leading-none tracking-tight md:text-7xl">
                {s.value}
              </dd>
              <dt className="mt-4 text-sm text-navy/65">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* MISSION AND VISION */}
      <section className="grid bg-navy text-paper md:grid-cols-2">
        <div className={`${pad} border-b border-paper/15 py-20 md:border-b-0 md:border-r md:py-32`}>
          <p className="text-sm font-medium text-gold">A nossa missão</p>
          <h2 className="mt-8 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.02] tracking-tight">
            Dar forma às ideias.
          </h2>
          <p className="mt-8 max-w-lg text-base leading-8 text-paper/70">
            Desenvolver e concretizar projectos de arquitectura, engenharia e
            construção com qualidade, rigor e responsabilidade, criando
            soluções que respondem às necessidades dos nossos clientes e
            contribuem para o desenvolvimento das comunidades.
          </p>
        </div>

        <div className={`${pad} py-20 md:py-32`}>
          <p className="text-sm font-medium text-gold">A nossa visão</p>
          <h2 className="mt-8 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.02] tracking-tight">
            Construir o futuro.
          </h2>
          <p className="mt-8 max-w-lg text-base leading-8 text-paper/70">
            Ser uma referência de confiança e excelência no sector da
            arquitectura, engenharia e construção, reconhecida pela capacidade
            de inovar, integrar competências e transformar positivamente o
            espaço construído.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className={`${pad} py-24 md:py-36`}>
        <div className={`${wrap} grid gap-14 lg:grid-cols-12 lg:gap-x-16`}>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[1.02] tracking-tight">
                Os nossos valores
              </h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-navy/65">
                Os princípios que orientam a nossa forma de trabalhar, as
                decisões que tomamos e as relações que construímos.
              </p>
            </div>
          </div>

          <ul className="lg:col-span-8">
            {values.map((v) => (
              <li
                key={v.title}
                className="grid gap-3 border-t border-navy/15 py-8 first:border-t-2 first:border-t-gold md:grid-cols-[1fr_1.4fr] md:gap-10 md:py-10"
              >
                <h3 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                  {v.title}
                </h3>
                <p className="max-w-md text-base leading-7 text-navy/65">
                  {v.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* EXPERTISE */}
      <section
        id="competencias"
        className={`${pad} scroll-mt-8 bg-stone py-24 md:py-36`}
      >
        <div className={wrap}>
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-gold-ink">O que fazemos</p>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,5.5vw,5rem)] font-medium leading-[1.02] tracking-tight">
              Competências que se complementam.
            </h2>
            <p className="mt-7 max-w-xl text-base leading-8 text-navy/65">
              Reunimos diferentes especialidades numa abordagem integrada,
              garantindo continuidade, coordenação e qualidade ao longo de todo
              o ciclo de vida dos projectos.
            </p>
          </div>

          <div className="mt-16 grid items-start gap-x-8 gap-y-16 md:grid-cols-12">
            {expertise.map((item) => (
              <article key={item.title} className={`group ${item.span}`}>
                <div className={`relative overflow-hidden bg-navy ${item.ratio}`}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    unoptimized
                    sizes="(min-width:768px) 58vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-10">
                  <h3 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="max-w-sm text-sm leading-7 text-navy/65">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className={`${pad} bg-navy py-24 text-paper md:py-36`}>
        <div className={`${wrap} flex flex-col items-start justify-between gap-12 md:flex-row md:items-end`}>
          <h2 className="font-display text-[clamp(2.75rem,7vw,7rem)] font-medium leading-[0.98] tracking-tight">
            O próximo projecto
            <br />
            começa com uma ideia.
          </h2>

          <Link
            href="/#contact"
            className="inline-flex items-center gap-4 bg-gold px-8 py-4 text-sm font-semibold text-navy transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
          >
            Fale connosco
            <span aria-hidden className="text-lg">
              ↗
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}