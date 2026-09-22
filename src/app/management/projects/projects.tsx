"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Grid2X2Icon,
  ListIcon,
  MapIcon,
  Plus,
  SearchIcon,
  X,
} from "lucide-react";

import ProjectTableView from "@/app/components/project_table_view";
import ProjectGridView from "@/app/components/project_grid_view";
import ProjectMapView from "@/app/components/project_map_view";
import { Database } from "@/app/lib/supabase/models";

const filters = [
  {
    value: "todos",
    label: "Todos",
    status: null,
  },
  {
    value: "em-curso",
    label: "Em curso",
    status: "Em Curso",
  },
  {
    value: "em-pausa",
    label: "Em pausa",
    status: "Em Pausa",
  },
  {
    value: "concluido",
    label: "Concluído",
    status: "Concluído",
  },
  {
    value: "em-observacao",
    label: "Em observação",
    status: "Em Observação",
  },
] as const;

const views = [
  {
    value: "grid",
    label: "Grid",
    icon: Grid2X2Icon,
  },
  {
    value: "list",
    label: "Lista",
    icon: ListIcon,
  },
  {
    value: "map",
    label: "Mapa",
    icon: MapIcon,
  },
] as const;

type Project =
  Database["public"]["Tables"]["projects"]["Row"];

type ViewMode =
  (typeof views)[number]["value"];

export default function ProjectsPageInner({
  projects,
}: {
  projects: Project[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement>(null);

  const clearButtonRef =
    useRef<HTMLButtonElement>(null);

  const filter =
    searchParams.get("filter") ??
    "todos";

  const requestedView =
    searchParams.get("view");

  const viewMode: ViewMode =
    requestedView === "list" ||
    requestedView === "map" ||
    requestedView === "grid"
      ? requestedView
      : "grid";

  const updateSearchParams = (
    key: string,
    value: string,
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (
      (key === "filter" &&
        value === "todos") ||
      (key === "view" &&
        value === "grid")
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString =
      params.toString();

    router.replace(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    );
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const closeSearch = () => {
    setSearchTerm("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const selectedFilter = useMemo(
    () =>
      filters.find(
        (item) =>
          item.value === filter,
      ) ?? filters[0],
    [filter],
  );

  const filteredProjects = useMemo(() => {
    const term =
      searchTerm
        .trim()
        .toLowerCase();

    return projects.filter(
      (project) => {
        const projectTitle =
          project.title?.toLowerCase() ??
          "";

        const matchesSearch =
          !term ||
          projectTitle.includes(term);

        const matchesFilter =
          selectedFilter.value ===
            "todos" ||
          project.status ===
            selectedFilter.status;

        return (
          matchesSearch &&
          matchesFilter
        );
      },
    );
  }, [
    projects,
    searchTerm,
    selectedFilter,
  ]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-gray-900">
      {/* Header */}
      <header className="bg-white">
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Projectos
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {filteredProjects.length}{" "}
                {filteredProjects.length ===
                1
                  ? "projecto"
                  : "projectos"}{" "}
                encontrado
                {filteredProjects.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>

            <Link
              href="/management/projects/create-project"
              className="inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] shadow-sm transition-colors duration-200 hover:bg-[#BD9655]/90 active:bg-[#BD9655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-5 w-5" />

              <span className="hidden sm:inline">
                Novo Projecto
              </span>

              <span className="sm:hidden">
                Novo
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="sticky top-0 z-30 border-b border-gray-200/50 bg-white/95 backdrop-blur-sm">
        <div className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex flex-col gap-3.5">
            {/* Search */}
            <div className="group relative w-full">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-600" />

              <input
                ref={inputRef}
                type="search"
                value={searchTerm}
                placeholder="Pesquisar projectos..."
                aria-label="Pesquisar projectos"
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:shadow-md"
              />

              {searchTerm && (
                <button
                  ref={clearButtonRef}
                  type="button"
                  aria-label="Limpar pesquisa"
                  onClick={closeSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]/20"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters + views */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Filters */}
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
                {filters.map((item) => {
                  const isActive =
                    filter === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={
                        isActive
                      }
                      onClick={() =>
                        updateSearchParams(
                          "filter",
                          item.value,
                        )
                      }
                      className={`flex-shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-[#BD9655] text-[#002950] shadow-sm hover:bg-[#BD9655]/90"
                          : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* View modes */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <span className="hidden text-xs font-medium text-gray-500 sm:inline">
                  Visualizar:
                </span>

                <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
                  {views.map(
                    ({
                      value,
                      label,
                      icon: Icon,
                    }) => {
                      const isActive =
                        viewMode ===
                        value;

                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={
                            label
                          }
                          aria-pressed={
                            isActive
                          }
                          title={label}
                          onClick={() =>
                            updateSearchParams(
                              "view",
                              value,
                            )
                          }
                          className={`cursor-pointer rounded p-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 ${
                            isActive
                              ? "bg-[#BD9655] text-[#002950] shadow-sm hover:bg-[#BD9655]/90"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {filteredProjects.length ===
        0 ? (
          <div className="flex items-center justify-center py-16 sm:py-24">
            <div className="max-w-sm text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                <SearchIcon className="h-7 w-7 text-gray-400" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Nenhum projecto encontrado
              </h3>

              <p className="mb-6 text-sm text-gray-600">
                {searchTerm ||
                filter !== "todos"
                  ? "Tente ajustar os seus filtros ou pesquisa."
                  : "Comece por criar o seu primeiro projecto."}
              </p>

              {!searchTerm &&
                filter ===
                  "todos" && (
                  <Link
                    href="/management/projects/create-project"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003b70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Projecto
                  </Link>
                )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {viewMode === "grid" && (
              <ProjectGridView
                projects={
                  filteredProjects
                }
              />
            )}

            {viewMode === "list" && (
              <ProjectTableView
                projects={
                  filteredProjects
                }
              />
            )}

            {viewMode === "map" && (
              <ProjectMapView
                projects={
                  filteredProjects
                }
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
