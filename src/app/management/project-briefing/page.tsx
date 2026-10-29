import "server-only";

import type { ReactNode } from "react";
import Link from "next/link";
import {
    ArrowDownRight,
    ArrowRight,
    ClipboardList,
    Clock3,
    FileText,
    Search,
} from "lucide-react";

import { getProjectBriefings } from "@/services/project_briefing";

type SearchParams = Promise<{
    q?: string;
    status?: string;
}>;

const STATUS_OPTIONS = [
    { value: "pending", label: "Novo" },
    { value: "in_review", label: "Em análise" },
    { value: "contacted", label: "Contactado" },
    { value: "approved", label: "Aprovado" },
    { value: "rejected", label: "Rejeitado" },
    { value: "converted", label: "Convertido em projecto" },
];

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Data indisponível";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Luanda",
    }).format(date);
}

function getStatus(status: string | null) {
    const value = STATUS_OPTIONS.find((item) => item.value === status);

    return (
        value ?? {
            value: status ?? "pending",
            label: status ?? "Novo",
        }
    );
}

function StatusBadge({ status }: { status: string | null }) {
    const value = getStatus(status);

    const styles: Record<string, string> = {
        pending: "bg-amber-50 text-amber-800 ring-amber-200",
        in_review: "bg-blue-50 text-blue-800 ring-blue-200",
        contacted: "bg-violet-50 text-violet-800 ring-violet-200",
        approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
        rejected: "bg-red-50 text-red-800 ring-red-200",
        converted: "bg-slate-100 text-slate-700 ring-slate-200",
    };

    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                styles[value.value] ?? styles.pending
            }`}
        >
            {value.label}
        </span>
    );
}

export default async function ProjectBriefsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;

    const query = params.q?.trim() ?? "";
    const selectedStatus = params.status ?? "";

    const {
        briefings,
        totalCount,
        pendingCount,
        reviewCount,
    } = await getProjectBriefings({
        query,
        status: selectedStatus,
    });

    return (
        <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px] space-y-7">
                {/* Page header */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#BD9655]">
                            <ClipboardList size={15} />
                            Gestão de clientes
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight text-[#002950] sm:text-3xl">
                            Briefings de projecto
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Consulte os pedidos recebidos, analise as necessidades
                            dos clientes e acompanhe cada pedido até à sua conversão
                            em projecto.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock3 size={16} />
                        Actualizado ao abrir a página
                    </div>
                </header>

                {/* Summary cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        label="Total de briefings"
                        value={totalCount}
                        icon={<FileText size={19} />}
                    />

                    <StatCard
                        label="Novos pedidos"
                        value={pendingCount}
                        icon={<ArrowDownRight size={19} />}
                        accent
                    />

                    <StatCard
                        label="Em análise"
                        value={reviewCount}
                        icon={<Clock3 size={19} />}
                    />
                </section>

                {/* Briefings table */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    {/* Search and filters */}
                    <div className="border-b border-slate-100 p-4 sm:p-5">
                        <form
                            method="GET"
                            action="/management/project-briefs"
                            className="flex flex-col gap-3 lg:flex-row lg:items-center"
                        >
                            <div className="relative min-w-0 flex-1">
                                <Search
                                    size={18}
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="search"
                                    name="q"
                                    defaultValue={query}
                                    placeholder="Pesquisar por cliente, email ou telefone..."
                                    aria-label="Pesquisar briefings"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                                />
                            </div>

                            <select
                                name="status"
                                defaultValue={selectedStatus}
                                aria-label="Filtrar por estado"
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#BD9655] sm:min-w-52"
                            >
                                <option value="">Todos os estados</option>

                                {STATUS_OPTIONS.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                className="h-11 rounded-xl bg-[#002950] px-5 text-sm font-medium text-white transition hover:bg-[#003968] focus:outline-none focus:ring-2 focus:ring-[#BD9655] focus:ring-offset-2"
                            >
                                Filtrar
                            </button>

                            {(query || selectedStatus) && (
                                <Link
                                    href="/management/project-briefs"
                                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm text-slate-600 transition hover:bg-slate-50"
                                >
                                    Limpar
                                </Link>
                            )}
                        </form>
                    </div>

                    {/* List heading */}
                    <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
                        <div>
                            <h2 className="text-sm font-semibold text-[#002950]">
                                Pedidos recebidos
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {briefings.length}{" "}
                                {briefings.length === 1
                                    ? "resultado"
                                    : "resultados"}
                                {(query || selectedStatus) && (
                                    <span> com os filtros aplicados</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Empty state */}
                    {briefings.length === 0 ? (
                        <div className="flex flex-col items-center px-6 py-16 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <ClipboardList size={25} />
                            </div>

                            <h3 className="font-medium text-[#002950]">
                                Nenhum briefing encontrado
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                {query || selectedStatus
                                    ? "Não existem pedidos que correspondam aos filtros seleccionados."
                                    : "Quando um cliente submeter o formulário público, o pedido aparecerá nesta lista."}
                            </p>

                            {(query || selectedStatus) && (
                                <Link
                                    href="/management/project-briefs"
                                    className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#002950] px-4 text-sm font-medium text-white transition hover:bg-[#003968]"
                                >
                                    Ver todos os briefings
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[850px] border-collapse text-left">
                                    <thead className="sticky top-0 z-10 bg-slate-50">
                                        <tr className="border-y border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-500">
                                            <th scope="col" className="px-5 py-3.5">
                                                Cliente
                                            </th>
                                            <th scope="col" className="px-5 py-3.5">
                                                Contacto
                                            </th>
                                            <th scope="col" className="px-5 py-3.5">
                                                Localização
                                            </th>
                                            <th scope="col" className="px-5 py-3.5">
                                                Data de entrada
                                            </th>
                                            <th scope="col" className="px-5 py-3.5">
                                                Estado
                                            </th>
                                            <th scope="col" className="px-5 py-3.5 text-right">
                                                Detalhes
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {briefings.map((briefing) => (
                                            <tr
                                                key={briefing.id}
                                                className="transition hover:bg-slate-50/80"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-[#002950]">
                                                        {briefing.full_name ||
                                                            "Cliente sem nome"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Ref.{" "}
                                                        {briefing.id
                                                            .slice(0, 8)
                                                            .toUpperCase()}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="text-sm text-slate-700">
                                                        {briefing.email || "—"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {briefing.phone ||
                                                            "Sem telefone"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {[
                                                        briefing.municipality,
                                                        briefing.province,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ") ||
                                                        "Não indicada"}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {formatDate(briefing.created_at)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={briefing.status}
                                                    />
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        href={`/management/project-briefs/${briefing.id}`}
                                                        aria-label={`Ver briefing de ${
                                                            briefing.full_name ??
                                                            "cliente"
                                                        }`}
                                                        title="Ver briefing"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#002950] transition hover:bg-[#002950]/5 focus:outline-none focus:ring-2 focus:ring-[#BD9655]"
                                                    >
                                                        <ArrowRight size={18} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="divide-y divide-slate-100 md:hidden">
                                {briefings.map((briefing) => (
                                    <Link
                                        key={briefing.id}
                                        href={`/management/project-briefs/${briefing.id}`}
                                        className="block p-4 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#BD9655]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-[#002950]">
                                                    {briefing.full_name ||
                                                        "Cliente sem nome"}
                                                </p>

                                                <p className="mt-1 truncate text-sm text-slate-500">
                                                    {briefing.email ||
                                                        briefing.phone ||
                                                        "Sem contacto"}
                                                </p>
                                            </div>

                                            <ArrowRight
                                                size={18}
                                                aria-hidden="true"
                                                className="mt-1 shrink-0 text-[#BD9655]"
                                            />
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <StatusBadge
                                                status={briefing.status}
                                            />

                                            <span className="text-xs text-slate-500">
                                                {formatDate(briefing.created_at)}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-xs text-slate-500">
                                            {[
                                                briefing.municipality,
                                                briefing.province,
                                            ]
                                                .filter(Boolean)
                                                .join(", ") ||
                                                "Localização não indicada"}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}

function StatCard({
    label,
    value,
    icon,
    accent = false,
}: {
    label: string;
    value: number;
    icon: ReactNode;
    accent?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{label}</p>

                <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        accent
                            ? "bg-[#BD9655]/10 text-[#BD9655]"
                            : "bg-[#002950]/5 text-[#002950]"
                    }`}
                >
                    {icon}
                </span>
            </div>

            <p className="mt-4 text-3xl font-semibold tracking-tight text-[#002950]">
                {value.toLocaleString("pt-PT")}
            </p>
        </div>
    );
}