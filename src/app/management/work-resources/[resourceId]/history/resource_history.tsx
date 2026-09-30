"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  History,
} from "lucide-react";

import type {
  Resource,
  ResourceMovement,
} from "@/services/resources";

type Props = {
  resource: Resource;
  movements: ResourceMovement[];
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMovementType(type: ResourceMovement["movement_type"]) {
  const labels: Record<
    ResourceMovement["movement_type"],
    string
  > = {
    entry: "Entrada",
    exit: "Saída",
    transfer: "Transferência",
    return: "Devolução",
    consumption: "Consumo",
    maintenance: "Manutenção",
    retirement: "Abate",
  };

  return labels[type] ?? type;
}

export default function ResourceHistory({
  resource,
  movements,
}: Props) {
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/management/work-resources/${resource.resource_id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={15} />
          Voltar ao recurso
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[#002950]">
              <History size={19} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Histórico de movimentações
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {resource.name} · {resource.resource_code}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {movements.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <ArrowRightLeft
                size={28}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-700">
                Nenhuma movimentação registada
              </p>

              <p className="mt-1 text-sm text-slate-400">
                As movimentações deste recurso aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {movements.map((movement) => (
                <div
                  key={movement.movement_id}
                  className="p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {formatMovementType(
                            movement.movement_type,
                          )}
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDateTime(
                            movement.movement_date,
                          )}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        {movement.quantity != null && (
                          <p>
                            <span className="text-slate-400">
                              Quantidade:
                            </span>{" "}
                            {movement.quantity}
                            {movement.unit
                              ? ` ${movement.unit}`
                              : ""}
                          </p>
                        )}

                        {movement.origin_location_id && (
                          <p>
                            <span className="text-slate-400">
                              Origem:
                            </span>{" "}
                            {movement.origin_location_name ||
                              "—"}
                          </p>
                        )}

                        {movement.destination_location_id && (
                          <p>
                            <span className="text-slate-400">
                              Destino:
                            </span>{" "}
                            {movement.destination_location_name ||
                              "—"}
                          </p>
                        )}

                        {movement.project_id && (
                          <p>
                            <span className="text-slate-400">
                              Obra:
                            </span>{" "}
                            {movement.project_name || "—"}
                          </p>
                        )}

                        {movement.profile_id && (
                          <p>
                            <span className="text-slate-400">
                              Responsável:
                            </span>{" "}
                            {movement.profile_name || "—"}
                          </p>
                        )}
                      </div>

                      {movement.notes && (
                        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                          {movement.notes}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-xs md:text-right">
                      {movement.profile_name && (
                        <p className="font-medium text-slate-700">
                          {movement.profile_name}
                        </p>
                      )}

                      {movement.created_by_name && (
                        <p className="mt-1 text-slate-400">
                          Registado por{" "}
                          {movement.created_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}