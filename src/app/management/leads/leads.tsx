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

type LeadStatus =
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";

type LeadPriority = "low" | "medium" | "high";

type Lead = {
    id: string;
    name: string;
    company?: string;
    project: string;
    projectType: string;
    budget: number;
    status: LeadStatus;
    priority: LeadPriority;
    location: string;
    phone: string;
    email: string;
    assignedTo: string;
    nextFollowUp?: string;
};

const leads: Lead[] = [
    {
        id: "1",
        name: "João Manuel",
        company: "Manuel Investimentos",
        project: "Villa Residencial Talatona",
        projectType: "Residencial",
        budget: 18000000,
        status: "new",
        priority: "high",
        location: "Talatona, Luanda",
        phone: "+244 923 000 000",
        email: "joao@example.com",
        assignedTo: "Carlos",
        nextFollowUp: "Hoje",
    },
    {
        id: "2",
        name: "Ana Gomes",
        project: "Casa Familiar",
        projectType: "Residencial",
        budget: 9500000,
        status: "new",
        priority: "medium",
        location: "Benfica, Luanda",
        phone: "+244 924 000 000",
        email: "ana@example.com",
        assignedTo: "Ana",
        nextFollowUp: "17 Set",
    },
    {
        id: "3",
        name: "Paulo António",
        company: "PA Consulting",
        project: "Escritório Corporate",
        projectType: "Comercial",
        budget: 32000000,
        status: "contacted",
        priority: "high",
        location: "Maianga, Luanda",
        phone: "+244 925 000 000",
        email: "paulo@example.com",
        assignedTo: "Carlos",
        nextFollowUp: "Hoje",
    },
    {
        id: "4",
        name: "Marta Silva",
        project: "Apartamento Moderno",
        projectType: "Interior Design",
        budget: 6800000,
        status: "contacted",
        priority: "low",
        location: "Ingombota, Luanda",
        phone: "+244 926 000 000",
        email: "marta@example.com",
        assignedTo: "Ana",
        nextFollowUp: "19 Set",
    },
    {
        id: "5",
        name: "ACME Angola",
        company: "ACME Angola",
        project: "Nova Sede",
        projectType: "Institucional",
        budget: 85000000,
        status: "qualified",
        priority: "high",
        location: "Talatona, Luanda",
        phone: "+244 927 000 000",
        email: "projects@acme.co.ao",
        assignedTo: "Carlos",
        nextFollowUp: "18 Set",
    },
    {
        id: "6",
        name: "Ricardo Santos",
        project: "Moradia Unifamiliar",
        projectType: "Residencial",
        budget: 14500000,
        status: "qualified",
        priority: "medium",
        location: "Viana, Luanda",
        phone: "+244 928 000 000",
        email: "ricardo@example.com",
        assignedTo: "Miguel",
        nextFollowUp: "20 Set",
    },
    {
        id: "7",
        name: "Grupo Nova",
        company: "Grupo Nova, Lda.",
        project: "Edifício Comercial",
        projectType: "Comercial",
        budget: 120000000,
        status: "proposal",
        priority: "high",
        location: "Luanda Sul",
        phone: "+244 929 000 000",
        email: "info@gruponova.co.ao",
        assignedTo: "Carlos",
        nextFollowUp: "Hoje",
    },
    {
        id: "8",
        name: "Teresa Joaquim",
        project: "Remodelação de Escritório",
        projectType: "Renovação",
        budget: 11200000,
        status: "proposal",
        priority: "medium",
        location: "Alvalade, Luanda",
        phone: "+244 930 000 000",
        email: "teresa@example.com",
        assignedTo: "Ana",
        nextFollowUp: "22 Set",
    },
    {
        id: "9",
        name: "Kwanza Properties",
        company: "Kwanza Properties",
        project: "Complexo Residencial",
        projectType: "Residencial",
        budget: 210000000,
        status: "negotiation",
        priority: "high",
        location: "Talatona, Luanda",
        phone: "+244 931 000 000",
        email: "contact@kwanza.co.ao",
        assignedTo: "Carlos",
        nextFollowUp: "Amanhã",
    },
];

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

