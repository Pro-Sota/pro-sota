
"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import "../../hero.css";
import HeroConstructionScene from "./hero_construction_scene";
import Link from "next/link";

const SERVICES = [
  "Arquitectura",
  "Engenharia",
  "Construção & Obras Públicas",
  "Fiscalização & Consultoria",
];

const TICKER_ITEMS = Array.from({ length: 6 }, () => SERVICES).flat();

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();


  useEffect(() => {
    const element = heroRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        element.dataset.paused = String(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Subtle upward movement while scrolling through the hero.
  const titleY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduceMotion ? 0 : -50],
  );

  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.75],
    [1, 1],
  );

  const isMobile = useTransform(
    scrollYProgress,
    (value) => value,
  );

  const GOLD_INK = "text-[#8B6A2F]";

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
            <span>Angola</span>
            <span className="ps-hero__eyebrow-line" aria-hidden="true" />
          </div>

          <motion.h1
            className="ps-hero__title"
            style={{
              y: titleY,
              opacity: titleOpacity,
            }}
          >
            <span>PRO</span>
            <span className={`ps-hero__title-second ${GOLD_INK}`}>
              SOTA
            </span>
          </motion.h1>

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
                <span className="ps-hero__cta-arrow" aria-hidden="true" />
              </Link>

              <Link href="#servicos" className="ps-hero__cta">
                <span>Explorar serviços</span>
                <span className="ps-hero__cta-arrow" aria-hidden="true" />
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
            <span>ENGENHARIA</span>
          </div>

          <div
            className="ps-hero__annotation ps-hero__annotation--bottom"
            aria-hidden="true"
          >
            <span className="ps-hero__annotation-dot" />
            <span>Arquitectura &amp; CONSTRUÇÃO</span>
          </div>
        </div>
      </div>

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
    </section>
  );
}
