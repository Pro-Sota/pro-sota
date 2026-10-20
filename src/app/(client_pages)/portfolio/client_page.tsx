"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Nav from "../components/nav";
import Footer from "../components/footer";
import PortfolioGrid from "../components/portfolio_grid";
import Lightbox from "../components/light_box";
import Contact from "../components/contact";

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
};

type PortfolioClientProps = {
  projects: PortfolioProject[];
  projectId?: string;
};

const CATEGORIES = [
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização",
];

const normalizeCategory = (category: string) =>
  category
    .trim()
    .toLocaleLowerCase("pt-PT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function PortfolioClient({
  projects,
  projectId,
}: PortfolioClientProps) {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] =
    useState<DisplayProject | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const displayProjects = useMemo<DisplayProject[]>(() => {
    return projects
      .filter((project) => project.status === "published")
      .map((project) => {
        const images = [
          project.cover_image,
          ...(project.gallery ?? []),
        ].filter((image): image is string => Boolean(image?.trim()));

        return {
          id: project.slug || project.id,
          name: project.name,
          category: project.category,
          year: project.year ? String(project.year) : "",
          location: project.location ?? "",
          summary: project.summary ?? project.description ?? "",
          description: project.description ?? project.summary ?? "",
          images: [...new Set(images)],
        };
      })
      .sort((a, b) => {
        const projectA = projects.find(
          (project) => (project.slug || project.id) === a.id,
        );
        const projectB = projects.find(
          (project) => (project.slug || project.id) === b.id,
        );

        return (
          (projectA?.display_order ?? 0) -
          (projectB?.display_order ?? 0)
        );
      });
  }, [projects]);

  const categories = useMemo(() => {
    const availableCategories = new Set(
      displayProjects
        .map((project) => project.category.trim())
        .filter(Boolean),
    );

    const orderedCategories = CATEGORIES.filter((category) =>
      [...availableCategories].some(
        (available) =>
          normalizeCategory(available) === normalizeCategory(category),
      ),
    );

    const additionalCategories = [...availableCategories].filter(
      (category) =>
        !CATEGORIES.some(
          (known) =>
            normalizeCategory(known) === normalizeCategory(category),
        ),
    );

    return ["Todos", ...orderedCategories, ...additionalCategories];
  }, [displayProjects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-PT");

    return displayProjects.filter((project) => {
      const matchesCategory =
        activeCategory === "Todos" ||
        normalizeCategory(project.category) ===
          normalizeCategory(activeCategory);

      const searchableText = [
        project.name,
        project.category,
        project.location,
        project.summary,
        project.description,
        project.year,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-PT");

      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [displayProjects, activeCategory, search]);

  const openGallery = useCallback(
    (id: string) => {
      const project = displayProjects.find((item) => item.id === id);

      if (!project) return;

      setSelectedProject(project);
      window.history.replaceState(
        null,
        "",
        `/portfolio/${encodeURIComponent(id)}`,
      );
    },
    [displayProjects],
  );

  const closeGallery = useCallback(() => {
    setSelectedProject(null);
    window.history.replaceState(null, "", "/portfolio");
  }, []);

  useEffect(() => {
    if (!projectId || displayProjects.length === 0) return;

    const project = displayProjects.find(
      (item) => item.id === projectId,
    );

    if (project) {
      setSelectedProject(project);
    }
  }, [projectId, displayProjects]);

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

  const handleContactClick = useCallback(() => {
    setIsContactOpen(true);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] text-[#002950]">
      <Nav />

      <section className="relative isolate overflow-hidden bg-[#002950] text-white">
        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#bd9655]/70 to-transparent" />

        <div className="mx-auto grid min-h-[420px] max-w-7xl items-end gap-12 px-5 pb-16 pt-28 sm:px-8 sm:pb-20 md:min-h-[500px] md:grid-cols-[1.3fr_0.7fr] md:items-center md:pt-32 lg:px-12">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-[#bd9655]" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d6b77f]">
                PRO SOTA · Portefólio
              </p>
            </div>

            <h1 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Projectos que
              <span className="block text-[#d6b77f]">
                definem espaços.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              Uma selecção de projectos que reflecte a nossa abordagem à
              arquitectura, engenharia e construção, com rigor em cada
              detalhe.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("portfolio-projects")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#bd9655] px-6 py-3 text-sm font-semibold text-[#002950] transition-colors hover:bg-[#d6b77f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#002950]"
              >
                Explorar projectos
                <span aria-hidden="true">↘</span>
              </button>

              <button
                type="button"
                onClick={handleContactClick}
                className="inline-flex min-h-12 items-center gap-2 border-b border-white/40 px-1 py-3 text-sm font-medium text-white transition-colors hover:border-[#d6b77f] hover:text-[#d6b77f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Fale connosco
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="ml-auto max-w-xs border-l border-white/20 pl-7">
              <p className="text-5xl font-light tracking-tight text-[#d6b77f]">
                {String(displayProjects.length).padStart(2, "0")}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Projectos publicados no nosso portefólio.
              </p>
              <div className="mt-8 h-px w-full bg-white/15" />
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/50">
                Pensar · Projectar · Construir
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="portfolio-projects"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
      >
        <div className="flex flex-col justify-between gap-8 border-b border-[#002950]/15 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#a77d3f]">
              O nosso trabalho
            </p>
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Portefólio de projectos
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#002950]/65 sm:text-base">
              Explore os projectos por área de intervenção ou encontre um
              projecto específico.
            </p>
          </div>

          <p className="shrink-0 text-sm text-[#002950]/60">
            <span className="font-semibold text-[#002950]">
              {filteredProjects.length}
            </span>{" "}
            {filteredProjects.length === 1 ? "projecto" : "projectos"}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="flex flex-wrap gap-2"
            aria-label="Filtrar projectos por categoria"
          >
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={isActive}
                  className={`min-h-10 border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9655] focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-[#002950] bg-[#002950] text-white"
                      : "border-[#002950]/15 bg-transparent text-[#002950]/75 hover:border-[#002950]/50 hover:text-[#002950]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <label className="relative block w-full lg:max-w-xs">
            <span className="sr-only">Pesquisar projectos</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-lg text-[#002950]/50"
            >
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar projectos..."
              className="min-h-11 w-full border-0 border-b border-[#002950]/25 bg-transparent py-3 pl-7 pr-3 text-sm text-[#002950] outline-none transition-colors placeholder:text-[#002950]/45 focus:border-[#bd9655] focus:ring-0"
            />
          </label>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="mt-10">
            <PortfolioGrid
              projects={filteredProjects}
              onOpen={openGallery}
            />
          </div>
        ) : (
          <div className="mt-10 flex min-h-64 flex-col items-center justify-center border border-dashed border-[#002950]/20 px-6 py-14 text-center">
            <span
              aria-hidden="true"
              className="text-3xl font-light text-[#bd9655]"
            >
              00
            </span>
            <h3 className="mt-4 text-lg font-medium">
              Não foram encontrados projectos
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#002950]/60">
              Experimente outra categoria ou altere os termos de pesquisa.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("Todos");
                setSearch("");
              }}
              className="mt-6 border-b border-[#bd9655] pb-1 text-sm font-semibold text-[#002950] transition-colors hover:text-[#8a672f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9655]"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1fr_auto] md:items-center lg:px-12">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#a77d3f]">
              Vamos trabalhar juntos
            </p>
            <h2 className="max-w-2xl text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Tem um projecto em mente?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#002950]/65 sm:text-base">
              Partilhe connosco a sua ideia. A nossa equipa está preparada
              para o ajudar a transformar a visão em realidade.
            </p>
          </div>

          <button
            type="button"
            onClick={handleContactClick}
            className="inline-flex min-h-12 items-center justify-center gap-4 self-start bg-[#002950] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#06416f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9655] focus-visible:ring-offset-2 md:self-center"
          >
            Iniciar conversa
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>

      <Contact />

      <Footer />

      {selectedProject && (
        <Lightbox
          project={selectedProject}
          onClose={closeGallery}
        />
      )}

      {isContactOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00172d]/80 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsContactOpen(false);
            }
          }}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-[#f7f7f5] p-5 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-contact-title"
          >
            <button
              type="button"
              onClick={() => setIsContactOpen(false)}
              aria-label="Fechar contacto"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center text-2xl text-[#002950]/70 transition-colors hover:text-[#bd9655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd9655]"
            >
              ×
            </button>

            <div className="mb-5 pr-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a77d3f]">
                PRO SOTA
              </p>
              <h2
                id="portfolio-contact-title"
                className="mt-2 text-2xl font-medium text-[#002950]"
              >
                Fale connosco
              </h2>
            </div>

            <Contact />
          </div>
        </div>
      )}
    </main>
  );
}