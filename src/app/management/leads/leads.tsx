"use client";

import { useMemo, useState } from "react";
import {
    ArrowDownUp,
    Building2,
    ChevronDown,
    DollarSign,
    Ellipsis,
    Filter,
    Mail,
    Phone,
    Plus,
    Search,
    UserPlus,
    Users,
    X,
} from "lucide-react";

import { StatCard } from "@/app/components/StatCard";
import type { Lead, LeadStatus } from "@/services/leads";
import CreateLeadModal from "./create_lead_modal";
import { useRouter } from "next/navigation";

type LeadsInitProps = {
    leads: Lead[];
};

type LeadView = "active" | "won" | "lost";

const columns: { id: LeadStatus; title: string }[] = [
    { id: "new", title: "Novos" },
    { id: "contacted", title: "Contactados" },
    { id: "qualified", title: "Qualificados" },
    { id: "proposal", title: "Proposta enviada" },
    { id: "negotiation", title: "Negociação" },
];

const statusLabels: Record<LeadStatus, string> = {
    new: "Novo",
    contacted: "Contactado",
    qualified: "Qualificado",
    proposal: "Proposta enviada",
    negotiation: "Negociação",
    won: "Ganho",
    lost: "Perdido",
};

const viewLabels: Record<LeadView, string> = {
    active: "Activos",
    won: "Ganhos",
    lost: "Perdidos",
};

function formatCurrency(value: number | null) {
    if (value === null) {
        return "Não definido";
    }

    return new Intl.NumberFormat("pt-AO", {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0,
    })
        .format(value)
        .replace("AOA", "Kz");
}

