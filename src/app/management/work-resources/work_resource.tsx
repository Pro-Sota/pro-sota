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
import ResourceTable from "./resource_table";
import ResourceMovementModal, {
  ResourceMovementProfileOption,
  ResourceMovementProjectOption,
  type ResourceMovementFormInput,
} from "./resource_movement_modal";

import type {
  Resource,
  ResourceCondition,
  ResourceLocation,
  ResourceMovement,
  ResourceOperationalStatus,
  ResourceStats,
  ResourceType,
} from "@/services/resources";
import { Database } from "@/app/lib/supabase/models";

import { createResourceMovementAction } from "@/actions/resource_movements";

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  material: "Material consumível",
  equipment: "Equipamento",
  tool: "Ferramenta",
  ppe: "EPI",
  vehicle: "Viatura",
};

export const RESOURCE_CONDITION_LABELS: Record<
  ResourceCondition,
  string
> = {
  operational: "Operacional",
  restricted: "Com restrição",
  maintenance: "Em manutenção",
  damaged: "Avariado",
  retired: "Abatido",
};

export const RESOURCE_STATUS_LABELS: Record<
  ResourceOperationalStatus,
  string
> = {
  available: "Disponível",
  in_use: "Em utilização",
  overdue: "Em atraso",
  missing: "Em falta",
};

/* -------------------------------------------------------------------------- */
/* Filter options                                                             */
/* -------------------------------------------------------------------------- */

const RESOURCE_TYPES: ResourceType[] = [
  "material",
  "equipment",
  "tool",
  "ppe",
  "vehicle",
];

const RESOURCE_CONDITIONS: ResourceCondition[] = [
  "operational",
  "restricted",
  "maintenance",
  "damaged",
  "retired",
];

