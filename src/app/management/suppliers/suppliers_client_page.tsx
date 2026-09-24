"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  X,
  ChevronDown,
  Filter,
  SearchX,
  ArrowUpRight,
  Award,
  MapPin,
  Phone,
  User,
  Hash,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { StatCard } from "@/app/components/StatCard";
import CustomSelect from "@/app/components/custom_select";

import {
  type Supplier,
  type SupplierStatus,
} from "./types";

const STATUS_LABELS: Record<SupplierStatus, string> = {
  Active: "Activo",
  Inactive: "Inativo",
  Prospective: "Potencial",
};

const STATUS_STYLES: Record<SupplierStatus, string> = {
  Active:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
  Inactive:
    "border border-slate-200 bg-slate-100 text-slate-600",
  Prospective:
    "border border-amber-200 bg-amber-50 text-amber-700",
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
  const [categoryFilter, setCategoryFilter] =
    useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  const summary = useMemo(
    () => [
      {
        label: "Total de fornecedores",
        value: suppliers.length,
        icon: Building2,
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
        icon: Building2,
      },
    ],
    [suppliers, categories]
  );

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
              typeof value === "string" &&
              value.trim().length > 0
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

  const hasFilters =
    query.trim().length > 0 ||
    statusFilter !== "All" ||
    categoryFilter !== "All";

  const handleViewSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailsOpen(true);
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setCategoryFilter("All");
  };

  const handleAddSupplier = () => {
    router.push("/management/suppliers/new");
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Fornecedores
            </h1>

            <p className="mt-1 text-slate-500">
              Gerir fornecedores, materiais, contratos e desempenho.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSupplier}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-5 py-2.5 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 active:scale-[0.98]"
          >
            <Plus size={16} />
            Adicionar fornecedor
          </button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map(({ label, value, icon: Icon }) => (
            <StatCard
              key={label}
              icon={<Icon size={22} />}
              title={label}
              value={String(value)}
            />
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-xl">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              type="search"
              placeholder="Pesquisar fornecedor, NIF, contacto ou categoria..."
              aria-label="Pesquisar fornecedores"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar pesquisa"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <StatusFilter
              filtersOpen={filtersOpen}
              setFiltersOpen={setFiltersOpen}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

            <CustomSelect
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              aria-label="Filtrar por categoria"
              className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 sm:w-auto"
            >
              <option value="All">
                Todas as categorias
              </option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </CustomSelect>
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "fornecedor"
              : "fornecedores"}
            {hasFilters
              ? ` de ${suppliers.length}`
              : ""}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Supplier table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">
                    Fornecedor
                  </th>

                  <th className="px-6 py-4">
                    Categoria
                  </th>

                  <th className="px-6 py-4">
                    Localização
                  </th>

                  <th className="px-6 py-4">
                    Avaliação
                  </th>

                  <th className="px-6 py-4">
                    Contacto
                  </th>

                  <th className="px-6 py-4">
                    Estado
                  </th>

                  <th className="w-12 px-4 py-4">
                    <span className="sr-only">
                      Acções
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {suppliers.length === 0 ? (
                  <EmptySupplierState
                    onAdd={handleAddSupplier}
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

      {/* Details modal */}
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
/* Status filter                                                               */
/* -------------------------------------------------------------------------- */

interface StatusFilterProps {
  filtersOpen: boolean;
  setFiltersOpen: (isOpen: boolean) => void;
  statusFilter: "All" | SupplierStatus;
  setStatusFilter: (
    filter: "All" | SupplierStatus
  ) => void;
}

function StatusFilter({
  filtersOpen,
  setFiltersOpen,
  statusFilter,
  setStatusFilter,
}: StatusFilterProps) {
  const active = statusFilter !== "All";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setFiltersOpen(!filtersOpen)
        }
        aria-expanded={filtersOpen}
        aria-haspopup="menu"
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition sm:w-auto ${
          active
            ? "border-slate-300 bg-slate-50 text-slate-900"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <Filter size={14} />

        Filtros

        {active && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#002950] px-1.5 text-[10px] font-semibold text-white">
            1
          </span>
        )}

        <ChevronDown
          size={14}
          className={`transition-transform ${
            filtersOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {filtersOpen && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
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
              className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                statusFilter === status
                  ? "bg-slate-50 font-medium text-slate-900"
                  : "text-slate-600"
              }`}
            >
              {status === "All"
                ? "Todos"
                : STATUS_LABELS[status]}

              {statusFilter === status && (
                <CheckCircle2
                  size={14}
                  className="text-[#BD9655]"
                />
              )}
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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#002950] text-xs font-bold text-white">
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
      className="tracking-wide text-slate-700"
      aria-label={`Avaliação ${safeCount} de 5`}
    >
      {"★".repeat(safeCount)}
      <span className="text-slate-200">
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
    <tr className="group transition-colors hover:bg-slate-50/70">
      {/* Supplier */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={supplier.supplier_name ?? ""}
          />

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {supplier.supplier_name ||
                "Fornecedor sem nome"}
            </p>

            {supplier.nif && (
              <p className="mt-0.5 text-xs text-slate-400">
                NIF: {supplier.nif}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-slate-700">
          {supplier.category || "—"}
        </div>

        {supplier.sub_category && (
          <div className="mt-0.5 text-xs text-slate-400">
            {supplier.sub_category}
          </div>
        )}
      </td>

      {/* Location */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin
            size={14}
            className="shrink-0 text-slate-400"
          />

          <span>
            {supplier.city ||
              supplier.country ||
              "—"}
          </span>
        </div>
      </td>

      {/* Rating */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Stars count={supplier.rating ?? 0} />

          {supplier.rating !== null && (
            <span className="text-xs font-medium text-slate-500">
              {supplier.rating}/5
            </span>
          )}
        </div>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        {supplier.person_of_contact ? (
          <div>
            <p className="max-w-[180px] truncate text-sm text-slate-700">
              {supplier.person_of_contact}
            </p>

            {supplier.phone_number && (
              <p className="mt-0.5 text-xs text-slate-400">
                {supplier.phone_number}
              </p>
            )}
          </div>
        ) : supplier.phone_number ? (
          <p className="text-sm text-slate-600">
            {supplier.phone_number}
          </p>
        ) : (
          <span className="text-sm text-slate-400">
            —
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-4">
        <button
          type="button"
          onClick={() => onView(supplier)}
          aria-label={`Ver ${supplier.supplier_name}`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-white hover:text-slate-700 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        >
          <MoreVertical size={16} />
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
      <td colSpan={7} className="px-6 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>

          <h3 className="mt-6 text-lg font-semibold text-slate-900">
            Nenhum fornecedor registado
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Adicione o seu primeiro fornecedor para
            começar a gerir fornecedores e desempenho.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#002950] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#002950]/90"
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
      <td colSpan={7} className="px-6 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <SearchX className="h-8 w-8 text-slate-400" />
          </div>

          <h3 className="mt-6 text-lg font-semibold text-slate-900">
            Nenhum fornecedor encontrado
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Tente alterar os filtros ou pesquisar por
            outro fornecedor.
          </p>

          <button
            type="button"
            onClick={onReset}
            className="mt-6 cursor-pointer rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-details-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              name={supplier.supplier_name ?? ""}
            />

            <div className="min-w-0">
              <h2
                id="supplier-details-title"
                className="truncate text-lg font-semibold text-slate-900"
              >
                {supplier.supplier_name}
              </h2>

              <p className="truncate text-sm text-slate-500">
                {supplier.category ||
                  "Sem categoria"}
                {supplier.sub_category
                  ? ` · ${supplier.sub_category}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal body */}
        <div className="max-h-[calc(90vh-145px)] space-y-7 overflow-y-auto p-6">
          {/* Overview */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Estado
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Avaliação
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-900">
                  {rating}/5
                </span>

                <Stars count={rating} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <section>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <User
                size={16}
                className="text-slate-400"
              />
              Informações de contacto
            </h3>

            <div className="grid gap-5 rounded-xl border border-slate-200 bg-slate-50/60 p-5 sm:grid-cols-2">
              <DetailItem
                icon={<User size={14} />}
                label="Pessoa de contacto"
                value={supplier.person_of_contact}
              />

              <DetailItem
                icon={<Phone size={14} />}
                label="Telefone"
                value={supplier.phone_number}
              />

              <DetailItem
                icon={<Hash size={14} />}
                label="NIF"
                value={supplier.nif}
              />

              <DetailItem
                icon={<MapPin size={14} />}
                label="Cidade"
                value={supplier.city}
              />

              <DetailItem
                icon={<MapPin size={14} />}
                label="País"
                value={supplier.country}
              />

              <DetailItem
                label="Endereço"
                value={supplier.address_line_1}
              />
            </div>
          </section>

          {/* Classification */}
          <section>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Classificação
            </h3>

            <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
              <DetailItem
                label="Categoria"
                value={supplier.category}
              />

              <DetailItem
                label="Subcategoria"
                value={supplier.sub_category}
              />
            </div>
          </section>

          {/* Rating */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Award
                  size={16}
                  className="text-slate-400"
                />
                Avaliação
              </h3>

              <span className="text-sm font-medium text-slate-700">
                {rating}/5
              </span>
            </div>

            {supplier.rating === null ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Este fornecedor ainda não foi
                avaliado.
              </div>
            ) : (
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#002950] transition-all"
                  style={{
                    width: `${(rating / 5) * 100}%`,
                  }}
                />
              </div>
            )}
          </section>

          {/* Tags */}
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Tags
            </h3>

            <SupplierTags tags={supplier.tags} />
          </section>

          {/* Dates */}
          <section className="border-t border-slate-200 pt-5">
            <div className="grid gap-5 sm:grid-cols-2">
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
          </section>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
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
            className="cursor-pointer rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002950]/90"
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
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium text-slate-900">
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
      <p className="text-sm text-slate-500">
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
      <p className="text-sm text-slate-500">
        Nenhuma tag definida.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {parsedTags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
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

function formatDate(value: string | null) {
  if (!value) {
    return "Não definido";
  }

  return new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function routerToEditSupplier(supplierId: string) {
  window.location.href = `/management/suppliers/${supplierId}/edit`;
}