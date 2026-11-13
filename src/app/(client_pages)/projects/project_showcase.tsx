
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";

import Lightbox from "../components/light_box";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PortfolioProject = {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string | null;
  year: number | null;
  summary: string | null;
  description: string | null;
  cover_image: string | null;
  gallery: string[];
  status: "draft" | "published" | "archived";
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type DisplayProject = {
  id: string;
  name: string;
  category: string;
  location: string;
  year: string;
  summary: string;
  description: string;
  images: string[];
  featured: boolean;
};

type SortOption =
  | "display_order"
  | "newest"
  | "oldest"
  | "az"
  | "za";

type PortfolioClientProps = {
  projects: PortfolioProject[];
  projectId?: string;
};

const EMPTY_PROJECTS: PortfolioProject[] = [];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "display_order", label: "Ordem original" },
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "az", label: "Nome A–Z" },
  { value: "za", label: "Nome Z–A" },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* -------------------------------------------------------------------------- */
/* Shared components                                                          */
/* -------------------------------------------------------------------------- */

function Label({
  children,
  className = "text-[#002950]/65",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${className}`}
    >
      {children}
    </p>
  );
}

function ChevronLeft() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Image                                                                      */
/* -------------------------------------------------------------------------- */

function FadeImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#EAE9E4]">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#002950]/40">
          Imagem indisponível
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${
        loaded ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Native select styling                                                      */
/* -------------------------------------------------------------------------- */

function SelectControl({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="relative min-w-0">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none border border-[#002950]/15 bg-transparent py-2 pl-3 pr-9 text-xs text-[#002950] outline-none transition-colors hover:border-[#BD9655] focus:border-[#BD9655]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#002950]/55">
        <ChevronDown />
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Project list — desktop                                                     */
/* -------------------------------------------------------------------------- */

function ProjectList({
  projects,
  selectedId,
  categories,
  categoryFilter,
  sortBy,
  onSelect,
  onCategoryChange,
  onSortChange,
}: {
  projects: DisplayProject[];
  selectedId: string;
  categories: string[];
  categoryFilter: string;
  sortBy: SortOption;
  onSelect: (id: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
}) {
  return (
    <aside
      aria-label="Projectos"
      className="hidden min-w-0 flex-col lg:flex lg:h-full lg:min-h-0"
    >
      {/* Heading */}
      <div className="mb-5 flex shrink-0 items-center justify-between">
        <Label>Projectos</Label>

        <span className="text-[11px] tabular-nums text-[#002950]/55">
          {pad(projects.length)}
        </span>
      </div>

      {/* Filters */}
      <div className="mb-5 shrink-0 space-y-3 border-b border-[#002950]/15 pb-5">
        <div>
          <Label className="mb-2 text-[#002950]/50">
            Categoria
          </Label>

          <SelectControl
            label="Filtrar por categoria"
            value={categoryFilter}
            onChange={onCategoryChange}
            options={[
              { value: "Todos", label: "Todas as categorias" },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
          />
        </div>

        <div>
          <Label className="mb-2 text-[#002950]/50">
            Ordenar por
          </Label>

          <SelectControl
            label="Ordenar projectos"
            value={sortBy}
            onChange={(value) => onSortChange(value as SortOption)}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {/* Project list */}
      <ul
        aria-label="Lista de projectos"
        className="min-h-0 flex-1 space-y-0 overflow-y-auto overflow-x-hidden pr-2"
      >
        {projects.map((project, index) => {
          const isActive = selectedId === project.id;

          return (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => onSelect(project.id)}
                aria-current={isActive ? "true" : undefined}
                className={`group relative flex w-full flex-col border-b py-4 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#BD9655] ${
                  isActive
                    ? "border-[#BD9655]"
                    : "border-[#002950]/10 hover:border-[#002950]/35"
                }`}
              >
                <span className="mb-3 flex items-center justify-between">
                  <span
                    className={`text-[11px] tabular-nums ${
                      isActive
                        ? "text-[#7a6032]"
                        : "text-[#002950]/45"
                    }`}
                  >
                    {pad(index + 1)}
                  </span>

                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-[#BD9655]"
                    />
                  )}
                </span>

                <span
                  className={`text-sm font-semibold leading-snug tracking-[-0.02em] transition-colors ${
                    isActive
                      ? "text-[#002950]"
                      : "text-[#002950]/65 group-hover:text-[#002950]"
                  }`}
                >
                  {project.name}
                </span>

                <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#002950]/55">
                    {project.category}
                  </span>

                  {project.year && (
                    <>
                      <span className="text-[#BD9655]/70">·</span>
                      <span className="text-[11px] text-[#002950]/55">
                        {project.year}
                      </span>
                    </>
                  )}
                </span>

                {project.featured && (
                  <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7a6032]">
                    Projecto em destaque
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {projects.length === 0 && (
        <p className="py-8 text-xs text-[#002950]/55">
          Não existem projectos nesta categoria.
        </p>
      )}
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Project selector — mobile                                                  */
/* -------------------------------------------------------------------------- */

function MobileProjectSelector({
  projects,
  selectedProject,
  categories,
  categoryFilter,
  sortBy,
  onSelect,
  onCategoryChange,
  onSortChange,
}: {
  projects: DisplayProject[];
  selectedProject: DisplayProject;
  categories: string[];
  categoryFilter: string;
  sortBy: SortOption;
  onSelect: (id: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-PT");

    if (!query) return projects;

    return projects.filter((project) =>
      [
        project.name,
        project.category,
        project.location,
        project.year,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-PT")
        .includes(query),
    );
  }, [projects, search]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = (id: string) => {
    onSelect(id);
    close();
    setSearch("");
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      {/* Compact selector */}
      <div className="lg:hidden">
        <div className="mb-3 flex items-center justify-between">
          <Label>Projecto seleccionado</Label>

          <span className="text-[11px] tabular-nums text-[#002950]/55">
            {pad(projects.findIndex(
              (project) => project.id === selectedProject.id,
            ) + 1)}
            {" / "}
            {pad(projects.length)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="group flex w-full items-center justify-between gap-4 border border-[#002950]/20 bg-white/40 px-4 py-4 text-left transition-colors hover:border-[#BD9655] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#BD9655]"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-[-0.02em] text-[#002950]">
              {selectedProject.name}
            </span>

            <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.12em] text-[#002950]/55">
              {selectedProject.category}
              {selectedProject.year && ` · ${selectedProject.year}`}
            </span>
          </span>

          <span className="flex size-9 shrink-0 items-center justify-center border border-[#002950]/15 text-[#002950] transition-colors group-hover:border-[#BD9655] group-hover:bg-[#BD9655] group-hover:text-white">
            <ChevronDown />
          </span>
        </button>
      </div>

      {/* Bottom sheet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center lg:hidden"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Fechar selector de projectos"
            onClick={close}
            className="absolute inset-0 bg-[#00182E]/60 backdrop-blur-[2px]"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-project-selector-title"
            className="relative z-10 flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-[#F7F7F5] shadow-2xl animate-in slide-in-from-bottom duration-300"
          >
            {/* Sheet header */}
            <div className="shrink-0 border-b border-[#002950]/15 px-5 pb-5 pt-4">
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#002950]/20" />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Portfólio PRO SOTA</Label>

                  <h2
                    id="mobile-project-selector-title"
                    className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[#002950]"
                  >
                    Seleccionar projecto<span className="text-[#BD9655]">.</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={close}
                  aria-label="Fechar"
                  className="flex size-10 items-center justify-center border border-[#002950]/15 text-[#002950] transition-colors hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-white"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Search */}
              <div className="relative mt-5">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#002950]/45"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar projecto..."
                  aria-label="Pesquisar projecto"
                  className="h-11 w-full border border-[#002950]/15 bg-white/50 pl-10 pr-4 text-sm text-[#002950] outline-none placeholder:text-[#002950]/35 focus:border-[#BD9655]"
                />
              </div>

              {/* Category and sorting */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <SelectControl
                  label="Filtrar por categoria"
                  value={categoryFilter}
                  onChange={onCategoryChange}
                  options={[
                    { value: "Todos", label: "Todas categorias" },
                    ...categories.map((category) => ({
                      value: category,
                      label: category,
                    })),
                  ]}
                />

                <SelectControl
                  label="Ordenar projectos"
                  value={sortBy}
                  onChange={(value) => onSortChange(value as SortOption)}
                  options={SORT_OPTIONS}
                />
              </div>
            </div>

            {/* Project results */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
              <div className="mb-3 flex items-center justify-between">
                <Label>Projectos disponíveis</Label>

                <span className="text-[10px] tabular-nums text-[#002950]/50">
                  {pad(filteredProjects.length)} resultados
                </span>
              </div>

              {filteredProjects.length > 0 ? (
                <div className="divide-y divide-[#002950]/10">
                  {filteredProjects.map((project) => {
                    const isActive =
                      selectedProject.id === project.id;

                    const thumbnail = project.images[0];

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => handleSelect(project.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={`flex w-full items-center gap-4 py-4 text-left transition-colors ${
                          isActive ? "bg-[#BD9655]/[0.06]" : ""
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="relative size-[76px] shrink-0 overflow-hidden bg-[#EAE9E4]">
                          {thumbnail ? (
                            <FadeImage
                              src={thumbnail}
                              alt=""
                              sizes="76px"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-[9px] text-[#002950]/40">
                              PRO SOTA
                            </span>
                          )}
                        </div>

                        {/* Information */}
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#7a6032]">
                            {project.category}
                          </span>

                          <span className="block text-sm font-semibold leading-snug text-[#002950]">
                            {project.name}
                          </span>

                          <span className="mt-1 block text-[11px] text-[#002950]/55">
                            {[project.location, project.year]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>

                        {/* Selection */}
                        <span
                          className={`flex size-7 shrink-0 items-center justify-center border transition-colors ${
                            isActive
                              ? "border-[#BD9655] bg-[#BD9655] text-white"
                              : "border-[#002950]/20 text-transparent"
                          }`}
                        >
                          {isActive && (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <span className="mb-3 text-[#BD9655]">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                  </span>

                  <p className="text-sm font-semibold text-[#002950]">
                    Nenhum projecto encontrado
                  </p>

                  <p className="mt-1 text-xs text-[#002950]/55">
                    Experimente outra pesquisa ou categoria.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-[#002950]/15 bg-[#F7F7F5] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
              <button
                type="button"
                onClick={close}
                className="flex w-full items-center justify-center bg-[#002950] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#BD9655]"
              >
                Ver projecto seleccionado
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Column 2 — main image                                                      */
/* -------------------------------------------------------------------------- */

function ProjectViewer({
  project,
  images,
  activeIndex,
  onOpenLightbox,
  onPrevious,
  onNext,
  containerRef,
}: {
  project: DisplayProject;
  images: string[];
  activeIndex: number;
  onOpenLightbox: () => void;
  onPrevious: () => void;
  onNext: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const activeImage = images[activeIndex] ?? null;

  return (
    <div
      ref={containerRef}
      className="flex min-w-0 scroll-mt-28 flex-col lg:h-full lg:min-h-0"
    >
      <div className="mb-4 hidden shrink-0 items-center justify-between lg:flex">
        <Label>Imagem principal</Label>

        <span className="text-[11px] tabular-nums text-[#002950]/60">
          {pad(images.length === 0 ? 0 : activeIndex + 1)}
          {" / "}
          {pad(images.length)}
        </span>
      </div>

      <div className="group relative overflow-hidden bg-[#EAE9E4] lg:min-h-0 lg:flex-1">
        {activeImage ? (
          <button
            type="button"
            onClick={onOpenLightbox}
            aria-label={`Ampliar imagem de ${project.name}`}
            className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-[#EAE9E4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] sm:aspect-[16/11] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
          >
            <FadeImage
              key={activeImage}
              src={activeImage}
              alt={`${project.name} — imagem ${activeIndex + 1}`}
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
            />

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#002950]/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            <span
              aria-hidden="true"
              className="absolute bottom-5 right-5 flex size-10 items-center justify-center border border-white/60 bg-[#002950]/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6M14 10l7-7M9 21H3v-6m0 6 7-7" />
              </svg>
            </span>

            {/* Mobile image counter */}
            <span className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#002950]/65 px-3 py-2 text-[10px] tabular-nums text-white backdrop-blur-sm lg:hidden">
              {pad(activeIndex + 1)}
              <span className="text-white/50">/</span>
              {pad(images.length)}
            </span>
          </button>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center sm:aspect-[16/11] lg:absolute lg:inset-0 lg:aspect-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#002950]/40">
              PRO SOTA
            </span>
          </div>
        )}

        {/* Mobile previous / next controls */}
        {images.length > 1 && activeImage && (
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between px-3 lg:hidden">
            <button
              type="button"
              onClick={onPrevious}
              aria-label="Imagem anterior"
              className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/50 bg-[#002950]/65 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-[#BD9655] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={onNext}
              aria-label="Imagem seguinte"
              className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-white/50 bg-[#002950]/65 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-[#BD9655] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Desktop image footer */}
      <div className="mt-4 hidden shrink-0 items-start justify-between border-b border-[#002950]/15 pb-4 lg:flex">
        <div>
          <p className="text-xs font-semibold text-[#002950]">
            {project.name}
          </p>

          {project.location && (
            <p className="mt-1 text-[11px] text-[#002950]/60">
              {project.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Column 3 — description + gallery                                           */
/* -------------------------------------------------------------------------- */

function ProjectDetails({
  project,
  images,
  activeIndex,
  onSelectImage,
  onPrevious,
  onNext,
}: {
  project: DisplayProject;
  images: string[];
  activeIndex: number;
  onSelectImage: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const stripRef = useRef<HTMLDivElement | null>(null);

  // Keep active thumbnail visible.
  useEffect(() => {
    const thumb = stripRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );

    thumb?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [activeIndex]);

  return (
    <aside
      aria-label="Detalhes do projecto"
      className="flex min-w-0 flex-col gap-8 lg:h-full lg:min-h-0 lg:gap-6"
    >
      {/* Gallery — first on mobile, second on desktop */}
      <div className="order-1 min-w-0 shrink-0 border-t border-[#002950]/15 pt-5 lg:order-2">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Label>Galeria</Label>

            <p className="mt-1 text-[11px] text-[#002950]/60">
              {images.length}{" "}
              {images.length === 1 ? "imagem" : "imagens"}
            </p>
          </div>

          {/* Desktop gallery navigation */}
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={onPrevious}
              disabled={images.length <= 1}
              aria-label="Imagem anterior"
              className="flex size-9 items-center justify-center border border-[#002950]/15 text-[#002950] transition-all hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#BD9655] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={images.length <= 1}
              aria-label="Imagem seguinte"
              className="flex size-9 items-center justify-center border border-[#002950]/15 text-[#002950] transition-all hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#BD9655] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {images.length > 0 ? (
          <div
            ref={stripRef}
            className="flex gap-3 overflow-x-auto pb-2"
          >
            {images.map((image, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${project.id}-${image}`}
                  type="button"
                  data-index={index}
                  onClick={() => onSelectImage(index)}
                  aria-label={`Ver imagem ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`group relative w-[88px] shrink-0 overflow-hidden border-2 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] sm:w-[105px] ${
                    isActive
                      ? "border-[#BD9655]"
                      : "border-transparent opacity-65 hover:opacity-100"
                  }`}
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-[#EAE9E4]">
                    <FadeImage
                      src={image}
                      alt={`${project.name} — miniatura ${index + 1}`}
                      sizes="115px"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="py-6 text-xs text-[#002950]/60">
            Não existem imagens disponíveis.
          </p>
        )}
      </div>

      {/* Description — second on mobile, first on desktop */}
      <div className="order-2 lg:order-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-3">
        <div className="mb-6 flex items-center justify-between border-b border-[#002950]/15 pb-4">
          <Label>Sobre o projecto</Label>

          {project.featured && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a6032]">
              Destaque
            </span>
          )}
        </div>

        <Label className="mb-4 text-[#7a6032]">
          {project.category}
        </Label>

        <h2 className="text-2xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#002950] sm:text-3xl lg:text-[clamp(25px,2.2vw,38px)]">
          {project.name}
          <span className="text-[#BD9655]">.</span>
        </h2>

        {(project.location || project.year) && (
          <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-y border-[#002950]/10 py-4">
            {project.location && (
              <div>
                <dt className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[#002950]/55">
                  Localização
                </dt>
                <dd className="text-xs font-medium text-[#002950]">
                  {project.location}
                </dd>
              </div>
            )}

            {project.year && (
              <div>
                <dt className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[#002950]/55">
                  Ano
                </dt>
                <dd className="text-xs font-medium text-[#002950]">
                  {project.year}
                </dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-6 w-full">
          <Label className="mb-3 text-[#002950]/60">
            Descrição
          </Label>

          <p className="w-full break-words text-sm leading-8 text-[#002950]/70">
            {project.description ||
              project.summary ||
              "Informações sobre este projecto serão disponibilizadas brevemente."}
          </p>
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ProjectsPage({
  projects: initialProjects,
  projectId,
}: PortfolioClientProps) {
  const projects = Array.isArray(initialProjects)
    ? initialProjects
    : EMPTY_PROJECTS;

  /* ------------------------------------------------------------------------ */
  /* Prepare published projects                                               */
  /* ------------------------------------------------------------------------ */

  const displayProjects = useMemo<DisplayProject[]>(() => {
    return projects
      .filter(Boolean)
      .filter((project) => project.status === "published")
      .sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }

        return (a.display_order ?? 0) - (b.display_order ?? 0);
      })
      .map((project) => {
        const images = [
          project.cover_image,
          ...(project.gallery ?? []),
        ].filter(
          (image): image is string =>
            typeof image === "string" && Boolean(image.trim()),
        );

        return {
          id: project.slug || project.id,
          name: project.name,
          category: project.category || "Projecto",
          location: project.location ?? "",
          year: project.year ? String(project.year) : "",
          summary: project.summary ?? "",
          description: project.description ?? project.summary ?? "",
          images: [...new Set(images)],
          featured: project.featured,
        };
      });
  }, [projects]);

  /* ------------------------------------------------------------------------ */
  /* Filtering and sorting                                                    */
  /* ------------------------------------------------------------------------ */

  const categories = useMemo(() => {
    return [...new Set(
      displayProjects
        .map((project) => project.category)
        .filter(Boolean),
    )].sort((a, b) => a.localeCompare(b, "pt-PT"));
  }, [displayProjects]);

  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState<SortOption>("display_order");

  const visibleProjects = useMemo(() => {
    const filtered = displayProjects.filter(
      (project) =>
        categoryFilter === "Todos" ||
        project.category === categoryFilter,
    );

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            (Number(b.year) || 0) - (Number(a.year) || 0) ||
            a.name.localeCompare(b.name, "pt-PT")
          );

        case "oldest":
          return (
            (Number(a.year) || Infinity) -
              (Number(b.year) || Infinity) ||
            a.name.localeCompare(b.name, "pt-PT")
          );

        case "az":
          return a.name.localeCompare(b.name, "pt-PT");

        case "za":
          return b.name.localeCompare(a.name, "pt-PT");

        case "display_order":
        default:
          return (
            Number(b.featured) - Number(a.featured) ||
            displayProjects.indexOf(a) -
              displayProjects.indexOf(b)
          );
      }
    });
  }, [displayProjects, categoryFilter, sortBy]);

  /* ------------------------------------------------------------------------ */
  /* Selection state                                                          */
  /* ------------------------------------------------------------------------ */

  const [selectedId, setSelectedId] = useState<string | null>(
    () => projectId ?? null,
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const viewerRef = useRef<HTMLDivElement | null>(null);

  // Follow route changes without an effect.
  const [prevProjectId, setPrevProjectId] = useState(projectId);

  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);

    if (projectId) {
      setSelectedId(projectId);
      setActiveImageIndex(0);
      setIsLightboxOpen(false);
    }
  }

  // Keep the selection inside the filtered result set.
  const selectedProject =
    visibleProjects.find((project) => project.id === selectedId) ??
    visibleProjects[0] ??
    null;

  const images = selectedProject?.images ?? [];
  const imageCount = images.length;

  /* ------------------------------------------------------------------------ */
  /* URL hash                                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (projectId) return;

    const hash = decodeURIComponent(
      window.location.hash.slice(1),
    );

    if (
      hash &&
      displayProjects.some((project) => project.id === hash)
    ) {
      setSelectedId(hash);
    }
  }, [projectId, displayProjects]);

  /* ------------------------------------------------------------------------ */
  /* Project selection                                                       */
  /* ------------------------------------------------------------------------ */

  const selectProject = useCallback((id: string) => {
    setSelectedId(id);
    setActiveImageIndex(0);
    setIsLightboxOpen(false);

    try {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`,
      );
    } catch {
      // Ignore Safari history errors.
    }

    if (window.matchMedia("(max-width: 1023px)").matches) {
      viewerRef.current?.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Image navigation                                                         */
  /* ------------------------------------------------------------------------ */

  const showNextImage = useCallback(() => {
    if (imageCount <= 1) return;

    setActiveImageIndex(
      (current) => (current + 1) % imageCount,
    );
  }, [imageCount]);

  const showPreviousImage = useCallback(() => {
    if (imageCount <= 1) return;

    setActiveImageIndex(
      (current) => (current - 1 + imageCount) % imageCount,
    );
  }, [imageCount]);

  // Reset active image when changing projects.
  const [previousSelectedId, setPreviousSelectedId] =
    useState(selectedProject?.id);

  if (selectedProject?.id !== previousSelectedId) {
    setPreviousSelectedId(selectedProject?.id);
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
  }

  // Keyboard navigation.
  useEffect(() => {
    if (isLightboxOpen || imageCount <= 1) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(
            target.tagName,
          ))
      ) {
        return;
      }

      if (event.key === "ArrowRight") showNextImage();
      else if (event.key === "ArrowLeft") showPreviousImage();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isLightboxOpen,
    imageCount,
    showNextImage,
    showPreviousImage,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7F5] text-[#002950]">
      <section className="mx-auto flex w-full max-w-[1800px] flex-col px-5 pb-12 pt-28 sm:px-8 md:px-10 md:pt-32 lg:h-[100dvh] lg:min-h-[640px] lg:px-12 lg:pb-8">
        {/* Page header */}
        <div className="mb-7 flex shrink-0 items-end justify-between border-b border-[#002950]/15 pb-5 md:mb-9 lg:mb-6">
          <div>
            <Label className="mb-2 text-[#7a6032]">
              PRO SOTA · ANGOLA
            </Label>

            <h1 className="text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
              Projectos<span className="text-[#BD9655]">.</span>
            </h1>
          </div>

          <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-[#002950]/55 sm:block">
            Portfólio
          </span>
        </div>

        {displayProjects.length === 0 || !selectedProject ? (
          /* Empty state */
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center lg:min-h-0 lg:flex-1">
            <span className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6032]">
              PRO SOTA
            </span>

            <h2 className="text-2xl font-semibold">
              Projectos em actualização
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#002950]/65">
              Estamos a preparar a apresentação dos nossos projectos.
              Volte em breve.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile project selector */}
            <MobileProjectSelector
              projects={visibleProjects}
              selectedProject={selectedProject}
              categories={categories}
              categoryFilter={categoryFilter}
              sortBy={sortBy}
              onSelect={selectProject}
              onCategoryChange={setCategoryFilter}
              onSortChange={setSortBy}
            />

            {/* Project explorer */}
            <div className="mt-6 grid grid-cols-1 gap-8 lg:mt-0 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(190px,0.72fr)_minmax(0,1.8fr)_minmax(270px,0.95fr)] lg:grid-rows-1 lg:gap-8 xl:gap-12">
              <ProjectList
                projects={visibleProjects}
                selectedId={selectedProject.id}
                categories={categories}
                categoryFilter={categoryFilter}
                sortBy={sortBy}
                onSelect={selectProject}
                onCategoryChange={setCategoryFilter}
                onSortChange={setSortBy}
              />

              <ProjectViewer
                project={selectedProject}
                images={images}
                activeIndex={activeImageIndex}
                onOpenLightbox={() => setIsLightboxOpen(true)}
                onPrevious={showPreviousImage}
                onNext={showNextImage}
                containerRef={viewerRef}
              />

              <ProjectDetails
                project={selectedProject}
                images={images}
                activeIndex={activeImageIndex}
                onSelectImage={setActiveImageIndex}
                onPrevious={showPreviousImage}
                onNext={showNextImage}
              />
            </div>
          </>
        )}
      </section>

      {/* Lightbox */}
      {isLightboxOpen && selectedProject && (
        <Lightbox
          project={selectedProject}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </main>
  );
}
