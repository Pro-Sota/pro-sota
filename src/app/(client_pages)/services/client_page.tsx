"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
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

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const SERVICES = services;

const MOBILE_BREAKPOINT = "(max-width: 900px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** How long the previous 3D scene stays mounted so its fade-out can finish. */
const SCENE_EXIT_MS = 600;

const SCROLL_OFFSETS = {
  desktop: 110,
  mobileNav: 82,
  mobileGap: 24,
} as const;

const SCENE_BY_SERVICE = {
  arquitectura: SCENES.arquitectura,
  engenharia: SCENES.engenharia,
  construcao: SCENES.construcao,
  fiscalizacao: SCENES.fiscalizacao,
} satisfies Record<
  ServiceKey,
  (typeof SCENES)[keyof typeof SCENES]
>;

const isServiceKey = (value: string | null): value is ServiceKey =>
  value !== null && SERVICE_KEYS.includes(value as ServiceKey);

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Subscribes to a media query without causing hydration mismatches.
 * The server snapshot is `true`, so on the server (and on first paint on
 * mobile) the 3D scenes are never rendered.
 */
function useMediaQuery(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Distance from the top of the viewport that content must clear. */
function getVisibleTop(visual: HTMLElement | null) {
  if (!window.matchMedia(MOBILE_BREAKPOINT).matches) {
    return SCROLL_OFFSETS.desktop;
  }

  const visualHeight = visual?.getBoundingClientRect().height ?? 0;

  return (
    SCROLL_OFFSETS.mobileNav +
    visualHeight +
    SCROLL_OFFSETS.mobileGap
  );
}

/**
 * Tracks which service is closest to the reading position.
 * Keeps a Set of every currently-visible step, because the observer callback
 * only reports the entries that changed, not all visible ones.
 */
function useActiveService(
  stepsRef: { current: (HTMLElement | null)[] },
  visualRef: { current: HTMLElement | null },
) {
  const [active, setActive] = useState<ServiceKey>(
    SERVICE_KEYS[0],
  );

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    let observer: IntersectionObserver | null = null;
    const visible = new Set<Element>();

    const build = () => {
      observer?.disconnect();
      visible.clear();

      const top = getVisibleTop(visualRef.current);

      const bottom = Math.min(
        window.innerHeight * 0.55,
        Math.max(0, window.innerHeight - top - 80),
      );

      const reading =
        top + (window.innerHeight - top - bottom) / 2;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visible.add(entry.target);
            else visible.delete(entry.target);
          });

          let best: Element | null = null;
          let bestDistance = Infinity;

          visible.forEach((element) => {
            const rect = element.getBoundingClientRect();
            const distance = Math.abs(
              rect.top + rect.height / 2 - reading,
            );

            if (distance < bestDistance) {
              best = element;
              bestDistance = distance;
            }
          });

          const key = (best as Element | null)?.getAttribute(
            "data-service",
          ) ?? null;

          if (isServiceKey(key)) {
            setActive((current) =>
              current === key ? current : key,
            );
          }
        },
        {
          root: null,
          rootMargin: `-${top}px 0px -${bottom}px 0px`,
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        },
      );

      stepsRef.current.forEach((step) => {
        if (step) observer?.observe(step);
      });
    };

    build();

    // Rebuild when the window OR the sticky visual panel changes size.
    const resizeObserver =
      "ResizeObserver" in window
        ? new ResizeObserver(build)
        : null;

    if (visualRef.current) {
      resizeObserver?.observe(visualRef.current);
    }

    window.addEventListener("resize", build, { passive: true });

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", build);
    };
  }, [stepsRef, visualRef]);

  return active;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ServicesOverview() {
  const stepsRef = useRef<(HTMLElement | null)[]>([]);
  const visualRef = useRef<HTMLElement | null>(null);

  const active = useActiveService(stepsRef, visualRef);

  /** No 3D on mobile. Defaults to `true` on the server. */
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, true);

  /* Desktop only: keep the previous scene mounted briefly for its fade-out. */
  const [mountedScenes, setMountedScenes] = useState<ServiceKey[]>(
    [active],
  );

  useEffect(() => {
    if (isMobile) {
      setMountedScenes([]);
      return;
    }

    setMountedScenes((current) =>
      current.includes(active) ? current : [...current, active],
    );

    const timeout = window.setTimeout(
      () => setMountedScenes([active]),
      SCENE_EXIT_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [active, isMobile]);

  const activeIndex = SERVICES.findIndex(
    (service) => service.key === active,
  );

  const currentNumber = Math.max(0, activeIndex + 1);

  const remaining =
    activeIndex < 0
      ? SERVICES.length
      : SERVICES.length - activeIndex - 1;

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  const goToService = useCallback(
    (index: number, instant = false) => {
      const step = stepsRef.current[index];

      if (!step) return;

      const offset = getVisibleTop(visualRef.current);

      const top =
        window.scrollY +
        step.getBoundingClientRect().top -
        offset;

      const reducedMotion =
        window.matchMedia(REDUCED_MOTION).matches;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: instant || reducedMotion ? "auto" : "smooth",
      });

      step.focus({ preventScroll: true });
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* URL hash <-> active service                                              */
  /* ------------------------------------------------------------------------ */

  // On load, jump to the service named in the hash (if any).
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const index = SERVICES.findIndex(
      (service) => service.key === hash,
    );

    if (index < 0) return;

    const frame = requestAnimationFrame(() =>
      goToService(index, true),
    );

    return () => cancelAnimationFrame(frame);
  }, [goToService]);

  // Keep the hash in sync while scrolling (replaceState: no history spam).
  // Skips the first run so it never overwrites the incoming hash.
  const hashReady = useRef(false);

  useEffect(() => {
    if (!hashReady.current) {
      hashReady.current = true;
      return;
    }

    history.replaceState(null, "", `#${active}`);
  }, [active]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Nav dark />

      <main className="bg-[#F7F7F5]">
        {/* ================================================================== */}
        {/* HERO                                                               */}
        {/* ================================================================== */}

        <section
          className="
            relative isolate flex min-h-[440px] items-end
            overflow-hidden bg-[#002950] pb-14 pt-32
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

          {/* Decorative circles */}

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

          {/* Hero content */}

          <div
            className="
              relative mx-auto w-full max-w-[1440px]
              px-6 md:px-12 lg:px-20
            "
          >
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[#BD9655]" />

              <span
                className="
                  text-[10px] font-semibold uppercase
                  tracking-[0.25em] text-white/55
                "
              >
                PRO SOTA / O que fazemos
              </span>
            </div>

            <div
              className="
                grid gap-10 lg:grid-cols-[1.2fr_0.8fr]
                lg:items-end
              "
            >
              {/* Title */}

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

                  <span
                    className="
                      block font-normal italic
                      text-[#BD9655]
                    "
                  >
                    integrados.
                  </span>
                </h1>
              </div>

              {/* Introduction */}

              <div className="max-w-md lg:justify-self-end">
                <p
                  className="
                    text-sm leading-8 text-white/65
                    md:text-base
                  "
                >
                  Da primeira ideia à entrega da obra,
                  reunimos arquitectura, engenharia,
                  construção e fiscalização num processo
                  coordenado, com rigor técnico e atenção
                  a cada detalhe.
                </p>

                <div className="mt-8">
                  <a
                    href={`#${SERVICES[0]?.key ?? ""}`}
                    onClick={(event) => {
                      event.preventDefault();
                      goToService(0);
                    }}
                    className="
                      group inline-flex items-center gap-4
                      text-[10px] font-semibold uppercase
                      tracking-[0.2em] text-white
                      transition-colors hover:text-[#BD9655]
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#BD9655]
                      focus-visible:ring-offset-4
                      focus-visible:ring-offset-[#002950]
                    "
                  >
                    Explorar serviços

                    <span
                      aria-hidden="true"
                      className="
                        flex size-9 items-center justify-center
                        rounded-full border border-white/25
                        text-base transition-all duration-300
                        group-hover:translate-y-1
                        group-hover:border-[#BD9655]
                        group-hover:text-[#BD9655]
                      "
                    >
                      ↓
                    </span>
                  </a>
                </div>

                {/* Service count */}

                <div
                  className="
                    mt-9 flex items-center gap-5
                    border-t border-white/15 pt-5
                  "
                >
                  <span className="text-xs font-semibold text-[#BD9655]">
                    {String(SERVICES.length).padStart(2, "0")}
                  </span>

                  <span className="h-px flex-1 bg-white/20" />

                  <span
                    className="
                      text-[9px] uppercase tracking-[0.2em]
                      text-white/45
                    "
                  >
                    Áreas de especialização
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SERVICES SCROLL EXPERIENCE                                        */}
        {/* ================================================================== */}

        <section
          className="services-scroll relative"
          aria-label="Áreas de actuação da PRO SOTA"
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
                      ${
                        active === service.key
                          ? "is-active"
                          : ""
                      }
                    `}
                  >
                    {/* Service identification */}

                    <div className="mb-8 flex items-center justify-between gap-4">
                      <span
                        className="
                          text-[11px] font-semibold uppercase
                          tracking-[0.2em] text-[#BD9655]
                        "
                      >
                        {service.num} / {service.label}
                      </span>

                      <span className="text-[10px] tabular-nums text-[#002950]/35">
                        {String(index + 1).padStart(2, "0")}
                        {" — "}
                        {String(SERVICES.length).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Service title */}

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

                    {/* Service introduction */}

                    <p
                      className="
                        services-scroll__intro mt-8 max-w-xl
                        text-base leading-8 text-[#73777C]
                        md:text-lg
                      "
                    >
                      {service.intro}
                    </p>

                    {/* Service capabilities */}

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
                            <span className="text-[10px] font-medium tabular-nums text-[#BD9655]">
                              {String(itemIndex + 1).padStart(2, "0")}
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

                    {/* Service signature */}

                    <div className="mt-12 flex items-center gap-4">
                      <span className="h-px w-10 bg-[#BD9655]" />

                      <span
                        className="
                          text-[9px] font-semibold uppercase
                          tracking-[0.2em] text-[#002950]/45
                        "
                      >
                        PRO SOTA · {service.label}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* STICKY VISUAL PANEL */}

              <aside
                ref={visualRef}
                className={
                  "services-scroll__visual relative" +
                  (isMobile ? " is-compact" : "")
                }
                aria-label="Navegação dos serviços"
              >
                {/* 3D stage: desktop only, never mounted on mobile */}

                {!isMobile && (
                  <>
                    <div
                      className="stage__grid"
                      aria-hidden="true"
                    />

                    {SERVICES.map((service) => {
                      const Scene =
                        SCENE_BY_SERVICE[service.key as ServiceKey];
                      const isActive = active === service.key;

                      // Only the active scene (plus the one fading out)
                      // is mounted, so inactive WebGL loops don't run.
                      const shouldMount =
                        isActive ||
                        mountedScenes.includes(
                          service.key as ServiceKey,
                        );

                      return (
                        <div
                          key={service.key}
                          className={
                            "services-scroll__scene" +
                            (isActive ? " is-active" : "")
                          }
                          aria-hidden={!isActive}
                          // `inert` set via ref works on React 18 and 19.
                          ref={(node) => {
                            if (node) node.inert = !isActive;
                          }}
                        >
                          <span aria-hidden="true">
                            {service.num}
                          </span>

                          <div
                            className="scene3d__rig"
                            aria-hidden="true"
                          >
                            {shouldMount && <Scene />}
                          </div>

                          <b>{service.title}</b>
                        </div>
                      );
                    })}
                  </>
                )}

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
                          aria-label={
                            `${index + 1} de ${SERVICES.length}: ${service.title}`
                          }
                          aria-current={
                            isActive ? "step" : undefined
                          }
                          aria-controls={service.key}
                          title={service.title}
                          onClick={() => goToService(index)}
                          className="
                            focus-visible:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[#BD9655]
                            focus-visible:ring-offset-4
                          "
                        >
                          <span aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>

                  <p>
                    <span>
                      {String(currentNumber).padStart(2, "0")}
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

        {/* ================================================================== */}
        {/* CONTACT                                                            */}
        {/* ================================================================== */}

        <Contact />
      </main>

      <Footer />
    </>
  );
}