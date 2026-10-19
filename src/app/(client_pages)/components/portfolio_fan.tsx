"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";

type PortfolioProject = {
  id: string;
  name: string;
  category: string;
  year: string | number;
  images?: string[];
};

type PortfolioFanProps = {
  projects: PortfolioProject[];
  onOpen: (id: string) => void;
};

type FanCardStyle = CSSProperties & {
  "--offset": number;
  "--distance": number;
  "--angle": string;
};

export default function PortfolioFan({
  projects,
  onOpen,
}: PortfolioFanProps) {
  const [active, setActive] = useState(0);
  const dragStart = useRef<number | null>(null);
  const swipedAt = useRef(0);

  const count = projects.length;

  if (count === 0) return null;

  // Navegação circular entre projectos.
  const select = (step: number) => {
    setActive((index) => (index + step + count) % count);
  };

  return (
    <div className="portfolio-fan">
      <div
        className="portfolio-fan__stage"
        role="group"
        aria-label="Projectos em destaque"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === "ArrowLeft" || event.key === "ArrowRight")
          ) {
            event.preventDefault();
            select(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          dragStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (dragStart.current === null) return;

          const distance = event.clientX - dragStart.current;
          dragStart.current = null;

          if (Math.abs(distance) < 45) return;

          // Ignora o clique que possa ocorrer imediatamente após o gesto.
          swipedAt.current = Date.now();
          select(distance > 0 ? -1 : 1);
        }}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
        onLostPointerCapture={() => {
          dragStart.current = null;
        }}
      >
        {projects.map((project, index) => {
          let offset = index - active;

          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;

          const distance = Math.abs(offset);
          const visible = distance <= 2;
          const current = offset === 0;
          const cover = project.images?.[0];

          const cardStyle: FanCardStyle = {
            "--offset": offset,
            "--distance": distance,
            "--angle": `${offset * 8}deg`,
            zIndex: 10 - distance,
          };

          return (
            <button
              type="button"
              key={project.id}
              className={`portfolio-fan__card${
                current ? " is-active" : ""
              }`}
              style={cardStyle}
              aria-label={
                current
                  ? `Ver projecto ${project.name}`
                  : `Seleccionar projecto ${project.name}`
              }
              aria-hidden={!visible}
              tabIndex={visible ? 0 : -1}
              onClick={() => {
                if (Date.now() - swipedAt.current < 400) return;

                if (current) {
                  onOpen(project.id);
                } else {
                  setActive(index);
                }
              }}
            >
              {cover ? (
                <img
                  src={cover}
                  alt=""
                  loading={visible ? "eager" : "lazy"}
                  draggable={false}
                />
              ) : (
                <span
                  className="portfolio-fan__placeholder"
                  aria-hidden="true"
                />
              )}

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
          aria-label="Projecto anterior"
          disabled={count < 2}
        >
          <span aria-hidden="true">←</span>
        </button>

        <span aria-live="polite" aria-atomic="true">
          <b>{String(active + 1).padStart(2, "0")}</b>
          {" / "}
          {String(count).padStart(2, "0")}
          {" · "}
          {projects[active].name}
        </span>

        <button
          type="button"
          onClick={() => select(1)}
          aria-label="Projecto seguinte"
          disabled={count < 2}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}