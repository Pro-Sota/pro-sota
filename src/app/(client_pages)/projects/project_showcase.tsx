"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import Nav from "../components/nav";
import Footer from "../components/footer";
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

type PortfolioClientProps = {
  projects: PortfolioProject[];
  projectId?: string;
};

/* -------------------------------------------------------------------------- */
/* Small shared pieces                                                        */
/* -------------------------------------------------------------------------- */

const EMPTY_PROJECTS: PortfolioProject[] = [];

/** Uppercase section label used all over the page. */
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

/** Zero-padded "01 — 04" style counter. */
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Image that fills its (relatively positioned) parent, fades in once loaded
 * and falls back to a neutral placeholder if the URL is broken.
 */
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
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#002950]/40">
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
      className={`object-cover transition-opacity duration-500 motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
    />
  );
}

const ChevronLeft = () => (
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

const ChevronRight = () => (
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

/* -------------------------------------------------------------------------- */
/* Column 1 — project list                                                    */
/* -------------------------------------------------------------------------- */

function ProjectList({
  projects,
  selectedId,
  onSelect,
}: {
  projects: DisplayProject[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside
      aria-label="Projectos"
      className="flex min-w-0 flex-col lg:h-full lg:min-h-0"
    >
      <div className="mb-5 flex shrink-0 items-center justify-between">
        <Label>Projectos</Label>
        <span className="text-[11px] tabular-nums text-[#002950]/55">
          {pad(projects.length)}
        </span>
      </div>

      <ul
        aria-label="Lista de projectos"
        className="flex gap-3 overflow-x-auto pb-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0"
      >
        {projects.map((project, index) => {
          const isActive = selectedId === project.id;

          return (
            <li key={project.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(project.id)}
                aria-current={isActive ? "true" : undefined}
                className={`group relative flex w-[190px] flex-col border-b py-4 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] lg:w-full lg:py-5 ${isActive
                    ? "border-[#BD9655]"
                    : "border-[#002950]/10 hover:border-[#002950]/40"
                  }`}
              >
                <span className="mb-3 flex items-center justify-between">
                  <span
                    className={`text-[11px] tabular-nums transition-colors ${isActive ? "text-[#7a6032]" : "text-[#002950]/55"
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
                  className={`text-sm font-semibold leading-snug tracking-[-0.02em] transition-colors ${isActive
                      ? "text-[#002950]"
                      : "text-[#002950]/65 group-hover:text-[#002950]"
                    }`}
                >
                  {project.name}
                </span>

                <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[11px] uppercase tracking-[0.1em] text-[#002950]/60">
                    {project.category}
                  </span>

                  {project.year && (
                    <>
                      <span aria-hidden="true" className="text-[#BD9655]/70">
                        ·
                      </span>
                      <span className="text-[11px] text-[#002950]/60">
                        {project.year}
                      </span>
                    </>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
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
  containerRef,
}: {
  project: DisplayProject;
  images: string[];
  activeIndex: number;
  onOpenLightbox: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const activeImage = images[activeIndex] ?? null;

  return (
    <div
      ref={containerRef}
      className="flex min-w-0 scroll-mt-28 flex-col lg:h-full lg:min-h-0"
    >
      <div className="mb-4 flex shrink-0 items-center justify-between">
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
            {/* `key` remounts the image so the fade-in replays per image */}
            <FadeImage
              key={activeImage}
              src={activeImage}
              alt={`${project.name} — imagem ${activeIndex + 1}`}
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
            />

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#002950]/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            <span
              aria-hidden="true"
              className="absolute bottom-5 right-5 flex size-10 items-center justify-center rounded-full border border-white/60 bg-[#002950]/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100"
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
          </button>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center sm:aspect-[16/11] lg:absolute lg:inset-0 lg:aspect-auto">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#002950]/40">
              PRO SOTA
            </span>
          </div>
        )}
      </div>

      {/* Main image footer */}
      <div className="mt-4 shrink-0 border-b border-[#002950]/15 pb-4">
        <p className="text-xs font-semibold text-[#002950]">{project.name}</p>

        {project.location && (
          <p className="mt-1 text-[11px] text-[#002950]/60">
            {project.location}
          </p>
        )}
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

  // Keep the active thumbnail visible when navigating with arrows / keyboard.
  useEffect(() => {
    const thumb = stripRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    thumb?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [activeIndex]);

  return (
    <aside
      aria-label="Detalhes do projecto"
      className="flex min-w-0 flex-col gap-10 lg:h-full lg:min-h-0 lg:gap-6"
    >
      {/* TOP — description (scrolls if too long) */}
      <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-3">
        <div className="mb-6 flex items-center justify-between border-b border-[#002950]/15 pb-4">
          <Label>Sobre o projecto</Label>

          {project.featured && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a6032]">
              Destaque
            </span>
          )}
        </div>

        <Label className="mb-4 text-[#7a6032]">{project.category}</Label>

        <h2 className="text-2xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#002950] sm:text-3xl lg:text-[clamp(25px,2.2vw,38px)]">
          {project.name}
          <span className="text-[#BD9655]">.</span>
        </h2>

        {(project.location || project.year) && (
          <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-y border-[#002950]/10 py-4">
            {project.location && (
              <div>
                <dt className="mb-1 text-[11px] uppercase tracking-[0.12em] text-[#002950]/60">
                  Localização
                </dt>
                <dd className="text-xs font-medium text-[#002950]">
                  {project.location}
                </dd>
              </div>
            )}

            {project.year && (
              <div>
                <dt className="mb-1 text-[11px] uppercase tracking-[0.12em] text-[#002950]/60">
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
          <Label className="mb-3 text-[#002950]/60">Descrição</Label>

          <p className="w-full word-break text-sm leading-8 text-[#002950]/70">
            {project.description ||
              project.summary ||
              "Informações sobre este projecto serão disponibilizadas brevemente."}
          </p>
        </div>
      </div>

      {/* BOTTOM — gallery (pinned) */}
      <div className="min-w-0 shrink-0 border-t border-[#002950]/15 pt-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Label>Galeria</Label>
            <p className="mt-1 text-[11px] text-[#002950]/60">
              {images.length} {images.length === 1 ? "imagem" : "imagens"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={images.length <= 1}
              aria-label="Imagem anterior"
              className="flex size-9 items-center justify-center border border-[#002950]/15 text-[#002950] transition-all hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={images.length <= 1}
              aria-label="Imagem seguinte"
              className="flex size-9 items-center justify-center border border-[#002950]/15 text-[#002950] transition-all hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {images.length > 0 ? (
          <div ref={stripRef} className="flex gap-3 overflow-x-auto pb-2">
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
                  className={`group relative w-[105px] shrink-0 overflow-hidden border-2 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] sm:w-[115px] ${isActive
                      ? "border-[#BD9655]"
                      : "border-transparent opacity-70 hover:opacity-100"
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
  // Stable reference when the prop isn't an array, so the memo below doesn't
  // re-run on every render.
  const projects = Array.isArray(initialProjects)
    ? initialProjects
    : EMPTY_PROJECTS;

  /* ------------------------------------------------------------------------ */
  /* Prepare projects                                                         */
  /* ------------------------------------------------------------------------ */

  const displayProjects = useMemo<DisplayProject[]>(() => {
    return [...projects]
      .filter(Boolean)
      .filter((project) => project.status === "published")
      .sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }

        return (a.display_order ?? 0) - (b.display_order ?? 0);
      })
      .map((project) => {
        const images = [project.cover_image, ...(project.gallery ?? [])].filter(
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
  /* Selection state                                                          */
  /* ------------------------------------------------------------------------ */

  const [selectedId, setSelectedId] = useState<string | null>(
    () => projectId ?? null,
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const viewerRef = useRef<HTMLDivElement | null>(null);

  // If the route changes `projectId` while this component stays mounted,
  // follow it (adjusting state during render, no extra effect).
  const [prevProjectId, setPrevProjectId] = useState(projectId);
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);
    if (projectId) {
      setSelectedId(projectId);
      setActiveImageIndex(0);
      setIsLightboxOpen(false);
    }
  }

  const selectedProject =
    displayProjects.find((project) => project.id === selectedId) ??
    displayProjects[0] ??
    null;

  const images = selectedProject?.images ?? [];
  const imageCount = images.length;

  /* ------------------------------------------------------------------------ */
  /* URL hash <-> selected project                                            */
  /* ------------------------------------------------------------------------ */

  // On load, honour a `#slug` when no `projectId` prop was given.
  useEffect(() => {
    if (projectId) return;

    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash && displayProjects.some((project) => project.id === hash)) {
      setSelectedId(hash);
    }
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      // Safari throws if replaceState is called too often. Safe to ignore.
    }

    // On stacked (mobile) layouts the viewer is below the list: bring it up.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      viewerRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
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
    setActiveImageIndex((current) => (current + 1) % imageCount);
  }, [imageCount]);

  const showPreviousImage = useCallback(() => {
    if (imageCount <= 1) return;
    setActiveImageIndex((current) => (current - 1 + imageCount) % imageCount);
  }, [imageCount]);

  // ← / → switch images (the lightbox handles its own keys while open).
  useEffect(() => {
    if (isLightboxOpen || imageCount <= 1) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      if (event.key === "ArrowRight") showNextImage();
      else if (event.key === "ArrowLeft") showPreviousImage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, imageCount, showNextImage, showPreviousImage]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7F5] text-[#002950]">
      <Nav />

      {/* On lg+ the section is exactly one screen tall (nav clearance comes
          from the top padding), so scrolling reveals only the footer. */}
      <section className="mx-auto flex w-full max-w-[1800px] flex-col px-5 pb-12 pt-28 sm:px-8 md:px-10 md:pt-32 lg:h-[100dvh] lg:min-h-[640px] lg:px-12 lg:pb-8">
        {/* PAGE HEADER */}
        <div className="mb-8 flex shrink-0 items-end justify-between border-b border-[#002950]/15 pb-5 md:mb-10 lg:mb-6">
          <h1 className="text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
            Projectos<span className="text-[#BD9655]">.</span>
          </h1>

          <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-[#002950]/55 sm:block">
            Portfólio
          </span>
        </div>

        {displayProjects.length === 0 || !selectedProject ? (
          /* EMPTY STATE */
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center lg:min-h-0 lg:flex-1">
            <span className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#7a6032]">
              PRO SOTA
            </span>

            <h2 className="text-2xl font-semibold">
              Projectos em actualização
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#002950]/65">
              Estamos a preparar a apresentação dos nossos projectos. Volte em
              breve.
            </p>
          </div>
        ) : (
          /* THREE COLUMN PROJECT EXPLORER */
          <div className="grid grid-cols-1 gap-9 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(190px,0.72fr)_minmax(0,1.8fr)_minmax(270px,0.95fr)] lg:grid-rows-1 lg:gap-8 xl:gap-12">
            <ProjectList
              projects={displayProjects}
              selectedId={selectedProject.id}
              onSelect={selectProject}
            />

            <ProjectViewer
              project={selectedProject}
              images={images}
              activeIndex={activeImageIndex}
              onOpenLightbox={() => setIsLightboxOpen(true)}
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
        )}
      </section>

      <Footer />

      {/* LIGHTBOX
          Needs two small additions in light_box.tsx:
            initialIndex?: number          -> image to open on
            onIndexChange?: (i: number) => void -> called when the user moves
          so the page stays in sync with what was last viewed. */}
      {isLightboxOpen && selectedProject && (
        <Lightbox
          project={selectedProject}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </main>
  );
}