const priorityStyles: Record<
    LeadPriority,
    { label: string; className: string }
> = {
    low: {
        label: "Baixa",
        className: "bg-neutral-100 text-neutral-600",
    },
    medium: {
        label: "Média",
        className: "bg-amber-50 text-amber-700",
    },
    high: {
        label: "Alta",
        className: "bg-red-50 text-red-700",
    },
};

function formatCurrency(value: number) {
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

function initials(name: string) {
    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

export default function LeadsInit() {
    const [search, setSearch] = useState("");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [activePriority, setActivePriority] = useState<
        LeadPriority | "all"
    >("all");
    const [showFilters, setShowFilters] = useState(false);

    const filteredLeads = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return leads.filter((lead) => {
            const matchesSearch =
                !searchValue ||
                lead.name.toLowerCase().includes(searchValue) ||
                lead.company?.toLowerCase().includes(searchValue) ||
                lead.project.toLowerCase().includes(searchValue) ||
                lead.projectType.toLowerCase().includes(searchValue);

            const matchesPriority =
                activePriority === "all" ||
                lead.priority === activePriority;

            return matchesSearch && matchesPriority;
        });
    }, [search, activePriority]);

    const pipelineLeads = filteredLeads.filter(
        (lead) => !["won", "lost"].includes(lead.status),
    );

    const totalPipelineValue = pipelineLeads.reduce(
        (sum, lead) => sum + lead.budget,
        0,
    );

    const qualifiedCount = filteredLeads.filter(
        (lead) =>
            lead.status === "qualified" ||
            lead.status === "proposal" ||
            lead.status === "negotiation",
    ).length;

    const negotiationCount = filteredLeads.filter(
        (lead) => lead.status === "negotiation",
    ).length;

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
                        value={String(pipelineLeads.length)}
                        icon={<Users className="h-5 w-5" />}
                    />

                    <StatCard
                        title="Pipeline"
                        value={formatCompactCurrency(totalPipelineValue)}
                        icon={<DollarSign className="h-5 w-5" />}
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
                </div>

                {/* Toolbar */}
                <div className="mb-5 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm">
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
                                className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition sm:flex-none ${
                                    showFilters
                                        ? "border-neutral-950 bg-neutral-950 text-white"
                                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filtros
                            </button>

                            <button
                                type="button"
                                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:flex-none"
                            >
                                <ArrowDownUp className="h-4 w-4" />
                                Ordenar
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-3 border-t border-neutral-100 pt-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="mr-1 text-xs font-medium text-neutral-400">
                                    Prioridade:
                                </span>

                                {(
                                    ["all", "high", "medium", "low"] as const
                                ).map((priority) => (
                                    <button
                                        key={priority}
                                        type="button"
                                        onClick={() =>
                                            setActivePriority(priority)
                                        }
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                            activePriority === priority
                                                ? "bg-neutral-950 text-white"
                                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {priority === "all"
                                            ? "Todas"
                                            : priorityStyles[priority].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pipeline */}
                <section className="rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm sm:p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900">
                                Pipeline de vendas
                            </h2>

                            <p className="mt-0.5 text-xs text-neutral-400">
                                {pipelineLeads.length} oportunidades activas
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
                                    (lead) => lead.status === column.id,
                                );

                                const columnValue = columnLeads.reduce(
                                    (sum, lead) => sum + lead.budget,
                                    0,
                                );

                                return (
                                    <div
                                        key={column.id}
                                        className="flex w-[280px] shrink-0 flex-col"
                                    >
                                        {/* Column header */}
                                        <div className="mb-2 px-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-neutral-400" />

                                                    <h3 className="truncate text-sm font-semibold text-neutral-800">
                                                        {column.title}
                                                    </h3>

                                                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 px-1.5 text-[10px] font-semibold text-neutral-600">
                                                        {columnLeads.length}
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

                                        {/* Column body */}
                                        <div className="min-h-[520px] rounded-2xl bg-neutral-100/80 p-2">
                                            <div className="space-y-2">
                                                {columnLeads.map((lead) => (
                                                    <button
                                                        key={lead.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedLead(
                                                                lead,
                                                            )
                                                        }
                                                        className="group w-full rounded-xl border border-neutral-200/80 bg-white p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
                                                    >
                                                        <div className="mb-3 flex items-start justify-between gap-3">
                                                            <div className="flex min-w-0 items-center gap-2.5">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-[10px] font-semibold text-white">
                                                                    {initials(
                                                                        lead.name,
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-semibold text-neutral-900">
                                                                        {
                                                                            lead.name
                                                                        }
                                                                    </p>

                                                                    {lead.company && (
                                                                        <p className="truncate text-[11px] text-neutral-400">
                                                                            {
                                                                                lead.company
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <Ellipsis className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-neutral-500" />
                                                        </div>

                                                        <div className="mb-3">
                                                            <p className="line-clamp-2 text-xs font-medium leading-5 text-neutral-800">
                                                                {
                                                                    lead.project
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[11px] text-neutral-400">
                                                                {
                                                                    lead.projectType
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-semibold text-neutral-900">
                                                                {formatCompactCurrency(
                                                                    lead.budget,
                                                                )}
                                                            </span>

                                                            <span
                                                                className={`rounded-md px-2 py-1 text-[9px] font-medium ${priorityStyles[lead.priority].className}`}
                                                            >
                                                                {
                                                                    priorityStyles[
                                                                        lead
                                                                            .priority
                                                                    ].label
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3">
                                                            <span className="truncate text-[10px] text-neutral-400">
                                                                {lead.nextFollowUp
                                                                    ? `Follow-up: ${lead.nextFollowUp}`
                                                                    : "Sem follow-up"}
                                                            </span>

                                                            <span className="shrink-0 text-[10px] font-medium text-neutral-500">
                                                                {
                                                                    lead.assignedTo
                                                                }
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}

                                                {columnLeads.length === 0 && (
                                                    <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-neutral-200 px-4 text-center">
                                                        <p className="text-xs text-neutral-400">
                                                            Nenhum lead nesta
                                                            etapa
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
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-semibold text-white">
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

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700">
                                            {statusLabels[selectedLead.status]}
                                        </span>

                                        <span
                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${priorityStyles[selectedLead.priority].className}`}
                                        >
                                            Prioridade{" "}
                                            {priorityStyles[
                                                selectedLead.priority
                                            ].label.toLowerCase()}
                                        </span>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-neutral-200 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                            Oportunidade
                                        </p>

                                        <h3 className="mt-2 text-base font-semibold text-neutral-900">
                                            {selectedLead.project}
                                        </h3>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            {selectedLead.projectType}
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
                                    </div>

                                    <div className="mt-6">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-neutral-900">
                                                Actividade
                                            </h3>

                                            <button
                                                type="button"
                                                className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
                                            >
                                                Ver tudo
                                            </button>
                                        </div>

                                        <div className="relative ml-2 border-l border-neutral-200 pl-5">
                                            <div className="relative pb-5">
                                                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-neutral-950" />

                                                <p className="text-xs font-medium text-neutral-800">
                                                    Lead criado
                                                </p>

                                                <p className="mt-1 text-[11px] text-neutral-400">
                                                    15 Setembro, 08:42
                                                </p>
                                            </div>

                                            <div className="relative">
                                                <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-neutral-300" />

                                                <p className="text-xs font-medium text-neutral-800">
                                                    Atribuído a{" "}
                                                    {selectedLead.assignedTo}
                                                </p>

                                                <p className="mt-1 text-[11px] text-neutral-400">
                                                    Hoje
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 border-t border-neutral-200 bg-white p-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Contactar
                                    </button>

                                    <button
                                        type="button"
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800"
                                    >
                                        Avançar lead
                                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </>
                )}
            </div>
        </main>
    );
}