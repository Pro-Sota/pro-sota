import Link from "next/link";

import "../../hero.css";
import HeroConstructionScene from "./hero_construction_scene";
import HeroAnimation from "./hero_animation"; // "use client" component (observers, ticker speed, pointer depth)

/* No "use client" here: parallax is now pure CSS (scroll-driven animation),
   so this component renders on the server and ships less JS. */

const SERVICES = [
  "Arquitectura",
  "Engenharia",
  "Construção & Obras Públicas",
  "Fiscalização & Consultoria",
];

/* 6 copies = 3 per half. The ticker moves -50%, so each half must be wider
   than the widest viewport you care about. */
const TICKER_ITEMS = Array.from({ length: 6 }, () => SERVICES).flat();

/* Add REAL figures only. The stats block renders only when this has items.
   Example:
   { value: "12+", label: "Anos de experiência" }, */
const STATS: { value: string; label: string }[] = [];

/* Drafting compass used as the "A" of SOTA (styles: .ps-compass in hero.css) */
function CompassA() {
  return (
    <svg
      className="ps-compass"
      viewBox="0 0 76 72"
      aria-hidden="true"
      focusable="false"
    >
      <path className="ps-compass__leg-l" pathLength={1} d="M33 10 L39 14 L9.5 64 L6 72 L3.5 64 Z" />
      <path className="ps-compass__leg-r" pathLength={1} d="M43 10 L37 14 L66.5 64 L70 72 L72.5 64 Z" />
      <path className="ps-compass__arc" pathLength={1} d="M20.7 45 Q38 35 55.3 45 L58.2 50 Q38 40 17.8 50 Z" />
      <path className="ps-compass__lead" pathLength={1} d="M64.7 61 L70.9 61" />
      <path className="ps-compass__grip" pathLength={1} d="M34 0 H42 V4 H34 Z" />
      <path className="ps-compass__hinge" pathLength={1} d="M31 11 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0" />
      <circle className="ps-compass__dot" cx="38" cy="11" r="1.6" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section
      className="ps-hero"
      id="top"
      lang="pt-AO"
      aria-labelledby="hero-title"
    >
      {/* Background */}
      <div className="ps-hero__grid" aria-hidden="true" />
      <div className="ps-hero__glow" aria-hidden="true" />
      <div className="ps-hero__scan" aria-hidden="true">
        <i />
      </div>

      {/* Main composition */}
      <div className="ps-hero__inner">
        <div className="ps-hero__content">
          <div className="ps-hero__eyebrow">
            <span className="ps-hero__pin" aria-hidden="true" />
            <span>Luanda, Angola</span>
            <span className="ps-hero__eyebrow-line" aria-hidden="true" />
          </div>

          {/* The visual title is decorative; the accessible name carries the
              brand plus what the company does (better for SEO / screen readers).
              Removed the Tailwind text-[#8B6A2F] class: it overrode
              `color: transparent` and filled the outlined word. */}
          <h1
            id="hero-title"
            className="ps-hero__title"
            aria-label="Pro Sota — Arquitectura, Engenharia e Construção em Angola"
          >
            <span aria-hidden="true">
              <b>PRO</b>
            </span>
            <span aria-hidden="true" className="ps-hero__title-second">
              <b>
                SOT
                <CompassA />
              </b>
            </span>
          </h1>

          <div className="ps-hero__divider" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="ps-hero__sub">
            <p className="ps-hero__tagline">
              Transformamos ideias em espaços, projectos em realidade e
              desafios em obras de excelência.
            </p>

            <div className="ps-hero__actions">
              <Link
                href="#contacto"
                className="ps-hero__cta ps-hero__cta--solid"
              >
                <span>Pedir proposta</span>
                <span className="ps-hero__cta-arrow" aria-hidden="true" />
              </Link>

              <Link href="#servicos" className="ps-hero__cta">
                <span>Explorar serviços</span>
                <span className="ps-hero__cta-arrow" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {STATS.length > 0 && (
            <dl className="ps-hero__stats">
              {STATS.map((stat) => (
                <div className="ps-hero__stat" key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Illustration column */}
        <div className="ps-hero__visual">
          <div className="ps-hero__scene" aria-hidden="true">
            <HeroConstructionScene />
          </div>

          <div
            className="ps-hero__annotation ps-hero__annotation--top"
            aria-hidden="true"
          >
            <span className="ps-hero__annotation-dot" />
            <span>ENGENHARIA</span>
          </div>

          <div
            className="ps-hero__annotation ps-hero__annotation--bottom"
            aria-hidden="true"
          >
            <span className="ps-hero__annotation-dot" />
            <span>ARQUITECTURA &amp; CONSTRUÇÃO</span>
          </div>

          <div
            className="ps-hero__annotation ps-hero__annotation--left"
            aria-hidden="true"
          >
            <span className="ps-hero__annotation-dot" />
            <span>FISCALIZAÇÃO</span>
          </div>
        </div>
      </div>

      {/* Scroll cue (styles already exist in hero.css) */}
      <a
        href="#servicos"
        className="ps-hero__scroll"
        aria-label="Ir para os serviços"
      >
        <span className="ps-hero__scroll-line" aria-hidden="true">
          <i />
        </span>
        <span aria-hidden="true">DESCER</span>
      </a>

      {/* Services ticker */}
      <div className="ps-hero__strip" aria-hidden="true">
        <div className="ps-hero__strip-track">
          {TICKER_ITEMS.map((service, index) => (
            <span className="ps-hero__strip-item" key={`${service}-${index}`}>
              {service}
              <i aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

      <HeroAnimation />
    </section>
  );
}