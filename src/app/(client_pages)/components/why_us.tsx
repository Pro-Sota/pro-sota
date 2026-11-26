"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import PinnedTitle from "./parallax_section";

const REASONS = [
  [
    "01",
    "Experiência multidisciplinar",
    "Integramos conhecimentos de arquitectura, engenharia e construção para desenvolver soluções coerentes, tecnicamente fundamentadas e adaptadas a cada desafio.",
  ],
  [
    "02",
    "Projectos à medida",
    "Desenvolvemos soluções que equilibram funcionalidade, estética e viabilidade económica, respeitando as necessidades e os objectivos de cada cliente.",
  ],
  [
    "03",
    "Acompanhamento contínuo",
    "Asseguramos coordenação e comunicação ao longo das diferentes fases, mantendo os clientes informados e envolvidos nas decisões relevantes.",
  ],
  [
    "04",
    "Gestão e controlo de prazos",
    "Trabalhamos com planeamento, cronogramas e acompanhamento da execução para garantir maior controlo sobre o desenvolvimento de cada projecto.",
  ],
  [
    "05",
    "Soluções integradas",
    "Reunimos diferentes especialidades num único processo de trabalho, desde os estudos iniciais ao desenvolvimento dos projectos e acompanhamento da obra.",
  ],
  [
    "06",
    "Inovação com responsabilidade",
    "Recorremos a ferramentas de visualização 3D e metodologias digitais, procurando soluções tecnicamente eficientes e adequadas à realidade de cada projecto.",
  ],
] as const;

type Direction = -1 | 1;

export default function WhyUs() {
  const trackRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [canScroll, setCanScroll] = useState({
    previous: false,
    next: false,
  });

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-reason-card]"),
    );

    const maxScroll = Math.max(
      0,
      track.scrollWidth - track.clientWidth,
    );

    const position = Math.max(0, track.scrollLeft);
    const trackLeft = track.getBoundingClientRect().left;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.getBoundingClientRect().left - trackLeft,
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
    setCanScroll({
      previous: position > 2,
      next: position < maxScroll - 2,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);

    return () => observer.disconnect();
  }, [updateScrollState]);

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-reason-card]"),
    );

    const trackLeft = track.getBoundingClientRect().left;
    const position = track.scrollLeft;

    const offsets = cards.map(
      (card) =>
        position + card.getBoundingClientRect().left - trackLeft,
    );

    const target =
      direction === 1
        ? offsets.find((offset) => offset > position + 2)
        : [...offsets]
            .reverse()
            .find((offset) => offset < position - 2);

    if (target === undefined) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    track.scrollTo({
      left: target,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }, []);

  return (
    <section
      aria-labelledby="why-us-title"
      className="relative overflow-x-clip bg-[#002950] py-[clamp(80px,10vw,120px)] hero-font-body text-[#F7F7F5]"
    >
      <div
        data-pin-container
        className="relative mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)]"
      >
        {/* Section heading */}
        <div className="mb-[clamp(40px,6vh,64px)] grid gap-7 md:grid-cols-[1fr_0.65fr] md:items-end">
          <PinnedTitle offset={128}>
            <div className="mb-6 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-9 bg-[#BD9655]"
              />

              <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#BD9655]">
                O nosso compromisso
              </span>
            </div>

            <h2
              id="why-us-title"
              className="max-w-[16ch] text-[clamp(2.1rem,3.5vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.045em]"
            >
              A diferença está
              <br />
              <span className="font-normal text-[#BD9655]">
                na forma como fazemos.
              </span>
            </h2>
          </PinnedTitle>

          <p className="relative z-10 max-w-[42ch] text-[14px] leading-[1.8] text-[#F7F7F5]/75 md:justify-self-end md:text-[15px]">
            Seis razões pelas quais os nossos clientes confiam o seu
            projecto à PRO SOTA, da concepção à execução e entrega da obra.
          </p>
        </div>

        {/* Reasons carousel */}
        <div className="relative z-10">
          <div
            ref={trackRef}
            onScroll={updateScrollState}
            role="region"
            aria-roledescription="carousel"
            aria-label="Razões para escolher a PRO SOTA"
            tabIndex={0}
            className="
              flex items-stretch gap-4 md:gap-5
              overflow-x-auto overflow-y-hidden
              overscroll-x-contain snap-x snap-mandatory
              pt-1 pb-5
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[#BD9655]
            "
          >
            {REASONS.map(([number, title, description]) => (
              <article
                key={number}
                data-reason-card
                className="
                  group flex min-h-[310px] w-full shrink-0
                  snap-start flex-col
                  border border-[#F7F7F5]/15
                  bg-[#07365F] p-6
                  transition-colors duration-300
                  hover:border-[#BD9655]/60
                  hover:bg-[#0B416F]
                  sm:w-[65%] sm:p-7
                  lg:min-h-[330px]
                  lg:w-[calc((100%-40px)/3)] lg:p-8
                "
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium tracking-[0.16em] text-[#F7F7F5]/70">
                    {number}
                  </span>

                  <span
                    aria-hidden="true"
                    className="
                      h-px w-9 bg-[#BD9655]/45
                      transition-all duration-300
                      group-hover:w-14
                      group-hover:bg-[#BD9655]
                    "
                  />
                </div>

                <div className="mt-auto pt-12">
                  <h3 className="mb-4 max-w-[18ch] text-[18px] font-medium leading-[1.25] tracking-[-0.02em] sm:text-[19px]">
                    {title}
                  </h3>

                  <p className="max-w-[38ch] text-[13px] leading-[1.75] text-[#F7F7F5]/75 sm:text-[13.5px]">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Carousel navigation */}
          <div className="mt-6 flex items-center justify-between border-t border-[#F7F7F5]/15 pb-2 pt-6">
            <span
              aria-live="polite"
              className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#F7F7F5]/60"
            >
              {String(activeIndex + 1).padStart(2, "0")}
              <span className="px-1 text-[#BD9655]">—</span>
              {String(REASONS.length).padStart(2, "0")}
            </span>

            <div className="flex gap-3">
              {([-1, 1] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  onClick={() => scrollByCard(direction)}
                  disabled={
                    direction === -1
                      ? !canScroll.previous
                      : !canScroll.next
                  }
                  aria-label={
                    direction === -1
                      ? "Ver razões anteriores"
                      : "Ver razões seguintes"
                  }
                  className="
                    flex size-11 items-center justify-center
                    border border-[#F7F7F5]/25 text-[#F7F7F5]
                    transition-colors duration-200
                    enabled:hover:border-[#BD9655]
                    enabled:hover:bg-[#BD9655]
                    enabled:hover:text-[#002950]
                    disabled:cursor-not-allowed disabled:opacity-30
                    focus-visible:outline-2
                    focus-visible:outline-offset-3
                    focus-visible:outline-[#BD9655]
                  "
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-4"
                  >
                    <path
                      d={
                        direction === -1
                          ? "M15 18L9 12L15 6"
                          : "M9 18L15 12L9 6"
                      }
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}