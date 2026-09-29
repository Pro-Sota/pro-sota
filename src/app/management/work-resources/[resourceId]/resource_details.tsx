"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  CalendarDays,
  ClipboardCheck,
  History,
  MapPin,
  Package,
  Pencil,
  Truck,
  User,
  Wrench,
} from "lucide-react";

import type {
  Resource,
  ResourceMovement
  } from "../work_resource";

type Props = {
  resource: Resource;
  movements: ResourceMovement[];
};

const formatCurrency = (
  value?: number | null,
) => {
  if (value == null) return "—";

  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (
  value?: string | null,
) => {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-AO").format(date);
};

function Detail({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-slate-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-slate-800">
        {value || "—"}
      </dd>
    </div>
  );
}

export default function ResourceDetails({
  resource,
  movements,
}: Props) {
  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-[1300px]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/management/work-resources"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={15} />
              Recursos de obra
            </Link>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#002950]">
                <Package size={22} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {resource.name}
                  </h1>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-500">
                    {resource.code}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {resource.resource_type}
                  {resource.category &&
                    ` · ${resource.category}`}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/management/work-resources/${resource.resource_id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={15} />
            Editar recurso
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {/* Identification */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Identificação
                </h2>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <Detail
                  label="Marca"
                  value={resource.brand}
                />

                <Detail
                  label="Modelo"
                  value={resource.model}
                />

                <Detail
                  label="N.º de série"
                  value={resource.serial_number}
                />

                <Detail
                  label="Fornecedor"
                  value={resource.supplier_name}
                />

                <Detail
                  label="Lote"
                  value={resource.batch_number}
                />

                <Detail
                  label="Validade"
                  value={formatDate(
                    resource.expiry_date,
                  )}
                />
              </dl>
            </section>

            {/* Location */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <MapPin size={16} />

                <h2 className="text-sm font-semibold text-slate-900">
                  Localização e atribuição
                </h2>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <Detail
                  label="Tipo de localização"
                  value={resource.location_type}
                />

                <Detail
                  label="Localização"
                  value={resource.location_name}
                />

                <Detail
                  label="Responsável"
                  value={resource.holder_name}
                />

                <Detail
                  label="Obra / Projecto"
                  value={resource.project_name}
                />
              </dl>
            </section>

            {/* Maintenance */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <Wrench size={16} />

                <h2 className="text-sm font-semibold text-slate-900">
                  Manutenção
                </h2>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2">
                <Detail
                  label="Estado"
                  value={resource.condition}
                />

                <Detail
                  label="Última manutenção"
                  value={formatDate(
                    resource.last_maintenance_date,
                  )}
                />

                <Detail
                  label="Próxima manutenção"
                  value={formatDate(
                    resource.next_maintenance_date,
                  )}
                />

                <Detail
                  label="Valor de substituição"
                  value={formatCurrency(
                    resource.replacement_value,
                  )}
                />
              </dl>
            </section>

            {/* Acquisition */}
            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <CalendarDays size={16} />

                <h2 className="text-sm font-semibold text-slate-900">
                  Aquisição e entrega
                </h2>
              </div>

              <dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <Detail
                  label="Data de aquisição"
                  value={formatDate(
                    resource.acquisition_date,
                  )}
                />

                <Detail
                  label="Data de recolha"
                  value={formatDate(
                    resource.collection_date,
                  )}
                />

                <Detail
                  label="Devolução prevista"
                  value={formatDate(
                    resource.expected_return_date,
                  )}
                />

                <Detail
                  label="Termo"
                  value={
                    resource.delivery_term_accepted ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <ClipboardCheck
                          size={14}
                        />
                        Aceite
                      </span>
                    ) : (
                      "Não aceite"
                    )
                  }
                />
              </dl>
            </section>
          </div>

          {/* Side panel */}
          <aside className="space-y-6">
            {resource.resource_type ===
              "Material consumível" && (
              <section className="rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Stock
                  </h2>
                </div>

                <div className="space-y-5 p-5">
                  <div>
                    <p className="text-xs text-slate-400">
                      Stock actual
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {resource.current_stock ?? 0}{" "}
                      {resource.unit_of_measure}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Detail
                      label="Stock mínimo"
                      value={`${resource.minimum_stock ?? 0} ${resource.unit_of_measure ?? ""}`}
                    />

                    <Detail
                      label="Reservado"
                      value={`${resource.reserved_quantity ?? 0} ${resource.unit_of_measure ?? ""}`}
                    />

                    <Detail
                      label="Em obra"
                      value={`${resource.quantity_in_works ?? 0} ${resource.unit_of_measure ?? ""}`}
                    />

                    <Detail
                      label="Valor"
                      value={formatCurrency(
                        resource.stock_value,
                      )}
                    />
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <History size={16} />

                  <h2 className="text-sm font-semibold text-slate-900">
                    Movimentações
                  </h2>
                </div>

                <Link
                  href={`/management/work-resources/${resource.resource_id}/history`}
                  className="text-xs font-medium text-[#002950] hover:underline"
                >
                  Ver todas
                </Link>
              </div>

              {movements.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nenhuma movimentação.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {movements
                    .slice(0, 5)
                    .map((movement) => (
                      <div
                        key={movement.movement_id}
                        className="p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                            {
                              movement.movement_type
                            }
                          </span>

                          <span className="text-[11px] text-slate-400">
                            {formatDate(
                              movement.movement_date,
                            )}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-600">
                          {movement.origin &&
                            `De ${movement.origin}`}
                          {movement.origin &&
                            movement.destination &&
                            " → "}
                          {movement.destination &&
                            movement.destination}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}