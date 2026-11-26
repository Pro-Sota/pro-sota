"use client";

import Link from "next/link";
import { Reveal } from "./motion_reveal";
import { ArrowUpRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Elevation drawing                                                   */
/* One technical drawing: front elevation of a cantilevered volume     */
/* over a glazed ground floor. The single gold-lit bay is the only     */
/* accent; everything else stays in navy line work.                    */
/* ------------------------------------------------------------------ */

const NAVY = "#002950";
const GOLD = "#BD9655";

const upperBays = Array.from({ length: 12 }, (_, i) => 100 + i * 35);
const groundBays = Array.from({ length: 6 }, (_, i) => 140 + i * 50);
const hatch = Array.from({ length: 40 }, (_, i) => `M${40 + i * 14} 380 l-8 9`).join(" ");

function ElevationDrawing() {
  return (
    <svg
      viewBox="0 0 620 460"
      role="img"
      aria-label="Alçado de um edifício contemporâneo com volume superior em consola sobre um piso térreo envidraçado"
      className="h-auto w-full max-w-[540px] text-[#002950]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      fontFamily="inherit"
    >
      {/* Central axis */}
      <path
        d="M310 112 V380"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="10 4 2 4"
        opacity=".35"
      />
      <circle cx="310" cy="100" r="10" stroke="currentColor" strokeWidth="1" opacity=".6" />
      <text x="310" y="104" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".7">
        A
      </text>

      {/* Rooftop volume */}
      <rect x="330" y="130" width="120" height="30" fill="currentColor" fillOpacity=".05" stroke="currentColor" strokeWidth="1.3" />

      {/* Roof slab */}
      <rect x="92" y="160" width="436" height="10" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeWidth="1.5" />

      {/* Upper volume (cantilever) */}
      <rect x="100" y="170" width="420" height="122" fill="currentColor" fillOpacity=".04" stroke="currentColor" strokeWidth="1.6" />

      {upperBays.map((x, i) => (
        <rect
          key={x}
          x={x + 4}
          y={196}
          width={27}
          height={68}
          fill={i === 8 ? GOLD : "currentColor"}
          fillOpacity={i === 8 ? 0.3 : 0.07}
          stroke={i === 8 ? GOLD : "currentColor"}
          strokeWidth={i === 8 ? 1.4 : 1}
        />
      ))}

      {/* Ground floor, set back under the cantilever */}
      <rect x="140" y="292" width="300" height="88" stroke="currentColor" strokeWidth="1.6" />
      {groundBays.map((x, i) => (
        <rect
          key={x}
          x={x + 3}
          y={302}
          width={44}
          height={78}
          fill={i === 2 ? "none" : "currentColor"}
          fillOpacity={i === 2 ? 0 : 0.06}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
      {/* Entrance */}
      <path d="M243 380 V318 H287 V380" stroke="currentColor" strokeWidth="1.3" />

      {/* Ground line and hatch */}
      <path d="M30 380 H590" stroke="currentColor" strokeWidth="2" />
      <path d={hatch} stroke="currentColor" strokeWidth="0.8" opacity=".4" />

      {/* Vertical dimension (left) */}
      <g stroke={GOLD} strokeWidth="1">
        <path d="M100 170 H52 M100 292 H52" strokeDasharray="3 3" opacity=".7" />
        <path d="M64 170 V380" />
        <path d="M59 175 L69 165 M59 297 L69 287 M59 385 L69 375" />
      </g>
      <g fontSize="10" fill={NAVY} opacity=".75" textAnchor="middle">
        <text transform="rotate(-90 55 236)" x="55" y="236">5,00</text>
        <text transform="rotate(-90 55 336)" x="55" y="336">3,60</text>
      </g>

      {/* Horizontal dimension (bottom) */}
      <g stroke={GOLD} strokeWidth="1">
        <path d="M100 384 V420 M520 384 V420" strokeDasharray="3 3" opacity=".7" />
        <path d="M100 414 H520" />
        <path d="M95 419 L105 409 M515 419 L525 409" />
      </g>
      <text x="310" y="407" textAnchor="middle" fontSize="10" fill={NAVY} opacity=".75">
        17,20 m
      </text>

      {/* Level markers (right) */}
      <g stroke={GOLD} strokeWidth="1">
        <path d="M520 170 H556 M520 292 H556" strokeDasharray="3 3" opacity=".7" />
        <path d="M556 380 H590" />
      </g>
      <g fill={GOLD}>
        <path d="M556 162 H566 L561 170 Z" />
        <path d="M556 284 H566 L561 292 Z" />
        <path d="M556 372 H566 L561 380 Z" />
      </g>
      <g fontSize="10" fill={NAVY} opacity=".75">
        <text x="571" y="168">+8,60</text>
        <text x="571" y="290">+3,60</text>
        <text x="571" y="378">±0,00</text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function BriefingSection() {
  return (
    <section
      id="briefing"
      aria-labelledby="briefing-title"
      className="relative overflow-hidden bg-[#F7F7F5] hero-font-body text-[#002950]"
    >
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-y-8 px-6 py-14 md:gap-y-10 md:px-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-16 lg:gap-y-6 lg:px-20">
        {/* Heading (first on mobile) */}
        <Reveal y={20} className="relative z-10 lg:col-start-1 lg:row-start-1 lg:self-end">
          <span aria-hidden="true" className="mb-7 block h-px w-12 bg-[#BD9655]" />

          <h2
            id="briefing-title"
            className="font-heading max-w-2xl text-[clamp(2.2rem,3.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#1F1E1B]"
          >
            Tudo começa com uma ideia.
            <br />
            <span className="font-normal text-[#9A7230]">Conte-nos a sua.</span>
          </h2>
        </Reveal>

        {/* Drawing (after heading on mobile, spans both rows on desktop) */}
        <Reveal className="relative min-h-[300px] overflow-hidden border border-[#002950]/15 bg-[#FDFCFA] sm:min-h-[380px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-full lg:min-h-[500px]">
          {/* Drawing paper grid */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#002950_1px,transparent_1px),linear-gradient(to_bottom,#002950_1px,transparent_1px)] [background-size:36px_36px]"
          />

          {/* Drawing */}
          <div className="absolute inset-0 flex items-center justify-center px-3 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-8">
            <ElevationDrawing />
          </div>

          {/* Title block */}
          <div className="absolute inset-x-0 bottom-0 flex items-stretch border-t border-[#002950]/20 bg-[#FDFCFA]/90 text-[#002950]">
            <div className="flex-1 px-4 py-3 sm:px-6">
              <p className="text-xs font-semibold sm:text-[13px]">Alçado principal</p>
              <p className="mt-0.5 text-[11px] text-[#002950]/70">Escala 1:200</p>
            </div>
            <div className="border-l border-[#002950]/20 px-4 py-3 text-right sm:px-6">
              <p className="text-xs font-semibold sm:text-[13px]">Pro Sota</p>
              <p className="mt-0.5 text-[11px] text-[#002950]/70">
                Arquitectura, engenharia e construção
              </p>
            </div>
          </div>
        </Reveal>

        {/* Supporting copy and CTA */}
        <Reveal className="relative z-10 lg:col-start-1 lg:row-start-2 lg:self-start">
          <p className="max-w-lg text-[15px] leading-7 text-[#002950]/75 sm:leading-8">
            Partilhe connosco a sua ideia, os seus objectivos e as características do
            projecto. A nossa equipa analisa as suas necessidades e desenvolve uma
            solução à medida da sua visão.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/project-briefing"
              className="group inline-flex min-h-[52px] items-center gap-6 bg-[#002950] px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#8B6A2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B6A2F]"
            >
              <span>Iniciar briefing</span>
              <ArrowUpRight
                size={15}
                strokeWidth={1.5}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
              />
            </Link>

            <span className="max-w-[16rem] text-xs leading-5 text-[#002950]/70">
              Leva poucos minutos e é o primeiro passo do seu projecto.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}