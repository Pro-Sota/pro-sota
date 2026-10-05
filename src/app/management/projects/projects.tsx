"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Grid2X2Icon,
  ListIcon,
  MapIcon,
  Plus,
  SearchIcon,
  X,
} from "lucide-react";

import ProjectTableView from "@/app/components/project_table_view";
import ProjectGridView from "@/app/components/project_grid_view";
import { MapSkeleton } from "@/app/components/project_skeletons";
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  SortValue,
  matchesSearch,
  normalizeStatus,
  sortProjects,
} from "@/app/components/project_helpers";
import { ProjectListItem } from "./types";
import CustomSelect from "@/app/components/custom_select";

/*
 * The map is the heavy view (map library + tiles). Loading it on demand keeps
 * the grid and list lightweight, and shows a skeleton while it loads.
 */
const ProjectMapView = dynamic(
  () => import("@/app/components/project_map_view"),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const filters = [
  { value: "todos", label: "Todos" },
  { value: "em-curso", label: "Em curso" },
  { value: "em-pausa", label: "Em pausa" },
  { value: "concluido", label: "Concluído" },
  { value: "em-observacao", label: "Em observação" },
] as const;

const views = [
  { value: "grid", label: "Grid", icon: Grid2X2Icon },
  { value: "list", label: "Lista", icon: ListIcon },
  { value: "map", label: "Mapa", icon: MapIcon },
] as const;

type ViewMode = (typeof views)[number]["value"];

type FilterValue = (typeof filters)[number]["value"];

const statusFilters = filters.filter((item) => item.value !== "todos");

/* -------------------------------------------------------------------------- */
/* URL state                                                                  */
/* -------------------------------------------------------------------------- */

function parseFilter(value: string | null): FilterValue {
  return filters.find((item) => item.value === value)?.value ?? "todos";
}

function parseView(value: string | null): ViewMode {
  return views.find((item) => item.value === value)?.value ?? "grid";
}

function parseSort(value: string | null): SortValue {
  return SORT_OPTIONS.find((item) => item.value === value)?.value ?? DEFAULT_SORT;
}

type UrlKey = "filter" | "sort" | "view" | "q";

const URL_DEFAULTS: Record<UrlKey, string> = {
  filter: "todos",
  sort: DEFAULT_SORT,
  view: "grid",
  q: "",
};

/**
 * Updates the address bar without navigating.
 *
 * router.replace() makes Next.js re-run the server page (and re-fetch every
 * project) on each change. That round trip is what made switching views slow.
 * history.replaceState updates the URL only, so the change is instant, and
 * Next (14.1+) keeps useSearchParams in sync with it.
 *
 * Returns the resulting query string.
 */
function writeUrl(updates: Partial<Record<UrlKey, string>>) {
  const params = new URLSearchParams(window.location.search);

  (Object.keys(updates) as UrlKey[]).forEach((key) => {
    const value = updates[key]?.trim() ?? "";

    if (!value || value === URL_DEFAULTS[key]) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const next = params.toString();

  if (next === window.location.search.replace(/^\?/, "")) return next;

  window.history.replaceState(
    null,
    "",
    next ? `${window.location.pathname}?${next}` : window.location.pathname,
  );

  return next;
}

/* -------------------------------------------------------------------------- */
/* Small pieces                                                               */
/* -------------------------------------------------------------------------- */

function SummaryMark({ status }: { status: FilterValue }) {
  if (status === "concluido") {
    return (
      <CheckCircle2 className="h-3 w-3 text-[#002950]" aria-hidden="true" />
    );
  }

  if (status === "em-observacao") {
    return (
      <span
        aria-hidden="true"
        className="h-2 w-2 rounded-full border-[1.5px] border-[#002950]"
      />
    );
  }

  if (status === "em-pausa") {
    return (
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gray-300" />
    );
  }

  return (
    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#002950]" />
  );
}

const secondaryButton =
  "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2";

function EmptyResults({
  kind,
  searchTerm,
  filterLabel,
  onClearSearch,
  onClearFilter,
}: {
  kind: "none" | "search" | "filter";
  searchTerm: string;
  filterLabel: string;
  onClearSearch: () => void;
  onClearFilter: () => void;
}) {
  const isFiltering = filterLabel !== "Todos";

  let title = "";
  let description = "";

  if (kind === "none") {
    title = "Ainda não existem projectos";
    description = "Comece por criar o seu primeiro projecto.";
  } else if (kind === "search") {
    title = `Nenhum resultado para “${searchTerm}”`;
    description = isFiltering
      ? `Não há projectos com este termo no estado “${filterLabel}”.`
      : "Verifique a ortografia ou pesquise por código, localização ou cliente.";
  } else {
    title = `Nenhum projecto com o estado “${filterLabel}”`;
    description = "Escolha outro estado para ver mais projectos.";
  }

  return (
    <div className="flex items-center justify-center py-16 sm:py-24">
      <div className="max-w-sm text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
          <SearchIcon className="h-7 w-7 text-gray-400" />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>

        <p className="mb-6 text-sm text-gray-600">{description}</p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {kind === "none" && (
            <Link
              href="/management/projects/create-project"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003b70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Novo Projecto
            </Link>
          )}

          {kind === "search" && (
            <button
              type="button"
              onClick={onClearSearch}
              className={secondaryButton}
            >
              Limpar pesquisa
            </button>
          )}

          {kind !== "none" && isFiltering && (
            <button
              type="button"
              onClick={onClearFilter}
              className={secondaryButton}
            >
              {kind === "filter"
                ? "Ver todos os projectos"
                : "Ver todos os estados"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProjectsPageInner({
  projects,
}: {
  projects: ProjectListItem[];
}) {
  const searchParams = useSearchParams();

  /*
   * Local state is the source of truth, so switching view / filter / sort is
   * instant. The URL is kept in sync for bookmarks and sharing.
   */
  const [filter, setFilter] = useState<FilterValue>(() =>
    parseFilter(searchParams.get("filter")),
  );
  const [sort, setSort] = useState<SortValue>(() =>
    parseSort(searchParams.get("sort")),
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    parseView(searchParams.get("view")),
  );
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") ?? "",
  );

  const deferredSearch = useDeferredValue(searchTerm);

  const inputRef = useRef<HTMLInputElement>(null);
  const lastUrlRef = useRef(searchParams.toString());

  /* ------------------------------------------------------------------------ */
  /* URL sync                                                                 */
  /* ------------------------------------------------------------------------ */

  /* Pick up changes made outside this component (links, back/forward). */
  useEffect(() => {
    const current = searchParams.toString();

    if (current === lastUrlRef.current) return;

    lastUrlRef.current = current;

    setFilter(parseFilter(searchParams.get("filter")));
    setSort(parseSort(searchParams.get("sort")));
    setViewMode(parseView(searchParams.get("view")));
    setSearchTerm(searchParams.get("q") ?? "");
  }, [searchParams]);

  /* Search is written to the URL after a short pause, not on every key. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      lastUrlRef.current = writeUrl({ q: searchTerm });
    }, 300);

    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const changeFilter = (value: FilterValue) => {
    setFilter(value);
    lastUrlRef.current = writeUrl({ filter: value });
  };

  const changeSort = (value: SortValue) => {
    setSort(value);
    lastUrlRef.current = writeUrl({ sort: value });
  };

  const changeView = (value: ViewMode) => {
    setViewMode(value);
    lastUrlRef.current = writeUrl({ view: value });
  };

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const clearSearch = () => {
    setSearchTerm("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Derived data                                                             */
  /* ------------------------------------------------------------------------ */

  const selectedFilter =
    filters.find((item) => item.value === filter) ?? filters[0];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const project of projects) {
      const key = normalizeStatus(project.status);

      counts[key] = (counts[key] ?? 0) + 1;
    }

    return counts;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const matching = projects.filter(
      (project) =>
        (filter === "todos" || normalizeStatus(project.status) === filter) &&
        matchesSearch(project, deferredSearch),
    );

    return sortProjects(matching, sort);
  }, [projects, filter, deferredSearch, sort]);

  const isSearching = deferredSearch.trim().length > 0;

  const emptyKind =
    projects.length === 0 ? "none" : isSearching ? "search" : "filter";

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-gray-900">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className="bg-white">
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Projectos
              </h1>

              {/* Summary */}
              <ul
                aria-label="Resumo dos projectos"
                className="mt-1.5 -ml-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500"
              >
                <li className="px-1">
                  Total{" "}
                  <span className="font-semibold tabular-nums text-gray-900">
                    {projects.length}
                  </span>
                </li>

                {statusFilters.map((item) => {
                  const isActive = filter === item.value;

                  return (
                    <li key={item.value}>
                      <button
                        type="button"
                        aria-pressed={isActive}
                        onClick={() =>
                          changeFilter(isActive ? "todos" : item.value)
                        }
                        className="inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] aria-pressed:font-medium aria-pressed:text-[#002950]"
                      >
                        <SummaryMark status={item.value} />

                        <span className="font-semibold tabular-nums text-gray-900">
                          {statusCounts[item.value] ?? 0}
                        </span>

                        {item.label}
                      </button>
                    </li>
                  );
                })}

                {filteredProjects.length !== projects.length && (
                  <li className="border-l border-gray-200 pl-3">
                    A mostrar{" "}
                    <span className="font-semibold tabular-nums text-gray-900">
                      {filteredProjects.length}
                    </span>{" "}
                    de {projects.length}
                  </li>
                )}
              </ul>

              <p role="status" className="sr-only">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1
                  ? "projecto encontrado"
                  : "projectos encontrados"}
              </p>
            </div>

            <Link
              href="/management/projects/create-project"
              className="inline-flex w-full flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] shadow-sm transition-colors duration-200 hover:bg-[#BD9655]/90 active:bg-[#BD9655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 sm:w-auto"
            >
              <Plus className="h-5 w-5" />

              <span className="hidden sm:inline">Novo Projecto</span>

              <span className="sm:hidden">Novo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Controls                                                           */}
      {/* ------------------------------------------------------------------ */}

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
                placeholder="Pesquisar por nome, código, local ou cliente..."
                aria-label="Pesquisar projectos por nome, código, local, cliente ou tipo"
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:shadow-md"
              />

              {searchTerm && (
                <button
                  type="button"
                  aria-label="Limpar pesquisa"
                  onClick={clearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]/20"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters + sort + views */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Filters (left) */}
              <div className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0 md:flex-wrap">
                {filters.map((item) => {
                  const isActive = filter === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => changeFilter(item.value)}
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

              {/* Sort + views (right) */}
              <div className="flex shrink-0 items-center justify-between gap-3 md:justify-end md:gap-4">
                {/* Sort */}
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <span>Ordenar por:</span>

                  <CustomSelect
                    value={sort}
                    onChange={(event) =>
                      changeSort(event.target.value as SortValue)
                    }
                    className="cursor-pointer rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-normal text-gray-700 shadow-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </CustomSelect>
                </label>

                {/* View modes */}
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs font-medium text-gray-500 sm:inline">
                    Visualizar:
                  </span>

                  <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
                    {views.map(({ value, label, icon: Icon }) => {
                      const isActive = viewMode === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={label}
                          aria-pressed={isActive}
                          title={label}
                          onClick={() => changeView(value)}
                          className={`cursor-pointer rounded p-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 ${
                            isActive
                              ? "bg-[#BD9655] text-[#002950] shadow-sm hover:bg-[#BD9655]/90"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                            */}
      {/* ------------------------------------------------------------------ */}

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {filteredProjects.length === 0 ? (
          <EmptyResults
            kind={emptyKind}
            searchTerm={deferredSearch.trim()}
            filterLabel={selectedFilter.label}
            onClearSearch={clearSearch}
            onClearFilter={() => changeFilter("todos")}
          />
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