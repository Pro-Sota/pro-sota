"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  History,
  ArrowRightLeft,
  CheckCircle2,
  Package,
  MoreVertical,
  Wrench,
  CircleAlert,
  Boxes,
  Truck,
  HardHat,
  Warehouse,
  ClipboardCheck,
} from "lucide-react";

import CustomSelect from "@/app/components/custom_select";
import { StatCard } from "@/app/components/StatCard";
import CreateResourceModal from "./creating_resource_modal";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ResourceType =
  | "Material consumível"
  | "Equipamento"
  | "Ferramenta"
  | "EPI"
  | "Viatura";

export type ResourceCondition =
  | "Operacional"
  | "Com restrição"
  | "Em manutenção"
  | "Avariado"
  | "Abatido";

export type ResourceLocationType =
  | "Armazém"
  | "Escritório"
  | "Obra"
  | "Colaborador"
  | "Fornecedor";

export type UnitOfMeasure =
  | "unidade"
  | "saco"
  | "kg"
  | "tonelada"
  | "m³"
  | "m"
  | "caixa"
  | "litro";

export type Resource = {
  resource_id: string;
  code: string;
  name: string;

  resource_type: ResourceType;
  category: string | null;

  brand: string | null;
  model: string | null;
  serial_number: string | null;

  condition: ResourceCondition;

  project_id: string | null;
  project_name: string | null;

  location_type: ResourceLocationType | null;
  location_name: string | null;

  holder_profile_id: string | null;
  holder_name: string | null;

  acquisition_date: string | null;
  collection_date: string | null;
  expected_return_date: string | null;

  last_maintenance_date: string | null;
  next_maintenance_date: string | null;

  replacement_value: number | null;

  delivery_term_accepted: boolean;

  unit_of_measure: UnitOfMeasure | null;
  current_stock: number | null;
  minimum_stock: number | null;
  reserved_quantity: number | null;
  quantity_in_works: number | null;
  average_unit_cost: number | null;
  stock_value: number | null;

  supplier_id: string | null;
  supplier_name: string | null;

  batch_number: string | null;
  expiry_date: string | null;
};

export type ResourceMovement = {
  movement_id: string;
  movement_date: string;

  movement_type:
    | "Entrada"
    | "Saída"
    | "Transferência"
    | "Devolução"
    | "Consumo"
    | "Manutenção"
    | "Baixa";

  resource_id: string;
  resource_name: string;

  quantity: number | null;
  unit_of_measure: UnitOfMeasure | null;

  origin: string | null;
  destination: string | null;
  project_name: string | null;

  responsible_name: string | null;
  created_by_name: string | null;

  expected_return_date: string | null;
  notes: string | null;
};

export type ResourceStats = {
  totalResources: number;
  totalStockValue: number;
  availableResources: number;
  resourcesInUse: number;
  resourcesInMaintenance: number;
  resourcesMissingLocation: number;
  overdueReturns: number;
  lowStockItems: number;
};

