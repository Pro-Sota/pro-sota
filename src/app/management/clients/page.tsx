"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Building2,
  Users,
  Briefcase,
  Wallet,
  MoreVertical,
  Mail,
  Phone,
  X,
  ChevronDown,
} from "lucide-react";

type ClientType = "Company" | "Individual";
type ClientStatus = "Active" | "Pending" | "Inactive";

interface Client {
  id: string;
  name: string;
  type: ClientType;
  projects: number;
  phone: string;
  email: string;
  status: ClientStatus;
  outstanding: number;
}

const CLIENTS: Client[] = [
  {
    id: "c1",
    name: "ABC Construction",
    type: "Company",
    projects: 4,
    phone: "+244 923 000 000",
    email: "geral@abcconstruction.ao",
    status: "Active",
    outstanding: 4200000,
  },
  {
    id: "c2",
    name: "Maria Fernandes",
    type: "Individual",
    projects: 1,
    phone: "+244 923 111 111",
    email: "maria.fernandes@gmail.com",
    status: "Active",
    outstanding: 350000,
  },
  {
    id: "c3",
    name: "Kianda Logística",
    type: "Company",
    projects: 2,
    phone: "+244 923 222 222",
    email: "contacto@kianda.ao",
    status: "Pending",
    outstanding: 1850000,
  },
  {
    id: "c4",
    name: "João Baptista",
    type: "Individual",
    projects: 0,
    phone: "+244 923 333 333",
    email: "joao.baptista@outlook.com",
    status: "Inactive",
    outstanding: 0,
  },
  {
    id: "c5",
    name: "Girassol Retail Group",
    type: "Company",
    projects: 6,
    phone: "+244 923 444 444",
    email: "financeiro@girassolretail.ao",
    status: "Active",
    outstanding: 9600000,
  },
];

const STATUS_STYLES: Record<ClientStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Inactive: "bg-gray-100 text-gray-600",
};

const currency = (value: number) =>
  value === 0
    ? "Kz 0"
    : `Kz ${new Intl.NumberFormat("pt-AO", {
        maximumFractionDigits: 1,
        notation: "compact",
      }).format(value)}`;

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ClientStatus>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CLIENTS.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const totalOutstanding = CLIENTS.reduce((sum, c) => sum + c.outstanding, 0);
  const companies = CLIENTS.filter((c) => c.type === "Company").length;
  const activeProjects = CLIENTS.reduce((sum, c) => sum + c.projects, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">Manage clients, contacts, and projects.</p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
          <Plus size={18} />
          New Client
        </button>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users size={22} />} title="Total Clients" value={String(CLIENTS.length)} />
        <StatCard icon={<Building2 size={22} />} title="Companies" value={String(companies)} />
        <StatCard icon={<Briefcase size={22} />} title="Active Projects" value={String(activeProjects)} />
        <StatCard icon={<Wallet size={22} />} title="Outstanding" value={currency(totalOutstanding)} />
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-4 rounded-xl border bg-white p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
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

        <div className="relative">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:w-auto"
          >
            <Filter size={18} />
            Filters
            {statusFilter !== "All" && (
              <span className="rounded-full bg-black px-1.5 text-xs text-white">1</span>
            )}
            <ChevronDown size={14} className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>

          {filtersOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border bg-white p-2 shadow-lg">
              <p className="px-2 pb-1 pt-1 text-xs font-medium uppercase text-gray-400">Status</p>
              {(["All", "Active", "Pending", "Inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setFiltersOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100 ${
                    statusFilter === s ? "font-medium text-black" : "text-gray-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-gray-500">
        {filtered.length} of {CLIENTS.length} clients
      </p>

      {/* Table (desktop) */}
      <div className="mt-2 hidden overflow-hidden rounded-xl border bg-white md:block">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Categoria</th>
              <th className="px-6 py-4 font-medium">Projectos</th>
              <th className="px-6 py-4 font-medium">Contacto</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4"> {""} </th>
             </tr>
          </thead>

          <tbody>
            {filtered.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                menuOpen={openMenuId === client.id}
                onToggleMenu={() =>
                  setOpenMenuId((id) => (id === client.id ? null : client.id))
                }
              />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && <EmptyState onReset={() => { setQuery(""); setStatusFilter("All"); }} />}
      </div>

      {/* Cards (mobile) */}
      <div className="mt-2 space-y-3 md:hidden">
        {filtered.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border bg-white">
            <EmptyState onReset={() => { setQuery(""); setStatusFilter("All"); }} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-gray-100 p-2 text-gray-700">{icon}</span>
      </div>
      <p className="mt-5 text-sm text-gray-500">{title}</p>
      <h2 className="mt-1 text-3xl font-bold">{value}</h2>
    </div>
  );
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

function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-sm ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function ClientRow({
  client,
  menuOpen,
  onToggleMenu,
}: {
  client: Client;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} />
          <span className="font-medium text-gray-900">{client.name}</span>
        </div>
      </td>

      <td className="px-6 py-4 text-gray-600">{client.type}</td>

      <td className="px-6 py-4 text-gray-600">{client.projects}</td>

      <td className="px-6 py-4">
        <div className="text-sm text-gray-600">{client.phone}</div>
        <div className="text-sm text-gray-400">{client.email}</div>
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={client.status} />
      </td>

      <td className="relative px-6 py-4 text-right">
        <button
          onClick={onToggleMenu}
          aria-label={`Actions for ${client.name}`}
          className="rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <MoreVertical size={18} className="text-gray-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-6 z-10 mt-1 w-36 rounded-lg border bg-white py-1 text-left shadow-lg">
            <button className="block w-full px-3 py-2 text-sm hover:bg-gray-50">View profile</button>
            <button className="block w-full px-3 py-2 text-sm hover:bg-gray-50">Edit client</button>
            <button className="block w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">Remove</button>
          </div>
        )}
      </td>
    </tr>
  );
}

function ClientCard({ client }: { client: Client }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} />
          <div>
            <p className="font-medium text-gray-900">{client.name}</p>
            <p className="text-sm text-gray-500">{client.type}</p>
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Phone size={14} className="text-gray-400" />
          {client.phone}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Mail size={14} className="text-gray-400" />
          {client.email}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-gray-500">{client.projects} projects</span>
        <button className="font-medium hover:underline">View</button>
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Users size={28} className="text-gray-300" />
      <p className="font-medium text-gray-900">No clients match your search</p>
      <p className="text-sm text-gray-500">Try a different name, email, or clear your filters.</p>
      <button onClick={onReset} className="mt-2 text-sm font-medium underline">
        Clear search and filters
      </button>
    </div>
  );
}