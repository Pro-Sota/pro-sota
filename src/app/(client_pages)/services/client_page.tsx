"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import dynamic from "next/dynamic";

import Nav from "../components/nav";

import {
  services,
  SERVICE_KEYS,
  type ServiceKey,
} from "../components/servicesData";

/* No CSS imports here: styles come from Tailwind classes only.
   Tailwind + the @theme tokens (font-display) must be loaded once in
   app/layout.tsx, not per page. */

/* -------------------------------------------------------------------------- */
/* Code-split pieces                                                          */
/* -------------------------------------------------------------------------- */

// Still server-rendered (no ssr:false), just split out of the main chunk.
const Contact = dynamic(() => import("../components/contact_page"));
const Footer = dynamic(() => import("../components/footer"));

// 3D scenes only render on desktop, so mobile never downloads them.
const SCENE_BY_SERVICE = {
  arquitectura: dynamic(
    () => import("../components/scene").then((m) => m.SCENES.arquitectura),
    { ssr: false, loading: () => null },
  ),
  engenharia: dynamic(
    () => import("../components/scene").then((m) => m.SCENES.engenharia),
    { ssr: false, loading: () => null },
  ),
  construcao: dynamic(
    () => import("../components/scene").then((m) => m.SCENES.construcao),
    { ssr: false, loading: () => null },
  ),
  fiscalizacao: dynamic(
    () => import("../components/scene").then((m) => m.SCENES.fiscalizacao),
    { ssr: false, loading: () => null },
  ),
} satisfies Record<ServiceKey, ComponentType>;

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const SERVICES = services;
type Service = (typeof SERVICES)[number];

// Must match the `min-[901px]:` variants used in the markup below.
const MOBILE_BREAKPOINT = "(max-width: 900px)";
const DESKTOP_BREAKPOINT = "(min-width: 901px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** How long the previous 3D scene stays mounted so its fade-out can finish. */
const SCENE_EXIT_MS = 600;

/**
 * Space kept between the bottom of the pinned aside and the bottom of the
 * services column (i.e. the Contact section). Equals the `py-20` (80px)
 * vertical padding of each service article on desktop.
 */
const ASIDE_BOTTOM_GAP = 80;

const SCROLL_OFFSETS = {
  desktop: 110,
  mobileNav: 82,
  mobileGap: 24,
} as const;

const isServiceKey = (value: string | null): value is ServiceKey =>
  value !== null && SERVICE_KEYS.includes(value as ServiceKey);

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
function getVisibleTop() {
  if (!window.matchMedia(MOBILE_BREAKPOINT).matches) {
    return SCROLL_OFFSETS.desktop;
  }
  // The aside is hidden on mobile, so only the nav bar needs clearing.
  return SCROLL_OFFSETS.mobileNav + SCROLL_OFFSETS.mobileGap;
}

/**
 * Tracks which service is closest to the reading position.
 *
 * Geometry (document-space top + height of every step) is measured only when
 * something actually changes size, then the scroll handler works from the
 * cache. No layout reads happen while scrolling.
 */
