
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
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

/* -------------------------------------------------------------------------- */
/* Code-split pieces                                                          */
/* -------------------------------------------------------------------------- */

const Contact = dynamic(() => import("../components/contact_page"));
const Footer = dynamic(() => import("../components/footer"));

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

const MOBILE_BREAKPOINT = "(max-width: 900px)";
const DESKTOP_BREAKPOINT = "(min-width: 901px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const SCENE_EXIT_MS = 600;
const ASIDE_BOTTOM_GAP = 80;

const SCROLL_OFFSETS = {
  desktop: 110,
  mobileNav: 82,
  mobileGap: 24,
} as const;

/* PRO SOTA colour palette */
const COLORS = {
  charcoal: "#1F1E1B",
  bronze: "#8B6A2F",
  warmGrey: "#5F5B54",
  paper: "#F7F7F5",
} as const;

const cn = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

const ASIDE_MOBILE =
  "fixed inset-x-0 bottom-0 z-30 block border-t border-[#1F1E1B]/10 bg-[#F7F7F5]/95 px-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur transition-transform duration-300 motion-reduce:transition-none";

const ASIDE_DESKTOP =
  "min-[901px]:absolute min-[901px]:inset-auto min-[901px]:left-0 min-[901px]:top-0 min-[901px]:z-auto min-[901px]:w-full min-[901px]:translate-y-0 min-[901px]:border-0 min-[901px]:bg-[#1F1E1B] min-[901px]:p-0 min-[901px]:backdrop-blur-none min-[901px]:h-[70svh] min-[901px]:max-h-[640px] min-[901px]:min-h-[480px] min-[901px]:overflow-hidden";

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

  return SCROLL_OFFSETS.mobileNav + SCROLL_OFFSETS.mobileGap;
}

/**
 * Tracks which service is closest to the reading position.
 * Geometry is measured only when something changes size.
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

      if (best) {
        setActive((current) => (current === best ? current : best));
      }
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
/* Service article                                                            */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const HERO_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.12,
    },
  },
};

const HERO_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: EASE_OUT,
    },
  },
};

const SERVICE_VARIANTS = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const SERVICE_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: EASE_OUT,
    },
  },
};
type ServiceArticleProps = {
  service: Service;
  index: number;
  total: number;
  isActive: boolean;
  stepRef: (node: HTMLElement | null) => void;
};

