// src/components/WhyUs.tsx

"use client";

import { useRef } from "react";

const REASONS = [
  [
    "01",
    "Experiência multidisciplinar",
    "Arquitectos, engenheiros e técnicos com sólida experiência no mercado angolano e português, de remodelações a grandes empreendimentos.",
  ],
  [
    "02",
    "Projectos sob medida",
    "Cada cliente é único. Equilibramos funcionalidade, estética e viabilidade económica, respeitando sempre os seus sonhos e possibilidades.",
  ],
  [
    "03",
    "Acompanhamento contínuo",
    "Comunicação clara em todas as etapas — acompanha o progresso, recebe actualizações frequentes e participa nas decisões importantes.",
  ],
  [
    "04",
    "Cumprimento de prazos",
    "Cronogramas realistas e processos bem definidos, para que o seu projecto avance de forma fluida e segura.",
  ],
  [
    "05",
    "Serviço completo",
    "Do levantamento topográfico ao projecto de interiores e acompanhamento de obra — tudo num só lugar, sem burocracias.",
  ],
  [
    "06",
    "Inovação com responsabilidade",
    "Renderizações 3D e software BIM para qualidade visual e técnica, sem perder de vista a sustentabilidade e a viabilidade local.",
  ],
] as const;

export default function WhyUs() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Avança ou recua a largura de um cartão mais o intervalo visual.
  function scrollByCard(direction: -1 | 1) {
    const track = trackRef.current;

    if (!track) return;

    const card = track.querySelector<HTMLElement>("[data-reason-card]");
    const distance = card
      ? card.getBoundingClientRect().width + 20
      : 300;

    track.scrollBy({
      left: distance * direction,
      behavior: "smooth",
    });
  }

  return (
    <section className="why relative overflow-hidden bg-navy-deep py-[clamp(80px,12vh,120px)] text-cream">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,5vw,64px)]">
        <div className="reveal is-visible mb-[clamp(40px,6vh,64px)] flex flex-wrap items-end justify-between gap-5">
          <h2 className="max-w-[16ch] font-display text-[clamp(34px,4.6vw,58px)] leading-none font-extrabold uppercase">
            Porque escolher a Pro Sota
          </h2>

          <p className="max-w-[40ch] text-[14.5px] leading-[1.6] text-cream/60">
            Seis razões pelas quais os nossos clientes confiam o seu projecto
            à PRO SOTA, do primeiro esboço à entrega da chave.
          </p>
        </div>

        <div
          ref={trackRef}
          className="-mx-[clamp(20px,5vw,64px)] flex snap-x snap-proximity gap-5 overflow-x-auto px-[clamp(20px,5vw,64px)] pt-1 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-label="Razões para escolher a Pro Sota"
          tabIndex={0}
        >
          {REASONS.map(([num, title, description]) => (
            <article
              data-reason-card
              className="w-[clamp(250px,26vw,320px)] shrink-0 snap-start rounded-[3px] border border-gold-light/20 bg-gradient-to-br from-white/5 to-transparent p-6 lg:p-7"
              key={num}
            >
              <i className="mb-[30px] block font-display text-[15px] font-extrabold not-italic text-gold">
                {num}
              </i>

              <h3 className="mb-3 font-display text-[19px] leading-[1.15] font-extrabold uppercase text-cream">
                {title}
              </h3>

              <p className="text-[13.5px] leading-[1.6] text-cream/60">
                {description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-7 flex gap-2.5">
          {([-1, 1] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => scrollByCard(direction)}
              aria-label={
                direction < 0 ? "Razão anterior" : "Razão seguinte"
              }
              className="flex size-11 items-center justify-center rounded-full border border-gold-light/20 bg-transparent text-cream transition-colors hover:border-gold hover:bg-gold hover:text-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {direction < 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}