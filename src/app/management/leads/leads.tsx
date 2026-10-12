
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowDownUp,
    Building2,
    Filter,
    Plus,
    Search,
    Users,
    UserPlus,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { StatCard } from "@/app/components/StatCard";
import type { Lead, LeadStatus } from "@/services/leads";
import { updateLeadStatus } from "@/services/leads";

import CreateLeadModal from "./create_lead_modal";
import LeadDetailDrawer from "./components/detail_drawer";
import LeadsKanbanBoard from "./components/kanban_board";
import {
    ALL_COLUMNS,
    CLOSED_COLUMNS,
    PIPELINE_COLUMNS,
    filterAndSortLeads,
    formatCompactCurrency,
    isClosedLead,
    STATUS_LABELS,
    VIEW_LABELS,
    type LeadsSort,
    type LeadsView,
} from "./utils";
import EditLeadModal from "./components/edit_modal";

type LeadsInitProps = {
    leads: Lead[];
};

export default function LeadsInit({
    leads: initialLeads,
}: LeadsInitProps) {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [activeView, setActiveView] = useState<LeadsView>("pipeline");
    const [sortBy, setSortBy] = useState<LeadsSort>("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
    const [createInitialStatus, setCreateInitialStatus] =
        useState<LeadStatus>("new")


    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const [updateInProgress, setUpdateInProgress] = useState(false);



    const [updatedLeads, setUpdatedLeads] = useState<
        Record<string, Lead>
    >({});
    const [pendingLeadIds, setPendingLeadIds] = useState<Set<string>>(
        () => new Set(),
    );
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
        null,
    );
    const [moveError, setMoveError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        null,
    );
    const [dragOverStatus, setDragOverStatus] =
        useState<LeadStatus | null>(null);

    const draggingLeadId = useRef<string | null>(null);

    // Fresh server data supersedes local mutation overlays after refresh.
    useEffect(() => {
        setUpdatedLeads({});
    }, [initialLeads]);

    const leads = useMemo(
        () =>
            initialLeads.map(
                (lead) => updatedLeads[lead.lead_id] ?? lead,
            ),
        [initialLeads, updatedLeads],
    );

    const activeLeads = useMemo(
        () => leads.filter((lead) => !isClosedLead(lead)),
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

    const qualifiedCount = activeLeads.filter(
        (lead) =>
            lead.status === "qualified" ||
            lead.status === "proposal" ||
            lead.status === "negotiation",
    ).length;

    const negotiationCount = activeLeads.filter(
        (lead) => lead.status === "negotiation",
    ).length;

    const viewLeads = useMemo(() => {
        if (activeView === "pipeline") {
            return activeLeads;
        }

        if (activeView === "closed") {
            return leads.filter(isClosedLead);
        }

        return leads;
    }, [activeView, activeLeads, leads]);

    const filteredLeads = useMemo(
        () => filterAndSortLeads(viewLeads, search, sortBy),
        [viewLeads, search, sortBy],
    );

    const columns = useMemo(() => {
        if (activeView === "pipeline") return PIPELINE_COLUMNS;
        if (activeView === "closed") return CLOSED_COLUMNS;
        return ALL_COLUMNS;
    }, [activeView]);

    const selectedLead = useMemo(
        () =>
            selectedLeadId
                ? leads.find(
                    (lead) => lead.lead_id === selectedLeadId,
                ) ?? null
                : null,
        [leads, selectedLeadId],
    );

    // Avoid leaving a drawer open if the selected lead disappears.
    useEffect(() => {
        if (
            selectedLeadId &&
            !leads.some((lead) => lead.lead_id === selectedLeadId)
        ) {
            setSelectedLeadId(null);
        }
    }, [leads, selectedLeadId]);

    function setLeadPending(leadId: string, pending: boolean) {
        setPendingLeadIds((current) => {
            const next = new Set(current);

            if (pending) next.add(leadId);
            else next.delete(leadId);

            return next;
        });
    }

    async function changeLeadStatus(
        leadId: string,
        nextStatus: LeadStatus,
    ) {
        const lead = leads.find((item) => item.lead_id === leadId);

        if (!lead || lead.status === nextStatus) return;

        // Prevent conflicting requests for the same lead.
        if (pendingLeadIds.has(leadId)) return;

        setLeadPending(leadId, true);
        setMoveError(null);
        setSuccessMessage(null);

        try {
            const updatedLead = await updateLeadStatus(
                leadId,
                nextStatus,
            );

            if (
                !updatedLead ||
                updatedLead.lead_id !== leadId ||
                updatedLead.status !== nextStatus
            ) {
                throw new Error(
                    "O serviço não devolveu a lead com o estado esperado.",
                );
            }

            setUpdatedLeads((current) => ({
                ...current,
                [leadId]: updatedLead,
            }));

            setSuccessMessage(
                `Lead actualizada para "${STATUS_LABELS[nextStatus]}".`,
            );
        } catch (error) {
            setMoveError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível actualizar o estado da lead.",
            );
        } finally {
            setLeadPending(leadId, false);
            setDragOverStatus(null);
            draggingLeadId.current = null;
        }
    }

    function openCreateModal(status: LeadStatus = "new") {
        setCreateInitialStatus(status);
        setShowCreateLeadModal(true);
    }

    function handleDragStart(leadId: string) {
        draggingLeadId.current = leadId;
        setMoveError(null);
        setSuccessMessage(null);
    }

    function handleDrop(
        leadId: string,
        nextStatus: LeadStatus,
    ) {
        const lead = leads.find((item) => item.lead_id === leadId);

        setDragOverStatus(null);
        draggingLeadId.current = null;

        if (!lead || lead.status === nextStatus) return;

        // Dropping a card onto a different board must not bypass
        // the view filter or accidentally close a lead.
        if (
            activeView === "pipeline" &&
            isClosedLead(lead)
        ) {
            return;
        }

        if (
            activeView === "closed" &&
            !isClosedLead(lead)
        ) {
            return;
        }

        void changeLeadStatus(leadId, nextStatus);
    }

    const totalPipelineValue = activeLeads.reduce(
        (sum, lead) => sum + (lead.budget ?? 0),
        0,
    );

    const currentViewValue = filteredLeads.reduce(
        (sum, lead) => sum + (lead.budget ?? 0),
        0,
    );

    return (
        <main className="min-h-screen bg-[#F7F7F5] px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1700px]">
                <header className="mb-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
                                <UserPlus className="h-4 w-4" />
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
                            onClick={() => openCreateModal()}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-4 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                        >
                            <Plus className="h-4 w-4" />
                            Novo lead
                        </button>
                    </div>
                </header>

                {moveError && (
                    <div
                        role="alert"
                        className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        <p>{moveError}</p>
                        <button
                            type="button"
                            onClick={() => setMoveError(null)}
                            aria-label="Fechar mensagem de erro"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                    >
                        <p>{successMessage}</p>
                        <button
                            type="button"
                            onClick={() => setSuccessMessage(null)}
                            aria-label="Fechar mensagem de sucesso"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

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

                <section className="mb-5 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm">
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
                                    aria-label="Pesquisar leads"
                                    className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    aria-expanded={showFilters}
                                    onClick={() =>
                                        setShowFilters((value) => !value)
                                    }
                                    className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium sm:flex-none ${showFilters
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

                        <div className="flex flex-wrap items-center gap-1 border-t border-neutral-100 pt-3">
                            {(
                                ["pipeline", "closed", "all"] as LeadsView[]
                            ).map((view) => {
                                const count =
                                    view === "pipeline"
                                        ? activeLeads.length
                                        : view === "closed"
                                            ? wonLeads.length + lostLeads.length
                                            : leads.length;

                                return (
                                    <button
                                        key={view}
                                        type="button"
                                        aria-pressed={activeView === view}
                                        onClick={() => {
                                            setActiveView(view);
                                            setDragOverStatus(null);
                                        }}
                                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${activeView === view
                                            ? "bg-[#002950] text-white"
                                            : "text-neutral-600 hover:bg-neutral-100"
                                            }`}
                                    >
                                        {VIEW_LABELS[view]}
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
                            })}
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                            <div>
                                <p className="text-xs font-medium text-neutral-700">
                                    Vista: {VIEW_LABELS[activeView]}
                                </p>
                                <p className="mt-1 text-xs text-neutral-400">
                                    {filteredLeads.length} resultados
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setSortBy("newest");
                                }}
                                className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </section>

                <LeadsKanbanBoard
                    columns={columns}
                    leads={filteredLeads}
                    view={activeView}
                    pendingLeadIds={pendingLeadIds}
                    dragOverStatus={dragOverStatus}
                    onSelectLead={setSelectedLeadId}
                    onDragStart={handleDragStart}
                    onDragEnd={() => {
                        draggingLeadId.current = null;
                        setDragOverStatus(null);
                    }}
                    onDropLead={handleDrop}
                    onAddLead={openCreateModal}
                />

                <p className="mt-3 text-right text-xs text-neutral-400">
                    Valor da vista: {formatCompactCurrency(currentViewValue)}
                    {activeView !== "closed" && (
                        <> · Pipeline total: {formatCompactCurrency(totalPipelineValue)}</>
                    )}
                </p>

                {selectedLead && (
                    <LeadDetailDrawer
                        lead={selectedLead}
                        pending={pendingLeadIds.has(selectedLead.lead_id)}
                        onClose={() => setSelectedLeadId(null)}
                        onChangeStatus={changeLeadStatus}
                        onEdit={(lead) => setEditingLead(lead)}
                    />
                )}

                {editingLead && (
                    <EditLeadModal
                        open={true}
                        lead={editingLead}
                        onClose={() => setEditingLead(null)}
                        onUpdated={() => {
                            setEditingLead(null);
                            setSelectedLeadId(null);
                            router.refresh();
                        }}
                    />
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