function useActiveService(
  stepsRef: { current: (HTMLElement | null)[] },
  visualRef: { current: HTMLElement | null },
) {
  const [active, setActive] = useState<ServiceKey>(SERVICE_KEYS[0]);

  useEffect(() => {
    let frame = 0;
    let reading = 0;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let tops: number[] = [];
    let heights: number[] = [];
    let keys: (ServiceKey | null)[] = [];

    const evaluate = () => {
      const scrollY = window.scrollY;
      let best: ServiceKey | null = null;
      let bestDistance = Infinity;

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!key) continue;
        const centre = tops[i] - scrollY + heights[i] / 2;
        const distance = Math.abs(centre - reading);
        if (distance < bestDistance) {
          best = key;
          bestDistance = distance;
        }
      }

      const next = best;
      if (next) setActive((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        evaluate();
      });
    };

    const measure = () => {
      const vh = window.innerHeight;
      const top = getVisibleTop();
      const bottom = Math.min(vh * 0.55, Math.max(0, vh - top - 80));
      reading = top + (vh - top - bottom) / 2;

      const scrollY = window.scrollY;
      keys = [];
      tops = [];
      heights = [];

      stepsRef.current.forEach((step, i) => {
        if (!step) return;
        const rect = step.getBoundingClientRect();
        const key = step.getAttribute("data-service");
        keys[i] = isServiceKey(key) ? key : null;
        tops[i] = rect.top + scrollY;
        heights[i] = rect.height;
      });

      evaluate();
    };

    // The mobile URL bar collapsing fires `resize` constantly while scrolling.
    // Only re-measure when the width changes or the height changes a lot.
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === lastWidth && Math.abs(h - lastHeight) < 150) return;
      lastWidth = w;
      lastHeight = h;
      measure();
    };

    measure();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    stepsRef.current.forEach((step) => {
      if (step) resizeObserver?.observe(step);
    });
    if (visualRef.current) resizeObserver?.observe(visualRef.current);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
    };
  }, [stepsRef, visualRef]);

  return active;
}

/* -------------------------------------------------------------------------- */
/* Service article (memoised: only the two whose isActive flips re-render)    */
/* -------------------------------------------------------------------------- */

type ServiceArticleProps = {
  service: Service;
  index: number;
  total: number;
  isActive: boolean;
  registerStep: (index: number, node: HTMLElement | null) => void;
};

