
"use client";

import { useState } from "react";
import Link from "next/link";

import Hero from "./components/hero_section";
import Projects from "./components/projects";
import Lightbox from "./components/light_box";
import Contact from "./components/contact_page";
import About from "./components/about";
import { services } from "./components/servicesData";

import "../globals.css";
import "../styles.css";
import "../admin.css";
import Nav from "./components/nav";

type Project = {
  id: string;
  name: string;
  category: string;
  year: string | number;
  images?: string[];
  [k: string]: unknown;
};

const NAV_LINKS = [
  { label: "Início", href: "#top" },
  { label: "Sobre nós", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Portefólio", href: "#portefolio" },
];

const wrap = "mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20";

export default function HomeClient({
  projects,
}: {
  projects: Project[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openProject =
    projects.find((project) => project.id === openId) ?? null;

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* =====================================================
          HEADER & NAVIGATION
      ===================================================== */}

      <Nav />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main>
        {/* HERO */}

        <Hero />

        {/* ABOUT */}

        <About />

        {/* =====================================================
            SERVICES
        ===================================================== */}

        <section
          id="servicos"
          className="scroll-mt-24 bg-ink py-24 text-white md:py-32 lg:py-36"
        >
          <div className={wrap}>
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div>
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-px w-10 bg-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    O que fazemos
                  </span>
                </div>

                <h2 className="text-5xl font-semibold tracking-[-0.055em] md:text-7xl">
                  Os nossos
                  <br />
                  <span className="text-gold">serviços.</span>
                </h2>
              </div>

              <p className="max-w-sm text-sm leading-7 text-white/55 md:text-base">
                Soluções integradas para acompanhar todas as
                etapas do seu projecto, da concepção à execução.
              </p>
            </div>

            {/* SERVICES ACCORDION */}

            <div className="mt-16 border-t border-white/20">
              {services.map((service, index) => (
                <details
                  key={service.key}
                  name="servicos"
                  open={index === 0}
                  className="group border-b border-white/15"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-8 focus-visible:outline-2 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-6 md:gap-12">
                      <span className="text-xs font-medium text-gold">
                        0{index + 1}
                      </span>

                      <span className="text-xl font-medium tracking-tight transition-colors duration-300 group-hover:text-gold md:text-4xl">
                        {service.title}
                      </span>
                    </div>

                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 text-xl transition duration-300 group-open:rotate-45 group-open:border-gold group-open:text-gold"
                    >
                      +
                    </span>
                  </summary>

                  <div className="grid gap-10 pb-10 pl-9 md:grid-cols-2 md:pl-20">
                    <p className="max-w-md text-sm leading-7 text-white/60 md:text-base">
                      {service.intro ?? service.label}
                    </p>

                    <ul className="space-y-3">
                      {service.items.map(([title]) => (
                        <li
                          key={title}
                          className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-white/85"
                        >
                          <span
                            className="h-px w-4 shrink-0 bg-gold"
                            aria-hidden="true"
                          />

                          {title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>

            <Link
              href="/servicos"
              className="mt-10 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-wider underline decoration-gold decoration-2 underline-offset-8 transition-colors hover:text-gold"
            >
              Explorar todos os serviços
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        {/* =====================================================
            PORTFOLIO
        ===================================================== */}

        <section
          id="portefolio"
          className="scroll-mt-24 bg-[#F7F7F5] py-24 md:py-32 lg:py-36"
        >
          <div className={wrap}>
            {/* PORTFOLIO HEADER */}

            <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
              <div>
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-px w-10 bg-gold" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mute">
                    O nosso trabalho
                  </span>
                </div>

                <h2 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-navy md:text-7xl">
                  Projectos
                  <br className="md:hidden" />
                  <span className="text-gold"> seleccionados.</span>
                </h2>
              </div>

              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-navy underline decoration-gold decoration-2 underline-offset-8 transition-colors hover:text-gold"
              >
                Ver portefólio completo
                <span className="transition-transform group-hover:translate-x-1">
                  ↗
                </span>
              </Link>
            </div>

            {/* PROJECTS FROM SUPABASE */}

            <Projects
              projects={projects.slice(0, 8)}
              onOpen={setOpenId}
            />

            {/* PORTFOLIO FOOTER */}

            <div className="mt-12 flex flex-col justify-between gap-4 border-t border-[#002950]/15 pt-6 text-xs text-[#777D82] sm:flex-row">
              <p>
                Uma selecção de projectos que reflecte a nossa experiência.
              </p>

              <p className="font-medium uppercase tracking-wider">
                PRO SOTA · Portefólio
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTACT
        ===================================================== */}

        <section
          id="contacto"
          className="scroll-mt-24 border-t border-line"
        >
          <Contact />
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-ink text-white">
        <div className={`${wrap} py-14`}>
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <div>
              <Link
                href="/"
                className="text-3xl font-bold tracking-[0.16em]"
              >
                PRO SOTA
              </Link>

              <p className="mt-3 text-[10px] tracking-[0.18em] text-white/45">
                ARQUITECTURA · ENGENHARIA · CONSTRUÇÃO
              </p>
            </div>

            <nav
              aria-label="Navegação do rodapé"
              className="flex flex-wrap gap-x-8 gap-y-4 text-xs text-white/65"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition-colors hover:text-gold"
                >
                  {link.label}
                </a>
              ))}

              <a
                href="#contacto"
                className="transition-colors hover:text-gold"
              >
                Contacto
              </a>
            </nav>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/15 pt-7 text-[11px] text-white/40 md:flex-row">
            <p>
              © {new Date().getFullYear()} PRO SOTA.
              Todos os direitos reservados.
            </p>

            <p>Luanda, Angola</p>
          </div>
        </div>
      </footer>

      {/* =====================================================
          PROJECT LIGHTBOX
      ===================================================== */}

      <Lightbox
        project={openProject as never}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}
