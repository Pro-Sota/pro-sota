// src/components/PortfolioFan.tsx
"use client";

import { useRef, useState } from "react";

type PortfolioProject = {
  id: string | number;
  name: string;
  category: string;
  year: string | number;
  images?: string[] | null;
};

type PortfolioFanProps = {
  projects: PortfolioProject[];
  onOpen: (projectId: PortfolioProject["id"]) => void;
};

export default function PortfolioFan({
  projects,
  onOpen,
}: PortfolioFanProps) {
  const [active, setActive] = useState(0);
  const dragStart = useRef<number | null>(null);
  const swipedAt = useRef(0);

  const count = projects.length;

  if (!count) return null;

  const select = (step: number) => {
    setActive((index) => (index + step + count) % count);
  };

  return (
    <div className="portfolio-fan">
      <div
        className="portfolio-fan__stage"
        role="group"
        aria-label="Projetos em destaque"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            select(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        onPointerDown={(event) => {
          dragStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (dragStart.current === null) return;

          const distance = event.clientX - dragStart.current;
          dragStart.current = null;

          if (Math.abs(distance) < 45) return;

          swipedAt.current = Date.now();
          select(distance > 0 ? -1 : 1);
        }}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
        {projects.map((project, index) => {
          let offset = index - active;

          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;

          const visible = Math.abs(offset) <= 2;
          const current = offset === 0;

          return (
            <button
              type="button"
              key={project.id}
              className={
                "portfolio-fan__card" + (current ? " is-active" : "")
              }
              style={
                {
                  "--offset": offset,
                  "--distance": Math.abs(offset),
                  "--angle": `${offset * 8}deg`,
                  zIndex: 10 - Math.abs(offset),
                } as React.CSSProperties
              }
              aria-label={
                current
                  ? `Ver projeto ${project.name}`
                  : `Selecionar projeto ${project.name}`
              }
              aria-hidden={!visible}
              tabIndex={visible ? 0 : -1}
              onClick={() => {
                // Ignorar o clique emitido no fim de um gesto de arrasto.
                if (Date.now() - swipedAt.current < 400) return;

                if (current) {
                  onOpen(project.id);
                } else {
                  setActive(index);
                }
              }}
            >
              <img
                src={project.images?.[0] ?? ""}
                alt=""
                loading={visible ? "eager" : "lazy"}
                draggable={false}
              />

              <span className="portfolio-fan__caption">
                <small>
                  {project.category} · {project.year}
                </small>
                <strong>{project.name}</strong>
              </span>
            </button>
          );
        })}
      </div>

      <div className="portfolio-fan__controls">
        <button
          type="button"
          onClick={() => select(-1)}
          aria-label="Projeto anterior"
        >
          ←
        </button>

        <span aria-live="polite">
          <b>{String(active + 1).padStart(2, "0")}</b> /{" "}
          {String(count).padStart(2, "0")} · {projects[active].name}
        </span>

        <button
          type="button"
          onClick={() => select(1)}
          aria-label="Projeto seguinte"
        >
          →
        </button>
      </div>
    </div>
  );
}