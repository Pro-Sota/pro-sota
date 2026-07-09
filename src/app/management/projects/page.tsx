"use client";

import { useRef, useEffect, useState } from "react";
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
import { projects } from "./data"


const filters = [
  { value: "todos", label: "Todos" },
  { value: "em-curso", label: "Em curso" },
  { value: "concluido", label: "Concluído" },
  { value: "em-observacao", label: "Em observação" },
] as const;

export default function ProjectsPage() {

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filter = searchParams.get("filter") ?? "todos";
  const viewMode =
    (searchParams.get("view") as "grid" | "list" | "map") ?? "grid";

  const inputRef = useRef<HTMLInputElement>(null);

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
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleActive = () => {
    setIsActive(!isActive);
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "todos" || project.status === filter;

    return matchesSearch && matchesFilter;
  });

  const buttonClass =
    "h-8 px-4 text-gray-400 flex text-sm items-center justify-centertext-sm rounded hover:border-gray-500 border border-gray=200f transition-colors duration-300 cursor-pointer";

  return (
    <div className="flex flex-col  text-black px-8 pt-2 ">
      <div>

        { /* new project button */}
        <div className="flex flex-row items-center justify-between mb-4">
          <h1 className="text-2xl text-black font-medium">Projectos</h1>
          <Link href="/management/projects/new-project">
            <button className=" bg-gray-200 text-gray-700 text-sm rounded-sm hover:border-gray-500 border border-transparent flex items-center justify-center cursor-pointer px-2 py-1 gap-2" onClick={handleActive}>
              <Plus className="h-4 w-4" /> New Project
            </button>
          </Link>
        </div>

        <div className="flex flex-row items-center justify-between mb-4">
          { /* search bar */}
          <div className="flex flex-row items-center gap-3">
            {isOpen ? (
              <div className="relative ">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Pesquisar projectos..."
                  className="h-8 w-72 bg-gray-200 text-gray-700 pl-10 pr-10 border border-gray-300 rounded"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onBlur={() => {
                    if (!searchTerm.trim()) {
                      setIsOpen(false);
                    }
                  }}
                />

                {  /* filter buttons */}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setIsOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>
            ) : (
              <button
                onClick={() => setIsOpen(true)}
                className="h-8 w-10 bg-gray-200 text-gray-700 rounded hover:border-gray-500 border border-transparent flex items-center justify-center cursor-pointer"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            )}

            {filters.map((f) => (
              <button
                key={f.value}
                className={buttonClass + (filter === f.value ? " !border-black !text-black" : "")}
                onClick={() => updateSearchParams("filter", f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* view filter */}
          <div className="flex flex-row items-center gap-4">
            <button onClick={() => updateSearchParams("view", "grid")} className="cursor-pointer" title="ver em grade" > <Grid2X2Icon className="w-4 h-4" /> </button>
            <button onClick={() => updateSearchParams("view", "list")} className="cursor-pointer" title="ver em lista" > <ListIcon className="w-4 h-4" /> </button>
            <button onClick={() => updateSearchParams("view", "map")} className="cursor-pointer" title="ver em mapa"   > <MapIcon className="w-4 h-4" /> </button>
          </div>

        </div>
      </div>

      {viewMode === "grid" && (<ProjectGridView projects={filteredProjects} />)}
      {viewMode === "list" && (<ProjectTableView projects={filteredProjects} />)}
      {viewMode === "map" && (<ProjectMapView projects={filteredProjects} />)}
    </div>
  );
}