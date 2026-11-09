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


const ROUTES = {
  about: "/about",
  services: "/services",
  projects: "/projects",
};

const FEATURED_COUNT = 8;

export default function HomeClient({
  projects,
}: HomeClientProps) {
  const featuredProjects = projects.slice(0, FEATURED_COUNT);

  return (
    <>
      {/* Skip navigation */}
      <Link
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-navy"
      >
        Saltar para o conteúdo
      </Link>

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

        <ProjectsShowcase projects={featuredProjects} />

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
