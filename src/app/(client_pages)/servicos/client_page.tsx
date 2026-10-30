
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
  mobileNav: 82,
  mobileGap: 24,
  desktopTracking: 110,
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
   * Navigate to a service section.
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

    step.focus({ preventScroll: true });
  }, []);

  /**
   * Track the service closest to the reading position.
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
          current === closest!.key
            ? current
            : closest!.key,
        );
      }
    };

    const scheduleUpdate = () => {
      if (frame !== 0) return;

      frame = window.requestAnimationFrame(update);
    };

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

      <main className="bg-[#F7F7F5]">

        {/* =====================================================
            SERVICES HERO
        ===================================================== */}

        <section
          className="
            relative isolate flex min-h-[440px] items-end
            overflow-hidden bg-[#002950] pb-16 pt-32
            text-white md:min-h-[540px] md:pb-20
          "
          aria-labelledby="services-page-title"
        >
          {/* Background grid */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0 opacity-[0.12]
              [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)]
              [background-size:80px_80px]
            "
          />

          {/* Decorative accent */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute -right-24 -top-32
              size-[450px] rounded-full border border-white/10
              md:size-[650px]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute -right-12 -top-20
              size-[350px] rounded-full border border-white/10
              md:size-[550px]
            "
          />

          <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[#BD9655]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">
                02 / Áreas de actuação
              </span>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1
                  id="services-page-title"
                  className="
                    max-w-4xl text-[clamp(3.5rem,8vw,7.5rem)]
                    font-medium leading-[0.88]
                    tracking-[-0.075em]
                  "
                >
                  Serviços
                  <span className="block font-normal italic text-[#BD9655]">
                    integrados.
                  </span>
                </h1>
              </div>

              <div className="max-w-md lg:justify-self-end">
                <p className="text-sm leading-8 text-white/65 md:text-base">
                  Da primeira ideia à entrega da obra,
                  reunimos arquitectura, engenharia,
                  construção e fiscalização num processo
                  coordenado, com rigor técnico e atenção
                  a cada detalhe.
                </p>

                <div className="mt-8 flex items-center gap-5">
                  <span className="text-xs font-semibold text-[#BD9655]">
                    {String(SERVICES.length).padStart(2, "0")}
                  </span>

                  <span className="h-px flex-1 bg-white/20" />

                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/45">
                    Áreas de especialização
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SERVICES SCROLL EXPERIENCE
        ===================================================== */}

        <section
          className="services-scroll relative"
          aria-label="Áreas de actuação"
        >
          <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
            <div className="services-scroll__layout">

              {/* SERVICE CONTENT */}

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
                    className={`
                      services-scroll__step
                      group relative
                      ${active === service.key ? "is-active" : ""}
                    `}
                  >
                    <div className="mb-8 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#BD9655]">
                        {service.num} / {service.label}
                      </span>

                      <span className="text-[10px] text-[#002950]/35">
                        0{index + 1} — 0{SERVICES.length}
                      </span>
                    </div>

                    <h2
                      id={`${service.key}-title`}
                      className="
                        max-w-2xl text-[clamp(2.5rem,5vw,5rem)]
                        font-medium leading-[0.95]
                        tracking-[-0.065em] text-[#002950]
                        transition-colors duration-500
                        group-hover:text-[#BD9655]
                      "
                    >
                      {service.title}
                    </h2>

                    <p className="services-scroll__intro mt-8 max-w-xl text-base leading-8 text-[#73777C] md:text-lg">
                      {service.intro}
                    </p>

                    <div className="mt-12 border-t border-[#002950]/15">
                      {service.items.map(
                        ([title, description], itemIndex) => (
                          <div
                            key={title}
                            className="
                              grid gap-3 border-b
                              border-[#002950]/10 py-6
                              md:grid-cols-[48px_0.8fr_1.2fr]
                              md:gap-6
                            "
                          >
                            <span className="text-[10px] font-medium text-[#BD9655]">
                              0{itemIndex + 1}
                            </span>

                            <h3 className="text-sm font-semibold text-[#002950]">
                              {title}
                            </h3>

                            <p className="text-sm leading-7 text-[#85898C]">
                              {description}
                            </p>
                          </div>
                        ),
                      )}
                    </div>

                    <div className="mt-12 flex items-center gap-4">
                      <span className="h-px w-10 bg-[#BD9655]" />

                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#002950]/45">
                        PRO SOTA · {service.label}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* STICKY VISUAL PANEL */}

              <aside
                ref={visualRef}
                className="services-scroll__visual relative"
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

                {/* PROGRESS NAVIGATION */}

                <nav
                  className="services-progress"
                  aria-label="Escolher área de serviço"
                >
                  <div className="services-progress__dots">
                    {SERVICES.map((service, index) => {
                      const isActive = active === service.key;

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

                  <p aria-live="off">
                    <span>
                      {String(
                        Math.max(0, activeIndex + 1),
                      ).padStart(2, "0")}
                    </span>
                    {" / "}
                    {String(SERVICES.length).padStart(2, "0")}
                    {" · "}
                    {remaining > 0
                      ? `${remaining} por explorar`
                      : "Último serviço"}
                  </p>
                </nav>
              </aside>
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTACT
        ===================================================== */}

        <Contact />
      </main>

      <Footer />
    </>
  );
}
