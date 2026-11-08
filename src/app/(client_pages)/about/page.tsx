import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "../components/nav";
import Footer from "../components/footer";


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
  },
  {
    title: "Engenharia",
    description:
      "Soluções de engenharia integradas, sustentadas pelo rigor técnico e pela eficiência construtiva.",
    image: "/images/engenharia.svg",
    alt: "Desenho de uma ponte atirantada com cabos dourados.",
    span: "md:col-span-5",
  },
  {
    title: "Construção",
    description:
      "Execução e gestão de obras, assegurando qualidade, coordenação e controlo em todas as etapas.",
    image: "/images/construcao.svg",
    alt: "Desenho de uma estrutura em betão em construção, com andaimes e grua.",
    span: "md:col-span-5",
  },
  {
    title: "Fiscalização e Consultoria",
    description:
      "Acompanhamento técnico, fiscalização e consultoria para garantir o cumprimento dos requisitos de cada projecto.",
    image: "/images/fiscalizacao.svg",
    alt: "Corte construtivo de um edifício com cotas de nível e uma lupa sobre uma ligação estrutural.",
    span: "md:col-span-7",
  },
];

const pad = "px-6 md:px-12 lg:px-20";
const wrap = "mx-auto w-full max-w-[1600px]";
const delay = (s: string) => ({ "--d": s }) as CSSProperties;

