
import type { KeyboardEvent } from "react";

const SIZE_PATTERN = [
  "is-w4",
  "is-w2",
  "is-w2",
  "is-w2",
  "is-w2",
  "is-w2",
  "is-w4",
];

export type PortfolioGridProject = {
  id: string;
  name: string;
  category: string;
  year: string | number;
  summary: string;
  images?: string[];
};

type PortfolioGridProps = {
  projects: PortfolioGridProject[];
  onOpen: (id: string) => void;
  sized?: boolean;
};

export default function PortfolioGrid({
  projects,
  onOpen,
  sized = true,
}: PortfolioGridProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    id: string
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(id);
    }
  }

  return (
    <div className="portfolio__grid">
      {projects.map((project, index) => {
        const cover = project.images?.[0];
        const count = project.images?.length ?? 0;

        return (
          <button
            key={project.id}
            type="button"
            className={`p-item${sized ? ` ${SIZE_PATTERN[index % SIZE_PATTERN.length]}` : ""}`}
            aria-label={`Ver projecto ${project.name}`}
            onClick={() => onOpen(project.id)}
            onKeyDown={(event) => handleKeyDown(event, project.id)}
          >
            {cover ? (
              <img
                src={cover}
                alt={project.name}
                loading="lazy"
              />
            ) : (
              <div
                className="p-item__placeholder"
                aria-hidden="true"
              />
            )}

            <div className="p-item__scrim" aria-hidden="true" />

            {count > 1 && (
              <div className="p-item__count">
                {count} fotos
              </div>
            )}

            <div className="p-item__meta">
              <em>
                {project.category} — {project.year}
              </em>
              <h3>{project.name}</h3>
              <span>{project.summary}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
