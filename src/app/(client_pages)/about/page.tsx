
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import MotionCounter from "../components/motion_counter";
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
import {
  Reveal,
  RevealArticle,
  RevealLi,
} from "../components/motion_reveal";
import MotionStagger from "../components/motion_stagger";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

export const revalidate = 86400;

const PATH = "/about";
const SITE_URL = site.url.replace(/\/$/, "");
const PAGE_URL = `${SITE_URL}${PATH}`;

const SHARE_DESCRIPTION =
  "Conheça a PRO SOTA. Uma empresa multidisciplinar com experiência em arquitectura, engenharia, construção e fiscalização em Angola.";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: SHARE_DESCRIPTION,
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
  },
  twitter: {
    card: "summary",
    title: "Sobre nós | PRO SOTA",
    description: SHARE_DESCRIPTION,
  },
};

/* -------------------------------------------------------------------------- */
/* Structured data                                                            */
/* -------------------------------------------------------------------------- */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: site.name,
  url: SITE_URL,
  logo: `${SITE_URL}${site.logo}`,
  foundingDate: String(site.founded),
  areaServed: {
    "@type": "Country",
    name: "Angola",
  },
  description: SHARE_DESCRIPTION,
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

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  const currentYear = new Date().getFullYear();
  const years = Math.max(1, currentYear - site.founded);

  const stats = [
    {
      value: projectsCount,
      label: "Projectos e obras concluídas",
      index: "01",
    },
    {
      value: years,
      label: "Anos de experiência",
      index: "02",
    },
    {
      value: expertise.length,
      label: "Áreas de especialidade",
      index: "03",
    },
    {
      value: site.founded,
      label: "Ano de fundação",
      index: "04",
    },
  ];

  return (
    <main id="main" className="relative z-0 bg-paper text-ink">
      <JsonLd data={jsonLd} />

      {/* ================================================================== */}
      {/* HERO                                                               */}
      {/* ================================================================== */}

      <section
        id="nossa-historia"
        aria-labelledby="about-title"
        className="relative isolate scroll-mt-24 bg-paper"
      >
        <div className="relative h-[70svh] min-h-[34rem] max-h-[900px] overflow-hidden md:h-[82svh]">
          <Image
            src="/images/courtyard_render.png"
            alt="Vista arquitectónica de um projecto da PRO SOTA."
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-navy/5"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-navy/30 via-transparent to-transparent"
          />

          <div className={`${pad} absolute inset-x-0 bottom-0 pb-28 md:pb-36`}>
            <div className={wrap}>
              <Reveal>
                <div className="max-w-4xl">
                  <Eyebrow className="text-paper">
                    PRO SOTA · Angola 
                  </Eyebrow>

                  <h1
                    id="about-title"
                    className="mt-7 font-heading text-[clamp(3.5rem,9vw,8rem)] font-light leading-[0.88] tracking-[-0.065em] text-paper"
                  >
                    Construímos
                    <br />
                    <span className="text-gold">com visão.</span>
                  </h1>

                  <p className="mt-7 max-w-xl text-sm leading-7 text-paper/85 md:text-base md:leading-8">
                    Uma visão integrada do ambiente construído,
                    onde arquitectura, engenharia e construção
                    se encontram para dar forma a novas possibilidades.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Editorial introduction */}
        <div className={`${pad} relative z-10 -mt-12 md:-mt-20`}>
          <div className={`${wrap} bg-paper px-6 py-10 md:px-12 md:py-16 lg:px-16`}>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-7">
                <div className="mb-8 flex items-center gap-5">
                  <p id="quem-somos" className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
                    Quem somos
                  </p>
                  <span className="h-px flex-1 bg-ink/15" />
                </div>

                <H2 className="mt-5 max-w-4xl text-[clamp(2.5rem,4.5vw,5rem)] leading-[0.98] tracking-[-0.05em]">
                  Experiência que transforma ideias em realidade.
                </H2>
              </Reveal>

              <Reveal
                className="space-y-5 text-[15px] leading-[1.9] text-ink-soft lg:col-span-5 lg:pt-10"
                delay={0.12}
              >
                <p>
                  A PRO SOTA é uma empresa multidisciplinar
                  cuja actividade abrange a concepção arquitectónica,
                  o desenvolvimento de especialidades de engenharia,
                  a construção e a fiscalização de empreendimentos.
                </p>

                <p>
                  A nossa abordagem integra diferentes competências
                  para responder aos desafios de cada projecto,
                  conciliando visão, conhecimento técnico e capacidade
                  de execução.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* COMPANY HISTORY                                                    */}
      {/* ================================================================== */}

      <Section id="percurso" >
        {/* Architectural drawing */}
        <Reveal>
          <div className="relative aspect-[16/9] overflow-hidden bg-stone sm:aspect-[2/1] lg:aspect-[16/9]">
            <Image
              src="/images/briefing_images/minimalist.jpg"
              alt="Desenho técnico arquitectónico."
              fill
              unoptimized
             
              className="object-cover"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-paper/10 via-transparent to-transparent"
            />
          </div>
        </Reveal>
      </Section>

      {/* ================================================================== */}
      {/* STATISTICS                                                         */}
      {/* ================================================================== */}

      <section
        aria-labelledby="stats-title"
        className={`${pad} pb-20 md:pb-28`}
      >
        <div className={wrap}>
          <div className="mb-8 flex items-center gap-5">
            <p id="stats-title" className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
              A nossa experiência em números
            </p>

            <span className="h-px flex-1 bg-ink/15" />
          </div>

          <Reveal>
            <dl className="grid grid-cols-2 border-y border-ink/15 md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.index}
                  className="flex h-48 flex-col justify-between border-t border-ink/15 px-4 py-7 odd:border-l odd:border-ink/15 [&:nth-child(-n+2)]:border-t-0 md:h-64 md:border-l md:border-t-0 md:px-7 md:py-9 md:first:border-l-0"
                >
                  <span
                    aria-hidden="true"
                    className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-dim"
                  >
                    {stat.index}
                  </span>

                  <div className="flex flex-col-reverse">
                    <dt className="mt-4 min-h-12 max-w-[12rem] text-xs leading-6 text-ink-soft md:min-h-14 md:text-sm">
                      {stat.label}
                    </dt>

                    <dd>
                      <MotionCounter
                        value={stat.value}
                        className="font-display text-5xl font-medium leading-none tracking-[-0.04em] text-ink tabular-nums md:text-7xl lg:text-8xl"
                      />
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ================================================================== */}
      {/* MISSION AND VISION                                                 */}
      {/* ================================================================== */}

      <section aria-label="Missão e visão" className="grid md:grid-cols-2">
        {/* Mission */}
        <Reveal className="relative isolate overflow-hidden bg-navy px-6 py-16 text-paper sm:px-10 md:px-12 lg:px-16 lg:py-24">
          <span
            aria-hidden="true"
            className="absolute right-8 top-8 -z-10 font-display text-[10rem] font-medium leading-none text-paper/[0.04] md:right-10 md:top-10 md:text-[14rem]"
          >
            01
          </span>

          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold" />
              <Eyebrow className="text-gold">A nossa missão</Eyebrow>
            </div>

            <H2 className="mt-8 text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[1.08] tracking-[-0.055em] text-paper">
              Criar valor
              <br />
              em cada obra.
            </H2>

            <p className="mt-7 text-base leading-8 text-paper/80">
              Desenvolver soluções que conciliem as necessidades
              dos clientes, a viabilidade técnica e a responsabilidade
              na utilização dos recursos, contribuindo para espaços
              funcionais e para a melhoria das comunidades.
            </p>

            <div className="mt-12 h-px w-full bg-paper/15" />

            <p className="mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-paper/70">
              Conhecimento · Rigor · Compromisso
            </p>
          </div>
        </Reveal>

        {/* Vision */}
        <Reveal className="relative isolate overflow-hidden bg-stone px-6 py-16 text-ink sm:px-10 md:px-12 lg:px-16 lg:py-24">
          <span
            aria-hidden="true"
            className="absolute right-8 top-8 -z-10 font-display text-[10rem] font-medium leading-none text-ink/[0.04] md:right-10 md:top-10 md:text-[14rem]"
          >
            02
          </span>

          <div className="mx-auto max-w-xl">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold" />
              <Eyebrow className="text-ink-soft">A nossa visão</Eyebrow>
            </div>

            <H2 className="mt-8 text-[clamp(2.5rem,4vw,4.5rem)] font-normal leading-[1.08] tracking-[-0.055em] text-ink">
              Ser uma referência
              <br />
              no sector.
            </H2>

            <p className="mt-7 text-base leading-8 text-ink-soft">
              Consolidar a posição da PRO SOTA como uma empresa
              de referência em Angola, reconhecida pela competência
              técnica, consistência dos resultados e capacidade
              de responder à evolução do sector.
            </p>

            <div className="mt-12 h-px w-full bg-ink/15" />

            <p className="mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
              Confiança · Inovação · Excelência
            </p>
          </div>
        </Reveal>
      </section>

      {/* ================================================================== */}
      {/* VALUES                                                             */}
      {/* ================================================================== */}

      <Section className="pb-8 md:pb-10">
        <div className="mb-12 flex items-center gap-5">
          <span className="h-px w-12 bg-gold" />

          <Eyebrow className="text-ink-soft">
            03 / Os nossos princípios
          </Eyebrow>
        </div>

        <div className="lg:w-8/12">
          <H2 className="mt-4 text-[clamp(2rem,3vw,4rem)] leading-[0.9] tracking-[-0.05em] text-ink">
            Aquilo que orienta
            <span className="block text-gold-dim">
              cada decisão.
            </span>
          </H2>
        </div>

        <div className="pt-16 md:pt-20">
          <MotionStagger className="grid border-y border-gold bg-paper sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <RevealLi
                key={value.title}
                className="group flex min-h-[16rem] flex-col justify-between border-b border-ink/15 bg-paper p-7 text-ink transition-colors duration-300 hover:bg-navy hover:text-paper active:bg-navy active:text-paper motion-reduce:transition-none sm:border-r sm:even:border-r-0 lg:min-h-[19rem] lg:border-b-0 lg:border-r lg:even:border-r lg:last:border-r-0 md:p-8"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="block h-px w-10 bg-gold transition-all duration-300 group-hover:w-20 motion-reduce:transition-none"
                  />

                  <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-dim transition-colors group-hover:text-paper/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
                    {value.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-ink-soft transition-colors duration-300 group-hover:text-paper/80 motion-reduce:transition-none">
                    {value.description}
                  </p>
                </div>
              </RevealLi>
            ))}
          </MotionStagger>
        </div>
      </Section>

      {/* ================================================================== */}
      {/* EXPERTISE                                                          */}
      {/* ================================================================== */}

      <Section id="competencias" className="scroll-mt-24 pt-8 md:pt-10">
        <div className="lg:w-7/12">
          <Eyebrow className="text-ink-soft">O que fazemos</Eyebrow>

          <H2 className="mt-4 text-ink">
            Quatro áreas de actuação.
          </H2>

          <p className="mt-5 max-w-lg text-sm leading-7 text-ink-soft">
            Integramos diferentes disciplinas para acompanhar
            os projectos desde a concepção até à sua concretização.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-12 md:gap-5">
          {expertise.map((item, index) => {
            const isSvg = item.image.toLowerCase().endsWith(".svg");
            const contactHref = `/contact?disciplina=${encodeURIComponent(item.title)}`;

            return (
              <RevealArticle
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
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/75 to-navy/10 transition-colors duration-500 group-hover:via-navy/85"
                />

                <div className="p-7 md:p-9">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="block h-px w-10 bg-gold transition-all duration-500 group-hover:w-20 motion-reduce:transition-none" />

                    <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-paper/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                    <Link
                      href={contactHref}
                      className={`outline-none after:absolute after:inset-0 focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-8 focus-visible:after:outline-paper`}
                    >
                      {item.title}
                    </Link>
                  </h3>

                  <p className="mt-4 max-w-md text-sm leading-7 text-paper/85">
                    {item.description}
                  </p>
                </div>
              </RevealArticle>
            );
          })}
        </div>
      </Section>

      {/* ================================================================== */}
      {/* FEATURED PROJECTS                                                  */}
      {/* ================================================================== */}

      {featuredProjects.length > 0 && (
        <Section id="projectos-destaque">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>O nosso trabalho</Eyebrow>

              <H2 className="mt-4">
                Projectos em destaque.
              </H2>

              <p className="mt-4 max-w-lg text-sm leading-7 text-ink-soft">
                Uma selecção de trabalhos que reflecte a diversidade
                das nossas áreas de intervenção.
              </p>
            </div>

            <Link
              href="/portfolio"
              className={`group inline-flex items-center gap-3 border-b border-ink/30 pb-2 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-gold-dim ${focus} focus-visible:outline-ink`}
            >
              Ver portefólio completo

              <span
                aria-hidden="true"
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
                      aria-hidden="true"
                      className="block h-px w-10 bg-gold transition-all duration-500 group-hover:w-20 motion-reduce:transition-none"
                    />

                    <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-dim transition-colors group-hover:text-paper/70">
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

      {/* ================================================================== */}
      {/* CREDENTIALS AND TEAM                                               */}
      {/* ================================================================== */}

      {(credentials.length > 0 || team.length > 0) && (
        <Section tone="stone" id="reconhecimento">
          <div className="mb-12 max-w-2xl">
            <Eyebrow>Credibilidade e pessoas</Eyebrow>

            <H2 className="mt-4">
              Conhecimento, competência e responsabilidade.
            </H2>

            <p className="mt-5 text-sm leading-7 text-ink-soft">
              O nosso trabalho assenta na experiência técnica,
              no compromisso profissional e nas pessoas que
              contribuem para cada projecto.
            </p>
          </div>

          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            {credentials.length > 0 && (
              <div>
                <Eyebrow>Reconhecimento</Eyebrow>

                <H2 className="mt-4 text-[clamp(2rem,3vw,3.5rem)]">
                  Certificações e registos.
                </H2>

                <ul className="mt-9 divide-y divide-ink/15 border-y border-ink/15">
                  {credentials.map((credential, index) => (
                    <li
                      key={credential}
                      className="flex items-start gap-5 py-5"
                    >
                      <span className="pt-1 font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-dim">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-base leading-7 text-ink-soft">
                        {credential}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {team.length > 0 && (
              <div>
                <Eyebrow>As pessoas</Eyebrow>

                <H2 className="mt-4 text-[clamp(2rem,3vw,3.5rem)]">
                  Liderança.
                </H2>

                <ul className="mt-9 divide-y divide-ink/15 border-y border-ink/15">
                  {team.map((member, index) => (
                    <li
                      key={member.name}
                      className="flex items-center justify-between gap-5 py-5"
                    >
                      <div className="flex min-w-0 items-center gap-5">
                        <span className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-dim">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="font-medium text-ink">
                          {member.name}
                        </span>
                      </div>

                      <span className="shrink-0 text-right text-sm text-ink-soft">
                        {member.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ================================================================== */}
      {/* CLOSING CTA                                                        */}
      {/* ================================================================== */}

      <section
        aria-label="Entre em contacto com a PRO SOTA"
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
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-paper/95 via-paper/85 to-paper/75"
        />

        <div
          aria-hidden="true"
          className={`${pad} pointer-events-none absolute inset-0 -z-[5] hidden lg:block`}
        >
          <div className={`${wrap} grid h-full grid-cols-4 border-x border-ink/10`}>
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
