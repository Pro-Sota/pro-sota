"use client";

import { useMemo, useState } from "react";

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
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProjectsPage({
  projects: initialProjects,
  projectId,
}: PortfolioClientProps) {
  const projects = Array.isArray(initialProjects) ? initialProjects : [];

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
    () => projectId ?? projects[0]?.slug ?? projects[0]?.id ?? null,
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const selectedProject =
    displayProjects.find((project) => project.id === selectedId) ??
    displayProjects[0] ??
    null;

  const images = selectedProject?.images ?? [];
  const activeImage = images[activeImageIndex] ?? null;

  /* ------------------------------------------------------------------------ */
  /* Project selection                                                        */
  /* ------------------------------------------------------------------------ */

  const selectProject = (id: string) => {
    setSelectedId(id);
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
  };

  /* ------------------------------------------------------------------------ */
  /* Image navigation                                                         */
  /* ------------------------------------------------------------------------ */

  const showNextImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex((current) => (current + 1) % images.length);
  };

  const showPreviousImage = () => {
    if (images.length <= 1) return;
    setActiveImageIndex(
      (current) => (current - 1 + images.length) % images.length,
    );
  };

  const selectImage = (index: number) => {
    setActiveImageIndex(index);
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7F5] text-[#002950]">
      <Nav />

      {/* On lg+ the section is exactly one screen tall (nav clearance comes
          from the top padding), so scrolling reveals only the footer. */}
      <section className="mx-auto flex w-full max-w-[1800px] flex-col px-5 pb-12 pt-28 sm:px-8 md:px-10 md:pt-32 lg:h-[100dvh] lg:min-h-[640px] lg:px-12 lg:pb-8">
        {/* ---------------------------------------------------------------- */}
        {/* PAGE HEADER                                                      */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-8 flex shrink-0 items-end justify-between border-b border-[#002950]/15 pb-5 md:mb-10 lg:mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
              Projectos<span className="text-[#BD9655]">.</span>
            </h1>
          </div>

          <span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-[#002950]/40 sm:block">
            Portfólio
          </span>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* EMPTY STATE                                                      */}
        {/* ---------------------------------------------------------------- */}

        {displayProjects.length === 0 ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center lg:min-h-0 lg:flex-1">
            <span className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#BD9655]">
              PRO SOTA
            </span>

            <h2 className="text-2xl font-semibold">
              Projectos em actualização
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-[#002950]/50">
              Estamos a preparar a apresentação dos nossos projectos. Volte em
              breve.
            </p>
          </div>
        ) : (
          selectedProject && (
            /* ------------------------------------------------------------ */
            /* THREE COLUMN PROJECT EXPLORER                                */
            /* ------------------------------------------------------------ */

            <div className="grid grid-cols-1 gap-9 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(190px,0.72fr)_minmax(0,1.8fr)_minmax(270px,0.95fr)] lg:grid-rows-1 lg:gap-8 xl:gap-12">
              {/* ======================================================== */}
              {/* COLUMN 1 — PROJECT LIST                                  */}
              {/* ======================================================== */}

              <aside className="flex min-w-0 flex-col lg:h-full lg:min-h-0">
                <div className="mb-5 flex shrink-0 items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#002950]/55">
                    Projectos
                  </p>

                  <span className="text-[10px] tabular-nums text-[#002950]/40">
                    {String(displayProjects.length).padStart(2, "0")}
                  </span>
                </div>

                <div
                  role="list"
                  aria-label="Lista de projectos"
                  className="flex gap-3 overflow-x-auto pb-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-0 lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0"
                >
                  {displayProjects.map((project, index) => {
                    const isActive = selectedProject.id === project.id;

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => selectProject(project.id)}
                        aria-pressed={isActive}
                        className={`group relative flex min-w-[190px] shrink-0 flex-col border-b py-4 text-left transition-all duration-300 lg:min-w-0 lg:py-5 ${isActive
                          ? "border-[#BD9655]"
                          : "border-[#002950]/10 hover:border-[#002950]/40"
                          }`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className={`text-[10px] tabular-nums transition-colors ${isActive
                              ? "text-[#BD9655]"
                              : "text-[#002950]/35"
                              }`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {isActive && (
                            <span className="size-1.5 rounded-full bg-[#BD9655]" />
                          )}
                        </div>

                        <h2
                          className={`text-sm font-semibold leading-snug tracking-[-0.02em] transition-colors ${isActive
                            ? "text-[#002950]"
                            : "text-[#002950]/50 group-hover:text-[#002950]"
                            }`}
                        >
                          {project.name}
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[9px] uppercase tracking-[0.12em] text-[#002950]/40">
                            {project.category}
                          </span>

                          {project.year && (
                            <>
                              <span className="text-[#BD9655]/60">·</span>

                              <span className="text-[9px] text-[#002950]/40">
                                {project.year}
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* ======================================================== */}
              {/* COLUMN 2 — MAIN PROJECT IMAGE                            */}
              {/* ======================================================== */}

              <div className="flex min-w-0 flex-col lg:h-full lg:min-h-0">
                <div className="mb-4 flex shrink-0 items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#002950]/50">
                    Imagem principal
                  </p>

                  <span className="text-[10px] tabular-nums text-[#002950]/40">
                    {String(activeImageIndex + 1).padStart(2, "0")}
                    {" / "}
                    {String(images.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="group relative overflow-hidden bg-[#EAE9E4] lg:min-h-0 lg:flex-1">
                  {activeImage ? (
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      aria-label={`Ampliar imagem de ${selectedProject.name}`}
                      className="relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-[#EAE9E4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BD9655] sm:aspect-[16/11] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
                    >
                      <img
                        key={activeImage}
                        src={activeImage}
                        alt={`${selectedProject.name} — imagem ${activeImageIndex + 1}`}
                        className="absolute inset-0 size-full object-cover transition-opacity duration-500"
                        loading="eager"
                        draggable={false}
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#002950]/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <span className="absolute bottom-5 right-5 flex size-10 items-center justify-center rounded-full border border-white/60 bg-[#002950]/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M15 3h6v6M14 10l7-7M9 21H3v-6m0 6 7-7" />
                        </svg>
                      </span>
                    </button>
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center sm:aspect-[16/11] lg:absolute lg:inset-0 lg:aspect-auto">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#002950]/25">
                        PRO SOTA
                      </span>
                    </div>
                  )}
                </div>

                {/* Main image footer */}

                <div className="mt-4 flex shrink-0 items-center justify-between border-b border-[#002950]/15 pb-4">
                  <div>
                    <p className="text-xs font-semibold text-[#002950]">
                      {selectedProject.name}
                    </p>

                    <p className="mt-1 text-[10px] text-[#002950]/45">
                      {selectedProject.location}
                    </p>
                  </div>

                  <span className="text-[9px] uppercase tracking-[0.14em] text-[#BD9655]">
                    PRO SOTA
                  </span>
                </div>
              </div>

              {/* ======================================================== */}
              {/* COLUMN 3 — DESCRIPTION + IMAGE GALLERY                   */}
              {/* ======================================================== */}

              <aside className="flex min-w-0 flex-col gap-10 lg:h-full lg:min-h-0 lg:gap-6">
                {/* ------------------------------------------------------ */}
                {/* TOP — PROJECT DESCRIPTION (scrolls if too long)        */}
                {/* ------------------------------------------------------ */}

                <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
                  <div className="mb-6 flex items-center justify-between border-b border-[#002950]/15 pb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#002950]/50">
                      Sobre o projecto
                    </p>

                    {selectedProject.featured && (
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#BD9655]">
                        Destaque
                      </span>
                    )}
                  </div>

                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BD9655]">
                    {selectedProject.category}
                  </p>

                  <h2 className="text-2xl font-semibold leading-[1.08] tracking-[-0.045em] text-[#002950] sm:text-3xl lg:text-[clamp(25px,2.2vw,38px)]">
                    {selectedProject.name}
                    <span className="text-[#BD9655]">.</span>
                  </h2>

                  {/* Location and year */}

                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 border-y border-[#002950]/10 py-4">
                    {selectedProject.location && (
                      <div>
                        <p className="mb-1 text-[9px] uppercase tracking-[0.13em] text-[#002950]/40">
                          Localização
                        </p>

                        <p className="text-xs font-medium text-[#002950]">
                          {selectedProject.location}
                        </p>
                      </div>
                    )}

                    {selectedProject.year && (
                      <div>
                        <p className="mb-1 text-[9px] uppercase tracking-[0.13em] text-[#002950]/40">
                          Ano
                        </p>

                        <p className="text-xs font-medium text-[#002950]">
                          {selectedProject.year}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {/* Description */}
                  <div className="mt-6 w-full">
                    <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#002950]/45">
                      Descrição
                    </p>

                    <p className="w-full whitespace-normal break-words text-sm leading-[1.9] text-[#002950]/65">
                      {selectedProject.description ||
                        selectedProject.summary ||
                        "Informações sobre este projecto serão disponibilizadas brevemente."}
                    </p>
                  </div>
                </div>

                {/* ------------------------------------------------------ */}
                {/* BOTTOM — PROJECT GALLERY (pinned to the bottom)        */}
                {/* ------------------------------------------------------ */}

                <div className="min-w-0 shrink-0 border-t border-[#002950]/15 pt-5">
                  {/* Gallery header */}

                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#002950]/55">
                        Galeria
                      </p>

                      <p className="mt-1 text-[10px] text-[#002950]/40">
                        {images.length}{" "}
                        {images.length === 1 ? "imagem" : "imagens"}
                      </p>
                    </div>

                    {/* Previous / Next */}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={showPreviousImage}
                        disabled={images.length <= 1}
                        aria-label="Imagem anterior"
                        className="flex size-9 items-center justify-center border border-[#002950]/15 text-[#002950] transition-all hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                      >
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
                      </button>

                      <button
                        type="button"
                        onClick={showNextImage}
                        disabled={images.length <= 1}
                        aria-label="Imagem seguinte"
                        className="flex size-9 items-center justify-center border border-[#002950]/15 text-[#002950] transition-all hover:border-[#BD9655] hover:bg-[#BD9655] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                      >
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
                      </button>
                    </div>
                  </div>

                  {/* Gallery thumbnails */}

                  {images.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {images.map((image, index) => {
                        const isActive = index === activeImageIndex;

                        return (
                          <button
                            key={`${selectedProject.id}-${image}-${index}`}
                            type="button"
                            onClick={() => selectImage(index)}
                            aria-label={`Ver imagem ${index + 1}`}
                            aria-pressed={isActive}
                            className={`group relative w-[105px] shrink-0 overflow-hidden border-2 transition-all duration-300 sm:w-[115px] ${isActive
                              ? "border-[#BD9655]"
                              : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-[#EAE9E4]">
                              <img
                                src={image}
                                alt={`${selectedProject.name} — miniatura ${index + 1}`}
                                loading="lazy"
                                draggable={false}
                                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>

                            {isActive && (
                              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#BD9655]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="py-6 text-xs text-[#002950]/40">
                      Não existem imagens disponíveis.
                    </p>
                  )}

                  {/* Gallery counter */}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.12em] text-[#002950]/40">
                      Explorar imagens
                    </span>

                    <span className="text-[10px] tabular-nums text-[#002950]/55">
                      {String(activeImageIndex + 1).padStart(2, "0")}
                      {" — "}
                      {String(images.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          )
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <Footer />

      {/* ------------------------------------------------------------------ */}
      {/* LIGHTBOX                                                           */}
      {/* ------------------------------------------------------------------ */}

      {isLightboxOpen && selectedProject && (
        <Lightbox
          project={selectedProject}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </main>
  );
}