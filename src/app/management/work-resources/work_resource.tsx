"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  History,
  ArrowRightLeft,
  CheckCircle2,
  CircleAlert,
  Boxes,
  Warehouse,
  Wrench,
} from "lucide-react";

import CustomSelect from "@/app/components/custom_select";
import { StatCard } from "@/app/components/StatCard";
import CreateResourceModal from "./creating_resource_modal";
import ResourceTable from "@/app/management/work-resources/resource_table";
import ResourceMovementModal from "@/app/management/work-resources/resource_movement_modal";

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
  stats?: ResourceStats | null;
}

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

const isConsumable = (type: ResourceType) =>
  type === "Material consumível";

export default function ResourcesPage({
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

  const [selectedResource, setSelectedResource] =
    useState<Resource | null>(null);

  const [movementModalOpen, setMovementModalOpen] =
    useState(false);

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  /*
   * Server stats are authoritative.
   * The fallback only exists for pages where stats
   * haven't been provided yet.
   */
  const calculatedStats = useMemo<ResourceStats>(() => {
    return {
      totalResources: resources.length,

      totalStockValue: resources.reduce(
        (total, resource) =>
          total + (resource.stock_value ?? 0),
        0,
      ),

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
        if (
          !resource.expected_return_date ||
          !resource.holder_profile_id
        ) {
          return false;
        }

        return (
          new Date(
            `${resource.expected_return_date}T23:59:59`,
          ).getTime() < new Date().setHours(0, 0, 0, 0)
        );
      }).length,

      lowStockItems: resources.filter((resource) => {
        if (
          !isConsumable(resource.resource_type) ||
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

  const displayStats =
    stats ?? calculatedStats;

  const filteredResources = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return resources.filter((resource) => {
      const searchable = [
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
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchable.includes(normalizedQuery);

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

  function clearFilters() {
    setQuery("");
    setTypeFilter("Todos os Tipos");
    setConditionFilter("Todos os Estados");
  }

  function openMovement(resource: Resource) {
    setSelectedResource(resource);
    setMovementModalOpen(true);
  }

  function closeMovement() {
    setMovementModalOpen(false);
    setSelectedResource(null);
  }

  async function handleMovementSubmit(data: {
    resource_id: string;
    movement_type: ResourceMovement["movement_type"];
    quantity: number | null;
    origin: string | null;
    destination: string | null;
    expected_return_date: string | null;
    notes: string | null;
  }) {
    /*
     * Connect this to the server action:
     *
     * await createResourceMovement(data)
     *
     * The page can then call router.refresh().
     */
    console.log(data);

    router.refresh();
  }

  return (
    <div className="min-h-screen p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-[1500px]">
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
            onClick={() =>
              setIsAddModalOpen(true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
          >
            <Plus size={16} />
            Registar Recurso
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          <StatCard
            title="Total de Recursos"
            value={`${displayStats.totalResources}`}
            icon={<Boxes size={18} />}
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
          displayStats.resourcesMissingLocation >
            0) && (
          <div className="mb-6 grid gap-3 lg:grid-cols-3">
            {displayStats.lowStockItems > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <CircleAlert
                    size={18}
                    className="shrink-0 text-amber-600"
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
              </div>
            )}

            {displayStats.overdueReturns > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <CircleAlert
                    size={18}
                    className="shrink-0 text-red-600"
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
              </div>
            )}

            {displayStats.resourcesMissingLocation >
              0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex gap-3">
                  <Warehouse
                    size={18}
                    className="shrink-0 text-slate-500"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Localização por confirmar
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        displayStats.resourcesMissingLocation
                      }{" "}
                      recurso(s) sem localização confirmada.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
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
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:w-auto"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:w-auto"
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

        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            {filteredResources.length}{" "}
            {filteredResources.length === 1
              ? "recurso encontrado"
              : "recursos encontrados"}
          </span>

          {(query ||
            typeFilter !== "Todos os Tipos" ||
            conditionFilter !== "Todos os Estados") && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-medium text-[#002950] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Table */}
        <ResourceTable
          resources={filteredResources}
          onOpen={(resource) =>
            router.push(
              `/management/work-resources/${resource.resource_id}`,
            )
          }
          onHistory={(resource) =>
            router.push(
              `/management/work-resources/${resource.resource_id}/history`,
            )
          }
          onMovement={openMovement}
          onEdit={(resource) =>
            router.push(
              `/management/work-resources/${resource.resource_id}/edit`,
            )
          }
        />

        {/* Recent movements */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Movimentações Recentes
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Últimas entradas, saídas, transferências,
              devoluções, consumos, manutenção e baixas.
            </p>
          </div>

          {recentMovements.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <History
                size={22}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-700">
                Nenhuma movimentação recente
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentMovements.map((movement) => (
                <div
                  key={movement.movement_id}
                  className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                        {movement.movement_type}
                      </span>

                      <span className="text-xs text-slate-400">
                        {new Date(
                          movement.movement_date,
                        ).toLocaleString("pt-AO")}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {movement.resource_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {movement.origin &&
                        `Origem: ${movement.origin}`}
                      {movement.origin &&
                        movement.destination &&
                        " · "}
                      {movement.destination &&
                        `Destino: ${movement.destination}`}
                    </p>
                  </div>

                  {movement.responsible_name && (
                    <p className="text-xs text-slate-500">
                      Responsável:{" "}
                      <span className="font-medium text-slate-700">
                        {movement.responsible_name}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateResourceModal
        open={isAddModalOpen}
        onClose={() =>
          setIsAddModalOpen(false)
        }
      />

      <ResourceMovementModal
        open={movementModalOpen}
        resource={selectedResource}
        onClose={closeMovement}
        onSubmit={handleMovementSubmit}
      />
    </div>
  );
}