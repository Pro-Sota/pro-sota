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
} from "../content/about";
import ContactCTA from "../components/contact_cta";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

export const revalidate = 86400;

const PATH = "/about";
const SITE_URL = site.url.replace(/\/$/, "");
const PAGE_URL = `${SITE_URL}${PATH}`;
const SHARE_IMAGE = `${SITE_URL}/images/logo-brand.png`;

const SHARE_DESCRIPTION =
  "Uma empresa multidisciplinar com experiência em arquitectura, engenharia, construção e fiscalização.";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça a PRO SOTA. Desenvolvemos projectos de arquitectura, engenharia, construção e fiscalização em Angola.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Sobre nós | PRO SOTA",
    description: SHARE_DESCRIPTION,
    url: PAGE_URL,
    siteName: site.name,
    locale: "pt_AO",
    type: "website",
    // No width/height: the file is a logo, not a 1200×630 share image.
    // For a proper card, add app/about/opengraph-image.(png|tsx).
    images: [{ url: SHARE_IMAGE, alt: "PRO SOTA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre nós | PRO SOTA",
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

/* -------------------------------------------------------------------------- */
/* Structured data                                                            */
/* -------------------------------------------------------------------------- */

const jsonLd = {
  "@context": "https://schema.org",
  // GeneralContractor already inherits from Organization
  "@type": "GeneralContractor",
  name: site.name,
  url: SITE_URL,
  logo: `${SITE_URL}${site.logo}`,
  foundingDate: String(site.founded),
  areaServed: {
    "@type": "Country",
    name: "Angola",
  },
  description:
    "Empresa multidisciplinar especializada em arquitectura, engenharia, construção e fiscalização.",
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

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const delay = (s: string) => ({ "--d": s }) as CSSProperties;

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

/* Entrance animation + its reduced-motion fallback, defined once */
const RISE =
  "rise motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:translate-y-0";

const TITLE_H1 =
  "font-display text-[clamp(3.25rem,8vw,4.5rem)] font-medium leading-[0.88] tracking-[-0.045em]";

const TITLE_H2 =
  "font-display text-[clamp(2rem,4vw,3.75rem)] font-medium leading-[0.98] tracking-[-0.035em]";

const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.2em]";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  const currentYear = new Date().getFullYear();
  const years = Math.max(1, currentYear - site.founded);

  const stats = [
    {
      value: projectsCount,
      label: "Projectos e obras acabadas",
      index: "01",
    },
    {
      value: `${years}+`,
      label: "Anos de experiência",
      index: "02",
    },
    {
      value: "98%",
      label: "Taxa de entrega dentro do prazo",
      index: "03",
    },
    {
      value: expertise.length,
      label: "Áreas de especialidade",
      index: "04",
    },
  ];

  return (
    <main id="main" className="relative z-0 bg-paper text-ink">
      <JsonLd data={jsonLd} />

      {/* ================================================================= */}
      {/* HERO                                                              */}
      {/* ================================================================= */}

      <section
        aria-labelledby="about-hero-title"
        // Set --header-h once (e.g. in globals.css) and reuse it everywhere
        className="relative isolate flex min-h-[calc(100svh-var(--header-h,4.5rem))] max-h-[920px] flex-col overflow-hidden bg-paper text-ink"
      >
        <Image
          src="/images/hero.svg"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="-z-20 object-cover object-[72%_100%]"
        />

        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-paper/90 via-paper/35 via-45% to-transparent md:bg-gradient-to-r md:from-paper/95 md:via-paper/50 md:via-40% md:to-transparent md:to-65%"
        />

        <div className={`${pad} mt-auto pb-12 pt-28 md:pb-16 md:pt-36`}>
          <div className={wrap}>
            <div
              className={`${RISE} mb-7 flex items-center gap-4`}
              style={delay("0.1s")}
            >
              <span className="h-px w-10 bg-gold" />
              <p className={`${EYEBROW} text-ink-soft`}>
                PRO SOTA · ANGOLA
              </p>
            </div>

            <h1 id="about-hero-title" className={TITLE_H1}>
              <span className={`${RISE} block`} style={delay("0.2s")}>
                Construímos
              </span>

              <span
                className={`${RISE} block text-gold-dim`}
                style={delay("0.38s")}
              >
                com visão.
              </span>
            </h1>

            <div
              className={`${RISE} mt-8 flex flex-col gap-8 border-t border-ink/15 pt-7 md:mt-10 md:flex-row md:items-end md:justify-between md:pt-8`}
              style={delay("0.55s")}
            >
              <p className="max-w-xl text-base leading-8 text-ink-soft md:text-lg md:leading-9">
                Reunimos diferentes especialidades para responder
                aos desafios do ambiente construído, com uma abordagem que
                alia conhecimento técnico e sentido de responsabilidade.
              </p>

              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  href="#competencias"
                  className={`group inline-flex items-center gap-5 bg-gold px-6 py-4 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper ${focus} focus-visible:outline-ink`}
                >
                  Ver o que fazemos
                  <span
                    aria-hidden
                    className="text-lg transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transition-none"
                  >
                    ↓
                  </span>
                </Link>

                <Link
                  href="#nossa-historia"
                  className={`inline-flex items-center border border-ink/25 px-6 py-4 text-sm font-semibold text-ink transition-colors hover:border-gold hover:bg-gold/10 ${focus} focus-visible:outline-ink`}
                >
                  A nossa história
                </Link>
              </div>
            </div>

            <div className="mt-12 hidden items-center justify-between border-t border-ink/15 pt-5 md:flex">
              <span className={`${EYEBROW} text-ink-soft`}>
                Arquitectura · Engenharia · Construção · Fiscalização
              </span>

              <span className={`${EYEBROW} text-ink-soft`}>
                Luanda · Angola
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* INTRODUCTION / HISTORY                                            */}
      {/* ================================================================= */}



      <Section id="nossa-historia" className="scroll-mt-24">
        {/* Full-width architectural drawing */}
        <div className="w-full">
          <div className="relative aspect-[16/9] overflow-hidden bg-[#EEECE6] sm:aspect-[2/1] lg:aspect-[21/9]">
            <Image
              src="/images/plan.svg"
              alt="Planta arquitectónica de uma habitação com cotas de 24 por 16,5 metros."
              fill
              unoptimized
              sizes="100vw"
              className="object-contain p-5 sm:p-8 lg:p-12"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink/15 pb-4">
            <span className={`${EYEBROW} text-ink-soft`}>
              O rigor começa no projecto.
            </span>

            <span className={`${EYEBROW} text-gold-dim`}>
              Planta · 24 × 16,5 m
            </span>
          </div>
        </div>

        {/* Editorial content */}
        <div className="mt-10 grid gap-8 sm:mt-12 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          {/* Title */}
          <div className="lg:col-span-7">
            <Eyebrow>Quem somos</Eyebrow>

            <H2 className="mt-4 max-w-4xl text-ink text-[clamp(2.5rem,4vw,5rem)] leading-[0.98] tracking-[-0.045em]">
              Uma visão integrada de arquitectura, engenharia e construção.
            </H2>
          </div>

          {/* Description */}
          <div className="space-y-5 text-[15px] leading-[1.9] text-ink-soft lg:col-span-5 lg:pt-10">
            <p>
              A nossa actividade abrange desde a concepção arquitectónica
              e o desenvolvimento de especialidades de engenharia até à
              materialização e fiscalização de empreendimentos.
            </p>

            <p>
              Ao longo do percurso, participámos em projectos residenciais,
              educativos, religiosos, hoteleiros e de saúde, assim como em
              iniciativas de desenvolvimento urbano.
            </p>

            <p>
              Esta diversidade permitiu-nos consolidar experiência em
              diferentes escalas de intervenção e contextos, mantendo uma
              atenção constante às características de cada projecto.
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
            <p className={`${EYEBROW} text-ink-soft`}>
              A nossa experiência em números
            </p>

            <span className="h-px flex-1 bg-ink/15" />
          </div>

          <dl className="grid grid-cols-2 border-y border-ink/15 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.index}
                className="flex h-48 flex-col justify-between border-t border-ink/15 px-4 py-7 odd:border-l odd:border-ink/15 [&:nth-child(-n+2)]:border-t-0 md:h-64 md:border-l md:border-t-0 md:px-7 md:py-9 md:first:border-l-0"
              >
                <span aria-hidden className={`${EYEBROW} text-gold-dim`}>
                  {stat.index}
                </span>

                <div className="flex flex-col-reverse">
                  <dt className="mt-4 min-h-12 max-w-[12rem] text-xs leading-6 text-ink-soft md:min-h-14 md:text-sm">
                    {stat.label}
                  </dt>

                  <dd className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-ink tabular-nums md:text-7xl lg:text-8xl">
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
              Criar valor
              <br />
              em cada obra.
            </h2>

            <p className="mt-7 text-base leading-8 text-paper/80">
              Desenvolver soluções que conciliem as necessidades dos clientes,
              a viabilidade técnica e a responsabilidade na utilização dos
              recursos, contribuindo para espaços funcionais e para a melhoria
              das comunidades.
            </p>

            <div className="mt-12 h-px w-full bg-paper/15" />

            <p className={`${EYEBROW} mt-5 text-paper/70`}>
              Conhecimento · Rigor · Compromisso
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className="relative isolate overflow-hidden bg-stone px-6 py-16 text-ink sm:px-10 md:px-12 lg:px-16 lg:py-24">
          <span
            aria-hidden
            className="absolute right-8 top-8 -z-10 font-display text-[10rem] font-medium leading-none text-ink/[0.04] md:right-10 md:top-10 md:text-[14rem]"
          >
            02
          </span>

          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold" />
              <p className={`${EYEBROW} text-ink-soft`}>A nossa visão</p>
            </div>

            <h2 className={`mt-8 ${TITLE_H2}`}>
              Ser uma referência
              <br />
              no sector.
            </h2>

            <p className="mt-7 text-base leading-8 text-ink-soft">
              Consolidar a posição da PRO SOTA como uma empresa de referência
              em Angola, reconhecida pela competência técnica, consistência
              dos resultados e capacidade de responder à evolução do sector.
            </p>

            <div className="mt-12 h-px w-full bg-ink/15" />

            <p className={`${EYEBROW} mt-5 text-ink-soft`}>
              Confiança · Inovação · Excelência
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* VALUES                                                            */}
      {/* ================================================================= */}

      <Section className="pb-8 md:pb-10">
        <div className="lg:w-7/12">
          <Eyebrow className="text-ink-soft">Os nossos princípios</Eyebrow>
          <H2 className="mt-4 text-ink">Os nossos valores.</H2>
        </div>

        <div className="pt-16 md:pt-20">
          <ul className="grid border-y border-gold bg-paper sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, index) => (
              <li
                key={v.title}
                className="group flex min-h-[16rem] flex-col justify-between border-b border-ink/15 bg-paper p-7 text-ink transition-colors duration-300 hover:bg-navy hover:text-paper active:bg-navy active:text-paper motion-reduce:transition-none sm:border-r sm:even:border-r-0 lg:border-b-0 lg:border-r lg:even:border-r lg:last:border-r-0 md:min-h-[19rem] md:p-8"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden
                    className="block h-px w-10 bg-gold transition-all duration-300 group-hover:w-20 motion-reduce:transition-none"
                  />

                  <span
                    aria-hidden
                    className={`${EYEBROW} text-gold-dim transition-colors group-hover:text-paper/70`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                    {v.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-ink-soft transition-colors duration-300 group-hover:text-paper/80 motion-reduce:transition-none">
                    {v.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ================================================================= */}
      {/* EXPERTISE                                                         */}
      {/* ================================================================= */}

      <Section id="competencias" className="scroll-mt-24 pt-8 md:pt-10">
        <div className="lg:w-7/12">
          <Eyebrow className="text-ink-soft">O que fazemos</Eyebrow>
          <H2 className="mt-4 text-ink">Quatro áreas de actuação.</H2>
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

                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/75 to-navy/10 transition-colors duration-500 group-hover:via-navy/85"
                />

                <div className="p-7 md:p-9">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="block h-px w-10 bg-gold transition-all duration-500 group-hover:w-20 motion-reduce:transition-none" />

                    <span className={`${EYEBROW} text-paper/70`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                    {/* The link is on the title only; after:inset-0 stretches its click area over the card */}
                    <Link
                      href={contactHref}
                      className="outline-none after:absolute after:inset-0 focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-8 focus-visible:after:outline-paper"
                    >
                      {item.title}
                    </Link>
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-paper/85">
                    {item.description}
                  </p>
                </div>
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
              className={`group inline-flex items-center gap-3 border-b border-ink/30 pb-2 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-gold-dim ${focus} focus-visible:outline-ink`}
            >
              Ver portefólio completo
              <span
                aria-hidden
                className="text-lg transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </Link>
          </div>

          <ul className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3 md:gap-5">
            {featuredProjects.slice(0, 3).map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex h-full min-h-[16rem] flex-col justify-between border border-ink/15 bg-paper p-7 text-ink transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-paper motion-reduce:transition-none md:min-h-[19rem] md:p-9 ${focus} focus-visible:outline-ink`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      aria-hidden
                      className="block h-px w-10 bg-gold transition-all duration-500 group-hover:w-20 motion-reduce:transition-none"
                    />

                    <span
                      aria-hidden
                      className={`${EYEBROW} text-gold-dim transition-colors group-hover:text-paper/70`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                      {item.title}
                    </h3>

                    <p className="mt-4 max-w-md text-sm leading-7 text-ink-soft transition-colors duration-300 group-hover:text-paper/85 motion-reduce:transition-none">
                      {item.type}
                    </p>
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
            {credentials.length > 0 && (
              <div>
                <Eyebrow>Reconhecimento</Eyebrow>
                <H2 className="mt-4">Certificações e registos.</H2>

                <ul className="mt-9 divide-y divide-ink/15 border-y border-ink/15">
                  {credentials.map((c, index) => (
                    <li key={c} className="flex items-start gap-5 py-5">
                      <span className={`${EYEBROW} pt-1 text-gold-dim`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-base leading-7 text-ink-soft">
                        {c}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {team.length > 0 && (
              <div>
                <Eyebrow>As pessoas</Eyebrow>
                <H2 className="mt-4">Liderança.</H2>

                <ul className="mt-9 divide-y divide-ink/15 border-y border-ink/15">
                  {team.map((m, index) => (
                    <li
                      key={m.name}
                      className="flex items-center justify-between gap-5 py-5"
                    >
                      <div className="flex min-w-0 items-center gap-5">
                        <span className={`${EYEBROW} text-gold-dim`}>
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="font-medium text-ink">{m.name}</span>
                      </div>

                      <span className="shrink-0 text-right text-sm text-ink-soft">
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
        className={`${pad} relative isolate overflow-hidden bg-paper py-20 text-ink md:py-32`}
      >
        <Image
          src="/images/plan.svg"
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-20 object-cover object-center opacity-[0.07]"
        />

        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-paper/95 via-paper/85 to-paper/75"
        />

        <div
          aria-hidden
          className={`${pad} pointer-events-none absolute inset-0 -z-[5] hidden lg:block`}
        >
          <div
            className={`${wrap} grid h-full grid-cols-4 border-x border-ink/10`}
          >
            <span className="border-r border-ink/10" />
            <span className="border-r border-ink/10" />
            <span className="border-r border-ink/10" />
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