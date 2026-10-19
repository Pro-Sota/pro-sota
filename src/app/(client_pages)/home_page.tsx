"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import Nav from "./components/nav";
import Footer from "./components/footer";
import Hero from "./components/hero_section";
import About from "./components/about";
import WhyUs from "./components/why_us";
import Services from "./components/services";
import PortfolioFan from "./components/portfolio_fan";
import Lightbox from "./components/light_box";
import Contact from "./components/contact";

import '../admin.css'
import '../styles.css'

import useProjects from "./services/portfolio";

type Project = {
  id: string;
  name: string;
  category: string;
  year: string | number;
  [key: string]: unknown;
};

type HomeClientProps = {
  projects: Project[];
};

export default function HomeClient({ projects }: HomeClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) return;

    const timeout = window.setTimeout(() => {
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);

    return () => window.clearTimeout(timeout);
  }, [pathname, searchParams]);

  const featured = projects.slice(0, 7);
  const openProject = projects.find((project) => project.id === openId) ?? null;

  return (
    <>
      <Nav />

      <main>
        <Hero />
        <About />
        <WhyUs />
        <Services />

        <section
          className="portfolio portfolio--featured"
          id="portefolio"
        >
          <div className="wrap">
            <div className="portfolio__head reveal is-visible">
              <h2>Portefólio seleccionado</h2>
              <span className="portfolio__count">
                Luanda · Lisboa · Madrid
              </span>
            </div>

            <div className="reveal is-visible">
              <PortfolioFan
                projects={featured}
                onOpen={setOpenId}
              />
            </div>

            <div className="portfolio__more reveal is-visible">
              <Link href="/portfolio" className="portfolio__more-link">
                Ver portefólio completo <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />

      <Lightbox
        project={openProject}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}