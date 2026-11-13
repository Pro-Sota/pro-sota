"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import dynamic from "next/dynamic";

import {
  services,
  SERVICE_KEYS,
  type ServiceKey,
} from "../components/servicesData";

/* Styles come from Tailwind classes only. The color tokens and the
   `hero-enter` keyframes used below live in the @theme block in your global
   CSS (see theme-tokens.css), loaded once in app/layout.tsx. */

/* -------------------------------------------------------------------------- */
/* Code-split pieces                                                          */
/* -------------------------------------------------------------------------- */

// Still server-rendered (no ssr:false), just split out of the main chunk.
const Contact = dynamic(() => import("../components/contact_page"));
const Footer = dynamic(() => import("../components/footer"));

// 3D scenes only render on desktop, so mobile never downloads them.
// If your Next version complains about this factory, inline the four calls.
const loadScene = (name: ServiceKey) =>
  dynamic(() => import("../components/scene").then((m) => m.SCENES[name]), {
    ssr: false,
    loading: () => null,
  });

const SCENE_BY_SERVICE = Object.fromEntries(
  SERVICE_KEYS.map((key) => [key, loadScene(key)]),
) as Record<ServiceKey, ComponentType>;

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
 * services column. Equals the `py-20` (80px) vertical padding of each
 * service article on desktop.
 */
const ASIDE_BOTTOM_GAP = 80;

const SCROLL_OFFSETS = {
  desktop: 110,
  mobileNav: 82,
  mobileGap: 24,
} as const;

/* Class groups, split so the long aside string stays readable. */
const cn = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

const ASIDE_MOBILE =
  "fixed inset-x-0 bottom-0 z-30 block border-t border-navy/10 bg-[#F7F7F5]/95 px-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur transition-transform duration-300 motion-reduce:transition-none";

const ASIDE_DESKTOP =
  "min-[901px]:absolute min-[901px]:inset-auto min-[901px]:left-0 min-[901px]:top-0 min-[901px]:z-auto min-[901px]:w-full min-[901px]:translate-y-0 min-[901px]:border-0 min-[901px]:bg-[#051221] min-[901px]:p-0 min-[901px]:backdrop-blur-none min-[901px]:h-[70svh] min-[901px]:max-h-[640px] min-[901px]:min-h-[480px] min-[901px]:overflow-hidden";

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
  // On mobile the progress bar sits at the bottom, so only the nav bar
  // at the top needs clearing.
  return SCROLL_OFFSETS.mobileNav + SCROLL_OFFSETS.mobileGap;
}

/**
 * Tracks which service is closest to the reading position.
 *
 * Geometry is measured only when something changes size; the scroll handler
 * works from the cache, so no layout reads happen while scrolling.
 * `count` is in the effect deps so observers re-attach if the list changes.
 */
function useActiveService(
  stepsRef: { current: (HTMLElement | null)[] },
  visualRef: { current: HTMLElement | null },
  count: number,
) {
  const [active, setActive] = useState<ServiceKey>(SERVICE_KEYS[0]);

  useEffect(() => {
    let frame = 0;
    let observerFrame = 0;
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

    // Deferred to the next frame to avoid "ResizeObserver loop" warnings.
    const resizeObserver =
      "ResizeObserver" in window
        ? new ResizeObserver(() => {
          cancelAnimationFrame(observerFrame);
          observerFrame = requestAnimationFrame(measure);
        })
        : null;
    stepsRef.current.forEach((step) => {
      if (step) resizeObserver?.observe(step);
    });
    if (visualRef.current) resizeObserver?.observe(visualRef.current);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      cancelAnimationFrame(observerFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
    };
  }, [stepsRef, visualRef, count]);

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
  /** Stable ref callback for this index (see `stepRefs` below). */
  stepRef: (node: HTMLElement | null) => void;
};

