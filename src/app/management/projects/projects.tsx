"use client";

import { Suspense, useRef, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  { value: "todos", label: "Todos", status: null },
  { value: "em-curso", label: "Em curso", status: "Em Curso" },
  { value: "em-pausa", label: "Em pausa", status: "Em Pausa" },
  { value: "concluido", label: "Concluído", status: "Concluído" },
  { value: "em-observacao", label: "Em observação", status: "Em Observação" },
] as const;

const views = [
  { value: "grid", label: "Grid", icon: Grid2X2Icon },
  { value: "list", label: "Lista", icon: ListIcon },
  { value: "map", label: "Mapa", icon: MapIcon },
] as const;

type Project = Database["public"]["Tables"]["projects"]["Row"];

export default function ProjectsPageInner({
  projects,
}: {
  projects: Project[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const filter = searchParams.get("filter") ?? "todos";
  const viewMode =
    (searchParams.get("view") as "grid" | "list" | "map") ?? "grid";

  const inputRef = useRef<HTMLInputElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (
      (key === "filter" && value === "todos") ||
      (key === "view" && value === "grid")
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const closeSearch = () => {
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(term);
      const selectedFilter = filters.find((f) => f.value === filter);

      const matchesFilter =
        filter === "todos" || project.status === selectedFilter?.status;

      return matchesSearch && matchesFilter;
    });
  }, [projects, searchTerm, filter]);

  return (
    <div className="flex flex-col bg-[#F7F7F5] min-h-screen text-gray-900">
      {/* Header Section */}
      <header className="bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Projectos
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "projecto" : "projectos"}{" "}
                encontrado
                {filteredProjects.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href="/management/projects/create-project"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#BD9655] text-[#00520] text-sm font-medium rounded-lg hover:bg-[#BD9655]/90 active:bg-[#BD9655] transition-colors duration-200 shadow-sm w-full sm:w-auto flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden xs:inline">Novo Projecto</span>
              <span className="xs:hidden">Novo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Controls Section */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col gap-3.5">
            {/* Search Bar */}
            <div className="relative w-full group">
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-gray-600" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar projectos..."
                aria-label="Pesquisar projectos"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:shadow-md"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={(e) => {
                  if (e.relatedTarget === clearButtonRef.current) return;
                  if (!searchTerm.trim()) {
                    setIsSearchOpen(false);
                  }
                }}
              />
              {searchTerm && (
                <button
                  ref={clearButtonRef}
                  type="button"
                  aria-label="Limpar pesquisa"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={closeSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters and View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Filter Buttons - Scrollable on mobile */}
              <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0 sm:gap-2 sm:flex-wrap">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    aria-pressed={filter === f.value}
                    className={`cursor-pointer px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-150 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#002950] focus-visible:ring-offset-gray-100 ${
                      filter === f.value
                        ? "bg-[#BD9655] text-[#002950] shadow-sm hover:bg-[#BD9655]/90 active:bg-[#BD9655] "
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 active:bg-gray-100"
                    }`}
                    onClick={() => updateSearchParams("filter", f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* View Mode Controls */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                  Visualizar:
                </span>
                <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 gap-1 shadow-sm">
                  {views.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={label}
                      aria-pressed={viewMode === value}
                      title={label}
                      onClick={() => updateSearchParams("view", value)}
                      className={`cursor-pointer p-2 rounded transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#002950] focus-visible:ring-offset-gray-100 ${
                        viewMode === value
                          ? "bg-[#BD9655] text-[#002950] shadow-sm hover:bg-[#BD9655]/90 active:bg-[#BD9655]"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:text-gray-900 active:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center py-16 sm:py-24">
            <div className="text-center max-w-sm">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gray-200 mb-4">
                <SearchIcon className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum projecto encontrado
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchTerm || filter !== "todos"
                  ? "Tente ajustar seus filtros ou pesquisa"
                  : "Comece criando seu primeiro projecto"}
              </p>
              {searchTerm === "" && filter === "todos" && (
                <Link
                  href="/management/projects/create-project"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
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
              <ProjectGridView projects={filteredProjects} />
            )}
            {viewMode === "list" && (
              <ProjectTableView projects={filteredProjects} />
            )}
            {viewMode === "map" && (
              <ProjectMapView projects={filteredProjects} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}