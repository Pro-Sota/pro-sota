import { StatCard } from "@/app/components/StatCard";
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Boxes,
  ArrowUpRight,
  Building2Icon,
} from "lucide-react";

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

type SupplierStatus = "Ativo" | "Em Análise";

type Supplier = {
  name: string;
  category: string;
  location: string;
  rating: number;
  projects: number;
  status: SupplierStatus;
};

const statusStyles: Record<SupplierStatus, { bg: string; text: string }> = {
  Ativo: { bg: tokens.oliveBg, text: tokens.olive },
  "Em Análise": { bg: tokens.amberBg, text: tokens.amber },
};

export default function SuppliersPage() {
  const suppliers: Supplier[] = [
    {
      name: "ABC Materials Ltd.",
      category: "Materiais de Construção",
      location: "Luanda",
      rating: 4,
      projects: 12,
      status: "Ativo",
    },
    {
      name: "GreenBuild Solutions",
      category: "Materiais Sustentáveis",
      location: "Lisboa",
      rating: 5,
      projects: 8,
      status: "Ativo",
    },
    {
      name: "SteelWorks Africa",
      category: "Aço Estrutural",
      location: "Joanesburgo",
      rating: 4,
      projects: 5,
      status: "Em Análise",
    },
  ];

  const summary = [
    { label: "Total de fornecedores", value: 245, icon: Building2Icon },
    { label: "Ativos", value: 198, icon: CheckCircle2 },
    { label: "Em análise", value: 12, icon: Clock },
    { label: "Projetos vinculados", value: 67, icon: Boxes },
  ];

  function Stars({ count }:{count:number}) {
    return (
      <span className="text-slate-700">
        {"★".repeat(count)}
        <span style={{ color: tokens.line }}>{"★".repeat(5 - count)}</span>
      </span>
    );
  }

  return (
    <div
      className="min-h-screen p-6 md:p-10"
    >
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
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar fornecedores..."
              className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none bg-gray-300/30 border border-gray-200 text-gray-600 font-mono"
            />
          </div>

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
                {["Fornecedor", "Categoria", "Localização", "Avaliação", "Projetos", "Status", "Ação"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 font-medium"
                    style={{ color: tokens.stone }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {suppliers.map((supplier, index) => {
                const s = statusStyles[supplier.status];
                return (
                  <tr
                    key={index}
                    className="transition"
                    style={{ borderTop: index === 0 ? "none" : `1px solid ${tokens.line}` }}
                  >
                    <td className="p-4 font-medium">{supplier.name}</td>
                    <td className="p-4 font-medium" style={{ color: tokens.stone }}>{supplier.category}</td>
                    <td className="p-4 font-medium" style={{ color: tokens.stone }}>{supplier.location}</td>
                    <td className="p-4 font-medium"><Stars count={supplier.rating} /></td>
                    <td className="p-4 font-medium">{supplier.projects}</td>
                    <td className="p-4 font-medium">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{ background: s.bg, color: s.text }}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium">
                      <button
                        className="flex items-center gap-1 text-sm font-medium"
                        style={{ color: tokens.bronze }}
                      >
                        Ver
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}