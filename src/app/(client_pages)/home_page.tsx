"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import Nav from "./components/nav";
import Footer from "./components/footer";
import Hero from "./components/hero_section";
import About from "./components/about";
import WhyUs from "./components/why_us";
import Services from "./components/services";
import PortfolioFan from "./components/portfolio_fan";
import Lightbox from "./components/light_box";
import Contact from "./components/contact";


interface Props {
    portifolios : [];
}

export default function HomePage({portifolios}:Props) {
  const pathname = usePathname();

  const [openId, setOpenId] = useState<string | number | null>(null);

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
                projects={[]}
                onOpen={setOpenId}
              />
            </div>

            <div className="portfolio__more reveal is-visible">
              <Link
                href="/portfolio"
                className="portfolio__more-link"
              >
                Ver portefólio completo <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />

      <Lightbox
        project={null}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}