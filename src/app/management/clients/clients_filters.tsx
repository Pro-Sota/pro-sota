"use client";

import {
  Download,
  Filter,
  Search,
  X,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CLIENT_STATUSES,
  CLIENT_TYPES,
} from "./constants";

interface Props {
  query: string;
  setQuery: (value: string) => void;

  statusFilter: string;
  setStatusFilter: (value: string) => void;

  typeFilter: string;
  setTypeFilter: (value: string) => void;

  projectFilter: string;
  setProjectFilter: (value: string) => void;

  onExport: () => void;
  onReset: () => void;

  resultCount: number;
  totalCount: number;
}

export default function ClientsFilters({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  projectFilter,
  setProjectFilter,
  onExport,
  onReset,
  resultCount,
  totalCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = [
    statusFilter !== "All",
    typeFilter !== "All",
    projectFilter !== "All",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;
  const hasSearch = query.trim().length > 0;

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        filterContainerRef.current &&
        !filterContainerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function resetFilters() {
    onReset();
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Search and actions */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
          />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar clientes por nome, NIF, email..."
            aria-label="Pesquisar clientes"
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-[#002950] focus:bg-white focus:ring-4 focus:ring-[#002950]/[0.06]"
          />

          {hasSearch && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar pesquisa"
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter dropdown */}
          <div
            ref={filterContainerRef}
            className="relative flex-1 sm:flex-none"
          >
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              aria-expanded={open}
              aria-haspopup="true"
              aria-controls="clients-filter-panel"
              className={`inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition sm:w-auto ${
                open || hasActiveFilters
                  ? "border-[#002950]/20 bg-[#002950]/[0.04] text-[#002950]"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={16} />

              Filtros

              {hasActiveFilters && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-[#002950] px-1.5 text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}

              <ChevronDown
                size={15}
                className={`text-gray-400 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {open && (
              <div
                id="clients-filter-panel"
                role="region"
                aria-label="Filtros de clientes"
                className="absolute right-0 top-full z-30 mt-2.5 w-[min(20rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-top-1 duration-150"
              >
                {/* Panel header */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#002950]/[0.06] text-[#002950]">
                        <Filter size={15} />
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900">
                        Filtrar clientes
                      </h3>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Refine a lista com os critérios abaixo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Fechar filtros"
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label
                      htmlFor="client-status-filter"
                      className="mb-1.5 block text-xs font-medium text-gray-700"
                    >
                      Estado do cliente
                    </label>

                    <select
                      id="client-status-filter"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value)
                      }
                      className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#002950] focus:ring-4 focus:ring-[#002950]/[0.06]"
                    >
                      <option value="All">Todos os estados</option>

                      {CLIENT_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Client type */}
                  <div>
                    <label
                      htmlFor="client-type-filter"
                      className="mb-1.5 block text-xs font-medium text-gray-700"
                    >
                      Categoria
                    </label>

                    <select
                      id="client-type-filter"
                      value={typeFilter}
                      onChange={(event) =>
                        setTypeFilter(event.target.value)
                      }
                      className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#002950] focus:ring-4 focus:ring-[#002950]/[0.06]"
                    >
                      <option value="All">Todas as categorias</option>

                      {CLIENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Projects */}
                  <div>
                    <label
                      htmlFor="client-project-filter"
                      className="mb-1.5 block text-xs font-medium text-gray-700"
                    >
                      Projectos associados
                    </label>

                    <select
                      id="client-project-filter"
                      value={projectFilter}
                      onChange={(event) =>
                        setProjectFilter(event.target.value)
                      }
                      className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition hover:border-gray-300 focus:border-[#002950] focus:ring-4 focus:ring-[#002950]/[0.06]"
                    >
                      <option value="All">Todos os clientes</option>
                      <option value="WithProjects">Com projectos</option>
                      <option value="WithoutProjects">Sem projectos</option>
                    </select>
                  </div>
                </div>

                {/* Panel footer */}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-500">
                    {activeFilterCount === 0
                      ? "Sem filtros activos"
                      : `${activeFilterCount} ${
                          activeFilterCount === 1
                            ? "filtro activo"
                            : "filtros activos"
                        }`}
                  </span>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                      <RotateCcw size={13} />
                      Limpar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={onExport}
            disabled={!resultCount}
            className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-sm text-gray-500">
          A mostrar{" "}
          <span className="font-semibold tabular-nums text-gray-900">
            {resultCount}
          </span>{" "}
          de{" "}
          <span className="font-medium tabular-nums text-gray-700">
            {totalCount}
          </span>{" "}
          {totalCount === 1 ? "cliente" : "clientes"}
        </p>

        {(hasActiveFilters || hasSearch) && (
          <button
            type="button"
            onClick={resetFiltersAndSearch}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-[#002950] transition hover:bg-[#002950]/[0.05]"
          >
            <X size={13} />
            Limpar pesquisa e filtros
          </button>
        )}
      </div>
    </div>
  );

  function resetFiltersAndSearch() {
    onReset();
    setQuery("");
    setOpen(false);
  }
}