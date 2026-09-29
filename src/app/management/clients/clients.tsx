"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Briefcase,
  Download,
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

export default function ClientsPage({ allClients }: Props) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

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
        searchableValues
          .filter(
            (value): value is string =>
              Boolean(value)
          )
          .some((value) =>
            value.toLowerCase().includes(normalizedQuery)
          );

      const matchesStatus =
        statusFilter === "All" ||
        client.status === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        client.client_type === typeFilter;

      const matchesProjects =
        projectFilter === "All" ||
        (projectFilter === "WithProjects" &&
          client.projectCount > 0) ||
        (projectFilter === "WithoutProjects" &&
          client.projectCount === 0);

      return (
        matchesQuery &&
        matchesStatus &&
        matchesType &&
        matchesProjects
      );
    });
  }, [
    allClients,
    query,
    statusFilter,
    typeFilter,
    projectFilter,
  ]);

  const companies = allClients.filter(
    (client) => client.client_type === "Company"
  ).length;

  const projectCount = allClients.reduce(
    (total, client) => total + client.projectCount,
    0
  );

  const activeClients = allClients.filter(
    (client) => client.status === "Active"
  ).length;

  const prospectiveClients = allClients.filter(
    (client) => client.status === "Prospective"
  ).length;

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
      ...filtered.map((client) => [
        client.name ?? "",
        client.client_type,
        client.nif ?? "",
        client.email ?? "",
        client.phone ?? "",
        client.city ?? "",
        client.status,
        String(client.projectCount),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`
          )
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

  function resetFilters() {
    setQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
    setProjectFilter("All");
  }

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
                "/management/clients/create-client"
              )
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users size={22} />}
            title="Total Clientes"
            value={String(allClients.length)}
          />

          <StatCard
            icon={<Users size={22} />}
            title="Clientes Activos"
            value={String(activeClients)}
          />

          <StatCard
            icon={<Briefcase size={22} />}
            title="Potenciais"
            value={String(prospectiveClients)}
          />

          <StatCard
            icon={<Building2 size={22} />}
            title="Projectos"
            value={String(projectCount)}
          />
        </div>

        <ClientsFilters
          query={query}
          setQuery={setQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          projectFilter={projectFilter}
          setProjectFilter={setProjectFilter}
          onExport={exportClients}
          onReset={resetFilters}
          resultCount={filtered.length}
          totalCount={allClients.length}
        />

        <ClientsTable clients={filtered} />

        {!filtered.length && (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <Users
              size={32}
              className="mx-auto text-gray-300"
            />

            <h3 className="mt-3 font-semibold text-gray-900">
              {allClients.length
                ? "Nenhum cliente encontrado"
                : "Ainda não existem clientes"}
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              {allClients.length
                ? "Tente alterar a pesquisa ou remover os filtros."
                : "Adicione o primeiro cliente para começar a gerir a sua carteira de clientes."}
            </p>

            {allClients.length ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 cursor-pointer text-sm font-medium text-[#002950] underline"
              >
                Limpar pesquisa e filtros
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/management/clients/create-client"
                  )
                }
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950]"
              >
                <Plus size={17} />
                Novo Cliente
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}