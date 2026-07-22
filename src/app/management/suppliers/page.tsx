import {
  Search,
  Plus,
  Building2,
  CheckCircle2,
  Clock,
  Boxes,
  Star,
  ArrowUpRight,
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

const statusStyles = {
  Ativo: { bg: tokens.oliveBg, text: tokens.olive },
  "Em Análise": { bg: tokens.amberBg, text: tokens.amber },
};

export default function SuppliersPage() {
  const suppliers = [
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
    { label: "Total de fornecedores", value: 245, icon: Building2 },
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
      className="min-h-screen p-6 md:p-10 bg-slate-100 font-serif"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-medium font-serif" >
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
            <div
              key={label}
              className="rounded-2xl p-5 border border-gray-300 bg-white"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {label}
                </p>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-300"
                >
                  <Icon size={16} />
                </div>
              </div>
              <h2 className="mt-3 text-3xl font-serif" >
                {value}
              </h2>
            </div>
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
        <div className="overflow-hidden rounded-2xl" style={{ background: tokens.card, border: `1px solid ${tokens.line}` }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${tokens.line}` }}>
                {["Fornecedor", "Categoria", "Localização", "Avaliação", "Projetos", "Status", "Ação"].map((h) => (
                  <th
                    key={h}
                    className="p-4 text-xs font-medium uppercase tracking-wide"
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
                    <td className="p-4" style={{ color: tokens.stone }}>{supplier.category}</td>
                    <td className="p-4" style={{ color: tokens.stone }}>{supplier.location}</td>
                    <td className="p-4"><Stars count={supplier.rating} /></td>
                    <td className="p-4">{supplier.projects}</td>
                    <td className="p-4">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{ background: s.bg, color: s.text }}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="p-4">
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