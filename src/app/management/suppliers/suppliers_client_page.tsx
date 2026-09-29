"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  SearchX,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { StatCard } from "@/app/components/StatCard";

import type {
  Supplier,
  SupplierStatus,
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

type SortOption =
  | "name-asc"
  | "name-desc"
  | "rating-desc"
  | "rating-asc"
  | "newest"
  | "oldest";

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

  const [cityFilter, setCityFilter] =
    useState("All");

  const [ratingFilter, setRatingFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState<SortOption>("name-asc");

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        suppliers
          .map((supplier) => supplier.category?.trim())
          .filter(Boolean)
      )
    ).sort((a, b) =>
      String(a).localeCompare(String(b), "pt")
    ) as string[];
  }, [suppliers]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        suppliers
          .map((supplier) => supplier.city?.trim())
          .filter(Boolean)
      )
    ).sort((a, b) =>
      String(a).localeCompare(String(b), "pt")
    ) as string[];
  }, [suppliers]);

  const summary = useMemo(() => {
    const ratedSuppliers = suppliers.filter(
      (supplier) =>
        typeof supplier.rating === "number" &&
        supplier.rating > 0
    );

    const averageRating =
      ratedSuppliers.length > 0
        ? ratedSuppliers.reduce(
            (sum, supplier) =>
              sum + Number(supplier.rating),
            0
          ) / ratedSuppliers.length
        : 0;

    return [
      {
        label: "Total de fornecedores",
        value: suppliers.length,
        icon: Building2,
      },
      {
        label: "Activos",
        value: suppliers.filter(
          (supplier) => supplier.status === "Active"
        ).length,
        icon: CheckCircle2,
      },
      {
        label: "Potenciais",
        value: suppliers.filter(
          (supplier) =>
            supplier.status === "Prospective"
        ).length,
        icon: Clock,
      },
      {
        label: "Avaliação média",
        value:
          averageRating > 0
            ? `${averageRating.toFixed(1)}/5`
            : "—",
        icon: Award,
      },
    ];
  }, [suppliers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const result = suppliers.filter((supplier) => {
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

      const matchesCity =
        cityFilter === "All" ||
        supplier.city === cityFilter;

      const numericRating =
        typeof supplier.rating === "number"
          ? supplier.rating
          : 0;

      const matchesRating =
        ratingFilter === "All" ||
        (ratingFilter === "none"
          ? numericRating === 0
          : numericRating >= Number(ratingFilter));

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory &&
        matchesCity &&
        matchesRating
      );
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return b.supplier_name.localeCompare(
            a.supplier_name,
            "pt"
          );

        case "rating-desc":
          return (
            (Number(b.rating) || 0) -
            (Number(a.rating) || 0)
          );

        case "rating-asc":
          return (
            (Number(a.rating) || 0) -
            (Number(b.rating) || 0)
          );

        case "newest":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );

        case "oldest":
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );

        case "name-asc":
        default:
          return a.supplier_name.localeCompare(
            b.supplier_name,
            "pt"
          );
      }
    });
  }, [
    suppliers,
    query,
    statusFilter,
    categoryFilter,
    cityFilter,
    ratingFilter,
    sortBy,
  ]);

  const hasFilters =
    query.trim().length > 0 ||
    statusFilter !== "All" ||
    categoryFilter !== "All" ||
    cityFilter !== "All" ||
    ratingFilter !== "All";

  function clearFilters() {
    setQuery("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setCityFilter("All");
    setRatingFilter("All");
  }

  function handleAddSupplier() {
    router.push("/management/suppliers/new");
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Fornecedores
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 md:text-base">
              Gerir fornecedores, contactos, classificação e
              desempenho de parceiros da Sota.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSupplier}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 active:scale-[0.98]"
          >
            <Plus size={17} />
            Adicionar fornecedor
          </button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map(
            ({ label, value, icon: Icon }) => (
              <StatCard
                key={label}
                icon={<Icon size={21} />}
                title={label}
                value={String(value)}
              />
            )
          )}
        </div>

        {/* Search / filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <Search
                size={17}
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
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar pesquisa"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() =>
                  setFiltersOpen((value) => !value)
                }
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition ${
                  filtersOpen || hasFilters
                    ? "border-[#002950]/20 bg-[#002950]/5 text-[#002950]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter size={16} />
                Filtros
                {hasFilters && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#002950] px-1.5 text-[11px] font-semibold text-white">
                    {
                      [
                        statusFilter !== "All",
                        categoryFilter !== "All",
                        cityFilter !== "All",
                        ratingFilter !== "All",
                      ].filter(Boolean).length
                    }
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`transition ${
                    filtersOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as SortOption
                  )
                }
                aria-label="Ordenar fornecedores"
                className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
              >
                <option value="name-asc">
                  Nome A–Z
                </option>
                <option value="name-desc">
                  Nome Z–A
                </option>
                <option value="rating-desc">
                  Melhor avaliação
                </option>
                <option value="rating-asc">
                  Pior avaliação
                </option>
                <option value="newest">
                  Mais recentes
                </option>
                <option value="oldest">
                  Mais antigos
                </option>
              </select>
            </div>
          </div>

          {filtersOpen && (
            <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect
                label="Estado"
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(
                    value as "All" | SupplierStatus
                  )
                }
                options={[
                  ["All", "Todos os estados"],
                  ["Active", "Activos"],
                  ["Prospective", "Potenciais"],
                  ["Inactive", "Inactivos"],
                ]}
              />

              <FilterSelect
                label="Categoria"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  ["All", "Todas as categorias"],
                  ...categories.map((category) => [
                    category,
                    category,
                  ]),
                ]}
              />

              <FilterSelect
                label="Localização"
                value={cityFilter}
                onChange={setCityFilter}
                options={[
                  ["All", "Todas as localizações"],
                  ...cities.map((city) => [
                    city,
                    city,
                  ]),
                ]}
              />

              <FilterSelect
                label="Avaliação"
                value={ratingFilter}
                onChange={setRatingFilter}
                options={[
                  ["All", "Qualquer avaliação"],
                  ["5", "5 estrelas"],
                  ["4", "4+ estrelas"],
                  ["3", "3+ estrelas"],
                  ["2", "2+ estrelas"],
                  ["1", "1+ estrela"],
                  ["none", "Sem avaliação"],
                ]}
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">
              {filtered.length}
            </span>{" "}
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
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 lg:hidden">
          {suppliers.length === 0 ? (
            <EmptyMobileState
              title="Ainda não existem fornecedores"
              description="Comece por adicionar o primeiro fornecedor."
              actionLabel="Adicionar fornecedor"
              onAction={handleAddSupplier}
            />
          ) : filtered.length === 0 ? (
            <EmptyMobileState
              title="Nenhum fornecedor encontrado"
              description="Experimente alterar os filtros ou a pesquisa."
              actionLabel="Limpar filtros"
              onAction={clearFilters}
            />
          ) : (
            filtered.map((supplier) => (
              <SupplierMobileCard
                key={supplier.supplier_id}
                supplier={supplier}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
      >
        {options.map(([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SupplierRow({
  supplier,
}: {
  supplier: Supplier;
}) {
  const rating =
    typeof supplier.rating === "number"
      ? supplier.rating
      : 0;

  return (
    <tr className="group transition hover:bg-slate-50/70">
      <td className="px-6 py-4">
        <Link
          href={`/management/suppliers/${supplier.supplier_id}`}
          className="flex min-w-[240px] items-center gap-3"
        >
          <SupplierAvatar
            name={supplier.supplier_name}
          />

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {supplier.supplier_name}
            </p>

            {supplier.nif && (
              <p className="mt-0.5 text-xs text-slate-500">
                NIF: {supplier.nif}
              </p>
            )}
          </div>
        </Link>
      </td>

      <td className="px-6 py-4">
        <div>
          <p className="text-sm text-slate-700">
            {supplier.category || "—"}
          </p>

          {supplier.sub_category && (
            <p className="mt-0.5 text-xs text-slate-400">
              {supplier.sub_category}
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin
            size={14}
            className="shrink-0 text-slate-400"
          />
          {supplier.city ||
            supplier.country ||
            "—"}
        </div>
      </td>

      <td className="px-6 py-4">
        <Rating rating={rating} />
      </td>

      <td className="px-6 py-4">
        <div>
          <p className="text-sm text-slate-700">
            {supplier.person_of_contact || "—"}
          </p>

          {supplier.phone_number && (
            <p className="mt-0.5 text-xs text-slate-400">
              {supplier.phone_number}
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[supplier.status as SupplierStatus]
          }`}
        >
          {STATUS_LABELS[supplier.status as SupplierStatus]}
        </span>
      </td>

      <td className="px-4 py-4">
        <SupplierActions
          supplierId={supplier.supplier_id}
        />
      </td>
    </tr>
  );
}

function SupplierMobileCard({
  supplier,
}: {
  supplier: Supplier;
}) {
  const rating =
    typeof supplier.rating === "number"
      ? supplier.rating
      : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/management/suppliers/${supplier.supplier_id}`}
          className="flex min-w-0 items-center gap-3"
        >
          <SupplierAvatar
            name={supplier.supplier_name}
          />

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">
              {supplier.supplier_name}
            </p>

            {supplier.nif && (
              <p className="mt-0.5 text-xs text-slate-500">
                NIF: {supplier.nif}
              </p>
            )}
          </div>
        </Link>

        <SupplierActions
          supplierId={supplier.supplier_id}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Categoria
          </p>

          <p className="mt-1 text-sm text-slate-700">
            {supplier.category || "—"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Localização
          </p>

          <p className="mt-1 text-sm text-slate-700">
            {supplier.city ||
              supplier.country ||
              "—"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Contacto
          </p>

          <p className="mt-1 truncate text-sm text-slate-700">
            {supplier.person_of_contact || "—"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Avaliação
          </p>

          <div className="mt-1">
            <Rating rating={rating} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_STYLES[supplier.status as SupplierStatus]
          }`}
        >
          {STATUS_LABELS[supplier.status as SupplierStatus]}
        </span>

        <Link
          href={`/management/suppliers/${supplier.supplier_id}`}
          className="text-sm font-medium text-[#002950] hover:underline"
        >
          Ver fornecedor
        </Link>
      </div>
    </div>
  );
}

function SupplierActions({
  supplierId,
}: {
  supplierId: string;
}) {
  return (
    <details className="relative">
      <summary
        aria-label="Acções do fornecedor"
        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 [&::-webkit-details-marker]:hidden"
      >
        <MoreVertical size={17} />
      </summary>

      <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
        <Link
          href={`/management/suppliers/${supplierId}`}
          className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Ver fornecedor
        </Link>

        <Link
          href={`/management/suppliers/${supplierId}/edit`}
          className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Editar fornecedor
        </Link>
      </div>
    </details>
  );
}

function SupplierAvatar({
  name,
}: {
  name: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#002950]/8 text-sm font-semibold text-[#002950]">
      {initials || "F"}
    </div>
  );
}

function Rating({
  rating,
}: {
  rating: number;
}) {
  if (!rating) {
    return (
      <span className="text-sm text-slate-400">
        Sem avaliação
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Star
        size={14}
        className="fill-[#BD9655] text-[#BD9655]"
      />

      <span className="text-sm font-medium text-slate-700">
        {rating.toFixed(1)}
      </span>

      <span className="text-xs text-slate-400">
        /5
      </span>
    </div>
  );
}

function EmptySupplierState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Building2 size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            Ainda não existem fornecedores
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Adicione o primeiro fornecedor para começar a
            construir o directório de parceiros.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002950]/90"
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
      <td colSpan={7}>
        <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <SearchX size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            Nenhum fornecedor encontrado
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Não encontrámos fornecedores que correspondam
            aos filtros seleccionados.
          </p>

          <button
            type="button"
            onClick={onReset}
            className="mt-5 text-sm font-medium text-[#002950] hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      </td>
    </tr>
  );
}

function EmptyMobileState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Search size={21} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onAction}
        className="mt-5 text-sm font-medium text-[#002950] hover:underline"
      >
        {actionLabel}
      </button>
    </div>
  );
}