const ServiceArticle = memo(function ServiceArticle({
  service,
  index,
  total,
  isActive,
  registerStep,
}: ServiceArticleProps) {
  return (
    <article
      ref={(node) => registerStep(index, node)}
      data-service={service.key}
      id={service.key}
      tabIndex={-1}
      aria-labelledby={`${service.key}-title`}
      className={`relative flex min-h-0 scroll-mt-28 flex-col justify-center py-10 outline-none transition-opacity duration-500 motion-reduce:transition-none sm:min-h-[62svh] min-[901px]:min-h-[90svh] min-[901px]:py-20 ${
        isActive ? "opacity-100" : "min-[901px]:opacity-40"
      }`}
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold tracking-[0.18em] text-[#7a6032]">
          {service.num} / {service.label}
        </span>
        <span className="text-xs tabular-nums text-[#002950]/60">
          {String(index + 1).padStart(2, "0")}
          {" — "}
          {String(total).padStart(2, "0")}
        </span>
      </div>

      <h2
        id={`${service.key}-title`}
        className="max-w-2xl font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1] tracking-[-0.02em] text-[#002950]"
      >
        {service.title}
      </h2>

      <p className="mt-8 max-w-xl text-base leading-8 text-[#5b6066] md:text-lg">
        {service.intro}
      </p>

      <div className="mt-12 border-t border-[#002950]/15">
        {service.items.map(([title, description], itemIndex) => (
          <div
            key={title}
            className="grid gap-3 border-b border-[#002950]/10 py-6 md:grid-cols-[48px_0.8fr_1.2fr] md:gap-6"
          >
            <span className="text-xs font-medium tabular-nums text-[#7a6032]">
              {String(itemIndex + 1).padStart(2, "0")}
            </span>
            <h3 className="font-body text-sm font-semibold tracking-normal text-[#002950]">
              {title}
            </h3>
            <p className="text-sm leading-7 text-[#5b6066]">{description}</p>
          </div>
        ))}
      </div>
    </article>
  );
});

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ServicesOverview() {
  const stepsRef = useRef<(HTMLElement | null)[]>([]);
  const visualRef = useRef<HTMLElement | null>(null);
  const columnRef = useRef<HTMLDivElement | null>(null);

  const active = useActiveService(stepsRef, visualRef);

  /** No 3D on mobile. Defaults to `true` on the server. */
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, true);

  /* Scene mounting ---------------------------------------------------------
     The new scene is added during render (no extra commit); the old ones are
     pruned once the fade-out has finished. */

  const [mountedScenes, setMountedScenes] = useState<ServiceKey[]>([active]);
  const [prevActive, setPrevActive] = useState<ServiceKey>(active);

  if (active !== prevActive) {
    setPrevActive(active);
    setMountedScenes((current) =>
      current.includes(active) ? current : [...current, active],
    );
  }

  useEffect(() => {
    if (isMobile) return;

    const timeout = window.setTimeout(
      () =>
        setMountedScenes((current) =>
          current.length === 1 && current[0] === active ? current : [active],
        ),
      SCENE_EXIT_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [active, isMobile]);

  const activeIndex = SERVICES.findIndex((s) => s.key === active);
  const currentNumber = Math.max(0, activeIndex + 1);
  const remaining =
    activeIndex < 0 ? SERVICES.length : SERVICES.length - activeIndex - 1;

  /* Navigation ------------------------------------------------------------ */

  const registerStep = useCallback(
    (index: number, node: HTMLElement | null) => {
      stepsRef.current[index] = node;
    },
    [],
  );

  const goToService = useCallback((index: number, instant = false) => {
    const step = stepsRef.current[index];
    if (!step) return;

    const offset = getVisibleTop();
    const top = window.scrollY + step.getBoundingClientRect().top - offset;
    const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: instant || reducedMotion ? "auto" : "smooth",
    });

    step.focus({ preventScroll: true });
  }, []);

  /* URL hash <-> active service -------------------------------------------
     1. On load, jump to the service named in the hash.
     2. As `active` changes while scrolling, write it back to the URL.
     `initialised` stops step 2 from overwriting the incoming hash before
     step 1 has scrolled there. */

  const initialised = useRef(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const index = SERVICES.findIndex((s) => s.key === hash);

    if (index < 0) {
      initialised.current = true;
      return;
    }

    const frame = requestAnimationFrame(() => {
      goToService(index, true);
      initialised.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [goToService]);

  useEffect(() => {
    if (!initialised.current) return;

    const current = window.location.hash.slice(1);
    if (current === active) return;
    // Don't add a hash just because the page loaded at the top.
    if (!current && active === SERVICE_KEYS[0]) return;

    try {
      // Full path + search, not just "#hash": more reliable with Next's
      // patched history API. Keep Next's own history.state for back/forward.
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}#${active}`,
      );
    } catch {
      // Safari throws if replaceState is called too often. Safe to ignore.
    }
  }, [active]);

  /* Aside: fixed in the middle of the viewport (desktop) -------------------
     Three states, switched with window.scrollY:
       before -> absolute, travels with the page until it reaches the middle
       pinned -> position: fixed in the middle, completely still
       after  -> absolute near the bottom of the column (ASIDE_BOTTOM_GAP
                 above it), released and scrolls away with the page
     Geometry is measured once (resize / ResizeObserver), the scroll handler
     only does arithmetic, and styles are written only when the state flips. */

  useEffect(() => {
    const column = columnRef.current;
    const aside = visualRef.current;
    if (!column || !aside) return;

    const desktop = window.matchMedia(DESKTOP_BREAKPOINT);

    type Mode = "off" | "before" | "pinned" | "after";
    let mode: Mode | null = null;
    let frame = 0;

    let colTop = 0; // column top in document space
    let colLeft = 0;
    let colWidth = 0;
    let centred = 0;
    let minY = 0;
    let maxY = 0;

    const reset = () => {
      aside.style.position = "";
      aside.style.top = "";
      aside.style.left = "";
      aside.style.width = "";
    };

    const update = () => {
      frame = 0;

      // Mobile keeps the CSS `sticky` bar.
      if (!desktop.matches) {
        if (mode !== "off") {
          reset();
          mode = "off";
        }
        return;
      }

      const top = colTop - window.scrollY; // no layout read

      const next: Mode =
        top + minY > centred
          ? "before"
          : top + maxY >= centred
            ? "pinned"
            : "after";

      if (next === mode) return; // nothing to write
      mode = next;

      reset();

      if (next === "before") {
        aside.style.top = `${minY}px`;
      } else if (next === "after") {
        aside.style.top = `${maxY}px`;
      } else {
        aside.style.position = "fixed";
        aside.style.top = `${centred}px`;
        aside.style.left = `${colLeft}px`;
        aside.style.width = `${colWidth}px`;
      }
    };

    const measure = () => {
      if (desktop.matches) {
        const rect = column.getBoundingClientRect();
        const asideH = aside.offsetHeight;
        const firstH = stepsRef.current[0]?.offsetHeight ?? asideH;

        colTop = rect.top + window.scrollY;
        colLeft = rect.left;
        colWidth = rect.width;
        centred = (window.innerHeight - asideH) / 2;

        // Start: centred on the first service.
        minY = Math.max(0, (firstH - asideH) / 2);
        // End: aside's bottom stops ASIDE_BOTTOM_GAP above the column's
        // bottom, matching the padding of the service content.
        maxY = Math.max(minY, column.offsetHeight - asideH - ASIDE_BOTTOM_GAP);
      }

      mode = null; // force a re-apply with the new numbers
      update();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    desktop.addEventListener("change", measure);

    // Observe the column only: the aside is absolutely positioned inside it,
    // so it can't change the column's size, and observing both risks a loop.
    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(column);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      desktop.removeEventListener("change", measure);
      resizeObserver?.disconnect();
    };
  }, []);

  /* Render ---------------------------------------------------------------- */

  return (
    <>
      <Nav dark />

      {/* No ancestor of the sticky <aside> may set overflow (hidden/auto/scroll).
          Keep this <main> and every parent in layout.tsx free of it. */}
      <main className="bg-[#F7F7F5] font-body text-[#16191c]">
        {/* ============================ HERO ============================ */}
        <section
          className="relative isolate flex min-h-[440px] items-end overflow-hidden bg-[#002950] pb-14 pt-32 text-white md:min-h-[540px] md:pb-20"
          aria-labelledby="services-page-title"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:80px_80px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-32 size-[450px] rounded-full border border-white/10 md:size-[650px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-20 size-[350px] rounded-full border border-white/10 md:size-[550px]"
          />

          <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[#BD9655]" />
              <span className="text-xs font-semibold tracking-[0.2em] text-white/70">
                PRO SOTA / O que fazemos
              </span>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <h1
                id="services-page-title"
                className="max-w-4xl font-display text-[clamp(2.75rem,6.5vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.03em]"
              >
                Serviços
                <span className="block font-normal italic text-[#BD9655]">
                  integrados.
                </span>
              </h1>

              <div className="max-w-md lg:justify-self-end">
                <p className="text-sm leading-8 text-white/75 md:text-base">
                  Da primeira ideia à entrega da obra, reunimos arquitectura,
                  engenharia, construção e fiscalização num processo
                  coordenado, com rigor técnico e atenção a cada detalhe.
                </p>

                <div className="mt-8">
                  <a
                    href={`#${SERVICES[0]?.key ?? ""}`}
                    onClick={(event) => {
                      event.preventDefault();
                      goToService(0);
                    }}
                    className="group inline-flex items-center gap-4 text-xs font-semibold tracking-[0.18em] text-white transition-colors hover:text-[#BD9655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-4 focus-visible:ring-offset-[#002950]"
                  >
                    Explorar serviços
                    <span
                      aria-hidden="true"
                      className="flex size-9 items-center justify-center rounded-full border border-white/25 text-base transition-all duration-300 group-hover:translate-y-1 group-hover:border-[#BD9655] group-hover:text-[#BD9655] motion-reduce:transition-none"
                    >
                      ↓
                    </span>
                  </a>
                </div>

                <div className="mt-9 flex items-center gap-5 border-t border-white/15 pt-5">
                  <span className="text-xs font-semibold text-[#BD9655]">
                    {String(SERVICES.length).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-white/20" />
                  <span className="text-xs tracking-[0.15em] text-white/60">
                    Áreas de especialização
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SERVICES SCROLL ===================== */}
        <section className="relative" aria-label="Áreas de actuação da PRO SOTA">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
            {/* items-start is REQUIRED: without it grid items stretch to the
                full row height and `sticky` has no room to move. */}
            <div className="grid grid-cols-1 items-start gap-6 min-[901px]:grid-cols-2 min-[901px]:gap-16">
              {/* ---------------------- COPY ---------------------- */}
              <div>
                {SERVICES.map((service, index) => (
                  <ServiceArticle
                    key={service.key}
                    service={service}
                    index={index}
                    total={SERVICES.length}
                    isActive={active === service.key}
                    registerStep={registerStep}
                  />
                ))}
              </div>

              {/* ------------------- STICKY ASIDE ------------------- */}
              {/* Mobile: `contents` lets the aside act as a direct grid child so
                  `sticky` works. Desktop: a full-height track the aside slides in. */}
              <div
                ref={columnRef}
                className="contents min-[901px]:relative min-[901px]:block min-[901px]:self-stretch"
              >
                <aside
                  ref={visualRef}
                  aria-label="Navegação dos serviços"
                  className="
                    hidden
                    min-[901px]:absolute min-[901px]:left-0 min-[901px]:top-0 min-[901px]:block min-[901px]:w-full
                    min-[901px]:h-[70svh] min-[901px]:max-h-[640px] min-[901px]:min-h-[480px]
                    min-[901px]:overflow-hidden
                    min-[901px]:bg-[#051221]
                  "
                >
                  {/* 3D stage: desktop only, never mounted on mobile */}
                  {!isMobile && (
                    <>
                      {/* Static decorative layer: promoted to its own layer so
                          the large radial mask isn't repainted with the scenes. */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 transform-gpu opacity-50 [background-image:linear-gradient(rgba(226,198,144,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(226,198,144,0.18)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(70%_70%_at_50%_55%,black,transparent)]"
                      />

                      {SERVICES.map((service) => {
                        const key = service.key as ServiceKey;
                        const Scene = SCENE_BY_SERVICE[key];
                        const isActive = active === key;
                        const shouldMount =
                          isActive || mountedScenes.includes(key);

                        return (
                          <div
                            key={service.key}
                            aria-hidden={!isActive}
                            ref={(node) => {
                              if (node) node.inert = !isActive;
                            }}
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 motion-reduce:transition-none ${
                              isActive
                                ? "opacity-100"
                                : "pointer-events-none opacity-0"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className="absolute left-6 top-6 font-display text-sm font-semibold tracking-[0.15em] text-[#e2c690]"
                            >
                              {service.num}
                            </span>

                            <div
                              aria-hidden="true"
                              className="relative size-[310px] [transform-style:preserve-3d] [transform:rotateX(42deg)_rotateZ(-38deg)]"
                            >
                              {shouldMount && <Scene />}
                            </div>

                            <b className="absolute bottom-20 left-6 font-display text-2xl font-semibold uppercase tracking-tight text-[#f3efe6]">
                              {service.title}
                            </b>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Progress navigation */}
                  <nav
                    aria-label="Escolher área de serviço"
                    className="relative flex items-center justify-between gap-4 text-xs text-[#002950] min-[901px]:absolute min-[901px]:inset-x-6 min-[901px]:bottom-6 min-[901px]:text-white/80"
                  >
                    <div className="flex items-center gap-2">
                      {SERVICES.map((service, index) => {
                        const isActive = active === service.key;

                        return (
                          <button
                            key={service.key}
                            type="button"
                            aria-label={`${index + 1} de ${SERVICES.length}: ${service.title}`}
                            aria-current={isActive ? "step" : undefined}
                            aria-controls={service.key}
                            onClick={() => goToService(index)}
                            className="group/dot flex h-8 items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2"
                          >
                            <span
                              aria-hidden="true"
                              className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                                isActive
                                  ? "w-10 bg-[#BD9655]"
                                  : "w-6 bg-current/25 group-hover/dot:bg-current/50"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <p className="tabular-nums">
                      <span className="font-semibold text-[#7a6032] min-[901px]:text-[#e2c690]">
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
          </div>
        </section>

        {/* ========================== CONTACT ========================== */}
        <Contact />
      </main>

      <Footer />
    </>
  );
}