export interface EquipmentPageProps {
  resources: Resource[];
  recentMovements: ResourceMovement[];
  stats: ResourceStats;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const RESOURCE_TYPES: ResourceType[] = [
  "Material consumível",
  "Equipamento",
  "Ferramenta",
  "EPI",
  "Viatura",
];

const RESOURCE_CONDITIONS: ResourceCondition[] = [
  "Operacional",
  "Com restrição",
  "Em manutenção",
  "Avariado",
  "Abatido",
];

const CONDITION_STYLES: Record<ResourceCondition, string> = {
  Operacional:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
  "Com restrição":
    "border border-amber-200 bg-amber-50 text-amber-700",
  "Em manutenção":
    "border border-blue-200 bg-blue-50 text-blue-700",
  Avariado:
    "border border-red-200 bg-red-50 text-red-700",
  Abatido:
    "border border-slate-200 bg-slate-100 text-slate-600",
};

const CONDITION_DOTS: Record<ResourceCondition, string> = {
  Operacional: "bg-emerald-500",
  "Com restrição": "bg-amber-500",
  "Em manutenção": "bg-blue-500",
  Avariado: "bg-red-500",
  Abatido: "bg-slate-500",
};

const MOVEMENT_STYLES: Record<
  ResourceMovement["movement_type"],
  string
> = {
  Entrada: "text-emerald-700 bg-emerald-50",
  Saída: "text-blue-700 bg-blue-50",
  Transferência: "text-violet-700 bg-violet-50",
  Devolução: "text-teal-700 bg-teal-50",
  Consumo: "text-orange-700 bg-orange-50",
  Manutenção: "text-amber-700 bg-amber-50",
  Baixa: "text-red-700 bg-red-50",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value?: number | null) => {
  if (value == null) return "—";

  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value?: number | null) => {
  if (value == null) return "—";

  return new Intl.NumberFormat("pt-AO", {
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-AO").format(date);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const isConsumable = (type: ResourceType) =>
  type === "Material consumível";

function getResourceTypeIcon(type: ResourceType) {
  switch (type) {
    case "Material consumível":
      return <Boxes size={16} />;

    case "Equipamento":
      return <Wrench size={16} />;

    case "Ferramenta":
      return <Wrench size={16} />;

    case "EPI":
      return <HardHat size={16} />;

    case "Viatura":
      return <Truck size={16} />;

    default:
      return <Package size={16} />;
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function EquipmentPage({
  resources,
  recentMovements,
  stats,
}: EquipmentPageProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<ResourceType | "Todos os Tipos">(
      "Todos os Tipos",
    );

  const [conditionFilter, setConditionFilter] =
    useState<ResourceCondition | "Todos os Estados">(
      "Todos os Estados",
    );

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const calculatedStats = useMemo<ResourceStats>(() => {
    const totalStockValue = resources.reduce(
      (total, resource) =>
        total + (resource.stock_value ?? 0),
      0,
    );

    return {
      totalResources: resources.length,

      totalStockValue,

      availableResources: resources.filter(
        (resource) =>
          resource.condition === "Operacional" &&
          !resource.holder_profile_id,
      ).length,

      resourcesInUse: resources.filter(
        (resource) =>
          Boolean(resource.holder_profile_id) ||
          resource.location_type === "Obra" ||
          resource.location_type === "Colaborador",
      ).length,

      resourcesInMaintenance: resources.filter(
        (resource) =>
          resource.condition === "Em manutenção",
      ).length,

      resourcesMissingLocation: resources.filter(
        (resource) =>
          !resource.location_type ||
          !resource.location_name,
      ).length,

      overdueReturns: resources.filter((resource) => {
        if (!resource.expected_return_date) {
          return false;
        }

        if (!resource.holder_profile_id) {
          return false;
        }

        const today = new Date();

        const returnDate = new Date(
          `${resource.expected_return_date}T23:59:59`,
        );

        return returnDate.getTime() < today.getTime();
      }).length,

      lowStockItems: resources.filter((resource) => {
        if (!isConsumable(resource.resource_type)) {
          return false;
        }

        if (
          resource.minimum_stock == null ||
          resource.current_stock == null
        ) {
          return false;
        }

        return (
          resource.current_stock <=
          resource.minimum_stock
        );
      }).length,
    };
  }, [resources]);

  const displayStats = stats ?? calculatedStats;

  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesQuery =
        normalizedQuery === "" ||
        [
          resource.code,
          resource.name,
          resource.category,
          resource.brand,
          resource.model,
          resource.serial_number,
          resource.project_name,
          resource.location_name,
          resource.holder_name,
          resource.supplier_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesType =
        typeFilter === "Todos os Tipos" ||
        resource.resource_type === typeFilter;

      const matchesCondition =
        conditionFilter === "Todos os Estados" ||
        resource.condition === conditionFilter;

      return (
        matchesQuery &&
        matchesType &&
        matchesCondition
      );
    });
  }, [
    resources,
    query,
    typeFilter,
    conditionFilter,
  ]);

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("Todos os Tipos");
    setConditionFilter("Todos os Estados");
  };

  const openResourceDetail = (resourceId: string) => {
    router.push(`/management/work-resources/${resourceId}`);
  };

  return (
    <div className="min-h-screen p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Recursos de obra
            </h1>

            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Controle materiais, equipamentos,
              ferramentas, EPI e viaturas, incluindo
              localização, stock, utilização,
              manutenção e movimentações.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
          >
            <Plus size={16} />
            Registar Recurso
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
          <StatCard
            title="Total de Recursos"
            value={`${displayStats.totalResources}`}
            icon={<Boxes size={18} />}
          />

          <StatCard
            title="Valor em Stock"
            value={formatCurrency(
              displayStats.totalStockValue,
            )}
            icon={<Package size={18} />}
          />

          <StatCard
            title="Disponíveis"
            value={`${displayStats.availableResources}`}
            icon={<CheckCircle2 size={18} />}
          />

          <StatCard
            title="Em Utilização"
            value={`${displayStats.resourcesInUse}`}
            icon={<ArrowRightLeft size={18} />}
          />

          <StatCard
            title="Em Manutenção"
            value={`${displayStats.resourcesInMaintenance}`}
            icon={<Wrench size={18} />}
          />

          <StatCard
            title="Stock Mínimo"
            value={`${displayStats.lowStockItems}`}
            icon={<CircleAlert size={18} />}
          />
        </div>

        {/* Alerts */}
        {(displayStats.lowStockItems > 0 ||
          displayStats.overdueReturns > 0 ||
          displayStats.resourcesMissingLocation > 0) && (
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            {displayStats.lowStockItems > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <CircleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Stock mínimo atingido
                  </p>

                  <p className="mt-1 text-xs text-amber-700">
                    {displayStats.lowStockItems} recurso(s)
                    consumível(eis) precisam de reposição.
                  </p>
                </div>
              </div>
            )}

            {displayStats.overdueReturns > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <CircleAlert
                  size={18}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Devoluções em atraso
                  </p>

                  <p className="mt-1 text-xs text-red-700">
                    {displayStats.overdueReturns} recurso(s)
                    têm devolução prevista ultrapassada.
                  </p>
                </div>
              </div>
            )}

            {displayStats.resourcesMissingLocation > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <Warehouse
                  size={18}
                  className="mt-0.5 shrink-0 text-slate-500"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Localização por confirmar
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {displayStats.resourcesMissingLocation} recurso(s)
                    sem localização confirmada.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-lg">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Pesquisar recurso, código, série, obra, responsável..."
              aria-label="Pesquisar recursos"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <CustomSelect
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | ResourceType
                    | "Todos os Tipos",
                )
              }
              aria-label="Filtrar por tipo"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none sm:w-auto"
            >
              <option value="Todos os Tipos">
                Todos os Tipos
              </option>

              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </CustomSelect>

            <CustomSelect
              value={conditionFilter}
              onChange={(event) =>
                setConditionFilter(
                  event.target.value as
                    | ResourceCondition
                    | "Todos os Estados",
                )
              }
              aria-label="Filtrar por estado de conservação"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none sm:w-auto"
            >
              <option value="Todos os Estados">
                Todos os Estados
              </option>

              {RESOURCE_CONDITIONS.map(
                (condition) => (
                  <option
                    key={condition}
                    value={condition}
                  >
                    {condition}
                  </option>
                ),
              )}
            </CustomSelect>
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {filtered.length}{" "}
            {filtered.length === 1
              ? "recurso encontrado"
              : "recursos encontrados"}
          </p>

          {(query ||
            typeFilter !== "Todos os Tipos" ||
            conditionFilter !== "Todos os Estados") && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-fit font-medium text-[#002950] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Resources table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[2400px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Código</th>
                  <th className="px-5 py-3">Recurso</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Categoria</th>
                  <th className="px-5 py-3">
                    Marca / Modelo
                  </th>
                  <th className="px-5 py-3">
                    N.º Série
                  </th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">
                    Localização
                  </th>
                  <th className="px-5 py-3">
                    Responsável
                  </th>
                  <th className="px-5 py-3">
                    Obra / Projecto
                  </th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">
                    Stock Mínimo
                  </th>
                  <th className="px-5 py-3">
                    Últ. Manutenção
                  </th>
                  <th className="px-5 py-3">
                    Próx. Manutenção
                  </th>
                  <th className="px-5 py-3">
                    Substituição
                  </th>
                  <th className="px-5 py-3">
                    Termo
                  </th>
                  <th className="px-5 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const consumable = isConsumable(
                    item.resource_type,
                  );

                  const lowStock =
                    consumable &&
                    item.current_stock != null &&
                    item.minimum_stock != null &&
                    item.current_stock <=
                      item.minimum_stock;

                  return (
                    <tr
                      key={item.resource_id}
                      className="group cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      onClick={() =>
                        openResourceDetail(item.resource_id)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          openResourceDetail(
                            item.resource_id,
                          );
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`Ver detalhes de ${item.name}`}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                        <span className="transition group-hover:text-[#002950]">
                          {item.code}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-900 transition group-hover:text-[#002950]">
                          {item.name}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                          {getResourceTypeIcon(
                            item.resource_type,
                          )}

                          {item.resource_type}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {item.category || "—"}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {item.brand || item.model
                          ? `${item.brand ?? ""}${
                              item.brand &&
                              item.model
                                ? " / "
                                : ""
                            }${item.model ?? ""}`
                          : "—"}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                        {item.serial_number || "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${CONDITION_STYLES[item.condition]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${CONDITION_DOTS[item.condition]}`}
                          />

                          {item.condition}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        <div>
                          <p className="font-medium text-slate-700">
                            {item.location_type || "—"}
                          </p>

                          {item.location_name && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {item.location_name}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {item.holder_name || "—"}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {item.project_name || "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        {consumable ? (
                          <div>
                            <p
                              className={`font-medium ${
                                lowStock
                                  ? "text-amber-700"
                                  : "text-slate-900"
                              }`}
                            >
                              {formatNumber(
                                item.current_stock,
                              )}{" "}
                              {item.unit_of_measure ?? ""}
                            </p>

                            {item.stock_value != null && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {formatCurrency(
                                  item.stock_value,
                                )}
                              </p>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {consumable
                          ? `${formatNumber(
                              item.minimum_stock,
                            )} ${
                              item.unit_of_measure ?? ""
                            }`
                          : "—"}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDate(
                          item.last_maintenance_date,
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDate(
                          item.next_maintenance_date,
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {formatCurrency(
                          item.replacement_value,
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        {item.delivery_term_accepted ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <ClipboardCheck size={15} />
                            Aceite
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td
                        className="px-5 py-3.5"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`Histórico de ${item.name}`}
                            title="Histórico"
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <History size={15} />
                          </button>

                          <button
                            type="button"
                            aria-label={`Registar movimento de ${item.name}`}
                            title="Registar movimento"
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <ArrowRightLeft size={15} />
                          </button>

                          <button
                            type="button"
                            aria-label={`Mais opções para ${item.name}`}
                            title="Mais opções"
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Package
                  size={28}
                  className="text-slate-400"
                />
              </div>

              <h3 className="text-base font-semibold text-slate-900">
                {query ||
                typeFilter !== "Todos os Tipos" ||
                conditionFilter !== "Todos os Estados"
                  ? "Nenhum recurso encontrado"
                  : "Nenhum recurso registado"}
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                {query ||
                typeFilter !== "Todos os Tipos" ||
                conditionFilter !== "Todos os Estados"
                  ? "Não encontramos recursos que correspondam aos filtros ou à pesquisa."
                  : "Registe o primeiro recurso para começar a gerir materiais, equipamentos e ferramentas."}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {(query ||
                  typeFilter !== "Todos os Tipos" ||
                  conditionFilter !== "Todos os Estados") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Limpar filtros
                  </button>
                )}

                {!query &&
                  typeFilter === "Todos os Tipos" &&
                  conditionFilter === "Todos os Estados" && (
                    <button
                      type="button"
                      onClick={() =>
                        setIsAddModalOpen(true)
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                    >
                      <Plus size={16} />
                      Registar Recurso
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Recent movements */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Movimentações Recentes
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Registo de entradas, saídas, transferências,
              devoluções, consumos, manutenção e baixas.
            </p>
          </div>

          {recentMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <History
                  size={22}
                  className="text-slate-400"
                />
              </div>

              <p className="text-sm font-medium text-slate-700">
                Nenhuma movimentação recente
              </p>

              <p className="mt-1 text-xs text-slate-400">
                As movimentações dos recursos aparecerão
                aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentMovements.map((movement) => (
                <div
                  key={movement.movement_id}
                  className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                          MOVEMENT_STYLES[
                            movement.movement_type
                          ]
                        }`}
                      >
                        {movement.movement_type}
                      </span>

                      <span className="text-xs text-slate-400">
                        {formatDateTime(
                          movement.movement_date,
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {movement.resource_name}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {movement.quantity != null && (
                        <span>
                          Quantidade:{" "}
                          {formatNumber(
                            movement.quantity,
                          )}{" "}
                          {movement.unit_of_measure ?? ""}
                        </span>
                      )}

                      {movement.origin && (
                        <span>
                          Origem: {movement.origin}
                        </span>
                      )}

                      {movement.destination && (
                        <span>
                          Destino: {movement.destination}
                        </span>
                      )}

                      {movement.project_name && (
                        <span>
                          Obra: {movement.project_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-left text-xs lg:text-right">
                    {movement.responsible_name && (
                      <p className="font-medium text-slate-700">
                        Responsável:{" "}
                        {movement.responsible_name}
                      </p>
                    )}

                    {movement.created_by_name && (
                      <p className="mt-1 text-slate-400">
                        Registado por:{" "}
                        {movement.created_by_name}
                      </p>
                    )}

                    {movement.expected_return_date && (
                      <p className="mt-1 text-slate-500">
                        Devolução:{" "}
                        {formatDate(
                          movement.expected_return_date,
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateResourceModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