function formatCompactCurrency(value: number) {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(
            value % 1_000_000 === 0 ? 0 : 1,
        )}M Kz`;
    }

    if (value >= 1_000) {
        return `${Math.round(value / 1_000)}K Kz`;
    }

    return `${value} Kz`;
}

function formatLeadBudget(value: number | null) {
    if (value === null) {
        return "Não definido";
    }

    return formatCompactCurrency(value);
}

function initials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-AO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

export default function LeadsInit({ leads }: LeadsInitProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [activeView, setActiveView] = useState<LeadView>("active");
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<"newest" | "budget">("newest");
    const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);

    const activeLeads = useMemo(
        () =>
            leads.filter(
                (lead) => lead.status !== "won" && lead.status !== "lost",
            ),
        [leads],
    );

    const wonLeads = useMemo(
        () => leads.filter((lead) => lead.status === "won"),
        [leads],
    );

    const lostLeads = useMemo(
        () => leads.filter((lead) => lead.status === "lost"),
        [leads],
    );

    const totalPipelineValue = useMemo(
        () =>
            activeLeads.reduce(
                (sum, lead) => sum + (lead.budget ?? 0),
                0,
            ),
        [activeLeads],
    );

    const qualifiedCount = useMemo(
        () =>
            activeLeads.filter(
                (lead) =>
                    lead.status === "qualified" ||
                    lead.status === "proposal" ||
                    lead.status === "negotiation",
            ).length,
        [activeLeads],
    );

    const negotiationCount = useMemo(
        () =>
            activeLeads.filter(
                (lead) => lead.status === "negotiation",
            ).length,
        [activeLeads],
    );

    const currentLeads = useMemo(() => {
        if (activeView === "won") {
            return wonLeads;
        }

        if (activeView === "lost") {
            return lostLeads;
        }

        return activeLeads;
    }, [activeView, activeLeads, wonLeads, lostLeads]);

    const filteredLeads = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        const result = currentLeads.filter((lead) => {
            if (!searchValue) {
                return true;
            }

            return (
                lead.name.toLowerCase().includes(searchValue) ||
                lead.company?.toLowerCase().includes(searchValue) ||
                lead.project_name.toLowerCase().includes(searchValue) ||
                lead.project_type.toLowerCase().includes(searchValue) ||
                lead.location?.toLowerCase().includes(searchValue) ||
                lead.email?.toLowerCase().includes(searchValue) ||
                lead.phone?.toLowerCase().includes(searchValue)
            );
        });

        return [...result].sort((a, b) => {
            if (sortBy === "budget") {
                return (b.budget ?? 0) - (a.budget ?? 0);
            }

            return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
        });
    }, [currentLeads, search, sortBy]);

    const currentViewValue = useMemo(
        () =>
            filteredLeads.reduce(
                (sum, lead) => sum + (lead.budget ?? 0),
                0,
            ),
        [filteredLeads],
    );

    function renderLeadCard(lead: Lead) {
        return (
            <button
                key={lead.lead_id}
                type="button"
                onClick={() => setSelectedLead(lead)}
                className="group w-full rounded-xl border border-neutral-200/80 bg-white p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
            >
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#002950] text-[10px] font-semibold text-white">
                            {initials(lead.name)}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                                {lead.name}
                            </p>

                            {lead.company && (
                                <p className="truncate text-[11px] text-neutral-400">
                                    {lead.company}
                                </p>
                            )}
                        </div>
                    </div>

                    <Ellipsis className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-neutral-500" />
                </div>

                <div className="mb-3">
                    <p className="line-clamp-2 text-xs font-medium leading-5 text-neutral-800">
                        {lead.project_name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-neutral-400">
                        {lead.project_type}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-900">
                        {formatLeadBudget(lead.budget)}
                    </span>

                    <span className="rounded-md bg-neutral-100 px-2 py-1 text-[9px] font-medium text-neutral-600">
                        {statusLabels[lead.status]}
                    </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                    <span className="truncate text-[10px] text-neutral-400">
                        {lead.location ?? "Localização não definida"}
                    </span>

                    <span className="shrink-0 text-[10px] font-medium text-neutral-500">
                        {formatDate(lead.created_at)}
                    </span>
                </div>
            </button>
        );
    }

    return (
        <main className="min-h-screen bg-[#F7F7F5] px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1700px]">
                {/* Header */}
                <header className="mb-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
                                <UserPlus className="h-4 w-4 shrink-0" />
                                <span>Desenvolvimento de negócio</span>
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
                                Leads
                            </h1>

                            <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                                Acompanhe oportunidades e transforme contactos
                                em novos projectos.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowCreateLeadModal(true)}
                            className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-4 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                        >
                            <Plus className="h-4 w-4" />
                            Novo lead
                        </button>
                    </div>
                </header>

                {/* Stats */}
                <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                    <StatCard
                        title="Leads activos"
                        value={String(activeLeads.length)}
                        icon={<Users className="h-5 w-5" />}
                    />

                    <StatCard
                        title="Qualificados"
                        value={String(qualifiedCount)}
                        icon={<Building2 className="h-5 w-5" />}
                    />

                    <StatCard
                        title="Negociações"
                        value={String(negotiationCount)}
                        icon={<ArrowDownUp className="h-5 w-5" />}
                    />
                    <StatCard
                        title="Ganhos"
                        value={String(wonLeads.length)}
                        icon={<Users className="h-5 w-5" />}
                    />
                </div>

                {/* Toolbar */}
                <div className="mb-5 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                            <div className="relative min-w-0 flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Pesquisar por nome, empresa ou projecto..."
                                    className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowFilters((value) => !value)
                                    }
                                    className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition sm:flex-none ${showFilters
                                        ? "border-[#002950] bg-[#002950] text-white"
                                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                >
                                    <Filter className="h-4 w-4" />
                                    Filtros
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSortBy((value) =>
                                            value === "newest"
                                                ? "budget"
                                                : "newest",
                                        )
                                    }
                                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:flex-none"
                                >
                                    <ArrowDownUp className="h-4 w-4" />
                                    {sortBy === "newest"
                                        ? "Mais recentes"
                                        : "Maior orçamento"}
                                </button>
                            </div>
                        </div>

                        {/* Main views */}
                        <div className="flex flex-wrap items-center gap-1 border-t border-neutral-100 pt-3">
                            {(["active", "won", "lost"] as LeadView[]).map(
                                (view) => {
                                    const count =
                                        view === "active"
                                            ? activeLeads.length
                                            : view === "won"
                                                ? wonLeads.length
                                                : lostLeads.length;

                                    return (
                                        <button
                                            key={view}
                                            type="button"
                                            onClick={() =>
                                                setActiveView(view)
                                            }
                                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${activeView === view
                                                ? "bg-[#002950] text-white"
                                                : "text-neutral-600 hover:bg-neutral-100"
                                                }`}
                                        >
                                            {viewLabels[view]}

                                            <span
                                                className={`rounded-md px-1.5 py-0.5 text-[10px] ${activeView === view
                                                    ? "bg-white/15 text-white"
                                                    : "bg-neutral-100 text-neutral-500"
                                                    }`}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-3 border-t border-neutral-100 pt-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="mr-1 text-xs font-medium text-neutral-400">
                                    Vista actual:
                                </span>

                                <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700">
                                    {viewLabels[activeView]}
                                </span>

                                <span className="text-xs text-neutral-400">
                                    {filteredLeads.length}{" "}
                                    {filteredLeads.length === 1
                                        ? "lead"
                                        : "leads"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active leads */}
                {activeView === "active" && (
                    <section className="rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm sm:p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-neutral-900">
                                    Oportunidades activas
                                </h2>

                                <p className="mt-0.5 text-xs text-neutral-400">
                                    {filteredLeads.length}{" "}
                                    {filteredLeads.length === 1
                                        ? "oportunidade"
                                        : "oportunidades"}{" "}
                                    activas
                                </p>
                            </div>

                            <span className="hidden text-xs font-medium text-neutral-500 sm:block">
                                {formatCompactCurrency(totalPipelineValue)}
                            </span>
                        </div>

                        <div className="overflow-x-auto pb-2">
                            <div className="flex min-w-max gap-3">
                                {columns.map((column) => {
                                    const columnLeads = filteredLeads.filter(
                                        (lead) =>
                                            lead.status === column.id,
                                    );

                                    const columnValue = columnLeads.reduce(
                                        (sum, lead) =>
                                            sum + (lead.budget ?? 0),
                                        0,
                                    );

                                    return (
                                        <div
                                            key={column.id}
                                            className="flex w-[280px] shrink-0 flex-col"
                                        >
                                            <div className="mb-2 px-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-400" />

                                                        <h3 className="truncate text-sm font-semibold text-neutral-800">
                                                            {column.title}
                                                        </h3>

                                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 px-1.5 text-[10px] font-semibold text-neutral-600">
                                                            {
                                                                columnLeads.length
                                                            }
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                                                        aria-label={`Opções de ${column.title}`}
                                                    >
                                                        <Ellipsis className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-[11px] text-neutral-400">
                                                        Valor potencial
                                                    </span>

                                                    <span className="text-[11px] font-medium text-neutral-600">
                                                        {formatCompactCurrency(
                                                            columnValue,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="min-h-[520px] rounded-2xl bg-neutral-100/80 p-2">
                                                <div className="space-y-2">
                                                    {columnLeads.map(
                                                        renderLeadCard,
                                                    )}

                                                    {columnLeads.length ===
                                                        0 && (
                                                            <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-neutral-200 px-4 text-center">
                                                                <p className="text-xs text-neutral-400">
                                                                    Nenhum lead
                                                                    nesta etapa
                                                                </p>
                                                            </div>
                                                        )}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-neutral-400 transition hover:bg-white hover:text-neutral-700"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Adicionar lead
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Won / Lost leads */}
                {/* Won / Lost leads */}
                {(activeView === "won" || activeView === "lost") && (
                    <section className="rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div>
                                <h2 className="text-sm font-semibold text-neutral-900">
                                    {activeView === "won"
                                        ? "Leads ganhos"
                                        : "Leads perdidos"}
                                </h2>

                                <p className="mt-0.5 text-xs text-neutral-400">
                                    {filteredLeads.length}{" "}
                                    {filteredLeads.length === 1 ? "lead" : "leads"}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                    Valor total
                                </p>

                                <p className="mt-0.5 text-sm font-semibold text-neutral-900">
                                    {formatCompactCurrency(currentViewValue)}
                                </p>
                            </div>
                        </div>

                        {filteredLeads.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 bg-neutral-50/70">
                                            <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                Lead
                                            </th>

                                            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                Projecto
                                            </th>

                                            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                Tipo
                                            </th>

                                            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                Orçamento
                                            </th>

                                            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                Localização
                                            </th>

                                            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                Data
                                            </th>

                                            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                Estado
                                            </th>

                                            <th className="w-12 px-4 py-3" />
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredLeads.map((lead) => (
                                            <tr
                                                key={lead.lead_id}
                                                onClick={() => setSelectedLead(lead)}
                                                className="group cursor-pointer border-b border-neutral-100 transition last:border-0 hover:bg-neutral-50/70"
                                            >
                                                {/* Lead */}
                                                <td className="px-5 py-4">
                                                    <div className="flex min-w-[190px] items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002950] text-[10px] font-semibold text-white">
                                                            {initials(lead.name)}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-neutral-900">
                                                                {lead.name}
                                                            </p>

                                                            {lead.company && (
                                                                <p className="truncate text-xs text-neutral-400">
                                                                    {lead.company}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Project */}
                                                <td className="px-4 py-4">
                                                    <div className="min-w-[180px]">
                                                        <p className="truncate text-sm font-medium text-neutral-800">
                                                            {lead.project_name}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                                                            {lead.location ??
                                                                "Localização não definida"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Project type */}
                                                <td className="px-4 py-4">
                                                    <span className="text-xs text-neutral-600">
                                                        {lead.project_type}
                                                    </span>
                                                </td>

                                                {/* Budget */}
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-semibold text-neutral-900">
                                                        {formatLeadBudget(lead.budget)}
                                                    </span>
                                                </td>

                                                {/* Location */}
                                                <td className="px-4 py-4">
                                                    <span className="text-xs text-neutral-500">
                                                        {lead.location ??
                                                            "Não definida"}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-4">
                                                    <span className="whitespace-nowrap text-xs text-neutral-500">
                                                        {formatDate(lead.created_at)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-4 text-right">
                                                    <span
                                                        className={`inline-flex rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${lead.status === "lost"
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-green-50 text-green-700"
                                                            }`}
                                                    >
                                                        {statusLabels[lead.status]}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setSelectedLead(lead);
                                                        }}
                                                        className="rounded-lg p-1.5 text-neutral-300 transition hover:bg-neutral-100 hover:text-neutral-700"
                                                        aria-label={`Opções de ${lead.name}`}
                                                    >
                                                        <Ellipsis className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex min-h-[300px] items-center justify-center px-5 text-center">
                                <div>
                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 text-neutral-400">
                                        {activeView === "lost" ? (
                                            <X className="h-5 w-5" />
                                        ) : (
                                            <Users className="h-5 w-5" />
                                        )}
                                    </div>

                                    <p className="text-sm font-medium text-neutral-700">
                                        {search
                                            ? "Nenhum lead encontrado"
                                            : activeView === "lost"
                                                ? "Ainda não existem leads perdidos"
                                                : "Ainda não existem leads ganhos"}
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-400">
                                        {search
                                            ? "Tente pesquisar por outro nome, projecto ou empresa."
                                            : activeView === "lost"
                                                ? "Os leads marcados como perdidos aparecerão aqui."
                                                : "Os leads convertidos aparecerão aqui."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* Detail drawer */}
                {selectedLead && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                            onClick={() => setSelectedLead(null)}
                        />

                        <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-neutral-200 bg-white shadow-2xl">
                            <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                        Lead
                                    </p>

                                    <h2 className="mt-1 truncate text-lg font-semibold text-neutral-950">
                                        {selectedLead.name}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedLead(null)}
                                    className="ml-4 shrink-0 rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                                    aria-label="Fechar"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto">
                                <div className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#002950] text-sm font-semibold text-white">
                                            {initials(selectedLead.name)}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-neutral-900">
                                                {selectedLead.name}
                                            </p>

                                            {selectedLead.company && (
                                                <p className="truncate text-sm text-neutral-500">
                                                    {selectedLead.company}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <span
                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${selectedLead.status === "lost"
                                                ? "bg-red-50 text-red-700"
                                                : selectedLead.status ===
                                                    "won"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-blue-50 text-blue-700"
                                                }`}
                                        >
                                            {
                                                statusLabels[
                                                selectedLead.status
                                                ]
                                            }
                                        </span>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-neutral-200 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                            Oportunidade
                                        </p>

                                        <h3 className="mt-2 text-base font-semibold text-neutral-900">
                                            {selectedLead.project_name}
                                        </h3>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            {selectedLead.project_type}
                                        </p>

                                        <div className="mt-4 border-t border-neutral-100 pt-4">
                                            <p className="text-xs text-neutral-400">
                                                Orçamento estimado
                                            </p>

                                            <p className="mt-1 text-xl font-semibold text-neutral-950">
                                                {formatCurrency(
                                                    selectedLead.budget,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {selectedLead.phone && (
                                            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                                                <Phone className="h-4 w-4 shrink-0 text-neutral-500" />

                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                                        Telefone
                                                    </p>

                                                    <p className="text-sm text-neutral-700">
                                                        {selectedLead.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedLead.email && (
                                            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                                                <Mail className="h-4 w-4 shrink-0 text-neutral-500" />

                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                                        Email
                                                    </p>

                                                    <p className="truncate text-sm text-neutral-700">
                                                        {selectedLead.email}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedLead.location && (
                                            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                                                <Building2 className="h-4 w-4 shrink-0 text-neutral-500" />

                                                <div className="min-w-0">
                                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                                        Localização
                                                    </p>

                                                    <p className="truncate text-sm text-neutral-700">
                                                        {selectedLead.location}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="mb-3 text-sm font-semibold text-neutral-900">
                                            Informação do lead
                                        </h3>

                                        <div className="rounded-xl bg-neutral-50 p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-neutral-400">
                                                    Criado em
                                                </span>

                                                <span className="text-xs font-medium text-neutral-700">
                                                    {formatDate(
                                                        selectedLead.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 border-t border-neutral-200 bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedLead.phone ? (
                                        <a
                                            href={`tel:${selectedLead.phone}`}
                                            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Contactar
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-300"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Contactar
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#002950] text-sm font-medium text-white transition hover:bg-neutral-800"
                                    >
                                        {selectedLead.status === "lost"
                                            ? "Reabrir lead"
                                            : selectedLead.status === "won"
                                                ? "Ver projecto"
                                                : "Avançar lead"}

                                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </>
                )}
                <CreateLeadModal
                    open={showCreateLeadModal}
                    onClose={() => setShowCreateLeadModal(false)}
                    onCreated={() => {
                        setShowCreateLeadModal(false);
                        router.refresh();
                    }}
                />
            </div>

        </main>
    );
}