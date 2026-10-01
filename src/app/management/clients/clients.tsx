"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Briefcase,
  Plus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { StatCard } from "@/app/components/StatCard";
import type { ClientWithProjectCount } from "@/services/clients";

import ClientsFilters from "./clients_filters";
import ClientsTable from "./clients_table";

interface Props {
  allClients: ClientWithProjectCount[];
}

type ClientFilters = {
  query: string;
  status: string;
  type: string;
  projects: string;
};

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function escapeCsvValue(value: unknown): string {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(
  filename: string,
  rows: Array<Array<unknown>>,
) {
  const csv = rows
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

export default function ClientsPage({ allClients }: Props) {
  const router = useRouter();

  const [filters, setFilters] = useState<ClientFilters>({
    query: "",
    status: "All",
    type: "All",
    projects: "All",
  });

  const filteredClients = useMemo(() => {
    const normalizedQuery = normalizeSearch(filters.query);

    return allClients.filter((client) => {
      const searchableValues = [
        client.name,
        client.first_name,
        client.last_name,
        client.organization_name,
        client.contact_person,
        client.email,
        client.phone,
        client.nif,
        client.city,
        client.province,
        client.client_id,
      ];

      const matchesQuery =
        !normalizedQuery ||
        searchableValues.some(
          (value) =>
            Boolean(value) &&
            normalizeSearch(String(value)).includes(
              normalizedQuery,
            ),
        );

      const matchesStatus =
        filters.status === "All" ||
        client.status === filters.status;

      const matchesType =
        filters.type === "All" ||
        client.client_type === filters.type;

      const matchesProjects =
        filters.projects === "All" ||
        (filters.projects === "WithProjects" &&
          client.projectCount > 0) ||
        (filters.projects === "WithoutProjects" &&
          client.projectCount === 0);

      return (
        matchesQuery &&
        matchesStatus &&
        matchesType &&
        matchesProjects
      );
    });
  }, [allClients, filters]);

  const stats = useMemo(() => {
    return allClients.reduce(
      (result, client) => {
        result.projectCount += client.projectCount;

        if (client.status === "Active") {
          result.activeClients += 1;
        }

        if (client.status === "Prospective") {
          result.prospectiveClients += 1;
        }

        return result;
      },
      {
        activeClients: 0,
        prospectiveClients: 0,
        projectCount: 0,
      },
    );
  }, [allClients]);

  function updateFilter<K extends keyof ClientFilters>(
    key: K,
    value: ClientFilters[K],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters({
      query: "",
      status: "All",
      type: "All",
      projects: "All",
    });
  }

  function exportClients() {
    const rows = [
      [
        "Cliente",
        "Categoria",
        "NIF",
        "Email",
        "Telefone",
        "Cidade",
        "Estado",
        "Projectos",
      ],
      ...filteredClients.map((client) => [
        client.name ?? "",
        client.client_type,
        client.nif ?? "",
        client.email ?? "",
        client.phone ?? "",
        client.city ?? "",
        client.status,
        client.projectCount,
      ]),
    ];

    downloadCsv("clientes.csv", rows);
  }

  const hasClients = allClients.length > 0;
  const hasFilteredClients = filteredClients.length > 0;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Clientes
            </h1>

            <p className="mt-1 text-gray-500">
              Gerir clientes, contactos e projectos.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/management/clients/create-client",
              )
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
          >
            <Plus size={18} aria-hidden="true" />
            Novo Cliente
          </button>
        </header>

        <section
          aria-label="Resumo de clientes"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            icon={<Users size={22} />}
            title="Total Clientes"
            value={String(allClients.length)}
          />

          <StatCard
            icon={<Users size={22} />}
            title="Clientes Activos"
            value={String(stats.activeClients)}
          />

          <StatCard
            icon={<Briefcase size={22} />}
            title="Potenciais"
            value={String(stats.prospectiveClients)}
          />

          <StatCard
            icon={<Building2 size={22} />}
            title="Projectos"
            value={String(stats.projectCount)}
          />
        </section>

        <ClientsFilters
          query={filters.query}
          setQuery={(value) => updateFilter("query", value)}
          statusFilter={filters.status}
          setStatusFilter={(value) =>
            updateFilter("status", value)
          }
          typeFilter={filters.type}
          setTypeFilter={(value) =>
            updateFilter("type", value)
          }
          projectFilter={filters.projects}
          setProjectFilter={(value) =>
            updateFilter("projects", value)
          }
          onExport={exportClients}
          onReset={resetFilters}
          resultCount={filteredClients.length}
          totalCount={allClients.length}
        />

        {hasFilteredClients ? (
          <ClientsTable clients={filteredClients} />
        ) : (
          <div
            role="status"
            className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center"
          >
            <Users
              size={32}
              aria-hidden="true"
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-3 font-semibold text-gray-900">
              {hasClients
                ? "Nenhum cliente encontrado"
                : "Ainda não existem clientes"}
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              {hasClients
                ? "Tente alterar a pesquisa ou remover os filtros."
                : "Adicione o primeiro cliente para começar a gerir a sua carteira de clientes."}
            </p>

            {hasClients ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 cursor-pointer text-sm font-medium text-[#002950] underline underline-offset-2 transition hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
              >
                Limpar pesquisa e filtros
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/management/clients/create-client",
                  )
                }
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
              >
                <Plus size={17} aria-hidden="true" />
                Novo Cliente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}