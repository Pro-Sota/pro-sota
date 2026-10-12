
"use client";

import { Plus } from "lucide-react";
import type { Lead, LeadStatus } from "@/services/leads";
import LeadCard from "./lead_card";
import {
    formatCompactCurrency,
    type LeadsView,
} from "../utils";

type BoardColumn = {
    id: LeadStatus;
    title: string;
};

type LeadsKanbanBoardProps = {
    columns: BoardColumn[];
    leads: Lead[];
    view: LeadsView;
    pendingLeadIds: Set<string>;
    dragOverStatus: LeadStatus | null;
    onSelectLead: (leadId: string) => void;
    onDragStart: (leadId: string) => void;
    onDragEnd: () => void;
    onDropLead: (leadId: string, status: LeadStatus) => void;
    onAddLead: (status: LeadStatus) => void;
};

export default function LeadsKanbanBoard({
    columns,
    leads,
    view,
    pendingLeadIds,
    dragOverStatus,
    onSelectLead,
    onDragStart,
    onDragEnd,
    onDropLead,
    onAddLead,
}: LeadsKanbanBoardProps) {
    return (
        <section className="rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-neutral-900">
                        {view === "pipeline"
                            ? "Oportunidades em curso"
                            : view === "closed"
                              ? "Leads fechados"
                              : "Todas as leads"}
                    </h2>

                    <p className="mt-1 text-xs text-neutral-400">
                        {leads.length}{" "}
                        {leads.length === 1 ? "lead" : "leads"}
                    </p>
                </div>

                <p className="text-xs font-medium text-neutral-500">
                    Valor visível:{" "}
                    {formatCompactCurrency(
                        leads.reduce(
                            (sum, lead) => sum + (lead.budget ?? 0),
                            0,
                        ),
                    )}
                </p>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex min-w-max items-start gap-3">
                    {columns.map((column) => {
                        const columnLeads = leads.filter(
                            (lead) => lead.status === column.id,
                        );

                        const columnValue = columnLeads.reduce(
                            (sum, lead) => sum + (lead.budget ?? 0),
                            0,
                        );

                        const isLost = column.id === "lost";
                        const isWon = column.id === "won";

                        return (
                            <div
                                key={column.id}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    event.dataTransfer.dropEffect = "move";
                                }}
                                onDragEnter={(event) => {
                                    event.preventDefault();
                                }}
                                onDrop={(event) => {
                                    event.preventDefault();

                                    const leadId =
                                        event.dataTransfer.getData("text/plain");

                                    if (leadId) {
                                        onDropLead(leadId, column.id);
                                    }
                                }}
                                className="flex w-[280px] shrink-0 flex-col"
                            >
                                <div className="mb-2 px-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span
                                                className={`h-2 w-2 shrink-0 rounded-full ${
                                                    isLost
                                                        ? "bg-red-500"
                                                        : isWon
                                                          ? "bg-green-600"
                                                          : "bg-neutral-400"
                                                }`}
                                            />

                                            <h3 className="truncate text-sm font-semibold text-neutral-800">
                                                {column.title}
                                            </h3>

                                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
                                                {columnLeads.length}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[11px] text-neutral-400">
                                            Valor potencial
                                        </span>

                                        <span className="text-[11px] font-medium text-neutral-600">
                                            {formatCompactCurrency(columnValue)}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className={`min-h-[400px] rounded-2xl p-2 transition-colors ${
                                        dragOverStatus === column.id
                                            ? "bg-[#002950]/5 ring-1 ring-inset ring-[#002950]/40"
                                            : "bg-neutral-100/80"
                                    }`}
                                >
                                    <div className="space-y-2">
                                        {columnLeads.map((lead) => (
                                            <LeadCard
                                                key={lead.lead_id}
                                                lead={lead}
                                                pending={pendingLeadIds.has(
                                                    lead.lead_id,
                                                )}
                                                onSelect={onSelectLead}
                                                onDragStart={onDragStart}
                                                onDragEnd={onDragEnd}
                                            />
                                        ))}

                                        {columnLeads.length === 0 && (
                                            <div className="flex min-h-[130px] items-center justify-center rounded-xl border border-dashed border-neutral-300 px-4 text-center">
                                                <p className="text-xs text-neutral-400">
                                                    {isLost
                                                        ? "Ainda não existem leads perdidos"
                                                        : isWon
                                                          ? "Ainda não existem leads ganhos"
                                                          : "Nenhuma lead nesta etapa"}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {view !== "closed" && (
                                        <button
                                            type="button"
                                            onClick={() => onAddLead(column.id)}
                                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-neutral-500 transition hover:bg-white hover:text-neutral-900"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Adicionar lead
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
