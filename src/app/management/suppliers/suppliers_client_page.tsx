"use client";

import { StatCard } from "@/app/components/StatCard";
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Building2Icon,
  X,
  ChevronDown,
  Filter,
  SearchX,
  Building2,
  ArrowUpRight,
  Award,
  MapPin,
  Phone,
  User,
  Hash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {useMemo, useState } from "react";

import {
  type Supplier,
  type SupplierStatus,
} from "./types"

const STATUS_LABELS: Record<SupplierStatus, string> = {
  Active: "Activo",
  Inactive: "Inativo",
  Prospective: "Potencial",
};

const STATUS_STYLES: Record<SupplierStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Prospective: "bg-amber-100 text-amber-700",
};

const tokens = {
  line: "#CBD5E1",
};

export default function SuppliersClientPage({
  suppliers,
}: {
  suppliers: Supplier[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | SupplierStatus>("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  /*
   * Get unique categories from the database.
   */
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      suppliers
        .map((supplier) => supplier.category?.trim())
        .filter(Boolean)
    );

    return Array.from(uniqueCategories).sort((a, b) =>
      a!.localeCompare(b!)
    ) as string[];
  }, [suppliers]);

  /*
   * Summary
   *
   * Projects are intentionally not counted here because
   * supplier_projects does not exist in the supplied schema yet.
   */
  
  const summary = [
    {
      label: "Total de fornecedores",
      value: suppliers.length,
      icon: Building2Icon,
    },
    {
      label: "Ativos",
      value: suppliers.filter(
        (supplier) => supplier.status === "Active"
      ).length,
      icon: CheckCircle2,
    },
    {
      label: "Em análise",
      value: suppliers.filter(
        (supplier) => supplier.status === "Prospective"
      ).length,
      icon: Clock,
    },
    {
      label: "Categorias",
      value: categories.length,
      icon: Building2Icon,
    },
  ];

  /*
   * Filtering
   */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return suppliers.filter((supplier) => {
      const searchableValues = [
        supplier.supplier_name,
        supplier.nif,
        supplier.person_of_contact,
        supplier.phone_number,
        supplier.address_line_1,
        supplier.city,
        supplier.country,
        supplier.category,
        supplier.sub_category,
      ];

      const matchesQuery =
        !q ||
        searchableValues
          .filter(
            (value): value is string =>
              typeof value === "string" && value.length > 0
          )
          .some((value) =>
            value.toLowerCase().includes(q)
          );

      const matchesStatus =
        statusFilter === "All" ||
        supplier.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        supplier.category === categoryFilter;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    suppliers,
    query,
    statusFilter,
    categoryFilter,
  ]);

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailsOpen(true);
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setCategoryFilter("All");
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestão de fornecedores
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Gerencie fornecedores, materiais, contratos e desempenho.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/management/suppliers/new")
            }
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-5 py-2.5 text-sm font-bold text-[#002950] transition hover:opacity-90"
          >
            <Plus size={16} />
            Adicionar fornecedor
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map(({ label, value, icon: Icon }) => (
            <StatCard
              key={label}
              icon={<Icon size={22} />}
              title={label}
              value={String(value)}
            />
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar por fornecedor, NIF, contacto, telefone ou categoria..."
              aria-label="Pesquisar fornecedores"
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

          {/* Status Filter */}
          <FilterBtn
            filtersOpen={filtersOpen}
            setFiltersOpen={setFiltersOpen}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            aria-label="Filtrar por categoria"
            className="cursor-pointer rounded-lg border border-gray-200 bg-gray-300/30 px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-black"
          >
            <option value="All">
              Todas as categorias
            </option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filtered.length} de {suppliers.length} fornecedores
          </p>

          {(query ||
            statusFilter !== "All" ||
            categoryFilter !== "All") && (
              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
              >
                Limpar filtros
              </button>
            )}
        </div>

        {/* Supplier Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-4 font-medium">
                    Fornecedor
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Categoria
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Localização
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Avaliação
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Contacto
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Estado
                  </th>

                  <th className="px-6 py-4 font-medium">
                    {" "}
                  </th>
                </tr>
              </thead>

              <tbody>
                {suppliers.length === 0 ? (
                  <EmptySupplierState
                    onAdd={() =>
                      router.push(
                        "/management/suppliers/new"
                      )
                    }
                  />
                ) : filtered.length === 0 ? (
                  <EmptyFilteredState
                    onReset={clearFilters}
                  />
                ) : (
                  filtered.map((supplier) => (
                    <SupplierRow
                      key={supplier.supplier_id}
                      supplier={supplier}
                      onView={handleViewSupplier}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Supplier Details Modal */}
      {detailsOpen && selectedSupplier && (
        <SupplierDetailsModal
          supplier={selectedSupplier}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedSupplier(null);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter button                                                               */
/* -------------------------------------------------------------------------- */

interface FilterProps {
  filtersOpen: boolean;
  setFiltersOpen: (isOpen: boolean) => void;
  statusFilter: "All" | SupplierStatus;
  setStatusFilter: (
    filter: "All" | SupplierStatus
  ) => void;
}

function FilterBtn({
  filtersOpen,
  setFiltersOpen,
  statusFilter,
  setStatusFilter,
}: FilterProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setFiltersOpen(!filtersOpen)
        }
        aria-expanded={filtersOpen}
        aria-haspopup="menu"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:w-auto"
      >
        <Filter size={14} />

        Filtros

        {statusFilter !== "All" && (
          <span className="rounded-full bg-black px-1.5 text-xs text-white">
            1
          </span>
        )}

        <ChevronDown
          size={14}
          className={`transition-transform ${filtersOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {filtersOpen && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-48 rounded-lg border bg-white p-2 shadow-lg"
        >
          <p className="px-2 pb-1 pt-1 text-xs font-medium uppercase text-gray-400">
            Estado
          </p>

          {(
            [
              "All",
              "Active",
              "Prospective",
              "Inactive",
            ] as const
          ).map((status) => (
            <button
              key={status}
              type="button"
              role="menuitem"
              onClick={() => {
                setStatusFilter(status);
                setFiltersOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-100 ${statusFilter === status
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
  );
}

/* -------------------------------------------------------------------------- */
/* Avatar                                                                      */
/* -------------------------------------------------------------------------- */

function Avatar({ name }: { name: string }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
      {initials}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stars                                                                       */
/* -------------------------------------------------------------------------- */

function Stars({ count }: { count: number }) {
  const safeCount = Math.max(
    0,
    Math.min(5, Math.round(count))
  );

  return (
    <span
      className="text-slate-700"
      aria-label={`Avaliação ${safeCount} de 5`}
    >
      {"★".repeat(safeCount)}

      <span style={{ color: tokens.line }}>
        {"★".repeat(5 - safeCount)}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Supplier row                                                                */
/* -------------------------------------------------------------------------- */

function SupplierRow({
  supplier,
  onView,
}: {
  supplier: Supplier;
  onView: (supplier: Supplier) => void;
}) {
  const status =
    (supplier.status as SupplierStatus | null) ??
    "Prospective";

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">
      {/* Supplier */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={supplier.supplier_name ?? ""}
          />

          <div>
            <p className="font-medium text-gray-900">
              {supplier.supplier_name}
            </p>

            {supplier.nif && (
              <p className="text-xs text-gray-400">
                NIF: {supplier.nif}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600">
          {supplier.category || "—"}
        </div>

        {supplier.sub_category && (
          <div className="text-xs text-gray-400">
            {supplier.sub_category}
          </div>
        )}
      </td>

      {/* Location */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin size={14} className="text-gray-400" />

          {supplier.city ||
            supplier.country ||
            "—"}
        </div>
      </td>

      {/* Rating */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Stars count={supplier.rating ?? 0} />

          {supplier.rating !== null && (
            <span className="text-xs text-gray-500">
              {supplier.rating}/5
            </span>
          )}
        </div>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        {supplier.person_of_contact && (
          <div className="text-sm text-gray-700">
            {supplier.person_of_contact}
          </div>
        )}

        {supplier.phone_number ? (
          <div className="text-xs text-gray-400">
            {supplier.phone_number}
          </div>
        ) : (
          !supplier.person_of_contact && (
            <span className="text-sm text-gray-400">
              —
            </span>
          )
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm ${STATUS_STYLES[status]
            }`}
        >
          {STATUS_LABELS[status]}
        </span>
      </td>

      {/* Action */}
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => onView(supplier)}
          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-700 underline-offset-3 hover:underline"
        >
          Ver
          <ArrowUpRight size={14} />
        </button>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty states                                                                */
/* -------------------------------------------------------------------------- */

function EmptySupplierState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
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
            Adicione o seu primeiro fornecedor para
            começar a gerir fornecedores e desempenho.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={16} />
            Adicionar fornecedor
          </button>
        </div>
      </td>
    </tr>
  );
}

function EmptyFilteredState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
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
            Tente alterar os filtros ou pesquisar por
            outro fornecedor.
          </p>

          <button
            type="button"
            onClick={onReset}
            className="mt-5 cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Limpar filtros
          </button>
        </div>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Supplier details modal                                                      */
/* -------------------------------------------------------------------------- */

interface SupplierDetailsModalProps {
  supplier: Supplier;
  onClose: () => void;
}

function SupplierDetailsModal({
  supplier,
  onClose,
}: SupplierDetailsModalProps) {
  const status =
    (supplier.status as SupplierStatus | null) ??
    "Prospective";

  const rating = supplier.rating ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-details-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={supplier.supplier_name ?? ""}
            />

            <div>
              <h2
                id="supplier-details-title"
                className="text-xl font-bold text-gray-900"
              >
                {supplier.supplier_name}
              </h2>

              <p className="text-xs text-gray-500">
                {supplier.category || "Sem categoria"}
                {supplier.sub_category
                  ? ` • ${supplier.sub_category}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="cursor-pointer rounded-lg p-2 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Status */}
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Estado
            </p>

            <div className="mt-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm ${STATUS_STYLES[status]
                  }`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
          </div>

          {/* Contact information */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <User size={18} />
              Informações de contacto
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                icon={<User size={15} />}
                label="Pessoa de contacto"
                value={
                  supplier.person_of_contact
                }
              />

              <DetailItem
                icon={<Phone size={15} />}
                label="Telefone"
                value={
                  supplier.phone_number
                }
              />

              <DetailItem
                icon={<Hash size={15} />}
                label="NIF"
                value={supplier.nif}
              />

              <DetailItem
                icon={<MapPin size={15} />}
                label="Cidade"
                value={supplier.city}
              />

              <DetailItem
                icon={<MapPin size={15} />}
                label="País"
                value={supplier.country}
              />

              <DetailItem
                label="Endereço"
                value={supplier.address_line_1}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">
              Classificação
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Categoria"
                value={supplier.category}
              />

              <DetailItem
                label="Subcategoria"
                value={
                  supplier.sub_category
                }
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <Award size={18} />
                Avaliação
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {rating}/5
                </span>

                <Stars count={rating} />
              </div>
            </div>

            {supplier.rating === null ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                Este fornecedor ainda não foi
                avaliado.
              </div>
            ) : (
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-slate-900 transition-all"
                  style={{
                    width: `${(rating / 5) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">
              Tags
            </h3>

            <SupplierTags tags={supplier.tags} />
          </div>

          {/* Dates */}
          <div className="border-t pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Criado em"
                value={formatDate(
                  supplier.created_at
                )}
              />

              <DetailItem
                label="Última atualização"
                value={formatDate(
                  supplier.updated_at
                )}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={() =>
              routerToEditSupplier(
                supplier.supplier_id
              )
            }
            className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Editar fornecedor
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail item                                                                 */
/* -------------------------------------------------------------------------- */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-gray-500">
        {icon}
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value || "Não definido"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tags                                                                        */
/* -------------------------------------------------------------------------- */

function SupplierTags({
  tags,
}: {
  tags: unknown;
}) {
  if (!tags) {
    return (
      <p className="text-sm text-gray-500">
        Nenhuma tag definida.
      </p>
    );
  }

  let parsedTags: string[] = [];

  if (Array.isArray(tags)) {
    parsedTags = tags.filter(
      (tag): tag is string =>
        typeof tag === "string"
    );
  } else if (
    typeof tags === "object" &&
    tags !== null
  ) {
    parsedTags = Object.values(tags).filter(
      (tag): tag is string =>
        typeof tag === "string"
    );
  }

  if (!parsedTags.length) {
    return (
      <p className="text-sm text-gray-500">
        Nenhuma tag definida.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {parsedTags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string | null
) {
  if (!value) {
    return "Não definido";
  }

  return new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function routerToEditSupplier(
  supplierId: string
) {
  window.location.href = `/management/suppliers/${supplierId}/edit`;
}
