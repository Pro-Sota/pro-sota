"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Nav from "../components/nav";
import Contact from "../components/contact_page";
import Footer from "../components/footer";

import { SCENES } from "../components/scene";
import {
  services,
  SERVICE_KEYS,
  type ServiceKey,
} from "../components/servicesData";

import "../../admin.css";
import "../../styles.css";

const SERVICES = services;

const MOBILE_BREAKPOINT = "(max-width: 900px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const SCENE_BY_SERVICE = {
  arquitectura: SCENES.arquitectura,
  engenharia: SCENES.engenharia,
  construcao: SCENES.construcao,
  fiscalizacao: SCENES.fiscalizacao,
} satisfies Record<
  ServiceKey,
  (typeof SCENES)[keyof typeof SCENES]
>;
const SCROLL_OFFSETS = {
  desktop: 110,
  mobileNav: 76,
  mobileGap: 24,
  desktopTracking: 94,
} as const;

export default function ServicesOverview() {
  const [active, setActive] = useState<ServiceKey>(
    SERVICE_KEYS[0],
  );

  const stepsRef = useRef<(HTMLElement | null)[]>([]);
  const visualRef = useRef<HTMLElement | null>(null);

  const activeIndex = SERVICES.findIndex(
    (service) => service.key === active,
  );

  const remaining =
    activeIndex < 0
      ? SERVICES.length
      : SERVICES.length - activeIndex - 1;

  /**
   * Scrolls to a service without hiding its heading behind
   * the navigation or the sticky visual panel.
   */
  const goToService = useCallback((index: number) => {
    const step = stepsRef.current[index];

    if (!step) return;

    const isMobile = window.matchMedia(
      MOBILE_BREAKPOINT,
    ).matches;

    const visualHeight = isMobile
      ? visualRef.current?.getBoundingClientRect().height ?? 0
      : 0;

    const offset = isMobile
      ? SCROLL_OFFSETS.mobileNav +
      visualHeight +
      SCROLL_OFFSETS.mobileGap
      : SCROLL_OFFSETS.desktop;

    const top =
      window.scrollY +
      step.getBoundingClientRect().top -
      offset;

    const reducedMotion = window.matchMedia(
      REDUCED_MOTION_QUERY,
    ).matches;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: reducedMotion ? "auto" : "smooth",
    });

    // Keep keyboard focus on the destination section.
    step.focus({ preventScroll: true });
  }, []);

  /**
   * Track the service closest to the reading position.
   *
   * The update is scheduled once per animation frame to avoid
   * doing repeated layout calculations for every scroll event.
   */
  useEffect(() => {
    let frame = 0;
    let disposed = false;

    const update = () => {
      frame = 0;

      if (disposed) return;

      const isMobile = window.matchMedia(
        MOBILE_BREAKPOINT,
      ).matches;

      const visualBottom =
        visualRef.current?.getBoundingClientRect().bottom ??
        SCROLL_OFFSETS.mobileNav;

      const visibleTop = isMobile
        ? Math.max(
          SCROLL_OFFSETS.mobileNav,
          visualBottom,
        )
        : SCROLL_OFFSETS.desktopTracking;

      const centre = Math.min(
        window.innerHeight - 24,
        visibleTop +
        (window.innerHeight - visibleTop) * 0.3,
      );

      let closest: {
        key: ServiceKey;
        distance: number;
      } | null = null;

      for (const step of stepsRef.current) {
        if (!step) continue;

        const rect = step.getBoundingClientRect();

        // Distance from the reading position to the section.
        const distance = Math.max(
          rect.top - centre,
          centre - rect.bottom,
          0,
        );

        if (!closest || distance < closest.distance) {
          const key = step.dataset.service;

          if (
            key &&
            SERVICE_KEYS.includes(key as ServiceKey)
          ) {
            closest = {
              key: key as ServiceKey,
              distance,
            };
          }
        }
      }

      if (closest) {
        setActive((current) =>
          current === closest!.key ? current : closest!.key,
        );
      }
    };

    const scheduleUpdate = () => {
      if (frame !== 0) return;

      frame = window.requestAnimationFrame(update);
    };

    // Calculate the initial state after mounting.
    update();

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);

    return () => {
      disposed = true;

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("load", scheduleUpdate);

      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <>
      <Nav dark />

      <main>
        <section
          className="subhero services-page__hero"
          aria-labelledby="services-page-title"
        >
          <div className="subhero__grid" aria-hidden="true" />

          <div className="wrap">
            <h1 id="services-page-title">
              Serviços integrados
            </h1>

            <p>
              Da primeira ideia à entrega da obra, reunimos
              arquitectura, engenharia, construção e fiscalização
              num processo coordenado.
            </p>
          </div>
        </section>

        <section
          className="services-scroll"
          aria-label="Áreas de actuação"
        >
          <div className="wrap services-scroll__layout">
            <div className="services-scroll__copy">
              {SERVICES.map((service, index) => (
                <article
                  key={service.key}
                  ref={(node) => {
                    stepsRef.current[index] = node;
                  }}
                  data-service={service.key}
                  id={service.key}
                  tabIndex={-1}
                  aria-labelledby={`${service.key}-title`}
                  className={
                    "services-scroll__step" +
                    (active === service.key ? " is-active" : "")
                  }
                >
                  <span
                    className="services-scroll__num"
                    aria-hidden="true"
                  >
                    {service.num}
                  </span>

                  <p className="section-label">
                    {service.label}
                  </p>

                  <h2 id={`${service.key}-title`}>
                    {service.title}
                  </h2>

                  <p className="services-scroll__intro">
                    {service.intro}
                  </p>

                  <ul>
                    {service.items.map(
                      ([title, description]) => (
                        <li key={title}>
                          <h3>{title}</h3>
                          <p>{description}</p>
                        </li>
                      ),
                    )}
                  </ul>
                </article>
              ))}
            </div>

            <aside
              ref={visualRef}
              className="services-scroll__visual"
              aria-label="Navegação entre serviços"
            >
              <div
                className="stage__grid"
                aria-hidden="true"
              />

              {SERVICES.map((service) => {
                const sceneKey = service.key as ServiceKey;
                const Scene = SCENE_BY_SERVICE[sceneKey];

                const isActive = active === service.key;

                return (
                  <div
                    key={service.key}
                    className={
                      "services-scroll__scene" +
                      (isActive ? " is-active" : "")
                    }
                    aria-hidden={!isActive}
                    inert={!isActive}
                  >
                    <span aria-hidden="true">
                      {service.num}
                    </span>

                    <div
                      className="scene3d__rig"
                      aria-hidden="true"
                    >
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
                  {SERVICES.map((service, index) => {
                    const isActive =
                      active === service.key;

                    return (
                      <button
                        key={service.key}
                        type="button"
                        aria-label={`${index + 1} de ${SERVICES.length}: ${service.title}`}
                        aria-current={
                          isActive ? "step" : undefined
                        }
                        title={service.title}
                        onClick={() => goToService(index)}
                      >
                        <span aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>

                {/* Visual counter; avoid announcing every scroll update. */}
                <p>
                  <span>{Math.max(0, activeIndex + 1)}</span>
                  {" de "}
                  {SERVICES.length}
                  {" · "}
                  {remaining > 0
                    ? `Falta${remaining === 1 ? "" : "m"} ${remaining}`
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