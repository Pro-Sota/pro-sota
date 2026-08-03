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
import { getProjects } from "@/services/projects";
import Loader from "@/app/components/loader";

const filters = [
  { value: "todos", label: "Todos", status: null },
  { value: "em-curso", label: "Em curso", status: "Em Curso" },
  { value: "concluido", label: "Concluído", status: "Concluído" },
  { value: "em-observacao", label: "Em observação", status: "Em Observação" },
] as const;

const views = [
  { value: "grid", label: "ver em grade", icon: Grid2X2Icon },
  { value: "list", label: "ver em lista", icon: ListIcon },
  { value: "map", label: "ver em mapa", icon: MapIcon },
] as const;

type Project = Database["public"]["Tables"]["projects"]["Row"];

function ProjectsPageInner() {

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true);

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
    async function loadProjects() {

      const data = await getProjects();

      console.log("Returned:", data);

      setProjects(data ?? []);

       const timer = setTimeout(() => {
          setLoading(false);
        }, 1000);
    }

    loadProjects();

  }, []);

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

  const buttonClass =
    " p-2 text-gray-400 flex items-center justify-center text-sm rounded hover:border-gray-500 border border-gray-300 transition-colors duration-300 cursor-pointer";


  if (loading) return (<Loader />);

  return (
    <div className="flex flex-col text-black px-8 bg-gray-50 h-screen">
      <div className="flex flex-col gap-y-2">
        {/* new project button */}
        <div className="flex flex-row items-center justify-between h-[60px]">
          <h1 className="text-2xl text-black font-medium">Projectos</h1>
          <Link href="/management/projects/create-project"
            className="bg-white text-gray-700  shadow-md text-sm rounded-sm hover:border-gray-100 border border-transparent flex items-center justify-center cursor-pointer px-2 py-2 gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Projecto
          </Link>
        </div>

        <div className="flex flex-row items-center justify-between mb-4">
          {/* search bar */}
          <div className="flex flex-row items-center gap-3">
            <div
              className={`relative overflow-hidden transition-all duration-500 ease-in-out ${isSearchOpen ? "w-94 opacity-100" : "w-0 opacity-0"
                }`}
            >
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar projectos..."
                aria-label="Pesquisar projectos"
                className="w-full rounded border border-gray-300 bg-gray-100 p-2 pl-10 pr-10 text-gray-700 outline-none transition-colors duration-300 focus:border-gray-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                onBlur={(e) => {
                  if (e.relatedTarget === clearButtonRef.current) return;

                  if (!searchTerm.trim()) {
                    setIsSearchOpen(false);
                  }
                }}
              />
              <button
                ref={clearButtonRef}
                type="button"
                aria-label="Limpar pesquisa"
                onMouseDown={(e) => e.preventDefault()}
                onClick={closeSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {!isSearchOpen && (
              <button
                type="button"
                aria-label="Abrir pesquisa"
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded bg-white shadow-sm p-2 text-gray-700 hover:border-gray-500"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            )}
            {/* filter buttons */}
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                className={
                  buttonClass +
                  (filter === f.value ? " !border-black !text-black" : "")
                }
                onClick={() => updateSearchParams("filter", f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* view filter */}
          <div className="flex flex-row items-center gap-4">
            {views.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                aria-pressed={viewMode === value}
                onClick={() => updateSearchParams("view", value)}
                className={
                  "cursor-pointer p-1 rounded transition-colors " +
                  (viewMode === value
                    ? "text-black"
                    : "text-gray-400 hover:text-gray-600")
                }
                title={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm">
          Nenhum projecto encontrado.
        </div>
      ) : (
        <>
          {viewMode === "grid" && <ProjectGridView projects={filteredProjects} />}
          {viewMode === "list" && <ProjectTableView projects={filteredProjects} />}
          {viewMode === "map" && <ProjectMapView projects={filteredProjects} />}
        </>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsPageInner />
    </Suspense>
  );
}