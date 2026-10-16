// src/components/PortfolioGrid.tsx

"use client";

type PortfolioProject = {
  id: string | number;
  name: string;
  category: string;
  year: string | number;
  images?: string[] | null;
  summary?: string | null;
};

type PortfolioGridProps = {
  projects: PortfolioProject[];
  onOpen: (projectId: PortfolioProject["id"]) => void;
  sized?: boolean;
};

// Sete peças formam o mosaico 2–3–2 usado na página completa do portefólio.
const SIZE_PATTERN = [
  "is-w4",
  "is-w2",
  "is-w2",
  "is-w2",
  "is-w2",
  "is-w2",
  "is-w4",
];

export default function PortfolioGrid({
  projects,
  onOpen,
  sized = true,
}: PortfolioGridProps) {
  return (
    <div className="portfolio__grid">
      {projects.map((project, i) => {
        const cover = project.images?.[0];
        const count = project.images?.length ?? 0;

        return (
          <div
            key={project.id}
            className={
              "p-item" +
              (sized ? ` ${SIZE_PATTERN[i % SIZE_PATTERN.length]}` : "")
            }
            role="button"
            tabIndex={0}
            aria-label={`Ver projecto ${project.name}`}
            onClick={() => onOpen(project.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen(project.id);
              }
            }}
          >
            {cover ? (
              <img
                src={cover}
                alt={project.name}
                loading="lazy"
                draggable={false}
              />
            ) : (
              <div
                className="p-item__placeholder"
                aria-label="Sem imagem disponível"
              />
            )}

            <div className="p-item__scrim" />

            {count > 1 && (
              <div className="p-item__count">{count} fotos</div>
            )}

            <div className="p-item__meta">
              <em>
                {project.category} — {project.year}
              </em>
              <h3>{project.name}</h3>
              {project.summary && <span>{project.summary}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}