"use client";

import Loader from "@/app/components/loader";
import { StatCard } from "@/app/components/StatCard";
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Boxes,
  ArrowUpRight,
  Building2Icon,
  X,
  ChevronDown,
  Filter,
  SearchX,
  Building2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const tokens = {
  ink: "#0F172A",
  paper: "#CBD5E1",
  card: "#FFFFFF",
  cardAlt: "#F1F5F9",
  slate700: "#334155",
  slate600: "#475569",
  onSlate700: "#FFFFFF",
  stone: "#64748B",
  line: "#CBD5E1",
  bronze: "#A8672E",
  bronzeBg: "#F1E3D3",
  olive: "#4B7A2F",
  oliveBg: "#E1EED7",
  amber: "#9C6F1E",
  amberBg: "#F3E6C9",
};

type SupplierStatus = "Activo" | "Inactivo" | "Em Análise";

type Supplier = {
  name: string;
  category: string;
  location: string;
  rating: number;
  projects: number;
  status: SupplierStatus;
};

const statusStyles: Record<SupplierStatus, string> = {
  Activo: "bg-green-100 text-green-700",
  "Em Análise": "bg-amber-100 text-amber-700",
  Inactivo: "bg-gray-100 text-gray-600",

};

export default function SuppliersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | SupplierStatus>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const suppliers: Supplier[] = [];

  const summary = [
    {
      label: "Total de fornecedores",
      value: suppliers.length,
      icon: Building2Icon,
    },
    {
      label: "Ativos",
      value: suppliers.filter((s) => s.status === "Activo").length,
      icon: CheckCircle2,
    },
    {
      label: "Em análise",
      value: suppliers.filter((s) => s.status === "Em Análise").length,
      icon: Clock,
    },
    {
      label: "Projetos vinculados",
      value: suppliers.reduce((sum, s) => sum + s.projects, 0),
      icon: Boxes,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return suppliers.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  if (loading) return (<Loader />);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" >
              Gestão de fornecedores
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie fornecedores, materiais, contratos e desempenho.
            </p>
          </div>

          <button
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition hover:opacity-90 bg-slate-900 text-gray-50 cursor-pointer"
          >
            <Plus size={16} />
            Adicionar fornecedor
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map(({ label, value, icon: Icon }) => (
            <StatCard key={label} icon={<Icon />} title={label} value={`${value}`} />
          ))}
        </div>

        {/* Search and Filters */}
        <div
          className="flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center"
          style={{ background: tokens.card, border: `1px solid ${tokens.line}` }}
        >

          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar por nome, email, ou número de telefone..."
              aria-label="Search clients"
              className="w-full rounded-lg border py-2 pl-10 pr-9 outline-none focus:ring-2 focus:ring-black"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <FilterBtn
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            statusFilter={statusFilter}
            setStatusFilter={() => setStatusFilter}
          />

          <select
            className="rounded-lg px-3 py-2 text-sm outline-none bg-gray-300/30 border border-gray-200 text-gray-600"
          >
            <option>Todas as categorias</option>
            <option>Materiais</option>
            <option>Móveis</option>
            <option>Construção</option>
          </select>

          <select
            className="rounded-lg px-3 py-2 text-sm outline-none bg-gray-300/30 border border-gray-200 text-gray-600"
          >
            <option>Todos os status</option>
            <option>Ativo</option>
            <option>Em análise</option>
          </select>
        </div>

        {/* Supplier Table */}
        <div className="overflow-hidden rounded-2xl bg-white border border-gray-100">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                {["Fornecedor", "Categoria", "Localização", "Avaliação", "Projetos", "Status", " "].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900">
                        Nenhum fornecedor registado
                      </h3>

                      <p className="mt-2 max-w-md text-sm text-gray-500">
                        Adicione o seu primeiro fornecedor para começar a gerir contratos,
                        materiais e desempenho.
                      </p>

                      <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                        <Plus size={16} />
                        Adicionar fornecedor
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <SearchX className="h-8 w-8 text-gray-400" />
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900">
                        Nenhum fornecedor encontrado
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Tente alterar os filtros ou pesquisar por outro nome.
                      </p>

                      <button
                        onClick={() => {
                          setQuery("");
                          setStatusFilter("All");
                        }}
                        className="mt-5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Limpar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((supplier) => (
                  <SupplierRow
                    key={supplier.name}
                    supplier={supplier}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface FilterProps {
  filtersOpen: boolean;
  setFiltersOpen: (isOpen: boolean) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

function FilterBtn({ filtersOpen, setFiltersOpen, statusFilter, setStatusFilter }: FilterProps) {
  return (
    <div className="relative">
      <button
        onClick={() => setFiltersOpen(!filtersOpen)}
        aria-expanded={filtersOpen}
        className="text-sm flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:w-auto"
      >
        <Filter size={14} />
        Filtros
        {statusFilter !== "All" && (
          <span className="rounded-full bg-black px-1.5 text-xs text-white">1</span>
        )}
        <ChevronDown size={14} className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
      </button>

      {filtersOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border bg-white p-2 shadow-lg">
          <p className="px-2 pb-1 pt-1 text-xs font-medium uppercase text-gray-400">Filtros</p>
          {(["All", "Active", "Pending", "Inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s as SupplierStatus);
                setFiltersOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100 ${statusFilter === s ? "font-medium text-black" : "text-gray-600"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
      {initials}
    </div>
  );
}


function Stars({ count }: { count: number }) {
  return (
    <span className="text-slate-700">
      {"★".repeat(count)}
      <span style={{ color: tokens.line }}>{"★".repeat(5 - count)}</span>
    </span>
  );
}

const STATUS_STYLES: Record<SupplierStatus, string> = {
  Activo: "bg-green-100 text-green-700",
  "Em Análise": "bg-amber-100 text-amber-700",
  Inactivo: "bg-gray-100 text-gray-600",
};


function StatusBadge({ status }: { status: SupplierStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-sm ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}


function SupplierRow({
  supplier,
}: {
  supplier: Supplier;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={supplier.name} />
          <span className="font-medium text-gray-900">{supplier.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600">{supplier.category}</td>
      <td className="px-6 py-4 text-gray-600">{supplier.location}</td>
      <td className="px-6 py-4"> <Stars count={supplier.rating} /></td>
      <td className="px-6 py-4"> {supplier.projects} </td>
      <td className="px-6 py-4">
        <StatusBadge status={supplier.status} />
      </td>
      <td className="p-4 font-medium">
        <button
          className="cursor-pointer flex items-center gap-1 text-sm font-medium hover:underline underline-offset-3"
        >
          Ver
          <ArrowUpRight size={14} />
        </button>
      </td>
    </tr>
  );
}