"use client";
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
  FileUp,
  AlertCircle,
  Download,
  Trash2,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

type RatingCriteria = {
  label: string;
  score: number; // 1-5
  weight: number; // percentage weight
};

type Document = {
  id: string;
  name: string;
  type: "proposta" | "contrato" | "factura" | "ficha_tecnica" | "certificado" | "garantia" | "conformidade" | "licenca" | "seguro" | "outro";
  uploadDate: string;
  expiryDate?: string;
  uploader: string;
  status: "valido" | "expirando" | "expirado";
};

type Supplier = {
  name: string;
  category: string;
  location: string;
  rating: number;
  ratingCriteria: RatingCriteria[];
  projects: number;
  status: SupplierStatus;
  documents: Document[];
  contact?: string;
  email?: string;
};

const statusStyles: Record<SupplierStatus, string> = {
  Activo: "bg-green-100 text-green-700",
  "Em Análise": "bg-amber-100 text-amber-700",
  Inactivo: "bg-gray-100 text-gray-600",
};

const documentTypes = {
  proposta: "Proposta Comercial",
  contrato: "Contrato/Acordo-Quadro",
  factura: "Factura",
  ficha_tecnica: "Ficha Técnica",
  certificado: "Certificado de Qualidade",
  garantia: "Garantia",
  conformidade: "Declaração de Conformidade",
  licenca: "Licença/Alvará",
  seguro: "Seguro",
  outro: "Outro",
};

export default function SuppliersClientPage({suppliers}:{suppliers: Supplier[]}) {

  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | SupplierStatus>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailsOpen(true);
  };

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
            onClick={() => router.push("/management/suppliers/new")}
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
                    onView={handleViewSupplier}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Details Modal */}
      {detailsOpen && selectedSupplier && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          onClose={() => setDetailsOpen(false)}
        />
      )}
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

function DocumentStatusBadge({ status }: { status: "valido" | "expirando" | "expirado" }) {
  const styles = {
    valido: "bg-green-50 text-green-700 border border-green-200",
    expirando: "bg-amber-50 text-amber-700 border border-amber-200",
    expirado: "bg-red-50 text-red-700 border border-red-200",
  };

  const labels = {
    valido: "Válido",
    expirando: "Expira em breve",
    expirado: "Expirado",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {status === "expirado" && <AlertCircle size={12} />}
      {labels[status]}
    </span>
  );
}

function SupplierRow({
  supplier,
  onView,
}: {
  supplier: Supplier;
  onView: (supplier: Supplier) => void;
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
          onClick={() => onView(supplier)}
          className="cursor-pointer flex items-center gap-1 text-sm font-medium hover:underline underline-offset-3"
        >
          Ver
          <ArrowUpRight size={14} />
        </button>
      </td>
    </tr>
  );
}

interface SupplierDetailsModalProps {
  supplier: Supplier;
  onClose: () => void;
}

function SupplierDetailsModal({ supplier, onClose }: SupplierDetailsModalProps) {
  const [documents, setDocuments] = useState<Document[]>(supplier.documents || []);
  const expiredDocs = documents.filter(d => d.status === "expirado").length;
  const expiringDocs = documents.filter(d => d.status === "expirando").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-lg">
        {/* Modal Header */}
        <div className="sticky top-0 border-b bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={supplier.name} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{supplier.name}</h2>
              <p className="text-xs text-gray-500">{supplier.category} • {supplier.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 p-6">
          {/* Status & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
              <div className="mt-2">
                <StatusBadge status={supplier.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Contacto</p>
              <p className="mt-2 text-sm text-gray-900 font-medium">{supplier.contact || "Não definido"}</p>
              {supplier.email && <p className="text-xs text-gray-500">{supplier.email}</p>}
            </div>
          </div>

          {/* Rating Breakdown */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Award size={18} />
                Avaliação Objectiva
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{supplier.rating.toFixed(1)}</span>
                <span className="text-slate-700">
                  {"★".repeat(supplier.rating)}
                  <span style={{ color: tokens.line }}>{"★".repeat(5 - supplier.rating)}</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {supplier.ratingCriteria.map((criterion, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{criterion.label}</span>
                    <span className="font-medium text-gray-900">{criterion.score}/5</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-slate-900 transition-all"
                      style={{ width: `${(criterion.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 flex items-center gap-2">
              <FileUp size={18} />
              Documentação ({documents.length})
            </h3>

            {(expiredDocs > 0 || expiringDocs > 0) && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-900">
                  {expiredDocs > 0 && <span className="font-medium">{expiredDocs} documento(s) expirado(s)</span>}
                  {expiredDocs > 0 && expiringDocs > 0 && <span> • </span>}
                  {expiringDocs > 0 && <span className="font-medium">{expiringDocs} expira em breve</span>}
                </p>
              </div>
            )}

            <button className="mb-4 w-full rounded-lg border-2 border-dashed border-gray-300 py-6 text-center hover:border-gray-400 hover:bg-gray-50 transition">
              <FileUp size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Carregar novo documento</p>
              <p className="text-xs text-gray-500">ou arrastar ficheiro aqui</p>
            </button>

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                      <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500">
                        <span>{documentTypes[doc.type]}</span>
                        <span>Carregado por {doc.uploader} • {doc.uploadDate}</span>
                        {doc.expiryDate && (
                          <span className="text-gray-600">Validade: {doc.expiryDate}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <DocumentStatusBadge status={doc.status} />
                      <div className="flex gap-1">
                        <button className="p-2 rounded-lg hover:bg-gray-200 transition">
                          <Download size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-100 transition">
                          <Trash2 size={16} className="text-gray-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 py-6">Nenhum documento carregado</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Fechar
          </button>
          <button className="rounded-lg px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition">
            Editar fornecedor
          </button>
        </div>
      </div>
    </div>
  );
}