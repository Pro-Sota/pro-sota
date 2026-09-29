"use client";

import {
  Download,
  Filter,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

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

  const activeFilterCount = [
    statusFilter !== "All",
    typeFilter !== "All",
    projectFilter !== "All",
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Procurar por nome, NIF, email, telefone..."
            aria-label="Procurar clientes"
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar pesquisa"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:w-auto"
          >
            <Filter size={17} />
            Filtros

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#002950] px-1.5 text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </label>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#002950]"
                  >
                    <option value="All">
                      Todos
                    </option>

                    {CLIENT_STATUSES.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Categoria
                  </label>

                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#002950]"
                  >
                    <option value="All">
                      Todas
                    </option>

                    {CLIENT_TYPES.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Projectos
                  </label>

                  <select
                    value={projectFilter}
                    onChange={(event) =>
                      setProjectFilter(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#002950]"
                  >
                    <option value="All">
                      Todos
                    </option>
                    <option value="WithProjects">
                      Com projectos
                    </option>
                    <option value="WithoutProjects">
                      Sem projectos
                    </option>
                  </select>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onReset();
                      setOpen(false);
                    }}
                    className="w-full cursor-pointer border-t border-gray-100 pt-3 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={!resultCount}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} />
          Exportar
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {resultCount} de {totalCount} clientes
        </p>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer text-sm font-medium text-[#002950] hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}