export default function AboutPage() {
  const years = new Date().getFullYear() - FOUNDED;

  const stats = [
    { value: `${years}+`, label: "Anos de experiência" },
    { value: "11+", label: "Grandes projectos" },
    { value: "3", label: "Cidades de presença" },
    { value: "4", label: "Áreas de especialidade" },
  ];

  return (
    <>
      {/*
        NAV FIX: the nav now lives outside the hero and outside <main>, in its
        own fixed layer at z-[100]. Page content sits in a z-0 stacking context
        (see <main>), so images, transforms and sticky blocks can never paint
        over it.
      */}
      <div className="fixed inset-x-0 top-0 z-[100]">
        <Nav />
      </div>

      <main className="relative z-0 bg-paper text-navy">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        {/* One orchestrated moment: the hero headline rises in. */}
        <style>{`
          @keyframes rise{from{opacity:0;transform:translateY(1.5rem)}to{opacity:1;transform:none}}
          .rise{animation:rise .9s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,0s)}
          @media (prefers-reduced-motion:reduce){.rise{animation:none}}
        `}</style>

        {/* ================================================================ */}
        {/* HERO                                                             */}
        {/* ================================================================ */}
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
            className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/55 to-navy/10 md:bg-gradient-to-r md:from-navy md:via-navy/50 md:to-transparent"
          />

          {/* Blueprint column lines */}
          <div
            aria-hidden
            className={`${pad} pointer-events-none absolute inset-0 -z-[5]`}
          >
            <div
              className={`${wrap} grid h-full grid-cols-4 border-x border-paper/10`}
            >
              <span className="border-r border-paper/10" />
              <span className="border-r border-paper/10" />
              <span className="border-r border-paper/10" />
              <span />
            </div>
          </div>

          <div className={`${pad} mt-auto pt-40`}>
            <div className={wrap}>
              <h1 className="font-display text-[clamp(3rem,10.5vw,10rem)] font-medium leading-[0.92] tracking-tight">
                <span className="rise block" style={delay("0.1s")}>
                  Construímos
                </span>
                <span className="rise block" style={delay("0.28s")}>
                  com visão.
                </span>
              </h1>

              <div
                className="rise mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
                style={delay("0.6s")}
              >
                <p className="max-w-lg text-base leading-7 text-paper/80 md:text-lg">
                  Somos uma empresa multidisciplinar que transforma ideias em
                  projectos, projectos em realidade e desafios em
                  oportunidades para construir o futuro.
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
            </div>
          </div>

          {/* Glass fact strip */}
          <div className={`${pad} mt-12 border-t border-paper/15 bg-navy/50 backdrop-blur-md`}>
            <dl
              className={`${wrap} grid grid-cols-3 divide-x divide-paper/15 text-sm`}
            >
              <div className="py-5 pr-4 md:py-6">
                <dt className="text-paper/55">Sede</dt>
                <dd className="mt-1 font-medium">Angola</dd>
              </div>
              <div className="px-4 py-5 md:px-8 md:py-6">
                <dt className="text-paper/55">Fundada em</dt>
                <dd className="mt-1 font-medium">{FOUNDED}</dd>
              </div>
              <div className="py-5 pl-4 md:px-8 md:py-6">
                <dt className="text-paper/55">Disciplinas</dt>
                <dd className="mt-1 font-medium">4</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ================================================================ */}
        {/* INTRODUCTION                                                     */}
        {/* ================================================================ */}
        <section
          id="nossa-historia"
          className={`${pad} scroll-mt-24 py-24 md:py-40`}
        >
          <div className={wrap}>
            <p className="text-sm font-medium text-gold-ink">Quem somos</p>
            <h2 className="mt-5 max-w-5xl font-display text-[clamp(2.5rem,6.5vw,6.5rem)] font-medium leading-[1] tracking-tight">
              Experiência que constrói. Visão que transforma.
            </h2>

            <div className="mt-16 grid gap-20 lg:mt-24 lg:grid-cols-12 lg:gap-x-16">
              <div className="relative lg:col-span-7">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                  <Image
                    src="/images/plan.svg"
                    alt="Planta de uma habitação com cotas de 24 por 16,5 metros."
                    fill
                    unoptimized
                    sizes="(min-width:1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="absolute -bottom-8 right-4 bg-gold p-6 text-navy md:-right-8 md:p-8">
                  <p className="text-sm font-medium">Desde</p>
                  <p className="mt-1 font-display text-6xl font-medium leading-none tracking-tight md:text-7xl">
                    {FOUNDED}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 lg:self-end">
                <p className="font-display text-2xl leading-snug md:text-3xl">
                  Desde {FOUNDED}, a PRO SOTA participa na transformação do
                  ambiente construído, desenvolvendo soluções nas áreas da
                  arquitectura, engenharia, construção e fiscalização.
                </p>

                <p className="mt-8 max-w-xl text-base leading-8 text-navy/70">
                  A nossa abordagem assenta na integração de diferentes
                  especialidades, permitindo acompanhar os projectos de forma
                  abrangente — desde a ideia inicial até à concretização da
                  obra. Valorizamos o conhecimento técnico, a colaboração e a
                  capacidade de encontrar soluções adequadas a cada contexto.
                </p>

                <p className="mt-5 max-w-xl text-base leading-8 text-navy/70">
                  Mais do que construir edifícios e infra-estruturas,
                  procuramos criar valor duradouro para os nossos clientes,
                  parceiros e para as comunidades onde trabalhamos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* STATISTICS                                                       */}
        {/* ================================================================ */}
        <section className={`${pad} pb-24 md:pb-40`}>
          <dl
            className={`${wrap} grid grid-cols-2 gap-px border-y border-navy/15 bg-navy/15 md:grid-cols-4`}
          >
            {stats.map((s) => (
              // dt before dd for correct semantics; flex-col-reverse keeps the
              // big number visually on top.
              <div
                key={s.label}
                className="flex flex-col-reverse justify-end gap-4 bg-paper px-4 py-10 md:px-8 md:py-16"
              >
                <dt className="text-sm text-navy/65">{s.label}</dt>
                <dd className="font-display text-6xl font-medium leading-none tracking-tight md:text-8xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ================================================================ */}
        {/* MISSION AND VISION                                               */}
        {/* ================================================================ */}
        <section className="grid md:grid-cols-2">
          <div className={`${pad} bg-navy py-20 text-paper md:py-36`}>
            <p className="text-sm font-medium text-gold">A nossa missão</p>
            <h2 className="mt-8 font-display text-[clamp(2.5rem,5vw,4.75rem)] font-medium leading-[1.02] tracking-tight">
              Dar forma às ideias.
            </h2>
            <p className="mt-8 max-w-lg text-base leading-8 text-paper/70">
              Desenvolver e concretizar projectos de arquitectura, engenharia
              e construção com qualidade, rigor e responsabilidade, criando
              soluções que respondem às necessidades dos nossos clientes e
              contribuem para o desenvolvimento das comunidades.
            </p>
          </div>

          <div className={`${pad} bg-gold py-20 text-navy md:py-36`}>
            <p className="text-sm font-medium text-navy/70">A nossa visão</p>
            <h2 className="mt-8 font-display text-[clamp(2.5rem,5vw,4.75rem)] font-medium leading-[1.02] tracking-tight">
              Construir o futuro.
            </h2>
            <p className="mt-8 max-w-lg text-base leading-8 text-navy/85">
              Ser uma referência de confiança e excelência no sector da
              arquitectura, engenharia e construção, reconhecida pela
              capacidade de inovar, integrar competências e transformar
              positivamente o espaço construído.
            </p>
          </div>
        </section>

        {/* ================================================================ */}
        {/* VALUES                                                           */}
        {/* ================================================================ */}
        <section className={`${pad} py-24 md:py-40`}>
          <div className={wrap}>
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[1] tracking-tight lg:col-span-7">
                Os nossos valores
              </h2>
              <p className="max-w-sm text-base leading-7 text-navy/65 lg:col-span-4 lg:col-start-9">
                Os princípios que orientam a nossa forma de trabalhar, as
                decisões que tomamos e as relações que construímos.
              </p>
            </div>

            <ul className="mt-16 grid gap-px border-y-2 border-y-gold bg-navy/15 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <li
                  key={v.title}
                  className="group flex min-h-[16rem] flex-col justify-between bg-paper p-8 transition-colors duration-500 hover:bg-navy hover:text-paper motion-reduce:transition-none lg:min-h-[26rem]"
                >
                  <span
                    aria-hidden
                    className="block h-px w-10 bg-gold transition-all duration-500 group-hover:w-24 motion-reduce:transition-none"
                  />

                  <div>
                    <h3 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                      {v.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-navy/65 transition-colors duration-500 group-hover:text-paper/75 motion-reduce:transition-none">
                      {v.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================================================================ */}
        {/* EXPERTISE (bento)                                                */}
        {/* ================================================================ */}
        <section
          id="competencias"
          className={`${pad} scroll-mt-8 bg-stone py-24 md:py-40`}
        >
          <div className={wrap}>
            <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <p className="text-sm font-medium text-gold-ink">
                  O que fazemos
                </p>
                <h2 className="mt-5 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-medium leading-[1] tracking-tight">
                  Competências que se complementam.
                </h2>
              </div>
              <p className="max-w-md text-base leading-8 text-navy/65 lg:col-span-4 lg:col-start-9">
                Reunimos diferentes especialidades numa abordagem integrada,
                garantindo continuidade, coordenação e qualidade ao longo de
                todo o ciclo de vida dos projectos.
              </p>
            </div>

            <div className="mt-16 grid gap-4 md:grid-cols-12 md:gap-5">
              {expertise.map((item) => (
                <article
                  key={item.title}
                  className={`group relative isolate flex min-h-[24rem] flex-col justify-end overflow-hidden bg-navy text-paper md:min-h-[34rem] ${item.span}`}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    unoptimized
                    sizes="(min-width:768px) 58vw, 100vw"
                    className="-z-20 object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/45 to-transparent"
                  />

                  <div className="p-6 md:p-10">
                    <span
                      aria-hidden
                      className="mb-5 block h-px w-10 bg-gold"
                    />
                    <h3 className="font-display text-3xl font-medium tracking-tight md:text-5xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-md text-sm leading-7 text-paper/75">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CLOSING                                                          */}
        {/* ================================================================ */}
        <section
          className={`${pad} relative isolate overflow-hidden bg-navy py-28 text-paper md:py-44`}
        >
          <Image
            src="/images/hero.svg"
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="-z-20 object-cover object-[72%_center] opacity-25"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/70 to-transparent"
          />

          <div className={wrap}>
            <h2 className="max-w-6xl font-display text-[clamp(3rem,8.5vw,8.5rem)] font-medium leading-[0.95] tracking-tight">
              O próximo projecto começa com uma ideia.
            </h2>

            <div className="mt-14 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-base leading-8 text-paper/70">
                Da ideia inicial à concretização da obra, com uma equipa
                integrada ao seu lado.
              </p>

              <Link
                href="/contact"
                className="group inline-flex items-center gap-5 self-start bg-gold py-3 pl-8 pr-3 text-sm font-semibold text-navy transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper"
              >
                Fale connosco
                <span
                  aria-hidden
                  className="flex size-11 items-center justify-center bg-navy text-lg text-paper transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none"
                >
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
 <Footer />
    </>
  );
}