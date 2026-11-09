import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "../components/nav";
import Footer from "../components/footer";
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

// The "years" stat is computed on render; revalidate keeps it fresh daily.
export const revalidate = 86400;

const PATH = "/about";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Conheça a PRO SOTA: empresa multidisciplinar fundada em 1997, com experiência em arquitectura, engenharia, construção e fiscalização.",
  alternates: {
    canonical: PATH,
    // Add an "en" entry here when an English version exists.
    languages: { "pt-AO": PATH },
  },
  openGraph: {
    title: "Sobre nós | PRO SOTA",
    description: "Arquitectura, engenharia, construção e fiscalização em Angola, desde 1997.",
    url: PATH,
    siteName: site.name,
    locale: "pt_AO",
    type: "website",
    images: [{ url: "/images/logo-brand.png", width: 1200, height: 630, alt: "PRO SOTA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobre nós | PRO SOTA",
    description: "Arquitectura, engenharia, construção e fiscalização em Angola, desde 1997.",
    images: ["/images/logo-brand.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "GeneralContractor"],
  name: site.name,
  url: site.url,
  logo: `${site.url}${site.logo}`,
  foundingDate: String(site.founded),
  areaServed: "AO",
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
      ? [{ "@type": "ContactPoint", contactType: "customer service", telephone: site.phone, email: site.email, availableLanguage: "pt" }]
      : undefined,
};

const delay = (s: string) => ({ "--d": s }) as CSSProperties;
const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";

export default function AboutPage() {
  const years = new Date().getFullYear() - site.founded;

  const stats = [
    { value: `${years}+`, label: "Anos de experiência" },
    { value: projectsCount, label: "Grandes projectos" },
    { value: countriesCount, label: "Países com projectos" },
    { value: String(expertise.length), label: "Áreas de especialidade" },
  ];

  return (
    <>
      <Link
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy"
      >
        Saltar para o conteúdo
      </Link>

      {/* Nav lives in its own fixed layer; page content sits in a z-0 context. */}
      <div className="fixed inset-x-0 top-0 z-[100]">
        <Nav />
      </div>

      <main id="main" className="relative z-0 bg-paper text-navy">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

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
            className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/55 to-navy/10 md:bg-gradient-to-r md:from-navy md:via-navy/50 md:to-transparent"
          />
          <div aria-hidden className={`${pad} pointer-events-none absolute inset-0 -z-[5]`}>
            <div className={`${wrap} grid h-full grid-cols-4 border-x border-paper/10`}>
              <span className="border-r border-paper/10" />
              <span className="border-r border-paper/10" />
              <span className="border-r border-paper/10" />
              <span />
            </div>
          </div>

          <div className={`${pad} mt-auto pt-28 md:pt-36`}>
            <div className={wrap}>
              <h1 className="font-display text-[clamp(2.5rem,7vw,6.25rem)] font-medium leading-[0.98] tracking-tight">
                <span className="rise block" style={delay("0.1s")}>Construímos</span>
                <span className="rise block" style={delay("0.28s")}>com visão.</span>
              </h1>

              <div
                className="rise mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
                style={delay("0.6s")}
              >
                <p className="max-w-lg text-base leading-7 text-paper/85 md:text-lg">
                  Somos uma empresa multidisciplinar que transforma ideias em
                  projectos, projectos em realidade e desafios em
                  oportunidades para construir o futuro.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="#competencias"
                    className={`bg-gold px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-paper ${focus} focus-visible:outline-paper`}
                  >
                    Ver o que fazemos
                  </Link>
                  <Link
                    href="#nossa-historia"
                    className={`border border-paper/40 px-6 py-3.5 text-sm font-semibold transition-colors hover:border-paper ${focus} focus-visible:outline-paper`}
                  >
                    A nossa história
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Fact strip: solid on mobile (cheap), blurred glass from md up */}
          <div className={`${pad} mt-10 border-t border-paper/15 bg-navy/85 md:bg-navy/50 md:backdrop-blur-md`}>
            <dl className={`${wrap} grid grid-cols-3 divide-x divide-paper/15 text-sm`}>
              <div className="py-4 pr-4 md:py-5">
                <dt className="text-paper/70">Sede</dt>
                <dd className="mt-1 font-medium">Angola</dd>
              </div>
              <div className="px-4 py-4 md:px-8 md:py-5">
                <dt className="text-paper/70">Fundada em</dt>
                <dd className="mt-1 font-medium">{site.founded}</dd>
              </div>
              <div className="py-4 pl-4 md:px-8 md:py-5">
                <dt className="text-paper/70">Disciplinas</dt>
                <dd className="mt-1 font-medium">{expertise.length}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* INTRODUCTION */}
        <Section id="nossa-historia">
          <Eyebrow>Quem somos</Eyebrow>
          <H2 className="mt-3 max-w-4xl">Experiência que constrói. Visão que transforma.</H2>

          <div className="mt-10 grid gap-14 lg:mt-14 lg:grid-cols-12 lg:gap-x-14">
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
              <div className="absolute -bottom-6 right-4 bg-gold p-5 text-navy md:-right-6 md:p-6">
                <p className="text-sm font-medium">Desde</p>
                <p className="mt-1 font-display text-5xl font-medium leading-none tracking-tight md:text-6xl">
                  {site.founded}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 lg:self-end">
              <p className="font-display text-xl leading-snug md:text-2xl">
                Desde {site.founded}, a PRO SOTA participa na transformação do
                ambiente construído, desenvolvendo soluções nas áreas da
                arquitectura, engenharia, construção e fiscalização.
              </p>
              <p className="mt-6 max-w-xl text-base leading-8 text-navy/75">
                Integramos as várias especialidades para acompanhar cada
                projecto de forma coordenada, dos estudos iniciais à execução e
                ao acompanhamento técnico da obra.
              </p>
              <p className="mt-4 max-w-xl text-base leading-8 text-navy/75">
                O nosso percurso reúne projectos residenciais, educativos,
                religiosos, hoteleiros e de saúde, bem como propostas de
                desenvolvimento urbano, a diferentes escalas e em contextos
                diversos.
              </p>
            </div>
          </div>
        </Section>

        {/* STATISTICS */}
        <section className={`${pad} pb-16 md:pb-24`}>
          <dl className={`${wrap} grid grid-cols-2 gap-px border-y border-navy/15 bg-navy/15 md:grid-cols-4`}>
            {stats.map((s) => (
              // dt before dd for semantics; flex-col-reverse keeps the number on top.
              <div key={s.label} className="flex flex-col-reverse justify-end gap-3 bg-paper px-4 py-8 md:px-8 md:py-12">
                <dt className="text-sm text-navy/75">{s.label}</dt>
                <dd className="font-display text-5xl font-medium leading-none tracking-tight md:text-7xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* MISSION AND VISION */}
        <section className="grid md:grid-cols-2">
          <div className={`${pad} bg-navy py-14 text-paper md:py-20`}>
            <p className="text-sm font-medium text-gold">A nossa missão</p>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.25rem)] font-medium leading-[1.05] tracking-tight">
              Dar forma às ideias.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-paper/80">
              Desenvolver e concretizar projectos de arquitectura, engenharia
              e construção, e assegurar fiscalização e acompanhamento técnico,
              respondendo às necessidades dos clientes e contribuindo para o
              desenvolvimento das comunidades.
            </p>
          </div>
          <div className={`${pad} bg-gold py-14 text-navy md:py-20`}>
            <p className="text-sm font-medium text-navy/80">A nossa visão</p>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.25rem)] font-medium leading-[1.05] tracking-tight">
              Construir o futuro.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-navy/90">
              Ser uma referência de confiança nas áreas da arquitectura,
              engenharia, construção e fiscalização, reconhecida pela
              capacidade de integrar competências e contribuir para a
              transformação positiva do ambiente construído.
            </p>
          </div>
        </section>

        {/* VALUES */}
        <Section>
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
            <H2 className="lg:col-span-7">Os nossos valores</H2>
            <p className="max-w-sm text-base leading-7 text-navy/75 lg:col-span-4 lg:col-start-9">
              Os princípios que orientam a nossa forma de trabalhar, as
              decisões que tomamos e as relações que construímos.
            </p>
          </div>

          <ul className="mt-10 grid gap-px border-y-2 border-y-gold bg-navy/15 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <li
                key={v.title}
                className="group flex min-h-[13rem] flex-col justify-between bg-paper p-7 transition-colors duration-500 hover:bg-navy hover:text-paper motion-reduce:transition-none lg:min-h-[20rem]"
              >
                <span aria-hidden className="block h-px w-10 bg-gold transition-all duration-500 group-hover:w-24 motion-reduce:transition-none" />
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight md:text-3xl">{v.title}</h3>
                  <p className="mt-3 text-base leading-7 text-navy/75 transition-colors duration-500 group-hover:text-paper/80 motion-reduce:transition-none">
                    {v.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* EXPERTISE */}
        <Section id="competencias" tone="stone">
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Eyebrow>O que fazemos</Eyebrow>
              <H2 className="mt-3">Competências que se complementam.</H2>
            </div>
            <p className="max-w-md text-base leading-8 text-navy/75 lg:col-span-4 lg:col-start-9">
              A experiência do nosso portefólio abrange diferentes tipologias
              e escalas de intervenção. Articulamos as competências para
              assegurar continuidade, coordenação e rigor em cada fase.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-12 md:gap-5">
            {expertise.map((item) => (
              <article
                key={item.title}
                className={`group relative isolate flex min-h-[20rem] flex-col justify-end overflow-hidden bg-navy text-paper md:min-h-[28rem] ${item.span}`}
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  unoptimized
                  sizes="(min-width:768px) 58vw, 100vw"
                  className="-z-20 object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
                />
                <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-navy via-navy/55 to-transparent" />
                <div className="p-6 md:p-8">
                  <span aria-hidden className="mb-4 block h-px w-10 bg-gold" />
                  <h3 className="font-display text-2xl font-medium tracking-tight md:text-4xl">{item.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-paper/85">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* FEATURED PROJECTS (renders only when content/about.ts has entries) */}
        {featuredProjects.length > 0 && (
          <Section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <H2>Projectos em destaque</H2>
              <Link href="/portfolio" className={`text-sm font-semibold underline underline-offset-4 ${focus} focus-visible:outline-navy`}>
                Ver portefólio completo
              </Link>
            </div>
            <ul className="mt-10 grid gap-5 md:grid-cols-3">
              {featuredProjects.slice(0, 3).map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className={`group block ${focus} focus-visible:outline-navy`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                      <Image
                        src={p.image}
                        alt={p.alt}
                        fill
                        sizes="(min-width:768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
                      />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-medium">{p.title}</h3>
                    <p className="mt-1 text-sm text-navy/75">{p.type}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* CREDENTIALS + TEAM (render only when filled) */}
        {(credentials.length > 0 || team.length > 0) && (
          <Section tone="stone">
            <div className="grid gap-12 lg:grid-cols-2">
              {credentials.length > 0 && (
                <div>
                  <H2>Certificações e registos</H2>
                  <ul className="mt-8 divide-y divide-navy/15 border-y border-navy/15">
                    {credentials.map((c) => (
                      <li key={c} className="py-4 text-base">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {team.length > 0 && (
                <div>
                  <H2>Liderança</H2>
                  <ul className="mt-8 divide-y divide-navy/15 border-y border-navy/15">
                    {team.map((m) => (
                      <li key={m.name} className="flex justify-between gap-4 py-4">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-navy/75">{m.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* CLOSING */}
        <section className={`${pad} relative isolate overflow-hidden bg-navy py-20 text-paper md:py-28`}>
          <Image
            src="/images/hero.svg"
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="-z-20 object-cover object-[72%_center] opacity-25"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/70 to-transparent" />

          <div className={wrap}>
            <h2 className="max-w-5xl font-display text-[clamp(2.25rem,5.5vw,4.75rem)] font-medium leading-[1] tracking-tight">
              O próximo projecto começa com uma ideia.
            </h2>

            <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-base leading-8 text-paper/80">
                Da ideia inicial à concretização da obra, com uma equipa
                integrada ao seu lado.
              </p>

              <div className="flex flex-wrap items-center gap-4 self-start">
                <Link
                  href="/contact"
                  className={`group inline-flex items-center gap-7 border border-gold bg-gold py-2 pl-7 pr-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-navy transition-all duration-300 hover:border-paper hover:bg-paper ${focus} focus-visible:outline-gold motion-reduce:transition-none`}
                >
                  <span>Fale connosco</span>
                  <span
                    aria-hidden="true"
                    className="flex size-11 items-center justify-center bg-navy text-lg text-paper transition-all duration-300 group-hover:rotate-45 group-hover:bg-gold group-hover:text-navy motion-reduce:transition-none"
                  >
                    ↗
                  </span>
                </Link>

                {site.whatsapp && (
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`border border-paper/50 px-6 py-4 text-sm font-semibold transition-colors hover:border-paper ${focus} focus-visible:outline-paper`}
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}