const ServiceArticle = memo(function ServiceArticle({
  service,
  index,
  total,
  isActive,
  stepRef,
}: ServiceArticleProps) {
const shouldReduceMotion = useReducedMotion();

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
      <motion.div
        variants={SERVICE_VARIANTS}
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          variants={SERVICE_ITEM_VARIANTS}
          className="mb-6 flex items-center justify-between gap-4"
        >
          <span className="text-xs font-semibold tracking-[0.18em] text-[#8B6A2F]">
            {service.num} / {service.label}
          </span>

          <span className="text-xs tabular-nums text-[#5F5B54]">
            {String(index + 1).padStart(2, "0")}
            {" — "}
            {String(total).padStart(2, "0")}
          </span>
        </motion.div>

        <motion.h2
          variants={SERVICE_ITEM_VARIANTS}
          id={`${service.key}-title`}
          className="
          max-w-2xl font-display
          text-[clamp(1.75rem,2.8vw,2.5rem)]
          font-medium leading-[1.1]
          tracking-[-0.015em] text-[#1F1E1B]
        "
        >
          {service.title}
        </motion.h2>

        <motion.p
          variants={SERVICE_ITEM_VARIANTS}
          className="mt-6 max-w-xl text-base leading-8 text-[#5F5B54] md:text-lg"
        >
          {service.intro}
        </motion.p>

        <div className="mt-10 border-t border-[#1F1E1B]/15">
          {service.items.map(([title, description], itemIndex) => (
            <motion.div
              key={title}
              variants={SERVICE_ITEM_VARIANTS}
              className="
              grid gap-3 border-b border-[#1F1E1B]/10
              py-6 md:grid-cols-[48px_0.8fr_1.2fr] md:gap-6
            "
            >
              <span className="text-xs font-medium tabular-nums text-[#8B6A2F]">
                {String(itemIndex + 1).padStart(2, "0")}
              </span>

              <h3 className="font-body text-sm font-semibold tracking-normal text-[#1F1E1B]">
                {title}
              </h3>

              <p className="text-sm leading-7 text-[#5F5B54]">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </article>
  );
});

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function ServicesOverview() {
  const stepsRef = useRef<(HTMLElement | null)[]>([]);
  const visualRef = useRef<HTMLElement | null>(null);
  const columnRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const active = useActiveService(stepsRef, visualRef, SERVICES.length);

  /** No 3D on mobile. Defaults to true on the server. */
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT, true);

  /** True while the services section is on screen. */
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

  /* Scene mounting --------------------------------------------------------- */

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

  /* Navigation ------------------------------------------------------------- */

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

  /* URL hash <-> active service ------------------------------------------- */

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

    if (!current && active === SERVICE_KEYS[0]) return;

    try {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}#${active}`,
      );
    } catch {
      // Safari may throw if replaceState is called too often.
    }
  }, [active]);

  /* Aside positioning ------------------------------------------------------ */

  useEffect(() => {
    const column = columnRef.current;
    const aside = visualRef.current;

    if (!column || !aside) return;

    const desktop = window.matchMedia(DESKTOP_BREAKPOINT);

    type Mode = "off" | "before" | "pinned" | "after";

    let mode: Mode | null = null;
    let frame = 0;
    let observerFrame = 0;

    let colTop = 0;
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

      const top = colTop - window.scrollY;

      const next: Mode =
        top + minY > centred
          ? "before"
          : top + maxY >= centred
            ? "pinned"
            : "after";

      if (next === mode) return;

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
        maxY = Math.max(
          minY,
          column.offsetHeight - asideH - ASIDE_BOTTOM_GAP,
        );
      }

      mode = null;
      update();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    desktop.addEventListener("change", measure);

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
      <main className="bg-[#F7F7F5] font-body text-[#1F1E1B]">
        {/* ============================ HERO ============================ */}

        <section
          className="
            relative isolate flex min-h-[760px] items-center
            overflow-hidden bg-[#F7F7F5] text-[#1F1E1B]
            md:min-h-[820px] lg:min-h-[880px]
          "
          aria-labelledby="services-page-title"
        >
          {/* Subtle architectural grid */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              bg-[linear-gradient(rgba(31,30,27,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(31,30,27,0.025)_1px,transparent_1px)]
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
            <Image
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
                from-[#F7F7F5] via-[#F7F7F5]/80 to-transparent
                md:from-[#F7F7F5] md:via-[#F7F7F5]/55 md:to-transparent
              "
            />

            {/* Bottom fade */}
            <div
              className="
                absolute inset-x-0 bottom-0 h-32
                bg-gradient-to-t from-[#F7F7F5] to-transparent
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
                <span className="h-px w-10 bg-[#BD9655]" />

                <span
                  className="
                    text-[10px] font-semibold uppercase
                    tracking-[0.22em] text-[#5F5B54]
                  "
                >
                  PRO SOTA / O que fazemos
                </span>
              </div>

              {/* Heading */}
              <h1
                id="services-page-title"
                className="
                font-display text-[clamp(3.5rem,4.5vw,6rem)]
                font-medium leading-[0.98]
                tracking-[-0.055em] text-[#002950]
                motion-safe:animate-[hero-enter_.8s_ease-out_both]
              "
              >
                Serviços
              </h1>

              {/* Description */}
              <p
                className="
                 max-w-[430px]
                text-sm leading-[1.8] text-[#5F5B54]
                md:text-[15px]
              "
              >
                Da concepção à entrega, reunimos arquitectura,
                engenharia, construção e fiscalização numa única
                abordagem integrada, assegurando continuidade
                entre o projecto, a execução e o acompanhamento
                de cada obra.
              </p>

              {/* Scroll CTA */}
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
                      rounded-full border border-[#8B6A2F]/45
                      text-[#8B6A2F]
                      transition-all duration-300
                      hover:-translate-y-1 hover:border-[#8B6A2F]
                      hover:bg-[#1F1E1B] hover:text-[#F7F7F5]
                      focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-[#8B6A2F]
                      focus-visible:ring-offset-4
                      focus-visible:ring-offset-[#F7F7F5]
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
            <div aria-hidden="true" className="hidden lg:block" />
          </div>

          {/* Bottom reference */}
          <div
            className="
              pointer-events-none absolute bottom-7
              left-6 right-6 z-10 flex items-center
              justify-between md:left-12 md:right-12 lg:left-20 lg:right-20
            "
          >
            <span
              className="
                text-[9px] font-medium uppercase
                tracking-[0.18em] text-[#5F5B54]/65
              "
            >
              Arquitectura · Engenharia · Construção
            </span>

            <span
              className="
                text-[9px] font-medium tabular-nums
                tracking-[0.15em] text-[#5F5B54]/65
              "
            >
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

              <div
                ref={columnRef}
                className="
                  contents min-[901px]:relative
                  min-[901px]:block min-[901px]:self-stretch
                "
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
                  {/* 3D stage: desktop only */}
                  {!isMobile && (
                    <div aria-hidden="true" className="absolute inset-0">
                      {/* Decorative architectural grid */}
                      <div
                        className="
                          absolute inset-0 transform-gpu opacity-50
                          [background-image:linear-gradient(rgba(226,198,144,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(226,198,144,0.18)_1px,transparent_1px)]
                          [background-size:46px_46px]
                          [mask-image:radial-gradient(70%_70%_at_50%_55%,black,transparent)]
                        "
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
                            <span className="absolute left-6 top-6 font-display text-sm font-semibold tracking-[0.15em] text-[#D7B477]">
                              {service.num}
                            </span>

                            <div
                              className="
                                relative size-[310px]
                                [transform-style:preserve-3d]
                                [transform:rotateX(42deg)_rotateZ(-38deg)]
                              "
                            >
                              {shouldMount && <Scene />}
                            </div>

                            <b className="absolute bottom-20 left-6 font-display text-lg font-semibold uppercase tracking-tight text-[#F7F7F5]/90">
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
                    className="
                      relative flex items-center justify-between gap-4
                      text-xs text-[#1F1E1B]
                      min-[901px]:absolute min-[901px]:inset-x-6
                      min-[901px]:bottom-6 min-[901px]:text-white/80
                    "
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
                            className="
                              group/dot flex h-8 items-center px-0.5
                              focus-visible:outline-none
                              focus-visible:ring-2 focus-visible:ring-[#BD9655]
                              focus-visible:ring-offset-2
                            "
                          >
                            <span
                              aria-hidden="true"
                              className={cn(
                                "block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
                                isActive
                                  ? "w-10 bg-[#BD9655]"
                                  : "w-6 bg-[#1F1E1B]/25 group-hover/dot:bg-[#1F1E1B]/50 min-[901px]:bg-white/25 min-[901px]:group-hover/dot:bg-white/50",
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <p className="tabular-nums">
                      <span className="font-semibold text-[#8B6A2F] min-[901px]:text-[#D7B477]">
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
