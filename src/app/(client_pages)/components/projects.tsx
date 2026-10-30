"use client";

import { useState } from "react";

type P = { id: string; name: string; category: string; year: string | number; images?: string[] };

/* Index of projects: a list you read like a drawing register.
   On desktop, the cover follows the cursor; on mobile, a thumbnail sits in each row. */
export default function Projects({ projects, onOpen }: { projects: P[]; onOpen: (id: string) => void }) {
  const [hover, setHover] = useState<P | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const cover = hover?.images?.[0];

  return (
    <div onMouseLeave={() => setHover(null)} onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      <ul className="border-t border-ink">
        {projects.map((p) => (
          <li key={p.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => onOpen(p.id)}
              onMouseEnter={() => setHover(p)}
              onFocus={() => setHover(p)}
              onBlur={() => setHover(null)}
              aria-label={`Ver projecto ${p.name}`}
              className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 py-5 text-left transition-[padding] duration-300 hover:pl-3 focus-visible:outline-2 focus-visible:outline-gold md:grid-cols-[1fr_200px_80px]"
            >
              <span className="flex items-center gap-4">
                {p.images?.[0] && (
                  <img src={p.images[0]} alt="" loading="lazy" className="size-14 rounded object-cover md:hidden" />
                )}
                <span className="text-xl font-medium tracking-tight md:text-3xl">{p.name}</span>
              </span>
              <span className="hidden text-sm text-mute md:block">{p.category}</span>
              <span className="text-sm tabular-nums text-mute md:text-right">{p.year}</span>
            </button>
          </li>
        ))}
      </ul>

      {cover && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-50 hidden h-60 w-80 overflow-hidden shadow-2xl md:block"
          style={{ transform: `translate(${pos.x + 24}px, ${pos.y - 120}px)` }}
        >
          <img src={cover} alt="" className="size-full object-cover" />
        </div>
      )}
    </div>
  );
}