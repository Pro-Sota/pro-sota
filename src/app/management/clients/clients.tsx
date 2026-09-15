"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Briefcase,
  Download,
  Filter,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { StatCard } from "../../components/StatCard";
import Loader from "@/app/components/loader";
import {
  getClients,
  type ClientWithProjectCount,
} from "@/services/clients";

const STATUS_LABELS: Record<string, string> = {
  Active: "Ativo",
  Inactive: "Inativo",
  Prospective: "Potencial",
};

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Prospective: "bg-amber-100 text-amber-700",
};

function clientTypeLabel(type: string) {
  return (
    {
      Company: "Empresa",
      Government: "Governo",
      Individual: "Particular",
    }[type] ?? type
  );
}

interface Props {
  allClients: ClientWithProjectCount[]
}

export default function ClientsPage({ allClients }: Props) {
  const router = useRouter();

  const clients = allClients;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);


  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesQuery =
        !normalizedQuery ||
        [client.name, client.email, client.phone]
          .filter((value): value is string => Boolean(value))
          .some((value) =>
            value.toLowerCase().includes(normalizedQuery)
          );

      const matchesStatus =
        statusFilter === "All" ||
        client.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [clients, query, statusFilter]);

  const companies = clients.filter(
    (client) => client.client_type === "Company"
  ).length;

  const projectCount = clients.reduce(
    (total, client) => total + client.projectCount,
    0
  );

  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length;

  function exportClients() {
    const rows = [
      [
        "Cliente",
        "Categoria",
        "Email",
        "Telefone",
        "Estado",
        "Projectos",
      ],
      ...filtered.map((client) => [
        client.name ?? "",
        clientTypeLabel(client.client_type),
        client.email ?? "",
        client.phone ?? "",
        STATUS_LABELS[client.status] ?? client.status,
        String(client.projectCount),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${value.replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8",
      })
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = "clientes.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Clientes
            </h1>

            <p className="text-gray-500">
              Gerir clientes, contactos e projectos.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/management/clients/create-client")
            }
            className="flex cursor-pointer items-center justify-center font-medium gap-2 text-sm rounded-lg bg-[#BD9655] px-4 py-2 text-[#002950] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users size={22} />}
            title="Total Clientes"
            value={String(clients.length)}
          />

          <StatCard
            icon={<Building2 size={22} />}
            title="Empresas"
            value={String(companies)}
          />

          <StatCard
            icon={<Briefcase size={22} />}
            title="Projectos"
            value={String(projectCount)}
          />

          <StatCard
            icon={<Users size={22} />}
            title="Clientes Activos"
            value={String(activeClients)}
          />
        </div>

        {/* Search / Filters */}
        <div className="mt-8 flex flex-col gap-4 rounded-xl border bg-white p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Procurar por nome, email, ou número de telefone..."
              aria-label="Procurar clientes"
              className="w-full rounded-lg border py-2 pl-10 pr-9 outline-none focus:ring-2 focus:ring-black"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar pesquisa"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setFiltersOpen((open) => !open)
              }
              aria-expanded={filtersOpen}
              aria-haspopup="menu"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:w-auto"
            >
              <Filter size={18} />
              Filtros
            </button>

            {filtersOpen && (
              <div
                className="absolute right-0 z-10 mt-2 w-48 rounded-lg border bg-white p-2 shadow-lg"
                role="menu"
              >
                {[
                  "All",
                  "Active",
                  "Prospective",
                  "Inactive",
                ].map((status) => (
                  <button
                    key={status}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setStatusFilter(status);
                      setFiltersOpen(false);
                    }}
                    className={`block w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100 ${statusFilter === status
                      ? "font-medium text-black"
                      : "text-gray-600"
                      }`}
                  >
                    {status === "All"
                      ? "Todos"
                      : STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={exportClients}
            disabled={!filtered.length}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>

        {/* Results count */}
        <p className="mt-4 text-sm text-gray-500">
          {filtered.length} de {clients.length} clientes
        </p>

        {/* Clients table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Cliente
                  </th>

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Categoria
                  </th>

                  <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Projectos
                  </th>

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Contacto
                  </th>

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    Estado
                  </th>

                  <th className="w-10 px-4 py-3.5" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filtered.map((client) => (
                  <tr
                    key={client.client_id}
                    onClick={() =>
                      router.push(
                        `/management/clients/${client.client_id}`
                      )
                    }
                    className="group cursor-pointer bg-white transition-colors hover:bg-[#FAFAF8]"
                  >
                    {/* Client */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002950]/5 text-sm font-semibold text-[#002950]">
                          {(client.name?.charAt(0) ?? "?").toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {client.name ?? "—"}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            ID #{client.client_id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {clientTypeLabel(client.client_type)}
                      </span>
                    </td>

                    {/* Projects */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-800 shadow-sm">
                        {client.projectCount}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="max-w-[240px]">
                        <p className="truncate text-sm font-medium text-gray-700">
                          {client.phone ?? "Sem telefone"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {client.email ?? "Sem email"}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[client.status] ??
                          "bg-gray-100 text-gray-600"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${client.status === "Active"
                            ? "bg-green-600"
                            : client.status === "Prospective"
                              ? "bg-amber-500"
                              : "bg-gray-400"
                            }`}
                        />

                        {STATUS_LABELS[client.status] ??
                          client.status}
                      </span>
                    </td>

                    {/* Arrow */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-all group-hover:bg-white group-hover:text-gray-600 group-hover:shadow-sm">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M6 3.5L10.5 8L6 12.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!filtered.length && (
            <EmptyState
              hasClients={clients.length > 0}
              onReset={() => {
                setQuery("");
                setStatusFilter("All");
              }}
            />
          )}
        </div>
      </div>
    </div>)
}
function EmptyState({
  hasClients,
  onReset,
}: {
  hasClients: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Users size={28} className="text-gray-300" />

      <p className="font-medium text-gray-900">
        {hasClients
          ? "Nenhum cliente corresponde à pesquisa"
          : "Ainda não existem clientes"}
      </p>

      <p className="text-sm text-gray-500">
        {hasClients
          ? "Tenta outro nome ou limpa os filtros."
          : "Adicione o primeiro cliente para começar."}
      </p>

      {hasClients && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 cursor-pointer text-sm font-medium underline"
        >
          Limpar pesquisa e filtros
        </button>
      )}
    </div>
  );
}
