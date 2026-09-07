"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Briefcase, Download, Filter, Plus, Search, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatCard } from "../../components/StatCard";
import Loader from "@/app/components/loader";
import { getClients, type ClientWithProjectCount } from "@/services/clients";

const STATUS_LABELS: Record<string, string> = { Active: "Ativo", Inactive: "Inativo", Prospective: "Potencial" };
const STATUS_STYLES: Record<string, string> = { Active: "bg-green-100 text-green-700", Inactive: "bg-gray-100 text-gray-600", Prospective: "bg-amber-100 text-amber-700" };

function clientTypeLabel(type: string) {
  return { Company: "Empresa", Government: "Governo", Individual: "Particular" }[type] ?? type;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithProjectCount[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    getClients().then((data) => {
      if (active) setClients(data);
    }).catch((error) => {
      if (active) setLoadError(error instanceof Error ? error.message : "Não foi possível carregar os clientes.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return clients.filter((client) => {
      const matchesQuery = !normalizedQuery || [client.name, client.email, client.phone]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesQuery && (statusFilter === "All" || client.status === statusFilter);
    });
  }, [clients, query, statusFilter]);

  const companies = clients.filter((client) => client.client_type === "Company").length;
  const projectCount = clients.reduce((total, client) => total + client.projectCount, 0);
  const activeClients = clients.filter((client) => client.status === "Active").length;

  function exportClients() {
    const rows = [["Cliente", "Categoria", "Email", "Telefone", "Estado", "Projectos"], ...filtered.map((client) => [client.name, clientTypeLabel(client.client_type), client.email ?? "", client.phone ?? "", STATUS_LABELS[client.status] ?? client.status, String(client.projectCount)])];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "clientes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><h1 className="text-3xl font-bold text-gray-900">Clientes</h1><p className="text-gray-500">Gerir clientes, contactos e projectos.</p></div>
          <button onClick={() => router.push("/management/clients/create-client")} className="flex items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-[#00520] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"><Plus size={18} /> Novo Cliente</button>
        </div>
        {loadError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Users size={22} />} title="Total Clientes" value={String(clients.length)} />
          <StatCard icon={<Building2 size={22} />} title="Empresas" value={String(companies)} />
          <StatCard icon={<Briefcase size={22} />} title="Projectos" value={String(projectCount)} />
          <StatCard icon={<Users size={22} />} title="Clientes Activos" value={String(activeClients)} />
        </div>
        <div className="mt-8 flex flex-col gap-4 rounded-xl border bg-white p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1"><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Procurar por nome, email, ou número de telefone..." aria-label="Procurar clientes" className="w-full rounded-lg border py-2 pl-10 pr-9 outline-none focus:ring-2 focus:ring-black" />{query && <button onClick={() => setQuery("")} aria-label="Limpar pesquisa" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>}</div>
          <div className="relative"><button onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:w-auto"><Filter size={18} /> Filtros</button>{filtersOpen && <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border bg-white p-2 shadow-lg">{["All", "Active", "Prospective", "Inactive"].map((status) => <button key={status} onClick={() => { setStatusFilter(status); setFiltersOpen(false); }} className={`block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100 ${statusFilter === status ? "font-medium text-black" : "text-gray-600"}`}>{status === "All" ? "Todos" : STATUS_LABELS[status]}</button>)}</div>}</div>
          <button onClick={exportClients} disabled={!filtered.length} className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"><Download size={18} /> Exportar</button>
        </div>
        <p className="mt-4 text-sm text-gray-500">{filtered.length} de {clients.length} clientes</p>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white"><div className="overflow-x-auto"><table className="min-w-[720px] w-full"><thead className="border-b"><tr className="text-left text-sm text-gray-600"><th className="px-6 py-4 font-medium">Cliente</th><th className="px-6 py-4 font-medium">Categoria</th><th className="px-6 py-4 font-medium">Projectos</th><th className="px-6 py-4 font-medium">Contacto</th><th className="px-6 py-4 font-medium">Estado</th></tr></thead><tbody>{filtered.map((client) => <tr key={client.client_id} className="border-b last:border-0 hover:bg-gray-50"><td className="px-6 py-4 font-medium text-gray-900">{client.name}</td><td className="px-6 py-4 text-gray-600">{clientTypeLabel(client.client_type)}</td><td className="px-6 py-4 text-gray-600">{client.projectCount}</td><td className="px-6 py-4"><div className="text-sm text-gray-600">{client.phone ?? "—"}</div><div className="text-sm text-gray-400">{client.email ?? "—"}</div></td><td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-sm ${STATUS_STYLES[client.status] ?? "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[client.status] ?? client.status}</span></td></tr>)}</tbody></table></div>{!filtered.length && <EmptyState hasClients={clients.length > 0} onReset={() => { setQuery(""); setStatusFilter("All"); }} />}</div>
      </div>
    </div>
  );
}

function EmptyState({ hasClients, onReset }: { hasClients: boolean; onReset: () => void }) {
  return <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center"><Users size={28} className="text-gray-300" /><p className="font-medium text-gray-900">{hasClients ? "Nenhum cliente corresponde à pesquisa" : "Ainda não existem clientes"}</p><p className="text-sm text-gray-500">{hasClients ? "Tenta outro nome ou limpa os filtros." : "Adicione o primeiro cliente para começar."}</p>{hasClients && <button onClick={onReset} className="mt-2 text-sm font-medium underline">Limpar pesquisa e filtros</button>}</div>;
}
