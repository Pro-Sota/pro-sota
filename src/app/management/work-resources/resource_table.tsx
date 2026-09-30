"use client";

import {
  ArrowRightLeft,
  Boxes,
  ClipboardCheck,
  History,
  MoreVertical,
  Package,
  Truck,
  Wrench,
  HardHat,
} from "lucide-react";

import type {
  Resource,
  ResourceCondition,
  ResourceMovement,
  ResourceType,
} from "@/services/resources";

export type ResourceTableAction =
  | "history"
  | "movement"
  | "edit"
  | "delete";

type Props = {
  resources: Resource[];
  onOpen: (resource: Resource) => void;
  onHistory: (resource: Resource) => void;
  onMovement: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
};

const CONDITION_STYLES: Record<ResourceCondition, string> = {
  operational:
    "border border-emerald-200 bg-emerald-50 text-emerald-700",
  restricted:
    "border border-amber-200 bg-amber-50 text-amber-700",
  maintenance:
    "border border-blue-200 bg-blue-50 text-blue-700",
  damaged:
    "border border-red-200 bg-red-50 text-red-700",
  retired:
    "border border-slate-200 bg-slate-100 text-slate-600",
};

const CONDITION_DOTS: Record<ResourceCondition, string> = {
  operational: "bg-emerald-500",
  restricted: "bg-amber-500",
  maintenance: "bg-blue-500",
  damaged: "bg-red-500",
  retired: "bg-slate-500",
};

const isConsumable = (type: ResourceType) =>
  type === "material";

const formatNumber = (value?: number | null) => {
  if (value == null) return "—";

  return new Intl.NumberFormat("pt-AO", {
    maximumFractionDigits: 2,
  }).format(value);
};

function getResourceTypeIcon(type: ResourceType) {
  switch (type) {
    case "material":
      return <Boxes size={15} />;

    case "equipment":
      return <Wrench size={15} />;

    case "tool":
      return <Wrench size={15} />;

    case "ppe":
      return <HardHat size={15} />;

    case "vehicle":
      return <Truck size={15} />;

    default:
      return <Package size={15} />;
  }
}

function ResourceActions({
  resource,
  onHistory,
  onMovement,
  onEdit,
  onDelete,
}: {
  resource: Resource;
  onHistory: () => void;
  onMovement: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className="flex items-center justify-end gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onHistory}
        aria-label={`Histórico de ${resource.name}`}
        title="Histórico"
        className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <History size={15} />
      </button>

      <button
        type="button"
        onClick={onMovement}
        aria-label={`Registar movimento de ${resource.name}`}
        title="Registar movimento"
        className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <ArrowRightLeft size={15} />
      </button>

      <div className="relative">
        <details>
          <summary
            className="flex cursor-pointer list-none rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Mais opções para ${resource.name}`}
          >
            <MoreVertical size={15} />
          </summary>

          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={onEdit}
              className="flex w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Editar recurso
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Eliminar recurso
              </button>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

export default function ResourceTable({
  resources,
  onOpen,
  onHistory,
  onMovement,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Recurso</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Localização</th>
              <th className="px-4 py-3">Responsável / Obra</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {resources.map((resource) => {
              const consumable = isConsumable(
                resource.resource_type,
              );

              const lowStock =
                consumable &&
                resource.current_stock != null &&
                resource.minimum_stock != null &&
                resource.current_stock <=
                resource.minimum_stock;

              return (
                <tr
                  key={resource.resource_id}
                  tabIndex={0}
                  role="link"
                  onClick={() => onOpen(resource)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      onOpen(resource);
                    }
                  }}
                  className="group cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50/70 focus:bg-slate-50 focus:outline-none"
                >
                  {/* Resource */}
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-slate-900 group-hover:text-[#002950]">
                          {resource.name}
                        </p>

                        {resource.delivery_term_accepted && (
                          <ClipboardCheck
                            size={14}
                            className="shrink-0 text-emerald-600"
                            aria-label="Termo aceite"
                          />
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400">
                          {resource.resource_code}
                        </span>

                        {resource.category && (
                          <>
                            <span className="text-slate-300">
                              /
                            </span>

                            <span className="truncate text-xs text-slate-400">
                              {resource.category}
                            </span>
                          </>
                        )}
                      </div>

                      {(resource.brand ||
                        resource.model ||
                        resource.serial_number) && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {[
                              resource.brand,
                              resource.model,
                              resource.serial_number
                                ? `S/N ${resource.serial_number}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                      {getResourceTypeIcon(
                        resource.resource_type,
                      )}

                      {resource.resource_type}
                    </span>
                  </td>

                  {/* Condition */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${CONDITION_STYLES[resource.condition_status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${CONDITION_DOTS[resource.condition_status]}`}
                      />

                      {resource.condition_status}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-700">
                        {resource.location_type || "Sem localização"}
                      </p>

                      {resource.location_name && (
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {resource.location_name}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Responsible/project */}
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      {resource.holder_name ? (
                        <p className="truncate font-medium text-slate-700">
                          {resource.holder_name}
                        </p>
                      ) : (
                        <p className="text-slate-400">
                          Sem responsável
                        </p>
                      )}

                      {resource.project_name && (
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {resource.project_name}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-4">
                    {consumable ? (
                      <div>
                        <p
                          className={`font-medium ${lowStock
                              ? "text-amber-700"
                              : "text-slate-900"
                            }`}
                        >
                          {formatNumber(
                            resource.current_stock,
                          )}{" "}
                          {resource.unit_of_measure ?? ""}
                        </p>

                        {resource.minimum_stock != null && (
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Mín.{" "}
                            {formatNumber(
                              resource.minimum_stock,
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <ResourceActions
                      resource={resource}
                      onHistory={() =>
                        onHistory(resource)
                      }
                      onMovement={() =>
                        onMovement(resource)
                      }
                      onEdit={() => onEdit(resource)}
                      onDelete={
                        onDelete
                          ? () => onDelete(resource)
                          : undefined
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {resources.length === 0 && (
        <div className="px-6 py-16 text-center">
          <Package
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm font-medium text-slate-700">
            Nenhum recurso encontrado
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Tente alterar os filtros ou registe um novo
            recurso.
          </p>
        </div>
      )}
    </div>
  );
}