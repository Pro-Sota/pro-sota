
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Nav from "../components/nav";
import Footer from "../components/footer";
import Lightbox from "../components/light_box";
import Contact from "../components/contact_page";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type PortfolioProject = {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string | null;
  year: number | null;
  summary?: string | null;
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
  year: string;
  location: string;
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
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  "Residencial",
  "Residencial multifamiliar",
  "Residencial unifamiliar",
  "Comercial",
  "Hotelaria",
  "Uso misto",
  "Equipamentos públicos",
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização",
];

const RESIDENTIAL_CATEGORIES = [
  "residencial",
  "residencial multifamiliar",
  "residencial unifamiliar",
];

const normalizeCategory = (category: string) =>
  category
    .trim()
    .toLocaleLowerCase("pt-PT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const matchesCategory = (
  projectCategory: string,
  activeCategory: string,
) => {
  const projectKey = normalizeCategory(projectCategory);
  const activeKey = normalizeCategory(activeCategory);

  if (activeKey === "residencial") {
    return RESIDENTIAL_CATEGORIES.includes(projectKey);
  }

  return projectKey === activeKey;
};

/* -------------------------------------------------------------------------- */
/* Editorial layouts                                                          */
/* -------------------------------------------------------------------------- */

const LAYOUTS = [
  {
    wrapper: "md:col-span-7",
    image: "aspect-[4/3]",
  },
  {
    wrapper: "md:col-span-5 md:mt-24",
    image: "aspect-[4/5]",
  },
  {
    wrapper: "md:col-span-5 md:mt-4",
    image: "aspect-[4/5]",
  },
  {
    wrapper: "md:col-span-7 md:mt-28",
    image: "aspect-[4/3]",
  },
  {
    wrapper: "md:col-span-4",
    image: "aspect-[4/5]",
  },
  {
    wrapper: "md:col-span-8 md:mt-24",
    image: "aspect-[16/9]",
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PortfolioClient({
  projects,
  projectId,
}: PortfolioClientProps) {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProject, setSelectedProject] =
    useState<DisplayProject | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const contactTriggerRef = useRef<HTMLButtonElement>(null);
  const contactDialogRef = useRef<HTMLDivElement>(null);
  const contactCloseRef = useRef<HTMLButtonElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Prepare projects                                                         */
  /* ------------------------------------------------------------------------ */

  const displayProjects = useMemo<DisplayProject[]>(() => {
    return projects
      .filter((project) => project.status === "published")
      .sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }

        return a.display_order - b.display_order;
      })
      .map((project) => {
        const images = [
          project.cover_image,
          ...(project.gallery ?? []),
        ].filter((image): image is string =>
          Boolean(image?.trim()),
        );

        return {
          id: project.slug || project.id,
          name: project.name,
          category: project.category,
          year: project.year ? String(project.year) : "",
          location: project.location ?? "",
          summary:
            project.summary ?? project.description ?? "",
          description:
            project.description ?? project.summary ?? "",
          images: [...new Set(images)],
          featured: project.featured,
        };
      });
  }, [projects]);

  /* ------------------------------------------------------------------------ */
  /* Categories                                                               */
  /* ------------------------------------------------------------------------ */

  const categories = useMemo(() => {
    const availableCategories = new Set(
      displayProjects
        .map((project) => project.category.trim())
        .filter(Boolean),
    );

    const hasResidentialProjects = [...availableCategories].some(
      (category) =>
        RESIDENTIAL_CATEGORIES.includes(
          normalizeCategory(category),
        ),
    );

    const orderedCategories = CATEGORIES.filter((category) => {
      if (category === "Residencial") {
        return hasResidentialProjects;
      }

      return [...availableCategories].some(
        (available) =>
          normalizeCategory(available) ===
          normalizeCategory(category),
      );
    });

    const additionalCategories = [...availableCategories].filter(
      (category) =>
        !CATEGORIES.some(
          (known) =>
            normalizeCategory(known) ===
            normalizeCategory(category),
        ),
    );

    return [
      "Todos",
      ...orderedCategories,
      ...additionalCategories,
    ];
  }, [displayProjects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "Todos") {
      return displayProjects;
    }

    return displayProjects.filter((project) =>
      matchesCategory(project.category, activeCategory),
    );
  }, [displayProjects, activeCategory]);

  const getCategoryCount = useCallback(
    (category: string) => {
      if (category === "Todos") {
        return displayProjects.length;
      }

      return displayProjects.filter((project) =>
        matchesCategory(project.category, category),
      ).length;
    },
    [displayProjects],
  );

  /* ------------------------------------------------------------------------ */
  /* Project gallery and URL navigation                                       */
  /* ------------------------------------------------------------------------ */

  const openGallery = useCallback(
    (id: string) => {
      const project = displayProjects.find(
        (item) => item.id === id,
      );

      if (!project) return;

      setSelectedProject(project);

      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          portfolioGallery: true,
        },
        "",
        `/projectos/${encodeURIComponent(id)}`,
      );
    },
    [displayProjects],
  );

  const closeGallery = useCallback(() => {
    setSelectedProject(null);

    if (window.history.state?.portfolioGallery) {
      window.history.back();
    } else {
      window.history.replaceState(
        null,
        "",
        "/projectos",
      );
    }
  }, []);

  // Support browser back and forward navigation.
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const projectPrefix = "/projectos/";

      if (pathname.startsWith(projectPrefix)) {
        const slug = decodeURIComponent(
          pathname.slice(projectPrefix.length),
        );

        const project = displayProjects.find(
          (item) => item.id === slug,
        );

        setSelectedProject(project ?? null);
      } else {
        setSelectedProject(null);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [displayProjects]);

  // Open a project when entering through its direct URL.
  useEffect(() => {
    if (!projectId) return;

    const project = displayProjects.find(
      (item) => item.id === projectId,
    );

    if (project) {
      setSelectedProject(project);
    }
  }, [projectId, displayProjects]);

  // Manage gallery scrolling and keyboard dismissal.
  useEffect(() => {
    if (!selectedProject) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGallery();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject, closeGallery]);

  /* ------------------------------------------------------------------------ */
  /* Contact modal                                                            */
  /* ------------------------------------------------------------------------ */

  const handleContactClick = useCallback(() => {
    setIsContactOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setIsContactOpen(false);
  }, []);

  useEffect(() => {
    if (!isContactOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      contactCloseRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContact();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = contactDialogRef.current;

      if (!dialog) return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);

      contactTriggerRef.current?.focus();
    };
  }, [isContactOpen, closeContact]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen overflow-x-hidden bg-paper text-navy">
      <Nav />

      {/* ------------------------------------------------------------------ */}
      {/* INTRODUCTION + FILTERS                                             */}
      {/* ------------------------------------------------------------------ */}

      <section
        id="portfolio-projects"
        className="mx-auto w-full max-w-[1600px] px-6 pb-20 pt-32 md:px-12 md:pb-28 md:pt-40 lg:px-16"
      >
        {/* Editorial introduction */}
        <div className="max-w-4xl">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-deep">
            PRO SOTA <span className="mx-2 text-navy/30">/</span>
            Portfólio
          </p>

          <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
            Projectos
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg md:leading-8">
            Uma selecção de projectos que reflectem a nossa
            experiência, visão e compromisso com a arquitectura,
            engenharia e construção.
          </p>
        </div>

        {/* Category filters */}
        <div className="mt-12 border-b border-navy/15 md:mt-16">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div
              role="group"
              aria-label="Filtrar projectos por categoria"
              className="-mx-6 flex gap-7 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:gap-x-8 md:gap-y-1 md:overflow-visible md:px-0"
            >
              {categories.map((category) => {
                const isActive = activeCategory === category;
                const count = getCategoryCount(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={isActive}
                    className={`group -mb-px flex shrink-0 items-center gap-2 border-b-2 py-4 text-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                      isActive
                        ? "border-gold text-navy"
                        : "border-transparent text-navy/50 hover:text-navy"
                    }`}
                  >
                    {category}

                    <span
                      className={`text-[10px] tabular-nums transition-colors ${
                        isActive
                          ? "text-gold-deep"
                          : "text-navy/35 group-hover:text-navy/60"
                      }`}
                    >
                      {String(count).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>

            <p
              className="shrink-0 pb-4 text-xs text-gray-400"
              aria-live="polite"
              aria-atomic="true"
            >
              A mostrar{" "}
              <span className="font-semibold text-navy">
                {filteredProjects.length}
              </span>{" "}
              {filteredProjects.length === 1
                ? "projecto"
                : "projectos"}
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* PROJECT GRID                                                     */}
        {/* ---------------------------------------------------------------- */}

        {filteredProjects.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 md:mt-16 md:grid-cols-12 md:gap-y-24 lg:gap-x-10">
            {filteredProjects.map((project, index) => {
              const layout = LAYOUTS[index % LAYOUTS.length];
              const cover = project.images[0];

              return (
                <article
                  key={project.id}
                  className={`min-w-0 ${layout.wrapper}`}
                >
                  <button
                    type="button"
                    onClick={() => openGallery(project.id)}
                    className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                    aria-label={`Ver projecto ${project.name}`}
                  >
                    {/* Image */}
                    <div
                      className={`relative isolate overflow-hidden bg-stone/40 ${layout.image}`}
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={project.name}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-semibold tracking-[0.2em] text-navy/30">
                            PRO SOTA
                          </span>
                        </div>
                      )}

                      {/* Image overlay */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90"
                      />

                      {/* Category */}
                      <div className="absolute bottom-5 left-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-white sm:bottom-7 sm:left-7">
                        <span
                          aria-hidden
                          className="h-px w-7 bg-gold"
                        />
                        {project.category}
                      </div>

                      {/* View indicator */}
                      <div className="absolute right-5 top-5 flex size-10 translate-y-2 items-center justify-center rounded-full bg-white/95 text-navy opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:right-7 sm:top-7">
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
                          <path d="M7 17 17 7M7 7h10v10" />
                        </svg>
                      </div>
                    </div>

                    {/* Project information */}
                    <div className="mt-5 min-w-0">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                          {project.category}
                        </span>

                        <span className="text-xs tabular-nums text-gray-400">
                          {[project.location, project.year]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-xl font-semibold leading-snug tracking-[-0.025em] transition-colors duration-300 group-hover:text-gold-deep sm:text-2xl">
                          {project.name}
                        </h2>

                        <span className="mt-1 shrink-0 text-navy/35 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-gold">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M7 17 17 7M7 7h10v10" />
                          </svg>
                        </span>
                      </div>

                      {project.summary && (
                        <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-gray-400">
                          {project.summary}
                        </p>
                      )}
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="flex min-h-72 flex-col items-center justify-center py-20 text-center">
            <span className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
              PRO SOTA
            </span>

            <h2 className="text-xl font-semibold tracking-tight">
              Não foram encontrados projectos
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
              Não existem projectos publicados nesta categoria.
              Experimente seleccionar outra categoria.
            </p>

            <button
              type="button"
              onClick={() => setActiveCategory("Todos")}
              className="mt-7 border-b border-gold pb-1 text-sm font-semibold transition-colors hover:text-gold-deep"
            >
              Ver todos os projectos
            </button>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CONTACT CTA                                                        */}
      {/* ------------------------------------------------------------------ */}

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-20 md:px-12 md:py-28 lg:px-16">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                Vamos trabalhar juntos
              </p>

              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.045em]">
                Tem um projecto
                <br className="hidden sm:block" />
                {" "}para desenvolver?
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600">
                Da concepção arquitectónica à execução, estamos
                preparados para transformar a sua ideia num
                projecto concreto.
              </p>
            </div>

            <button
              ref={contactTriggerRef}
              type="button"
              onClick={handleContactClick}
              className="group inline-flex h-14 shrink-0 items-center justify-center gap-5 self-start bg-navy px-8 text-sm font-semibold text-white transition-colors duration-300 hover:bg-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:self-end"
            >
              Fale com a nossa equipa

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <Footer />

      {/* ------------------------------------------------------------------ */}
      {/* PROJECT LIGHTBOX                                                   */}
      {/* ------------------------------------------------------------------ */}

      {selectedProject && (
        <Lightbox
          project={selectedProject}
          onClose={closeGallery}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CONTACT MODAL                                                      */}
      {/* ------------------------------------------------------------------ */}

      {isContactOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeContact();
            }
          }}
        >
          <div
            ref={contactDialogRef}
            className="relative my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-paper p-5 shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-contact-title"
          >
            <button
              ref={contactCloseRef}
              type="button"
              onClick={closeContact}
              aria-label="Fechar contacto"
              className="absolute right-4 top-4 flex size-10 items-center justify-center text-2xl text-navy/60 transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              ×
            </button>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
              PRO SOTA
            </p>

            <h2
              id="portfolio-contact-title"
              className="mb-6 pr-10 text-2xl font-semibold tracking-tight text-navy"
            >
              Fale connosco
            </h2>

            <Contact />
          </div>
        </div>
      )}
    </main>
  );
}