const isConsumable = (type: ResourceType): boolean =>
  type === "material";

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface ResourcePageProps {
  resources: Resource[];
  locations: ResourceLocation[]
  projects: ResourceMovementProjectOption[]
  recentMovements: ResourceMovement[];
  stats?: ResourceStats | null;
  profiles:ResourceMovementProfileOption[];
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ResourcesClientPage({
  resources,
  recentMovements,
  locations, 
  projects,
  profiles,
  stats,
}: ResourcePageProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<ResourceType | "all">("all");

  const [conditionFilter, setConditionFilter] =
    useState<ResourceCondition | "all">("all");

  const [selectedResource, setSelectedResource] =
    useState<Resource | null>(null);

  const [movementModalOpen, setMovementModalOpen] =
    useState(false);

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Fallback stats                                                           */
  /* ------------------------------------------------------------------------ */

  const calculatedStats = useMemo<ResourceStats>(
    () => ({
      totalResources: resources.length,

      totalReplacementValue: resources.reduce(
        (total, resource) =>
          total + (resource.replacement_value ?? 0),
        0,
      ),

      availableResources: resources.filter(
        (resource) =>
          resource.operational_status === "available",
      ).length,

      resourcesInUse: resources.filter(
        (resource) =>
          resource.operational_status === "in_use",
      ).length,

      resourcesInMaintenance: resources.filter(
        (resource) =>
          resource.condition_status === "maintenance",
      ).length,

      missingResources: resources.filter(
        (resource) =>
          resource.operational_status === "missing",
      ).length,

      damagedResources: resources.filter(
        (resource) =>
          resource.condition_status === "damaged",
      ).length,
    }),
    [resources],
  );

  /* ------------------------------------------------------------------------ */
  /* Display stats                                                            */
  /* ------------------------------------------------------------------------ */

  const displayStats = useMemo(() => {
    if (stats) {
      return {
        totalResources: stats.totalResources,

        totalStockValue: stats.totalReplacementValue,

        availableResources: stats.availableResources,

        resourcesInUse: stats.resourcesInUse,

        resourcesInMaintenance:
          stats.resourcesInMaintenance,

        resourcesMissingLocation: resources.filter(
          (resource) =>
            !resource.location_type ||
            !resource.location_name,
        ).length,

        overdueReturns: resources.filter(
          (resource) =>
            resource.operational_status === "overdue",
        ).length,

        lowStockItems: resources.filter(
          (resource) =>
            isConsumable(resource.resource_type) &&
            resource.minimum_stock != null &&
            resource.current_stock != null &&
            resource.current_stock <=
            resource.minimum_stock,
        ).length,
      };
    }

    return {
      totalResources: calculatedStats.totalResources,

      totalStockValue:
        calculatedStats.totalReplacementValue,

      availableResources:
        calculatedStats.availableResources,

      resourcesInUse:
        calculatedStats.resourcesInUse,

      resourcesInMaintenance:
        calculatedStats.resourcesInMaintenance,

      resourcesMissingLocation: resources.filter(
        (resource) =>
          !resource.location_type ||
          !resource.location_name,
      ).length,

      overdueReturns: resources.filter(
        (resource) =>
          resource.operational_status === "overdue",
      ).length,

      lowStockItems: resources.filter(
        (resource) =>
          isConsumable(resource.resource_type) &&
          resource.minimum_stock != null &&
          resource.current_stock != null &&
          resource.current_stock <=
          resource.minimum_stock,
      ).length,
    };
  }, [stats, calculatedStats, resources]);

  /* ------------------------------------------------------------------------ */
  /* Filtering                                                                */
  /* ------------------------------------------------------------------------ */

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return resources.filter((resource) => {
      const searchable = [
        resource.resource_code,
        resource.name,
        resource.description,
        resource.category,
        resource.brand,
        resource.model,
        resource.serial_number,
        resource.asset_tag,
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
        typeFilter === "all" ||
        resource.resource_type === typeFilter;

      const matchesCondition =
        conditionFilter === "all" ||
        resource.condition_status === conditionFilter;

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

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  function clearFilters() {
    setQuery("");
    setTypeFilter("all");
    setConditionFilter("all");
  }

  function openMovement(resource: Resource) {
    setSelectedResource(resource);
    setMovementModalOpen(true);
  }

  function openGlobalMovement() {
    setSelectedResource(null);
    setMovementModalOpen(true);
  }

  function closeMovement() {
    setMovementModalOpen(false);
    setSelectedResource(null);
  }

  /**
   * Movement payload.
   *
   * IMPORTANT:
   * This is deliberately separate from CreateResourceActionInput.
   */
  async function handleMovementSubmit(
  data: ResourceMovementFormInput,
) {
  try {
    const result =
      await createResourceMovementAction(data);

    if (!result.success) {
      console.error(
        "handleMovementSubmit error:",
        result.error,
      );

      return;
    }

    closeMovement();
    router.refresh();
  } catch (error) {
    console.error(
      "handleMovementSubmit error:",
      error,
    );
  }
}

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

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
              ferramentas, EPI e viaturas,
              incluindo localização, stock,
              utilização, manutenção e
              movimentações.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={openGlobalMovement}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowRightLeft size={16} />
              Registar movimentação
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
            >
              <Plus size={16} />
              Registar recurso
            </button>
          </div>
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
          displayStats.resourcesMissingLocation > 0) && (
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
                        {displayStats.lowStockItems}{" "}
                        recurso(s) consumível(eis)
                        precisam de reposição.
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
                        {displayStats.overdueReturns}{" "}
                        recurso(s) têm devolução
                        prevista ultrapassada.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {displayStats.resourcesMissingLocation > 0 && (
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
                        {displayStats.resourcesMissingLocation}{" "}
                        recurso(s) sem localização
                        confirmada.
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
                  | "all",
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:w-auto"
            >
              <option value="all">
                Todos os Tipos
              </option>

              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {RESOURCE_TYPE_LABELS[type]}
                </option>
              ))}
            </CustomSelect>

            <CustomSelect
              value={conditionFilter}
              onChange={(event) =>
                setConditionFilter(
                  event.target.value as
                  | ResourceCondition
                  | "all",
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:w-auto"
            >
              <option value="all">
                Todos os Estados
              </option>

              {RESOURCE_CONDITIONS.map(
                (condition) => (
                  <option
                    key={condition}
                    value={condition}
                  >
                    {
                      RESOURCE_CONDITION_LABELS[
                      condition
                      ]
                    }
                  </option>
                ),
              )}
            </CustomSelect>
          </div>
        </div>

        {/* Result count */}
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            {filteredResources.length}{" "}
            {filteredResources.length === 1
              ? "recurso encontrado"
              : "recursos encontrados"}
          </span>

          {(query ||
            typeFilter !== "all" ||
            conditionFilter !== "all") && (
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
              Últimas entradas, saídas,
              transferências, devoluções,
              consumos, manutenção e
              baixas.
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
                      {movement.origin_location_name &&
                        `Origem: ${movement.origin_location_name}`}

                      {movement.origin_location_name &&
                        movement.destination_location_name &&
                        " · "}

                      {movement.destination_location_name &&
                        `Destino: ${movement.destination_location_name}`}
                    </p>
                  </div>

                  {movement.profile_name && (
                    <p className="text-xs text-slate-500">
                      Responsável:{" "}
                      <span className="font-medium text-slate-700">
                        {movement.profile_name}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create resource */}
      <CreateResourceModal
        open={isAddModalOpen}
        onCloseAction={() =>
          setIsAddModalOpen(false)
        }
      />

      {/* Resource movement */}
      <ResourceMovementModal
        open={movementModalOpen}
        resources={resources}
        locations={locations}
        projects={projects}
        onCloseAction={closeMovement}
        onSubmitAction={handleMovementSubmit} 
        profiles={profiles} />
    </div>
  );
}