"use client";

/*
 * Página de serviços com texto e cena CSS 3D sincronizados pelo scroll.
 * stepsRef guarda os elementos reais; active guarda apenas a chave do serviço visível.
 */

import { useEffect, useRef, useState } from "react";
import Nav from "./nav";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { SCENES } from "../scene3d/Scenes";
import { services } from "../data/services";

const SERVICES = services;

export default function ServicesOverview() {
  const [active, setActive] = useState("arquitectura");

  const stepsRef = useRef<(HTMLElement | null)[]>([]);
  const visualRef = useRef<HTMLElement | null>(null);

  const activeIndex = SERVICES.findIndex(
    (service) => service.key === active
  );

  const remaining = SERVICES.length - activeIndex - 1;

  const goToService = (index: number) => {
    const step = stepsRef.current[index];

    if (!step) return;

    const mobile = window.matchMedia(
      "(max-width: 900px)"
    ).matches;

    const offset = mobile
      ? 76 + (visualRef.current?.offsetHeight || 0) + 24
      : 110;

    window.scrollTo({
      top:
        window.scrollY +
        step.getBoundingClientRect().top -
        offset,
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "auto"
        : "smooth",
    });

    step.focus({ preventScroll: true });
  };

  // O bloco mais próximo do centro do ecrã
  // alimenta simultaneamente texto e modelo.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const mobile = window.matchMedia(
        "(max-width: 900px)"
      ).matches;

      const visibleTop = mobile
        ? Math.max(
            76,
            visualRef.current?.getBoundingClientRect()
              .bottom || 76
          )
        : 94;

      const centre = Math.min(
        window.innerHeight - 24,
        visibleTop +
          (window.innerHeight - visibleTop) * 0.3
      );

      const closest = stepsRef.current
        .filter(
          (step): step is HTMLElement => step !== null
        )
        .reduce<{
          step: HTMLElement;
          distance: number;
        } | null>((best, step) => {
          const rect = step.getBoundingClientRect();

          const distance = Math.max(
            rect.top - centre,
            centre - rect.bottom,
            0
          );

          return !best || distance < best.distance
            ? { step, distance }
            : best;
        }, null);

      if (closest) {
        setActive(
          closest.step.dataset.service || "arquitectura"
        );
      }
    };

    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener("scroll", schedule, {
      passive: true,
    });

    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);

      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <>
      <Nav dark />

      <main>
        <section className="subhero services-page__hero">
          <div className="subhero__grid" />

          <div className="wrap">
            <h1>Serviços integrados</h1>

            <p>
              Da primeira ideia à entrega da obra, reunimos
              arquitectura, engenharia, construção e
              fiscalização num processo coordenado.
            </p>
          </div>
        </section>

        <section className="services-scroll">
          <div className="wrap services-scroll__layout">
            <div className="services-scroll__copy">
              {SERVICES.map((service, index) => {
                const detail = service;

                return (
                  <article
                    key={service.key}
                    ref={(node) => {
                      stepsRef.current[index] = node;
                    }}
                    data-service={service.key}
                    id={service.key}
                    tabIndex={-1}
                    aria-labelledby={`${service.key}-title`}
                    className={`services-scroll__step${
                      active === service.key
                        ? " is-active"
                        : ""
                    }`}
                  >
                    <span className="services-scroll__num">
                      {service.num}
                    </span>

                    <p className="section-label">
                      {service.label}
                    </p>

                    <h2 id={`${service.key}-title`}>
                      {detail.title}
                    </h2>

                    <p className="services-scroll__intro">
                      {detail.intro}
                    </p>

                    <ul>
                      {detail.items.map(
                        ([title, description]) => (
                          <li key={title}>
                            <h3>{title}</h3>
                            <p>{description}</p>
                          </li>
                        )
                      )}
                    </ul>
                  </article>
                );
              })}
            </div>

            <aside
              ref={visualRef}
              className="services-scroll__visual"
              aria-label="Navegação entre serviços"
            >
              <div className="stage__grid" />

              {SERVICES.map((service) => {
                const Scene = SCENES[service.key];

                if (!Scene) return null;

                return (
                  <div
                    key={service.key}
                    className={`services-scroll__scene${
                      active === service.key
                        ? " is-active"
                        : ""
                    }`}
                  >
                    <span>{service.num}</span>

                    <div className="scene3d__rig">
                      <Scene />
                    </div>

                    <b>{service.title}</b>
                  </div>
                );
              })}

              <nav
                className="services-progress"
                aria-label="Escolher área de serviço"
              >
                <div className="services-progress__dots">
                  {SERVICES.map((service, index) => (
                    <button
                      key={service.key}
                      type="button"
                      aria-label={`${index + 1} de ${
                        SERVICES.length
                      }: ${service.title}`}
                      aria-current={
                        active === service.key
                          ? "step"
                          : undefined
                      }
                      title={service.title}
                      onClick={() => goToService(index)}
                    >
                      <span />
                    </button>
                  ))}
                </div>

                <p role="status">
                  {activeIndex + 1} de {SERVICES.length} ·{" "}
                  {remaining
                    ? `Falta${
                        remaining === 1 ? "" : "m"
                      } ${remaining}`
                    : "Último serviço"}
                </p>
              </nav>
            </aside>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </>
  );
}