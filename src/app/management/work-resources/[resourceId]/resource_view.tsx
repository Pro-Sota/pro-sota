

"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    Boxes,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileText,
    History,
    MapPin,
    Package,
    Paperclip,
    Settings2,
    UserRound,
    Wrench,
    XCircle,
} from "lucide-react";

import type {
    AttachmentType,
    ConditionStatus,
    MaintenanceType,
    MovementType,
    OperationalStatus,
    ResourceType,
} from "@/services/resources";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Resource = NonNullable<
    Awaited<ReturnType<typeof import("@/services/resources").getResourceById>>
>;

type Stock = Awaited<
    ReturnType<typeof import("@/services/resources").getResourceStock>
>;

type Assignments = Awaited<
    ReturnType<typeof import("@/services/resources").getResourceAssignments>
>;

type Movements = Awaited<
    ReturnType<typeof import("@/services/resources").getResourceMovements>
>;

type Maintenance = Awaited<
    ReturnType<typeof import("@/services/resources").getResourceMaintenance>
>;

type DeliveryTerms = Awaited<
    ReturnType<
        typeof import("@/services/resources").getResourceDeliveryTerms
    >
>;

type Attachments = Awaited<
    ReturnType<typeof import("@/services/resources").getResourceAttachments>
>;

type Locations = Awaited<
    ReturnType<typeof import("@/services/resources").getResourceLocations>
>;

type Assignment = Assignments[number];
type Movement = Movements[number];
type MaintenanceItem = Maintenance[number];
type DeliveryTerm = DeliveryTerms[number];
type Attachment = Attachments[number];
type Location = Locations[number];

type ResourcePageProps = {
    resource: Resource;
    stock: Stock;
    assignments: Assignments;
    movements: Movements;
    maintenance: Maintenance;
    deliveryTerms: DeliveryTerms;
    attachments?: Attachments;
    locations: Locations;
};

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
    material: "Material consumível",
    equipment: "Equipamento",
    tool: "Ferramenta",
    ppe: "EPI",
    vehicle: "Viatura",
};

const CONDITION_LABELS: Record<ConditionStatus, string> = {
    operational: "Operacional",
    restricted: "Com restrição",
    maintenance: "Em manutenção",
    damaged: "Avariado",
    retired: "Abatido",
};

const OPERATIONAL_LABELS: Record<OperationalStatus, string> = {
    available: "Disponível",
    in_use: "Em utilização",
    overdue: "Em atraso",
    missing: "Em falta",
};

const MOVEMENT_LABELS: Record<MovementType, string> = {
    entry: "Entrada",
    exit: "Saída",
    transfer: "Transferência",
    return: "Devolução",
    consumption: "Consumo",
    maintenance: "Manutenção",
    retirement: "Baixa",
};

const MAINTENANCE_LABELS: Record<MaintenanceType, string> = {
    preventive: "Preventiva",
    corrective: "Correctiva",
    inspection: "Inspecção",
    other: "Outra",
};

const ATTACHMENT_LABELS: Record<AttachmentType, string> = {
    photo: "Fotografia",
    delivery_term: "Termo de entrega",
    invoice: "Factura",
    maintenance_document: "Documento de manutenção",
    manual: "Manual",
    other: "Outro",
};

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const CONDITION_STYLES: Record<ConditionStatus, string> = {
    operational: "border-emerald-200 bg-emerald-50 text-emerald-700",
    restricted: "border-amber-200 bg-amber-50 text-amber-700",
    maintenance: "border-blue-200 bg-blue-50 text-blue-700",
    damaged: "border-red-200 bg-red-50 text-red-700",
    retired: "border-slate-200 bg-slate-100 text-slate-600",
};

const OPERATIONAL_STYLES: Record<OperationalStatus, string> = {
    available: "border-emerald-200 bg-emerald-50 text-emerald-700",
    in_use: "border-blue-200 bg-blue-50 text-blue-700",
    overdue: "border-amber-200 bg-amber-50 text-amber-700",
    missing: "border-red-200 bg-red-50 text-red-700",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number | string | null | undefined) {
    if (value == null || Number.isNaN(Number(value))) {
        return "—";
    }

    return new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function formatNumber(value: number | string | null | undefined) {
    if (value == null || Number.isNaN(Number(value))) {
        return "—";
    }

    return new Intl.NumberFormat("pt-AO", {
        maximumFractionDigits: 3,
    }).format(Number(value));
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-AO", {
        dateStyle: "medium",
    }).format(date);
}

