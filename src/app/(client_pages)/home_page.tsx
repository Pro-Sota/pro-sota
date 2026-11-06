"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

import Nav from "./components/nav";
import Hero from "./components/hero_section";
import About from "./components/about";
import Projects from "./components/projects";
import Lightbox from "./components/light_box";
import Contact from "./components/contact_page";
import { services } from "./components/servicesData";

import "../globals.css";
import "../styles.css";
import "../admin.css";
import WhyUs from "./components/why_us";
import Services from "./components/services";
import ServicesSection from "./components/service_component";
import ProjectsShowcase from "./components/projects";


// Reuses whatever type Lightbox expects, so no `as never` is needed.
type LightboxProject = React.ComponentProps<typeof Lightbox>["project"];

const NAV_LINKS = [
  { label: "Início", href: "#top" },
  { label: "Sobre nós", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Projectos", href: "#projectos" },
  { label: "Contacto", href: "#contacto" },
];

const ROUTES = {
  services: "/services",
  projects: "/projects", // consider renaming to /projectos to match /servicos
};

const FEATURED_COUNT = 8;
const YEAR = new Date().getFullYear();

const wrap = "mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20";

export function SectionHeader({
  eyebrow,
  children,
  tone = "light",
}: {
  eyebrow: string;
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div>
      <div className="mb-7 flex items-center gap-3">
        <span className="h-px w-10 bg-gold" aria-hidden="true" />
        <span
          className={`text-xs font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-white/70" : "text-mute"
          }`}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className={`text-5xl font-semibold leading-[0.98] tracking-[-0.055em] md:text-7xl ${
          dark ? "" : "text-navy"
        }`}
      >
        {children}
      </h2>
    </div>
  );
}

export default function HomeClient({ projects }: { projects: any[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const featured = projects.slice(0, FEATURED_COUNT);
  const openProject = projects.find((p) => p.id === openId) ?? null;

            {console.log("projects", featured)}


  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-navy"
      >
        Saltar para o conteúdo
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <About />
        <WhyUs /> 
        <ServicesSection services={services} Routes={ROUTES} />
        {/* PORTFOLIO */}
        <section
          id="projectos"
          className="scroll-mt-24 bg-[#F7F7F5] py-24 md:py-32 lg:py-36"
        >
          <div className={wrap}>
            <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
              <SectionHeader eyebrow="O nosso trabalho">
                Projectos
                <br className="md:hidden" />
                <span className="text-gold"> seleccionados.</span>
              </SectionHeader>

              <Link
                href={ROUTES.projects}
                className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-navy underline decoration-gold decoration-2 underline-offset-8 transition-colors hover:text-gold"
              >
                Ver projectos completos
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                >
                  ↗
                </span>
              </Link>
            </div>

            <ProjectsShowcase projects={featured} />
            <div className="mt-12 flex flex-col justify-between gap-4 border-t border-navy/15 pt-6 text-xs text-[#5F656A] sm:flex-row">
              <p>Uma selecção de projectos que reflecte a nossa experiência.</p>
              <p className="font-medium uppercase tracking-wider">
                PRO SOTA · Projectos
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contacto" className="scroll-mt-24 border-t border-line">
          <Contact />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-ink text-white">
        <div className={`${wrap} py-14`}>
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <div>
              <Link href="/" className="text-3xl font-bold tracking-[0.16em]">
                PRO SOTA
              </Link>
              <p className="mt-3 text-xs tracking-[0.18em] text-white/65">
                ARQUITECTURA · ENGENHARIA · CONSTRUÇÃO
              </p>
            </div>

            <nav
              aria-label="Navegação do rodapé"
              className="flex flex-wrap gap-x-8 gap-y-4 text-xs text-white/75"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-gold"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/15 pt-7 text-xs text-white/60 md:flex-row">
            <p>© {YEAR} PRO SOTA. Todos os direitos reservados.</p>
            <p>Luanda, Angola</p>
          </div>
        </div>
      </footer>

      <Lightbox
        project={openProject as LightboxProject}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}