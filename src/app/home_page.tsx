
"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import Nav from '@/app/components/clients_pages/nav';
import Footer from '@/app/components/clients_pages/Footer';
import Hero from '@/app/components/clients_pages/Hero';
import About from '@/app/components/clients_pages/About';
import WhyUs from '@/app/components/clients_pages/WhyUs';
import Services from '@/app/components/clients_pages/Services';
import PortfolioFan from '@/app/components/clients_pages/PortfolioFan'; 
import Lightbox from '@/app/components/clients_pages/Lightbox';
import Contact from '@/app/components/clients_pages/Contact';

interface Props {
    projects: []
    locations: []
}

export default function Home({projects, locations} : Props) {

  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }, [location]);

  const featured = projects.slice(0, 7);
  const openProject = projects.find((p) => p.id === openId) || null;

  return (
    <>
      <Nav />
      <Hero />
      <About />
      <WhyUs />
      <Services />

      <section className="portfolio portfolio--featured" id="portefolio">
        <div className="wrap">
          <div className="portfolio__head reveal is-visible">
            <h2>Portefólio seleccionado</h2>
            <span className="portfolio__count">Luanda · Lisboa · Madrid</span>
          </div>

          <div className="reveal is-visible">
            <PortfolioFan projects={featured} onOpen={setOpenId} />
          </div>

          <div className="portfolio__more reveal is-visible">
            <Link href="/portfolio" className="portfolio__more-link">Ver portefólio completo <span>→</span></Link>
          </div>
        </div>
      </section>

      <Contact />
      <Footer />

      <Lightbox project={openProject} onClose={() => setOpenId(null)} />
    </>
  );
}

