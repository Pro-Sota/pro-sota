"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const shouldReduceMotion = useReducedMotion();
  const [canScroll, setCanScroll] = useState({
    previous: false,
    next: true,
  });

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;

    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;

    setCanScroll({
      previous: track.scrollLeft > 2,
      next: track.scrollLeft < maxScroll - 2,
    });
  }, []);

  const scrollByCard = useCallback((direction: Direction) => {
    const track = trackRef.current;

    if (!track) return;

    const card = track.querySelector<HTMLElement>(
      "[data-reason-card]",
    );

    if (!card) return;

    const gap =
      Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;

    const distance = card.getBoundingClientRect().width + gap;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    track.scrollBy({
      left: distance * direction,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  return (
    <section
      aria-labelledby="why-us-title"
      className="relative overflow-hidden bg-[#1F1E1B] py-[clamp(80px,10vw,120px)] text-[#F7F7F5]"
    >
      {/* data-pin-container: the title stays frozen until this block ends.
          relative → anchors the title at the end; clip-path → the title can never show outside it. */}
      <div
        data-pin-container
        className="relative mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)] [clip-path:inset(0)]"
      >
        {/* Section heading */}
        <div className="mb-[clamp(40px,6vh,64px)] grid gap-7 md:grid-cols-[1fr_0.65fr] md:items-end">
          {/* Pinned title: frozen 128px from the window top, below the content layer (z-0) */}
          <PinnedTitle offset={128}>
            <div className="mb-6 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-9 bg-[#BD9655]"
              />

              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#BD9655]">
                O nosso compromisso
              </span>
            </div>

            <h2
              id="why-us-title"
              className="max-w-[16ch] font-display text-[clamp(32px,4vw,52px)] leading-[1.08] font-bold uppercase tracking-[-0.035em] text-[#F7F7F5]"
            >
              A diferença está
              <br />
              <span className="text-[#BD9655]">
                na forma como fazemos.
              </span>
            </h2>
          </PinnedTitle>

          <p className="relative z-10 max-w-[42ch] text-[14px] leading-[1.8] text-[#F7F7F5]/70 md:justify-self-end md:text-[15px]">
            Seis razões pelas quais os nossos clientes confiam o seu
            projecto à PRO SOTA, da concepção à execução e entrega da obra.
          </p>
        </div>

        {/* Content layer: opaque and above the title (z-10), so it overlaps it on scroll */}
        <div className="relative z-10 bg-[#1F1E1B]">
          {/* Reasons carousel */}
          <div
            ref={trackRef}
            onScroll={updateScrollState}
            className="-mx-[clamp(20px,5vw,64px)] flex snap-x snap-proximity gap-4 overflow-x-auto px-[clamp(20px,5vw,64px)] pt-1 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#BD9655] md:gap-5"
            role="region"
            aria-label="Razões para escolher a PRO SOTA"
            tabIndex={0}
          >
            {REASONS.map(([number, title, description]) => (
              <motion.article
                key={number}
                data-reason-card
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, y: 30 }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.75,
                  delay: shouldReduceMotion ? 0 : Number(number) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group flex min-h-[310px] w-[85%] shrink-0 snap-start flex-col border border-[#F7F7F5]/10 bg-[#292824] p-6 transition-colors duration-300 hover:border-[#BD9655]/50 hover:bg-[#33312C] sm:w-[65%] sm:p-7 lg:min-h-[330px] lg:w-[calc((100%-40px)/3)] lg:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold tracking-[0.16em] text-[#B8B5AE]">
                    {number}
                  </span>

                  <span
                    aria-hidden="true"
                    className="h-px w-9 bg-[#BD9655]/45 transition-all duration-300 group-hover:w-14 group-hover:bg-[#BD9655]"
                  />
                </div>

                <div className="mt-auto pt-12">
                  <h3 className="mb-4 max-w-[18ch] font-display text-[19px] leading-[1.2] font-bold uppercase text-[#F7F7F5] sm:text-[20px]">
                    {title}
                  </h3>

                  <p className="max-w-[38ch] text-[13px] leading-[1.75] text-[#F7F7F5]/70 sm:text-[13.5px]">
                    {description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Carousel navigation (pb-2 leaves room for the focus rings inside the clipped container) */}
          <div className="mt-6 flex items-center justify-between border-t border-[#F7F7F5]/15 pb-2 pt-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#F7F7F5]/50">
              01 <span className="px-1 text-[#BD9655]">—</span> 06
            </span>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                disabled={!canScroll.previous}
                aria-label="Ver razões anteriores"
                className="flex size-11 items-center justify-center border border-[#F7F7F5]/25 text-[#F7F7F5] transition-colors duration-200 hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-[#1F1E1B] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#F7F7F5]/25 disabled:hover:bg-transparent disabled:hover:text-[#F7F7F5] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#BD9655]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-4"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => scrollByCard(1)}
                disabled={!canScroll.next}
                aria-label="Ver razões seguintes"
                className="flex size-11 items-center justify-center border border-[#F7F7F5]/25 text-[#F7F7F5] transition-colors duration-200 hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-[#1F1E1B] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#F7F7F5]/25 disabled:hover:bg-transparent disabled:hover:text-[#F7F7F5] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#BD9655]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-4"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}