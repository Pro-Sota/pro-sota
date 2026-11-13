import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import { Section, Eyebrow, H2, pad, wrap } from "../components/section";
import { site } from "../content/site";
import {
  values,
  expertise,
  featuredProjects,
  credentials,
  team,
  projectsCount,
  countriesCount,
} from "../content/about";
import ContactCTA from "../components/contact_cta";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

export const revalidate = 86400;

const PATH = "/about";
const SITE_URL = site.url.replace(/\/$/, "");
const PAGE_URL = `${SITE_URL}${PATH}`;

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça a PRO SOTA: empresa multidisciplinar fundada em 1997, com experiência em arquitectura, engenharia, construção e fiscalização.",
  alternates: {
    canonical: PAGE_URL,
    languages: {
      "pt-AO": PAGE_URL,
    },
  },
  openGraph: {
    title: "Sobre nós | PRO SOTA",
    description:
      "Arquitectura, engenharia, construção e fiscalização em Angola.",
    url: PAGE_URL,
    siteName: site.name,
    locale: "pt_AO",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/images/logo-brand.png`,
        width: 1200,
        height: 630,
        alt: "PRO SOTA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre nós | PRO SOTA",
    description:
      "Arquitectura, engenharia, construção e fiscalização em Angola.",
    images: [`${SITE_URL}/images/logo-brand.png`],
  },
};

/* -------------------------------------------------------------------------- */
/* Structured data                                                            */
/* -------------------------------------------------------------------------- */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "GeneralContractor"],
  name: site.name,
  url: SITE_URL,
  logo: `${SITE_URL}${site.logo}`,
  foundingDate: String(site.founded),
  areaServed: {
    "@type": "Country",
    name: "Angola",
  },
  inLanguage: "pt-AO",
  description:
    "Empresa multidisciplinar de arquitectura, engenharia, construção e fiscalização.",
  email: site.email,
  telephone: site.phone,
  address: {
    "@type": "PostalAddress",
    addressCountry: site.address.country,
    addressLocality: site.address.locality,
    streetAddress: site.address.street,
  },
  sameAs: site.sameAs.length ? site.sameAs : undefined,
  contactPoint:
    site.phone || site.email
      ? [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: site.phone,
          email: site.email,
          availableLanguage: "pt",
        },
      ]
      : undefined,
};

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const delay = (s: string) => ({ "--d": s }) as CSSProperties;

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

const TITLE_H1 =
  "font-display text-[clamp(3.25rem,8vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.045em]";

const TITLE_H2 =
  "font-display text-[clamp(2rem,4vw,3.75rem)] font-medium leading-[0.98] tracking-[-0.035em]";

const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.2em]";

/* Darker bronze tone for WCAG AA (>= 4.5:1) legibility on light paper/stone */
const GOLD_INK = "text-[#8B6A2F]";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  const currentYear = new Date().getFullYear();
  const years = Math.max(1, currentYear - site.founded);

  const stats = [
    {
      value: `${years}+`,
      label: "Anos de experiência",
      index: "01",
    },
    {
      value: projectsCount,
      label: "Grandes projectos",
      index: "02",
    },
    {
      value: countriesCount,
      label: "Países com projectos",
      index: "03",
    },
    {
      value: expertise.length,
      label: "Áreas de especialidade",
      index: "04",
    },
  ];

  return (
    <main id="main" className="relative z-0 bg-paper text-navy">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ================================================================= */}
      {/* HERO                                                              */}
      {/* ================================================================= */}

      <section
        aria-labelledby="about-hero-title"
        className="relative isolate flex min-h-[calc(100svh-4.5rem)] max-h-[920px] flex-col overflow-hidden bg-[#F7F7F5] text-[#1F1E1B]"
      >
        {/* The SVG carries its own cream background, grid and ground line */}
        <Image
          src="/images/hero.svg"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="-z-20 object-cover object-[72%_100%]"
        />

        {/* Light legibility fade: only behind the text, drawing stays visible */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#F7F7F5]/90 via-[#F7F7F5]/35 via-45% to-transparent md:bg-gradient-to-r md:from-[#F7F7F5]/95 md:via-[#F7F7F5]/50 md:via-40% md:to-transparent md:to-65%"
        />

        {/* Hero content */}
        <div className={`${pad} mt-auto pb-12 pt-28 md:pb-16 md:pt-36`}>
          <div className={wrap}>
            <div
              className="rise mb-7 flex items-center gap-4 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
              style={delay("0.1s")}
            >
              <span className="h-px w-10 bg-gold" />
              <p className={`${EYEBROW} text-[#1F1E1B]/70`}>
                PRO SOTA · ANGOLA · DESDE {site.founded}
              </p>
            </div>

            <h1 id="about-hero-title" className={TITLE_H1}>
              <span
                className="rise block motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
                style={delay("0.2s")}
              >
                Construímos
              </span>

              {/* Darker bronze: large-text contrast on cream */}
              <span
                className={`rise block ${GOLD_INK} motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0`}
                style={delay("0.38s")}
              >
                com visão.
              </span>
            </h1>

            <div
              className="rise mt-8 flex flex-col gap-8 border-t border-[#1F1E1B]/15 pt-7 motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0 md:mt-10 md:flex-row md:items-end md:justify-between md:pt-8"
              style={delay("0.55s")}
            >
              <p className="max-w-xl text-base leading-8 text-[#1F1E1B]/75 md:text-lg md:leading-9">
                Somos uma empresa multidisciplinar que transforma ideias em
                projectos, projectos em realidade e desafios em oportunidades
                para construir o futuro.
              </p>

              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  href="#competencias"
                  className={`group inline-flex items-center gap-5 bg-gold px-6 py-4 text-sm font-semibold text-[#1F1E1B] transition-colors hover:bg-[#1F1E1B] hover:text-[#F7F7F5] ${focus} focus-visible:outline-[#1F1E1B]`}
                >
                  Ver o que fazemos
                  <span
                    aria-hidden
                    className="text-lg transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                  >
                    ↗
                  </span>
                </Link>

                <Link
                  href="#nossa-historia"
                  className={`inline-flex items-center border border-[#1F1E1B]/25 px-6 py-4 text-sm font-semibold text-[#1F1E1B] transition-colors hover:border-gold hover:bg-gold/10 ${focus} focus-visible:outline-[#1F1E1B]`}
                >
                  A nossa história
                </Link>
              </div>
            </div>

            {/* Bottom identifier */}
            <div className="mt-12 hidden items-center justify-between border-t border-[#1F1E1B]/15 pt-5 md:flex">
              <span className={`${EYEBROW} text-[#1F1E1B]/55`}>
                Arquitectura · Engenharia · Construção · Fiscalização
              </span>

              <span className={`${EYEBROW} text-[#1F1E1B]/55`}>
                Luanda · Angola
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* ================================================================= */}
      {/* INTRODUCTION / HISTORY                                            */}
      {/* ================================================================= */}

      <Section id="nossa-historia">
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>Quem somos</Eyebrow>

            <H2 className="mt-4 max-w-4xl">
              Experiência que constrói. Visão que transforma.
            </H2>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 lg:pb-1">
            <p className="text-sm leading-7 text-navy/70">
              Uma história de conhecimento, integração e compromisso com a
              qualidade do ambiente construído.
            </p>
          </div>
        </div>

        <div className="mt-12 grid items-start gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
          {/* Architectural image */}
          <div className="lg:sticky lg:top-28 lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden bg-stone">
              <Image
                src="/images/plan.svg"
                alt="Planta arquitectónica de uma habitação com cotas de 24 por 16,5 metros."
                fill
                unoptimized
                sizes="(min-width:1024px) 58vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="mt-4 flex items-center justify-between border-b border-navy/15 pb-4">
              <span className={`${EYEBROW} text-navy/55`}>
                O rigor começa no projecto.
              </span>

              <span className={`${EYEBROW} ${GOLD_INK}`}>
                Planta · 24 × 16,5 m
              </span>
            </div>
          </div>

          {/* Company history */}
          <div className="flex flex-col justify-start lg:col-span-5">
            <div className="mb-7">
              <span className="font-display text-7xl font-medium leading-none tracking-tight text-gold md:text-8xl">
                {site.founded}
              </span>

              <p className={`${EYEBROW} mt-3 text-navy/55`}>
                O início do nosso percurso
              </p>
            </div>

            <h3 className="font-display text-2xl font-medium leading-snug md:text-3xl">
              Desde {site.founded}, a PRO SOTA participa na transformação do
              ambiente construído.
            </h3>

            <p className="mt-6 text-base leading-8 text-navy/75">
              Desenvolvemos soluções nas áreas da arquitectura, engenharia,
              construção e fiscalização, integrando diferentes especialidades
              para acompanhar cada projecto de forma coordenada.
            </p>

            <p className="mt-4 text-base leading-8 text-navy/75">
              Do estudo inicial à execução e ao acompanhamento técnico da obra,
              procuramos assegurar continuidade, rigor e qualidade em todas as
              fases de intervenção.
            </p>

            <p className="mt-4 text-base leading-8 text-navy/75">
              O nosso percurso reúne projectos residenciais, educativos,
              religiosos, hoteleiros e de saúde, bem como propostas de
              desenvolvimento urbano, a diferentes escalas em Luanda e noutras
              províncias de Angola e no exterior.
            </p>
          </div>
        </div>
      </Section>

      {/* ================================================================= */}
      {/* STATISTICS                                                        */}
      {/* ================================================================= */}

      <section
        aria-label="PRO SOTA em números"
        className={`${pad} pb-20 md:pb-28`}
      >
        <div className={wrap}>
          <div className="mb-8 flex items-center justify-between gap-4">
            <p className={`${EYEBROW} text-navy/60`}>
              A nossa experiência em números
            </p>

            <span className="h-px flex-1 bg-navy/15" />

            <span className={`${EYEBROW} ${GOLD_INK}`}>
              {site.founded} — {currentYear}
            </span>
          </div>

          <dl className="grid grid-cols-2 border-y border-navy/15 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.index}
                className="flex min-h-[12rem] flex-col justify-between border-t border-navy/15 px-4 py-7 odd:border-l odd:border-navy/15 [&:nth-child(-n+2)]:border-t-0 md:min-h-[16rem] md:border-l md:border-t-0 md:px-7 md:py-9 md:first:border-l-0"
              >
                <span aria-hidden className={`${EYEBROW} text-navy/40`}>
                  {stat.index}
                </span>

                <div className="flex flex-col-reverse">
                  <dt className="mt-4 max-w-[12rem] text-xs leading-6 text-navy/70 md:text-sm">
                    {stat.label}
                  </dt>

                  <dd className="font-display text-5xl font-medium leading-none tracking-[-0.04em] tabular-nums md:text-7xl lg:text-8xl">
                    {stat.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ================================================================= */}
      {/* MISSION AND VISION                                                */}
      {/* ================================================================= */}

      <section aria-label="Missão e visão" className="grid md:grid-cols-2">
        {/* Mission */}
        <div className="relative isolate overflow-hidden bg-navy px-6 py-16 text-paper sm:px-10 md:px-12 lg:px-16 lg:py-24">
          <span
            aria-hidden
            className="absolute right-8 top-8 -z-10 font-display text-[10rem] font-medium leading-none text-paper/[0.04] md:right-10 md:top-10 md:text-[14rem]"
          >
            01
          </span>

          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold" />

              <p className={`${EYEBROW} text-gold`}>A nossa missão</p>
            </div>

            <h2 className={`mt-8 ${TITLE_H2}`}>
              Dar forma
              <br />
              às ideias.
            </h2>

            <p className="mt-7 text-base leading-8 text-paper/80">
              Desenvolver e concretizar projectos de arquitectura, engenharia e
              construção, e assegurar fiscalização e acompanhamento técnico,
              respondendo às necessidades dos clientes e contribuindo para o
              desenvolvimento das comunidades.
            </p>

            <div className="mt-12 h-px w-full bg-paper/15" />

            <p className={`${EYEBROW} mt-5 text-paper/45`}>
              Conhecimento · Rigor · Compromisso
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className="relative isolate overflow-hidden bg-stone px-6 py-16 text-navy sm:px-10 md:px-12 lg:px-16 lg:py-24">
          <span
            aria-hidden
            className="absolute right-8 top-8 -z-10 font-display text-[10rem] font-medium leading-none text-navy/[0.04] md:right-10 md:top-10 md:text-[14rem]"
          >
            02
          </span>

          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold" />

              <p className={`${EYEBROW} text-navy/70`}>A nossa visão</p>
            </div>

            <h2 className={`mt-8 ${TITLE_H2}`}>
              Construir
              <br />
              o futuro.
            </h2>

            <p className="mt-7 text-base leading-8 text-navy/75">
              Ser uma referência de confiança nas áreas da arquitectura,
              engenharia, construção e fiscalização, reconhecida pela capacidade
              de integrar competências e contribuir para a transformação
              positiva do ambiente construído.
            </p>

            <div className="mt-12 h-px w-full bg-navy/15" />

            <p className={`${EYEBROW} mt-5 text-navy/50`}>
              Confiança · Inovação · Desenvolvimento
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* VALUES                                                            */}
      {/* ================================================================= */}

      <Section>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>Os nossos princípios</Eyebrow>

            <H2 className="mt-4">Os nossos valores.</H2>
          </div>

          <p className="max-w-md text-base leading-8 text-navy/70 lg:col-span-4 lg:col-start-9">
            Os princípios que orientam a nossa forma de trabalhar, as decisões
            que tomamos e as relações que construímos.
          </p>
        </div>

        <ul className="mt-12 grid border-y border-gold bg-paper sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {values.map((v, index) => (
            <li
              key={v.title}
              className="group flex min-h-[16rem] flex-col justify-between border-b border-navy/15 bg-paper p-7 last:border-b-0 transition-colors duration-300 hover:bg-navy hover:text-paper active:bg-navy active:text-paper motion-reduce:transition-none sm:border-r sm:even:border-r-0 lg:border-b-0 lg:border-r lg:even:border-r lg:last:border-r-0 md:min-h-[19rem] md:p-8"
            >
              <div className="flex items-center justify-between">
                <span
                  aria-hidden
                  className="block h-px w-10 bg-gold transition-all duration-300 group-hover:w-20 motion-reduce:transition-none"
                />

                <span
                  aria-hidden
                  className={`${EYEBROW} text-navy/40 transition-colors group-hover:text-paper/45`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div>
                <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                  {v.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-navy/75 transition-colors duration-300 group-hover:text-paper/80 motion-reduce:transition-none">
                  {v.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* ================================================================= */}
      {/* EXPERTISE                                                         */}
      {/* ================================================================= */}

      <Section id="competencias" tone="stone">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>O que fazemos</Eyebrow>

            <H2 className="mt-4">Competências que se complementam.</H2>
          </div>

          <p className="max-w-md text-base leading-8 text-navy/75 lg:col-span-4 lg:col-start-9">
            A experiência do nosso portefólio abrange diferentes tipologias e
            escalas de intervenção. Articulamos as competências para assegurar
            continuidade, coordenação e rigor em cada fase.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-12 md:gap-5">
          {expertise.map((item, index) => {
            const isSvg = item.image.toLowerCase().endsWith(".svg");
            const contactHref = `/contact?disciplina=${encodeURIComponent(item.title)}`;

            return (
              <article
                key={item.title}
                className={`group relative isolate flex min-h-[23rem] flex-col justify-end overflow-hidden bg-navy text-paper md:min-h-[30rem] ${item.span}`}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  unoptimized={isSvg}
                  sizes="(min-width:1024px) 58vw, (min-width:768px) 50vw, 100vw"
                  className="-z-20 object-cover transition-transform duration-700 group-hover:scale-[1.045] motion-reduce:transition-none"
                />

                {/* Strengthened contrast scrim for WCAG AA legibility */}
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/75 to-navy/10 transition-colors duration-500 group-hover:via-navy/85"
                />

                <Link
                  href={contactHref}
                  className={`flex h-full flex-col justify-end p-7 md:p-9 ${focus} focus-visible:outline-paper`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="block h-px w-10 bg-gold transition-all duration-500 group-hover:w-20 motion-reduce:transition-none" />

                    <span className={`${EYEBROW} text-paper/60`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                    {item.title}
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-paper/85">
                    {item.description}
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold transition-colors group-hover:text-paper">
                    Solicitar enquadramento
                    <span
                      aria-hidden
                      className="text-sm transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                    >
                      ↗
                    </span>
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      </Section>

      {/* ================================================================= */}
      {/* FEATURED PROJECTS                                                 */}
      {/* ================================================================= */}

      {featuredProjects.length > 0 && (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>O nosso trabalho</Eyebrow>

              <H2 className="mt-4">Projectos em destaque.</H2>
            </div>

            <Link
              href="/portfolio"
              className={`group inline-flex items-center gap-3 border-b border-navy/30 pb-2 text-sm font-semibold transition-colors hover:border-gold ${focus} focus-visible:outline-navy`}
            >
              Ver portefólio completo
              <span
                aria-hidden
                className="text-lg transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              >
                ↗
              </span>
            </Link>
          </div>

          <ul className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-5">
            {featuredProjects.slice(0, 3).map((p, index) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className={`group block ${focus} focus-visible:outline-navy`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      sizes="(min-width:768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                    />

                    <span className="absolute left-4 top-4 bg-paper px-3 py-2 text-[10px] font-semibold tracking-[0.15em] text-navy">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-4 border-b border-navy/15 pb-5">
                    <div>
                      <h3 className="font-display text-2xl font-medium tracking-tight transition-colors group-hover:text-[#8B6A2F]">
                        {p.title}
                      </h3>

                      <p className="mt-2 text-sm text-navy/65">{p.type}</p>
                    </div>

                    <span
                      aria-hidden
                      className="mt-1 flex size-9 shrink-0 items-center justify-center border border-navy/20 text-navy transition-all duration-300 group-hover:border-gold group-hover:bg-gold motion-reduce:transition-none"
                    >
                      ↗
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ================================================================= */}
      {/* CREDENTIALS AND TEAM                                              */}
      {/* ================================================================= */}

      {(credentials.length > 0 || team.length > 0) && (
        <Section tone="stone">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            {/* Credentials */}
            {credentials.length > 0 && (
              <div>
                <Eyebrow>Reconhecimento</Eyebrow>

                <H2 className="mt-4">Certificações e registos.</H2>

                <ul className="mt-9 divide-y divide-navy/15 border-y border-navy/15">
                  {credentials.map((c, index) => (
                    <li key={c} className="flex items-start gap-5 py-5">
                      <span className={`${EYEBROW} pt-1 ${GOLD_INK}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-base leading-7 text-navy/85">
                        {c}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Team */}
            {team.length > 0 && (
              <div>
                <Eyebrow>As pessoas</Eyebrow>

                <H2 className="mt-4">Liderança.</H2>

                <ul className="mt-9 divide-y divide-navy/15 border-y border-navy/15">
                  {team.map((m, index) => (
                    <li
                      key={m.name}
                      className="flex items-center justify-between gap-5 py-5"
                    >
                      <div className="flex min-w-0 items-center gap-5">
                        <span className={`${EYEBROW} ${GOLD_INK}`}>
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="font-medium text-navy">{m.name}</span>
                      </div>

                      <span className="shrink-0 text-right text-sm text-navy/65">
                        {m.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ================================================================= */}
      {/* CLOSING CTA                                                       */}
      {/* ================================================================= */}

      <section
        aria-labelledby="about-cta-title"
        className={`${pad} relative isolate overflow-hidden bg-navy py-20 text-paper md:py-32`}
      >
        <Image
          src="/images/plan.svg"
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-20 object-cover object-center opacity-[0.06] invert"
        />

        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/90 to-navy/70"
        />

        {/* Decorative architectural grid centered with content */}
        <div
          aria-hidden
          className={`${pad} pointer-events-none absolute inset-0 -z-[5] hidden lg:block`}
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

        <div className="relative z-10">
          <ContactCTA />
        </div>
      </section>
    </main>
  );
}