"use client";

import Link from "next/link";

import Nav from "./components/nav";
import Hero from "./components/hero_section";
import Footer from "./components/footer";
import About from "./components/about";
import WhyUs from "./components/why_us";
import ServicesSection from "./components/service_component";
import ProjectsShowcase from "./components/projects";
import Contact from "./components/contact_page"
import SectionHeader from "./components/section_header"; 

import { services } from "./components/servicesData";

import "../globals.css";
import "../styles.css";
import "../admin.css";

interface HomeClientProps {
  projects: any[];
}

const NAV_LINKS = [
  { label: "Início", href: "#top" },
  { label: "Sobre nós", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Projectos", href: "#projectos" },
  { label: "Contacto", href: "#contacto" },
];

const ROUTES = {
  about: "/about",
  services: "/services",
  projects: "/projects",
};

const FEATURED_COUNT = 8;
const YEAR = new Date().getFullYear();

const WRAP =
  "mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20";



export default function HomeClient({
  projects,
}: HomeClientProps) {
  const featuredProjects = projects.slice(0, FEATURED_COUNT);

  return (
    <>
      {/* Skip navigation */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-navy"
      >
        Saltar para o conteúdo
      </a>

      {/* NAVIGATION */}
      <Nav />

      <main id="main">
        {/* 01 — HERO */}
        <Hero />

        {/* 02 — ABOUT */}
        <About />

        {/* 03 — SERVICES */}
        <ServicesSection
          services={services}
          Routes={ROUTES}
        />

        {/* 04 — WHY PRO SOTA */}
        <WhyUs />

        {/* 05 — SELECTED PROJECTS */}

{/* 05 — SELECTED PROJECTS */}
<section
  id="projectos"
  aria-labelledby="projects-heading"
  className="scroll-mt-24 bg-[#F7F7F5] py-28 md:py-36 lg:py-44"
>
  <div className={WRAP}>
    <div className="mb-16 flex flex-col items-start justify-between gap-8 md:mb-20 md:flex-row md:items-end">
      <SectionHeader eyebrow="O nosso trabalho">
        <span id="projects-heading">
          Projectos
          <br className="md:hidden" />
          <span className="text-gold">
            {" "}seleccionados.
          </span>
        </span>
      </SectionHeader>

      <Link
        href={ROUTES.projects}
        className="group inline-flex items-center gap-4 border-b border-gold pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-navy transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        Ver todos os projectos

        <span
          aria-hidden="true"
          className="inline-block text-lg transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none"
        >
          ↗
        </span>
      </Link>
    </div>

    <ProjectsShowcase projects={featuredProjects} />

    <div className="mt-16 flex flex-col justify-between gap-4 border-t border-navy/15 pt-7 text-xs text-[#5F656A] sm:flex-row">
      <p>
        Uma selecção de projectos que reflecte a nossa experiência.
      </p>

      <p className="font-medium uppercase tracking-[0.16em]">
        PRO SOTA · Projectos
      </p>
    </div>
  </div>
</section>


        {/* 06 — CONTACT */}
        <section
          id="contacto"
          className="scroll-mt-24 border-t border-line"
        >
          <Contact />
        </section>
      </main>

      {/* FOOTER */}
<Footer />
    </>
  );
}
