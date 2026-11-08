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
  categories: string[];
  year: string;
  yearValue: number | null;
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

type SortKey =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "year-desc"
  | "year-asc"
  | "location-asc"
  | "category-asc";

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

const CORE_CATEGORIES = [
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização",
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Destaque" },
  { value: "name-asc", label: "Nome (A–Z)" },
  { value: "name-desc", label: "Nome (Z–A)" },
  { value: "year-desc", label: "Ano (mais recente)" },
  { value: "year-asc", label: "Ano (mais antigo)" },
  { value: "location-asc", label: "Localização (A–Z)" },
  { value: "category-asc", label: "Categoria (A–Z)" },
];

const normalizeCategory = (category: string) =>
  category
    .trim()
    .toLocaleLowerCase("pt-PT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Supports both individual categories and projects
 * containing multiple categories.
 *
 * Examples:
 * "Arquitectura"
 * "Arquitectura, Engenharia"
 * "Arquitectura; Engenharia; Construção"
 */
const parseCategories = (category: string): string[] => {
  if (!category?.trim()) return [];

  return [
    ...new Set(
      category
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
};

const isResidential = (categories: string[]) =>
  categories.some((category) =>
    RESIDENTIAL_CATEGORIES.includes(
      normalizeCategory(category),
    ),
  );

const isIntegrated = (categories: string[]) => {
  const normalized = categories.map(normalizeCategory);

  return CORE_CATEGORIES.every((category) =>
    normalized.includes(normalizeCategory(category)),
  );
};

const matchesCategory = (
  projectCategories: string[],
  activeCategory: string,
) => {
  const active = normalizeCategory(activeCategory);

  if (active === "todos") return true;

  if (active === "multidisciplinar") {
    return isIntegrated(projectCategories);
  }

  if (active === "residencial") {
    return isResidential(projectCategories);
  }

  return projectCategories.some(
    (category) =>
      normalizeCategory(category) === active,
  );
};

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

// Accent-insensitive, case-insensitive, and "Torre 2" < "Torre 10".
const collator = new Intl.Collator("pt-PT", {
  sensitivity: "base",
  numeric: true,
});

// Empty values always go last, whatever the direction.
const compareText = (a: string, b: string) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  return collator.compare(a, b);
};

const compareYear = (
  a: number | null,
  b: number | null,
  direction: 1 | -1,
) => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;

  return (a - b) * direction;
};

const sortProjects = (
  list: DisplayProject[],
  key: SortKey,
): DisplayProject[] => {
  // "featured" keeps the order already set by featured + display_order.
  if (key === "featured") return list;

  return [...list].sort((a, b) => {
    let result = 0;

    switch (key) {
      case "name-asc":
        result = compareText(a.name, b.name);
        break;
      case "name-desc":
        result = compareText(b.name, a.name);
        break;
      case "year-desc":
        result = compareYear(a.yearValue, b.yearValue, -1);
        break;
      case "year-asc":
        result = compareYear(a.yearValue, b.yearValue, 1);
        break;
      case "location-asc":
        result = compareText(a.location, b.location);
        break;
      case "category-asc":
        result = compareText(a.category, b.category);
        break;
    }

    // Ties fall back to name so the order is predictable.
    return result !== 0
      ? result
      : compareText(a.name, b.name);
  });
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

export default function ProjectsPage({
  projects: initialProjects,
  projectId,
}: PortfolioClientProps) {
  const projects = Array.isArray(initialProjects)
    ? initialProjects
    : [];

  const [activeCategory, setActiveCategory] =
    useState("Todos");

  const [sortKey, setSortKey] =
    useState<SortKey>("featured");

  const [selectedProject, setSelectedProject] =
    useState<DisplayProject | null>(null);

  const [isContactOpen, setIsContactOpen] =
    useState(false);

  const contactTriggerRef =
    useRef<HTMLButtonElement>(null);

  const contactDialogRef =
    useRef<HTMLDivElement>(null);

  const contactCloseRef =
    useRef<HTMLButtonElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Prepare projects                                                         */
  /* ------------------------------------------------------------------------ */

  const displayProjects = useMemo<DisplayProject[]>(() => {
    return projects
      .filter(Boolean)
      .sort((a, b) => {
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }

        return (
          (a.display_order ?? 0) -
          (b.display_order ?? 0)
        );
      })
      .map((project) => {
        const categories = parseCategories(
          project.category ?? "",
        );

        const images = [
          project.cover_image,
          ...(project.gallery ?? []),
        ].filter(
          (image): image is string =>
            typeof image === "string" &&
            Boolean(image.trim()),
        );

        return {
          id: project.slug || project.id,
          name: project.name,
          category: project.category,
          categories,
          year: project.year
            ? String(project.year)
            : "",
          yearValue: project.year ?? null,
          location: project.location ?? "",
          summary:
            project.summary ??
            project.description ??
            "",
          description:
            project.description ??
            project.summary ??
            "",
          images: [...new Set(images)],
          featured: project.featured,
        };
      });
  }, [projects]);

  /* ------------------------------------------------------------------------ */
  /* Dynamic categories                                                       */
  /* ------------------------------------------------------------------------ */

  const categories = useMemo(() => {
    const available = new Map<string, string>();

    displayProjects.forEach((project) => {
      project.categories.forEach((category) => {
        const key = normalizeCategory(category);

        if (key && !available.has(key)) {
          available.set(key, category);
        }
      });
    });

    const availableCategories = [
      ...available.values(),
    ];

    const hasResidential = displayProjects.some(
      (project) => isResidential(project.categories),
    );

    const hasIntegrated = displayProjects.some(
      (project) => isIntegrated(project.categories),
    );

    const ordered = CATEGORIES.filter((category) => {
      if (category === "Residencial") {
        return hasResidential;
      }

      return available.has(normalizeCategory(category));
    });

    const additional = availableCategories.filter(
      (category) =>
        !CATEGORIES.some(
          (known) =>
            normalizeCategory(known) ===
            normalizeCategory(category),
        ) &&
        !RESIDENTIAL_CATEGORIES.includes(
          normalizeCategory(category),
        ),
    );

    return [
      "Todos",
      ...ordered,
      ...(hasIntegrated ? ["Multidisciplinar"] : []),
      ...additional,
    ];
  }, [displayProjects]);

  /* ------------------------------------------------------------------------ */
  /* Filtering and sorting                                                    */
  /* ------------------------------------------------------------------------ */

  const filteredProjects = useMemo(() => {
    if (activeCategory === "Todos") {
      return displayProjects;
    }

    return displayProjects.filter((project) =>
      matchesCategory(
        project.categories,
        activeCategory,
      ),
    );
  }, [displayProjects, activeCategory]);

  const sortedProjects = useMemo(
    () => sortProjects(filteredProjects, sortKey),
    [filteredProjects, sortKey],
  );

  // The large lead card only makes sense in the default
  // "Destaque" order. In any other order every card is equal.
  const hasLead =
    sortKey === "featured" && sortedProjects.length > 1;

  const getCategoryCount = useCallback(
    (category: string) => {
      if (category === "Todos") {
        return displayProjects.length;
      }

      return displayProjects.filter((project) =>
        matchesCategory(
          project.categories,
          category,
        ),
      ).length;
    },
    [displayProjects],
  );

  /* ------------------------------------------------------------------------ */
  /* Gallery navigation                                                       */
  /* ------------------------------------------------------------------------ */

  const openGallery = useCallback(
    (id: string) => {
      const project = displayProjects.find(
        (item) => item.id === id,
      );

      if (!project) return;

      setSelectedProject(project);

      const url = `/projects/${encodeURIComponent(id)}`;

      window.history.pushState(
        {
          ...(window.history.state ?? {}),
          portfolioGallery: true,
        },
        "",
        url,
      );
    },
    [displayProjects],
  );

  const closeGallery = useCallback(() => {
    if (window.history.state?.portfolioGallery) {
      window.history.back();
      return;
    }

    setSelectedProject(null);

    window.history.replaceState(
      null,
      "",
      "/projects",
    );
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Browser navigation                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const prefix = "/projects/";

      if (pathname.startsWith(prefix)) {
        const slug = decodeURIComponent(
          pathname.slice(prefix.length),
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
      window.removeEventListener(
        "popstate",
        handlePopState,
      );
    };
  }, [displayProjects]);

  /* ------------------------------------------------------------------------ */
  /* Direct project URL                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!projectId) return;

    const project = displayProjects.find(
      (item) => item.id === projectId,
    );

    setSelectedProject(project ?? null);
  }, [projectId, displayProjects]);

  /* ------------------------------------------------------------------------ */
  /* Gallery scroll and keyboard                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedProject) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGallery();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
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

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
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

      const elements = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (!first || !last) return;

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);

      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );

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
      {/* HERO                                                               */}
      {/* ------------------------------------------------------------------ */}

      <section
        id="portfolio-projects"
        className="relative overflow-hidden bg-navy px-6 pb-16 pt-32 text-white md:px-12 md:pb-20 md:pt-40 lg:px-16"
      >
        {/* Decorative background */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 size-[500px] rounded-full border border-white/[0.07] md:size-[700px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-[400px] rounded-full border border-gold/20 md:size-[600px]"
        />

        <div className="relative mx-auto w-full max-w-[1600px]">
          <div className="max-w-4xl">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
              PRO SOTA
              <span className="h-px w-8 bg-gold/60" />
              Portfólio
            </p>

            <h1 className="text-[clamp(2.75rem,5.5vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
              Projectos
              <span className="text-gold">.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-white/65 md:text-lg md:leading-8">
              Uma selecção de projectos que reflectem a
              nossa experiência, visão e compromisso com a
              arquitectura, engenharia e construção.
            </p>
          </div>

          {/* Hero bottom information */}

          <div className="mt-14 flex items-center justify-between border-t border-white/15 pt-6 md:mt-20">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
              Angola · Desde 1997
            </span>

            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold">
              Explorar portfólio
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CATEGORY FILTERS + SORT                                            */}
      {/* ------------------------------------------------------------------ */}

      <section className="bg-paper">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-12 lg:px-16">
          <div className="border-b border-navy/15">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between md:gap-5">
              <div
                role="group"
                aria-label="Filtrar projectos por categoria"
                className="-mx-6 flex gap-7 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:gap-x-8 md:gap-y-1 md:overflow-visible md:px-0"
              >
                {categories.map((category) => {
                  const isActive =
                    activeCategory === category;

                  const count =
                    getCategoryCount(category);

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setActiveCategory(category)
                      }
                      aria-pressed={isActive}
                      className={`group -mb-px flex shrink-0 items-center gap-2 border-b-2 py-5 text-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${isActive
                        ? "border-gold text-navy"
                        : "border-transparent text-navy/50 hover:text-navy"
                        }`}
                    >
                      {category}

                      <span
                        className={`text-[10px] tabular-nums transition-colors ${isActive
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

              {/* Count + sort */}

              <div className="flex shrink-0 items-center justify-between gap-4 pb-4 pt-1 md:justify-end md:gap-6 md:pb-4 md:pt-0">
                <p
                  className="text-xs text-gray-400"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  A mostrar{" "}
                  <span className="font-semibold text-navy">
                    {sortedProjects.length}
                  </span>{" "}
                  {sortedProjects.length === 1
                    ? "projecto"
                    : "projectos"}
                </p>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="portfolio-sort"
                    className="sr-only text-xs text-gray-400 sm:not-sr-only"
                  >
                    Ordenar por
                  </label>

                  <div className="relative">
                    <select
                      id="portfolio-sort"
                      value={sortKey}
                      onChange={(event) =>
                        setSortKey(
                          event.target.value as SortKey,
                        )
                      }
                      className="appearance-none border border-navy/15 bg-transparent py-2 pl-3 pr-9 text-sm font-medium text-navy transition-colors hover:border-navy/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy/50"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PROJECT GRID                                                       */}
      {/* ------------------------------------------------------------------ */}

      <section className="mx-auto w-full max-w-[1600px] px-6 pb-24 pt-14 md:px-12 md:pb-32 md:pt-20 lg:px-16">
        {sortedProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-y-16 lg:gap-x-8 lg:gap-y-20 xl:grid-cols-12">

            {sortedProjects.map((project, index) => {
              const isLead = hasLead && index === 0;
              const cover = project.images[0];

              return (
                <article
                  key={project.id}
                  className={`group min-w-0 ${isLead
                      ? "sm:col-span-2 xl:col-span-8"
                      : "xl:col-span-4"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => openGallery(project.id)}
                    aria-label={`Ver projecto ${project.name}`}
                    className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  >
                    {/* PROJECT IMAGE */}

                    <div
                      className={`relative isolate overflow-hidden bg-stone/40 ${isLead
                          ? "aspect-[4/5] sm:aspect-[16/9]"
                          : "aspect-[4/5] sm:aspect-[4/3]"
                        }`}
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={project.name}
                          loading={index === 0 ? "eager" : "lazy"}
                          fetchPriority={index === 0 ? "high" : "auto"}
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-semibold tracking-[0.25em] text-navy/30">
                            PRO SOTA
                          </span>
                        </div>
                      )}

                      {/* Image overlay */}

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-80"
                      />

                      {/* Featured label */}

                      {project.featured && (
                        <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
                          <span className="border border-white/40 bg-navy/30 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                            Projecto em destaque
                          </span>
                        </div>
                      )}

                      {/* Category */}

                      <div className="absolute bottom-5 left-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:bottom-7 sm:left-7">
                        <span className="h-px w-7 bg-gold" />
                        {project.category}
                      </div>

                      {/* View icon */}

                      <div className="absolute right-5 top-5 flex size-11 translate-y-2 items-center justify-center rounded-full bg-white text-navy opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:right-7 sm:top-7">
                        <svg
                          width="19"
                          height="19"
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

                    {/* PROJECT INFORMATION */}

                    <div className="mt-5">
                      {/* Metadata */}

                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                          {project.category}
                        </span>

                        <span className="text-[11px] font-medium tracking-wide text-gray-400">
                          {[
                            project.location,
                            project.year,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>

                      {/* Title and arrow */}

                      <div className="flex items-start justify-between gap-4">
                        <h2
                          className={`font-semibold leading-tight tracking-[-0.035em] text-navy transition-colors duration-300 group-hover:text-gold-deep ${isLead
                              ? "text-2xl sm:text-3xl lg:text-4xl"
                              : "text-2xl"
                            }`}
                        >
                          {project.name}
                        </h2>

                        <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-navy/10 text-navy/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:border-gold group-hover:text-gold">
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
                            <path d="M7 17 17 7M7 7h10v10" />
                          </svg>
                        </span>
                      </div>

                      {/* Description */}

                      {project.summary && (
                        <p
                          className={`mt-3 max-w-2xl text-gray-400 ${isLead
                              ? "text-base leading-7"
                              : "line-clamp-2 text-base leading-7 sm:text-sm sm:leading-6"
                            }`}
                        >
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
          <div className="flex min-h-72 flex-col items-center justify-center py-20 text-center">
            <span className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
              PRO SOTA
            </span>

            <h2 className="text-xl font-semibold tracking-tight">
              Não foram encontrados projectos
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
              Não existem projectos nesta categoria.
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

      {/*  <section className="bg-white">
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
                Da concepção arquitectónica à execução,
                estamos preparados para transformar a sua
                ideia num projecto concreto.
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
      </section> */}

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
      {/* 
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
        </div> }*/
      }
    </main>
  );
}