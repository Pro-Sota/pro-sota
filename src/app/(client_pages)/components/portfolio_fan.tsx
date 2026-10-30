"use client";

import { useRef } from "react";

type PortfolioProject = {
  id: string;
  name: string;
  category: string;
  year: string | number;
  images?: string[];
};

/* Same props as before: drop-in replacement. A snap carousel replaces the 3D fan. */
export default function PortfolioFan({
  projects,
  onOpen,
}: {
  projects: PortfolioProject[];
  onOpen: (id: string) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  if (projects.length === 0) return null;

  const scrollBy = (dir: -1 | 1) =>
    track.current?.scrollBy({ left: dir * 420, behavior: "smooth" });

  return (
    <div>
      <div
        ref={track}
        role="group"
        aria-label="Projectos em destaque"
        className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {projects.map((p) => {
          const cover = p.images?.[0];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpen(p.id)}
              aria-label={`Ver projecto ${p.name}`}
              className="group relative aspect-[4/5] w-[min(82vw,380px)] shrink-0 snap-start overflow-hidden rounded-3xl bg-navy text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {cover && (
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-6 text-white">
                <small className="block text-sm text-white/70">
                  {p.category}, {p.year}
                </small>
                <strong className="mt-1 block font-display text-2xl font-semibold leading-tight">
                  {p.name}
                </strong>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => scrollBy(d)}
            aria-label={d < 0 ? "Projecto anterior" : "Projecto seguinte"}
            className="flex size-12 items-center justify-center rounded-full border border-navy/20 text-navy transition hover:bg-navy hover:text-white"
          >
            {d < 0 ? "←" : "→"}
          </button>
        ))}
      </div>
    </div>
  );
}