const ServiceArticle = memo(function ServiceArticle({
  service,
  index,
  total,
  isActive,
  stepRef,
}: ServiceArticleProps) {
  return (
    <article
      ref={stepRef}
      data-service={service.key}
      id={service.key}
      tabIndex={-1}
      aria-labelledby={`${service.key}-title`}
      className={cn(
        "relative flex min-h-0 scroll-mt-28 flex-col justify-center py-10 outline-none transition-opacity duration-500 motion-reduce:transition-none sm:min-h-[55svh] min-[901px]:min-h-[75svh] min-[901px]:py-20",
        isActive ? "opacity-100" : "min-[901px]:opacity-60",
      )}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold tracking-[0.18em] text-gold-ink">
          {service.num} / {service.label}
        </span>
        <span className="text-xs tabular-nums text-navy/70">
          {String(index + 1).padStart(2, "0")}
          {" — "}
          {String(total).padStart(2, "0")}
        </span>
      </div>

      <h2
        id={`${service.key}-title`}
        className="max-w-2xl font-display text-[clamp(1.75rem,2.8vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.015em] text-navy"
      >
        {service.title}
      </h2>

      <p className="mt-6 max-w-xl text-base leading-8 text-ink md:text-lg">
        {service.intro}
      </p>

      <div className="mt-10 border-t border-navy/15">
        {service.items.map(([title, description], itemIndex) => (
          <div
            key={title}
            className="grid gap-3 border-b border-navy/10 py-6 md:grid-cols-[48px_0.8fr_1.2fr] md:gap-6"
          >
            <span className="text-xs font-medium tabular-nums text-gold-ink">
              {String(itemIndex + 1).padStart(2, "0")}
            </span>
            <h3 className="font-body text-sm font-semibold tracking-normal text-navy">
              {title}
            </h3>
            <p className="text-sm leading-7 text-ink">{description}</p>
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
  const sectionRef = useRef<HTMLElement | null>(null);

  const active = useActiveService(stepsRef, visualRef, SERVICES.length);

  /** No 3D on mobile. Defaults to `true` on the server. */
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, true);

  /** True while the services section is on screen (drives the mobile bar). */
  const [inServices, setInServices] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInServices(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

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

  /* One stable ref callback per service, so React doesn't call each ref with
     `null` and then the node again on every re-render. */
  const stepRefs = useMemo(
    () =>
      SERVICES.map((_, index) => (node: HTMLElement | null) => {
        stepsRef.current[index] = node;
      }),
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
       after  -> absolute near the bottom of the column, released
     Geometry is measured once (resize / ResizeObserver), the scroll handler
     only does arithmetic, and styles are written only when the state flips.
     On mobile the aside is a fixed bottom bar styled purely with classes. */

  useEffect(() => {
    const column = columnRef.current;
    const aside = visualRef.current;
    if (!column || !aside) return;

    const desktop = window.matchMedia(DESKTOP_BREAKPOINT);

    type Mode = "off" | "before" | "pinned" | "after";
    let mode: Mode | null = null;
    let frame = 0;
    let observerFrame = 0;

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

        minY = Math.max(0, (firstH - asideH) / 2);
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
      "ResizeObserver" in window
        ? new ResizeObserver(() => {
          cancelAnimationFrame(observerFrame);
          observerFrame = requestAnimationFrame(measure);
        })
        : null;
    resizeObserver?.observe(column);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      cancelAnimationFrame(observerFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      desktop.removeEventListener("change", measure);
      resizeObserver?.disconnect();
    };
  }, []);

  /* Render ---------------------------------------------------------------- */

  return (
    <>
      {/* No ancestor of the aside may set overflow (hidden/auto/scroll).
          Keep this <main> and every parent in layout.tsx free of it. */}
      <main className="bg-paper font-body text-[#16191c]">
        {/* ============================ HERO ============================ */}
        
<section
  className="
    relative isolate flex min-h-[760px] items-center
    overflow-hidden bg-paper text-navy
    md:min-h-[820px] lg:min-h-[880px]
  "
  aria-labelledby="services-page-title"
>
  {/* Subtle architectural grid */}
  <div
    aria-hidden="true"
    className="
      pointer-events-none absolute inset-0
      bg-[linear-gradient(rgba(0,41,80,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,41,80,0.025)_1px,transparent_1px)]
      bg-[size:64px_64px]
    "
  />

  {/* Architectural illustration */}
  <div
    aria-hidden="true"
    className="
      pointer-events-none absolute inset-y-0 right-0
      z-0 w-full overflow-hidden
      md:w-[65%] lg:w-[68%]
    "
  >
    <img
      src="/images/services_hero.svg"
      alt=""
      width={1600}
      height={760}
      loading="eager"
      fetchPriority="low"
      decoding="async"
      className="
        absolute inset-0 h-full w-full
        object-contain object-right
        opacity-35
        md:opacity-75
      "
    />

    {/* Blend illustration into text column */}
    <div
      className="
        absolute inset-0
        bg-gradient-to-r
        from-paper via-paper/80 to-transparent
        md:from-paper md:via-paper/55 md:to-transparent
      "
    />

    {/* Bottom fade */}
    <div
      className="
        absolute inset-x-0 bottom-0 h-32
        bg-gradient-to-t from-paper to-transparent
      "
    />
  </div>

  {/* Content */}
  <div
    className="
      relative z-10 mx-auto grid w-full max-w-[1440px]
      grid-cols-1 items-center
      px-6 py-28
      md:px-12 lg:grid-cols-[0.9fr_1.1fr]
      lg:px-20
    "
  >
    <div className="max-w-[570px]">

      {/* Eyebrow */}
      <div
        className="
          mb-10 flex items-center gap-4
          motion-safe:animate-[hero-enter_.7s_ease-out_both]
        "
      >
        <span className="h-px w-10 bg-gold" />

        <span className="
          text-[10px] font-semibold uppercase
          tracking-[0.22em] text-navy/65
        ">
          PRO SOTA / O que fazemos
        </span>
      </div>

      {/* Heading */}
      <h1
        id="services-page-title"
        className="
          font-display text-[clamp(3.5rem,6.5vw,6rem)]
          font-medium leading-[0.98]
          tracking-[-0.055em] text-navy
          motion-safe:animate-[hero-enter_.8s_ease-out_both]
        "
      >
        Serviços
        <span className="
          block font-normal italic
          tracking-[-0.045em] text-gold-dark
        ">
          integrados.
        </span>
      </h1>

      {/* Description */}
      <p className="
        mt-9 max-w-[430px]
        text-sm leading-[1.9] text-ink/80
        md:text-[15px]
      ">
        Da concepção à entrega, reunimos arquitectura,
        engenharia, construção e fiscalização numa única
        abordagem integrada, assegurando continuidade
        entre o projecto, a execução e o acompanhamento
        de cada obra.
      </p>

      {/* Centred CTA */}
      {SERVICES.length > 0 && (
        <div className="mt-12 flex w-full justify-center">
          <a
            href={`#${SERVICES[0].key}`}
            onClick={(event) => {
              event.preventDefault();
              goToService(0);
            }}
            aria-label="Explorar os serviços"
            className="
              group flex size-14 items-center justify-center
              rounded-full border border-navy/30
              text-navy
              transition-all duration-300
              hover:-translate-y-1 hover:border-gold-dark
              hover:bg-navy hover:text-paper
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-gold-dark
              focus-visible:ring-offset-4
              focus-visible:ring-offset-paper
              motion-reduce:transition-none
            "
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="
                size-5 transition-transform duration-300
                group-hover:translate-y-0.5
                motion-reduce:transition-none
              "
            >
              <path
                d="M12 4v16m-7-7 7 7 7-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      )}

    </div>

    {/* Right column reserved for illustration */}
    <div
      aria-hidden="true"
      className="hidden lg:block"
    />
  </div>

  {/* Bottom reference */}
  <div className="
    pointer-events-none absolute bottom-7
    left-6 right-6 z-10 flex items-center
    justify-between md:left-12 md:right-12 lg:left-20 lg:right-20
  ">
    <span className="
      text-[9px] font-medium uppercase
      tracking-[0.18em] text-navy/45
    ">
      Arquitectura · Engenharia · Construção
    </span>

    <span className="
      text-[9px] font-medium tabular-nums
      tracking-[0.15em] text-navy/45
    ">
      01 / 04
    </span>
  </div>
</section>


        {/* ===================== SERVICES SCROLL ===================== */}
        <section
          ref={sectionRef}
          className="relative"
          aria-label="Áreas de actuação da PRO SOTA"
        >
          <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-20">
            {/* items-start is REQUIRED: without it grid items stretch to the
                full row height and the aside has no room to move. */}
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
                    stepRef={stepRefs[index]}
                  />
                ))}
              </div>

              {/* ------------------- ASIDE ------------------- */}
              {/* Mobile: `contents` so the column wrapper doesn't generate a
                  box; the aside is a fixed bottom bar shown only while the
                  services section is on screen. Desktop: a full-height track
                  the aside slides in. */}
              <div
                ref={columnRef}
                className="contents min-[901px]:relative min-[901px]:block min-[901px]:self-stretch"
              >
                <aside
                  ref={visualRef}
                  aria-label="Navegação dos serviços"
                  className={cn(
                    ASIDE_MOBILE,
                    inServices ? "translate-y-0" : "translate-y-full",
                    ASIDE_DESKTOP,
                  )}
                >
                  {/* 3D stage: desktop only, never mounted on mobile.
                      The whole stage is decorative, so it is hidden from
                      assistive tech as one unit. */}
                  {!isMobile && (
                    <div aria-hidden="true" className="absolute inset-0">
                      {/* Static decorative layer on its own GPU layer so the
                          large radial mask isn't repainted with the scenes. */}
                      <div className="absolute inset-0 transform-gpu opacity-50 [background-image:linear-gradient(rgba(226,198,144,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(226,198,144,0.18)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:radial-gradient(70%_70%_at_50%_55%,black,transparent)]" />

                      {SERVICES.map((service) => {
                        const key = service.key as ServiceKey;
                        const Scene = SCENE_BY_SERVICE[key];
                        const isActive = active === key;
                        const shouldMount =
                          isActive || mountedScenes.includes(key);

                        return (
                          <div
                            key={service.key}
                            ref={(node) => {
                              if (node) node.inert = !isActive;
                            }}
                            className={cn(
                              "absolute inset-0 flex items-center justify-center transition-opacity duration-500 motion-reduce:transition-none",
                              isActive
                                ? "opacity-100"
                                : "pointer-events-none opacity-0",
                            )}
                          >
                            <span className="absolute left-6 top-6 font-display text-sm font-semibold tracking-[0.15em] text-gold-light">
                              {service.num}
                            </span>

                            <div className="relative size-[310px] [transform-style:preserve-3d] [transform:rotateX(42deg)_rotateZ(-38deg)]">
                              {shouldMount && <Scene />}
                            </div>

                            <b className="absolute bottom-20 left-6 font-display text-lg font-semibold uppercase tracking-tight text-cream/90">
                              {service.title}
                            </b>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Progress navigation */}
                  <nav
                    aria-label="Escolher área de serviço"
                    className="relative flex items-center justify-between gap-4 text-xs text-navy min-[901px]:absolute min-[901px]:inset-x-6 min-[901px]:bottom-6 min-[901px]:text-white/80"
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
                            className="group/dot flex h-8 items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
                                isActive
                                  ? "w-10 bg-gold"
                                  : "w-6 bg-navy/25 group-hover/dot:bg-navy/50 min-[901px]:bg-white/25 min-[901px]:group-hover/dot:bg-white/50",
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <p className="tabular-nums">
                      <span className="font-semibold text-gold-ink min-[901px]:text-gold-light">
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
    </>
  );
}