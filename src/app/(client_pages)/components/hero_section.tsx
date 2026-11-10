"use client";

import { useEffect, useRef } from "react";

import "../../hero.css";
import HeroConstructionScene from "./hero_construction_scene";
import Link from "next/link";

const SERVICES = [
  "Arquitectura",
  "Engenharia",
  "Construção & Obras Públicas",
  "Fiscalização & Consultoria",
];

/* Repeated an even number of times so the CSS ticker (translateX -50%)
   loops without a gap, even on very wide screens. */
const TICKER_ITEMS = Array.from({ length: 6 }, () => SERVICES).flat();

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  /* Pause every CSS animation while the hero is off-screen. */
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        el.dataset.paused = String(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);


  return (
    <section
      ref={heroRef}
      className="ps-hero"
      id="top"
      lang="pt-AO"
      data-paused="false"
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
            <span>Angola </span>
            <span className="ps-hero__eyebrow-line" aria-hidden="true" />
          </div>

          <h1 className="ps-hero__title">
            <span>PRO</span>
            <span className="ps-hero__title-second">SOTA</span>
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
              <Link href="#contacto" className="ps-hero__cta ps-hero__cta--solid">
                <span>Pedir proposta</span>
                <span className="ps-hero__cta-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>

              <Link href="#servicos" className="ps-hero__cta">
                <span>Explorar serviços</span>
                <span className="ps-hero__cta-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </div>
          </div>
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
            <span>ENGENHARIA · 01</span>
          </div>

          <div
            className="ps-hero__annotation ps-hero__annotation--bottom"
            aria-hidden="true"
          >
            <span>DESIGN &amp; CONSTRUÇÃO</span>
            <span className="ps-hero__annotation-line" />
            <span>08°50′ S · 13°14′ E</span>
          </div>
        </div>
      </div>

      {/* Services ticker (decorative duplicate of the services section) */}
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
    </section>
  );
}