function formatDateTime(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-AO", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getLocationName(
    locationId: string | null | undefined,
    locations: Locations,
) {
    if (!locationId) {
        return "—";
    }

    const location = locations.find(
        (item: Location) => item.location_id === locationId,
    );

    return location?.name ?? locationId;
}

/* -------------------------------------------------------------------------- */
/* Shared components                                                          */
/* -------------------------------------------------------------------------- */

function Section({
    title,
    description,
    icon,
    children,
    className = "",
}: {
    title: string;
    description?: string;
    icon: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}
        >
            <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
                        {icon}
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold text-slate-950">
                            {title}
                        </h2>

                        {description && (
                            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5 md:p-6">{children}</div>
        </section>
    );
}

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) {
    return (
        <div>
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
        </div>
    );
}

function EmptyState({
    icon,
    title,
    description,
}: {
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-6 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                {icon}
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">{title}</p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ResourceDetailsClient({
    resource,
    stock,
    assignments,
    movements,
    maintenance,
    deliveryTerms,
    attachments = [],
    locations,
}: ResourcePageProps) {

    const stockValue = useMemo(() => {
        if (!stock) {
            return 0;
        }

        return (
            Number(stock.current_quantity ?? 0) *
            Number(stock.average_unit_cost ?? 0)
        );
    }, [stock]);

    const isLowStock = useMemo(() => {
        if (!stock) {
            return false;
        }

        return (
            Number(stock.current_quantity ?? 0) <=
            Number(stock.minimum_quantity ?? 0)
        );
    }, [stock]);

    const activeAssignment = useMemo<Assignment | null>(() => {
        return (
            assignments.find(
                (assignment: Assignment) => !assignment.returned_at,
            ) ?? null
        );
    }, [assignments]);

    const latestMaintenance = useMemo<MaintenanceItem | null>(() => {
        if (maintenance.length === 0) {
            return null;
        }

        return (
            [...maintenance].sort(
                (a: MaintenanceItem, b: MaintenanceItem) =>
                    new Date(b.completed_at ?? b.created_at).getTime() -
                    new Date(a.completed_at ?? a.created_at).getTime(),
            )[0] ?? null
        );
    }, [maintenance]);

    const nextMaintenance = useMemo<MaintenanceItem | null>(() => {
        const now = Date.now();

        const upcoming = maintenance
            .filter((item: MaintenanceItem) => {
                if (!item.scheduled_date) {
                    return false;
                }

                return new Date(item.scheduled_date).getTime() >= now;
            })
            .sort(
                (a: MaintenanceItem, b: MaintenanceItem) =>
                    new Date(a.scheduled_date!).getTime() -
                    new Date(b.scheduled_date!).getTime(),
            );

        return upcoming[0] ?? null;
    }, [maintenance]);

    return (
        <div className="min-h-screen bg-[#F7F7F5] px-4 py-6 text-slate-900 md:px-8 md:py-8">
            <div className="mx-auto max-w-[1500px]">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/management/work-resources"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#002950]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Recursos de obra
                    </Link>

                    <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                                    {resource.resource_code}
                                </span>

                                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600">
                                    {RESOURCE_TYPE_LABELS[resource.resource_type]}
                                </span>
                            </div>

                            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                                {resource.name}
                            </h1>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${CONDITION_STYLES[resource.condition_status]}`}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                    {CONDITION_LABELS[resource.condition_status]}
                                </span>

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${OPERATIONAL_STYLES[resource.operational_status]}`}
                                >
                                    {OPERATIONAL_LABELS[resource.operational_status]}
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                <Settings2 className="h-4 w-4" />
                                Editar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-5">
                        {/* General information */}
                        <Section
                            title="Informação geral"
                            description="Dados principais do recurso."
                            icon={<Package className="h-4 w-4" />}
                        >
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3">
                                <DetailItem
                                    label="Tipo"
                                    value={RESOURCE_TYPE_LABELS[resource.resource_type]}
                                />

                                <DetailItem
                                    label="Categoria"
                                    value={resource.category || "—"}
                                />

                                <DetailItem
                                    label="Marca"
                                    value={resource.brand || "—"}
                                />

                                <DetailItem
                                    label="Modelo"
                                    value={resource.model || "—"}
                                />

                                <DetailItem
                                    label="Número de série"
                                    value={resource.serial_number || "—"}
                                />

                                <DetailItem
                                    label="Data de aquisição"
                                    value={formatDate(resource.acquisition_date)}
                                />

                                <DetailItem
                                    label="Valor de substituição"
                                    value={formatCurrency(resource.replacement_value)}
                                />

                                <DetailItem
                                    label="Registado em"
                                    value={formatDate(resource.created_at)}
                                />

                                <DetailItem
                                    label="Última actualização"
                                    value={formatDate(resource.updated_at)}
                                />
                            </dl>

                            {resource.notes && (
                                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Observações
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                        {resource.notes}
                                    </p>
                                </div>
                            )}
                        </Section>

                        {/* Stock */}
                        {stock && (
                            <Section
                                title="Stock"
                                description="Informação de stock e valorização do material."
                                icon={<Boxes className="h-4 w-4" />}
                            >
                                {isLowStock && (
                                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                                        <div>
                                            <p className="text-sm font-semibold text-amber-800">
                                                Stock mínimo atingido
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-amber-700">
                                                A quantidade actual está igual ou abaixo do nível
                                                mínimo definido para este recurso.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="text-xs text-slate-500">Stock actual</p>

                                        <p className="mt-1 text-xl font-semibold text-slate-950">
                                            {formatNumber(stock.current_quantity)}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {stock.unit}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="text-xs text-slate-500">Stock mínimo</p>

                                        <p className="mt-1 text-xl font-semibold text-slate-950">
                                            {formatNumber(stock.minimum_quantity)}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {stock.unit}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="text-xs text-slate-500">Reservado</p>

                                        <p className="mt-1 text-xl font-semibold text-slate-950">
                                            {formatNumber(stock.reserved_quantity)}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {stock.unit}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <p className="text-xs text-slate-500">Em obras</p>

                                        <p className="mt-1 text-xl font-semibold text-slate-950">
                                            {formatNumber(stock.quantity_in_projects)}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {stock.unit}
                                        </p>
                                    </div>
                                </div>

                                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3">
                                    <DetailItem
                                        label="Unidade de medida"
                                        value={stock.unit}
                                    />

                                    <DetailItem
                                        label="Custo médio unitário"
                                        value={formatCurrency(stock.average_unit_cost)}
                                    />

                                    <DetailItem
                                        label="Valor em stock"
                                        value={formatCurrency(stockValue)}
                                    />

                                    <DetailItem
                                        label="Armazém"
                                        value={getLocationName(stock.warehouse_id, locations)}
                                    />

                                    <DetailItem
                                        label="Fornecedor habitual"
                                        value={stock.supplier_id || "—"}
                                    />

                                    <DetailItem
                                        label="Lote"
                                        value={stock.batch_number || "—"}
                                    />

                                    <DetailItem
                                        label="Validade"
                                        value={formatDate(stock.expiry_date)}
                                    />
                                </dl>
                            </Section>
                        )}

                        {/* Current assignment */}
                        <Section
                            title="Localização e responsabilidade"
                            description="Onde o recurso se encontra e a quem está afecto."
                            icon={<MapPin className="h-4 w-4" />}
                        >
                            {activeAssignment ? (
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-5">
                                        <DetailItem
                                            label="Colaborador"
                                            value={
                                                activeAssignment.profile_id ||
                                                "Não atribuído a colaborador"
                                            }
                                        />

                                        <DetailItem
                                            label="Projecto"
                                            value={
                                                activeAssignment.project_id ||
                                                "Não associado a projecto"
                                            }
                                        />

                                        <DetailItem
                                            label="Localização"
                                            value={getLocationName(
                                                activeAssignment.location_id,
                                                locations,
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-5">
                                        <DetailItem
                                            label="Data de saída"
                                            value={formatDateTime(activeAssignment.assigned_at)}
                                        />

                                        <DetailItem
                                            label="Devolução prevista"
                                            value={formatDateTime(
                                                activeAssignment.expected_return_at,
                                            )}
                                        />

                                        <DetailItem
                                            label="Confirmação de recepção"
                                            value={
                                                activeAssignment.received_confirmed ? (
                                                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Confirmada
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-700">Pendente</span>
                                                )
                                            }
                                        />
                                    </div>

                                    {activeAssignment.delivery_condition && (
                                        <div className="md:col-span-2">
                                            <DetailItem
                                                label="Estado no momento da entrega"
                                                value={activeAssignment.delivery_condition}
                                            />
                                        </div>
                                    )}

                                    {activeAssignment.notes && (
                                        <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Observações da atribuição
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                                {activeAssignment.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<MapPin className="h-5 w-5" />}
                                    title="Sem atribuição activa"
                                    description="Este recurso não tem actualmente uma atribuição registada."
                                />
                            )}
                        </Section>

                        {/* Movement journal */}
                        <Section
                            title="Movimentos"
                            description="Histórico de entradas, saídas, transferências, consumo e outras operações."
                            icon={<History className="h-4 w-4" />}
                        >
                            {movements.length === 0 ? (
                                <EmptyState
                                    icon={<History className="h-5 w-5" />}
                                    title="Sem movimentos"
                                    description="Ainda não existem movimentos registados para este recurso."
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px] text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="pb-3 pr-4 text-xs font-semibold text-slate-500">
                                                    Data
                                                </th>

                                                <th className="pb-3 pr-4 text-xs font-semibold text-slate-500">
                                                    Movimento
                                                </th>

                                                <th className="pb-3 pr-4 text-xs font-semibold text-slate-500">
                                                    Quantidade
                                                </th>

                                                <th className="pb-3 pr-4 text-xs font-semibold text-slate-500">
                                                    Origem
                                                </th>

                                                <th className="pb-3 pr-4 text-xs font-semibold text-slate-500">
                                                    Destino
                                                </th>

                                                <th className="pb-3 text-xs font-semibold text-slate-500">
                                                    Projecto
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {movements.map((movement: Movement) => (
                                                <tr
                                                    key={movement.movement_id}
                                                    className="border-b border-slate-50 last:border-0"
                                                >
                                                    <td className="py-4 pr-4 text-sm text-slate-700">
                                                        {formatDateTime(movement.movement_date)}
                                                    </td>

                                                    <td className="py-4 pr-4">
                                                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                                                            {MOVEMENT_LABELS[movement.movement_type]}
                                                        </span>
                                                    </td>

                                                    <td className="py-4 pr-4 text-sm text-slate-700">
                                                        {movement.quantity != null
                                                            ? `${formatNumber(movement.quantity)}${movement.unit
                                                                ? ` ${movement.unit}`
                                                                : ""
                                                            }`
                                                            : "—"}
                                                    </td>

                                                    <td className="py-4 pr-4 text-sm text-slate-600">
                                                        {getLocationName(
                                                            movement.origin_location_id,
                                                            locations,
                                                        )}
                                                    </td>

                                                    <td className="py-4 pr-4 text-sm text-slate-600">
                                                        {getLocationName(
                                                            movement.destination_location_id,
                                                            locations,
                                                        )}
                                                    </td>

                                                    <td className="py-4 text-sm text-slate-600">
                                                        {movement.project_id || "—"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Section>

                        {/* Maintenance */}
                        <Section
                            title="Manutenção"
                            description="Histórico e próximas intervenções de manutenção."
                            icon={<Wrench className="h-4 w-4" />}
                        >
                            <div className="mb-6 grid gap-3 md:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-slate-400" />

                                        <p className="text-xs font-medium text-slate-500">
                                            Última manutenção
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-900">
                                        {formatDate(
                                            latestMaintenance?.completed_at ??
                                            latestMaintenance?.scheduled_date,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center gap-2">
                                        <Clock3 className="h-4 w-4 text-slate-400" />

                                        <p className="text-xs font-medium text-slate-500">
                                            Próxima manutenção
                                        </p>
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-slate-900">
                                        {formatDate(nextMaintenance?.scheduled_date)}
                                    </p>
                                </div>
                            </div>

                            {maintenance.length === 0 ? (
                                <EmptyState
                                    icon={<Wrench className="h-5 w-5" />}
                                    title="Sem histórico de manutenção"
                                    description="Ainda não existem intervenções de manutenção registadas."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {maintenance.map((item: MaintenanceItem) => (
                                        <div
                                            key={item.maintenance_id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold text-slate-900">
                                                            {MAINTENANCE_LABELS[item.maintenance_type]}
                                                        </span>

                                                        {item.completed_at ? (
                                                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                                                Concluída
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                                                Pendente
                                                            </span>
                                                        )}
                                                    </div>

                                                    {item.description && (
                                                        <p className="mt-2 text-sm leading-5 text-slate-600">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <p className="shrink-0 text-xs text-slate-500">
                                                    {formatDate(
                                                        item.completed_at ?? item.scheduled_date,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 md:grid-cols-4">
                                                <DetailItem
                                                    label="Fornecedor"
                                                    value={item.supplier_id || "—"}
                                                />

                                                <DetailItem
                                                    label="Custo"
                                                    value={formatCurrency(item.cost)}
                                                />

                                                <DetailItem
                                                    label="Estado anterior"
                                                    value={item.condition_before || "—"}
                                                />

                                                <DetailItem
                                                    label="Estado posterior"
                                                    value={item.condition_after || "—"}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>

                        {/* Assignment history */}
                        <Section
                            title="Histórico de atribuições"
                            description="Registo de entregas e devoluções do recurso."
                            icon={<UserRound className="h-4 w-4" />}
                        >
                            {assignments.length === 0 ? (
                                <EmptyState
                                    icon={<UserRound className="h-5 w-5" />}
                                    title="Sem atribuições"
                                    description="Este recurso ainda não foi atribuído a nenhum colaborador, projecto ou localização."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {assignments.map((assignment: Assignment) => (
                                        <div
                                            key={assignment.assignment_id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                                                <DetailItem
                                                    label="Colaborador"
                                                    value={assignment.profile_id || "—"}
                                                />

                                                <DetailItem
                                                    label="Projecto"
                                                    value={assignment.project_id || "—"}
                                                />

                                                <DetailItem
                                                    label="Localização"
                                                    value={getLocationName(
                                                        assignment.location_id,
                                                        locations,
                                                    )}
                                                />

                                                <DetailItem
                                                    label="Estado da entrega"
                                                    value={
                                                        assignment.received_confirmed
                                                            ? "Recepção confirmada"
                                                            : "Recepção pendente"
                                                    }
                                                />

                                                <DetailItem
                                                    label="Saída"
                                                    value={formatDateTime(assignment.assigned_at)}
                                                />

                                                <DetailItem
                                                    label="Devolução prevista"
                                                    value={formatDateTime(
                                                        assignment.expected_return_at,
                                                    )}
                                                />

                                                <DetailItem
                                                    label="Devolvido em"
                                                    value={formatDateTime(assignment.returned_at)}
                                                />

                                                <DetailItem
                                                    label="Estado na entrega"
                                                    value={assignment.delivery_condition || "—"}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    </div>

                    {/* Right column */}
                    <aside className="space-y-5">
                        {/* Current status */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-slate-950">
                                Estado actual
                            </h2>

                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-slate-500">
                                        Conservação
                                    </span>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${CONDITION_STYLES[resource.condition_status]}`}
                                    >
                                        {CONDITION_LABELS[resource.condition_status]}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-slate-500">
                                        Disponibilidade
                                    </span>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${OPERATIONAL_STYLES[resource.operational_status]}`}
                                    >
                                        {OPERATIONAL_LABELS[resource.operational_status]}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Maintenance summary */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
                                    <Wrench className="h-4 w-4" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-950">
                                        Manutenção
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Estado do plano de manutenção
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Última intervenção
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatDate(
                                            latestMaintenance?.completed_at ??
                                            latestMaintenance?.scheduled_date,
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Próxima intervenção
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatDate(nextMaintenance?.scheduled_date)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Registos</p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {maintenance.length}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Delivery terms */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
                                    <ClipboardCheck className="h-4 w-4" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-950">
                                        Termos de entrega
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Aceitação e documentação
                                    </p>
                                </div>
                            </div>

                            {deliveryTerms.length === 0 ? (
                                <div className="mt-5">
                                    <p className="text-sm text-slate-500">
                                        Nenhum termo de entrega registado.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    {deliveryTerms.map((term: DeliveryTerm) => (
                                        <div
                                            key={term.delivery_id}
                                            className="rounded-xl bg-slate-50 p-3"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs font-medium text-slate-600">
                                                    {formatDate(term.delivered_at)}
                                                </span>

                                                {term.accepted ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Aceite
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Pendente
                                                    </span>
                                                )}
                                            </div>

                                            {term.condition && (
                                                <p className="mt-2 text-xs leading-5 text-slate-600">
                                                    {term.condition}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Attachments */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
                                    <Paperclip className="h-4 w-4" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-semibold text-slate-950">
                                        Documentos
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Ficheiros associados ao recurso
                                    </p>
                                </div>
                            </div>

                            {attachments.length === 0 ? (
                                <div className="mt-5">
                                    <p className="text-sm text-slate-500">
                                        Nenhum documento associado.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-2">
                                    {attachments.map((attachment: Attachment) => (
                                        <a
                                            key={attachment.attachment_id}
                                            href={attachment.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <FileText className="h-4 w-4 shrink-0 text-slate-400" />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    {attachment.file_name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {
                                                        ATTACHMENT_LABELS[
                                                        attachment.attachment_type
                                                        ]
                                                    }
                                                </p>
                                            </div>
                                        </a>
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