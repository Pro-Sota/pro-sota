
"use client";

import { Building2, Ellipsis } from "lucide-react";
import {
    formatCompactCurrency,
    formatDate,
    getInitials,
    STATUS_LABELS,
} from "../utils";
import { Lead } from "../types";

type LeadCardProps = {
    lead: Lead;
    pending: boolean;
    onSelect: (leadId: string) => void;
    onDragStart: (leadId: string) => void;
    onDragEnd: () => void;
};

export default function LeadCard({
    lead,
    pending,
    onSelect,
    onDragStart,
    onDragEnd,
}: LeadCardProps) {
    return (
        <button
            type="button"
            draggable={!pending}
            onDragStart={(event) => {
                if (pending) {
                    event.preventDefault();
                    return;
                }

                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", lead.lead_id);
                onDragStart(lead.lead_id);
            }}
            onDragEnd={onDragEnd}
            onClick={() => onSelect(lead.lead_id)}
            aria-busy={pending}
            className={`group w-full rounded-xl border border-neutral-200/80 bg-white p-3 text-left shadow-sm transition hover:border-neutral-300 hover:shadow-md ${
                pending
                    ? "cursor-wait opacity-60"
                    : "cursor-grab active:cursor-grabbing"
            }`}
        >
            <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002950] text-xs font-semibold text-white">
                        {getInitials(lead.name)}
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

                <Ellipsis className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-neutral-600" />
            </div>

            <div className="mb-3">
                <p className="line-clamp-2 text-sm font-medium leading-5 text-neutral-800">
                    {lead.project_name}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                    {lead.project_type}
                </p>
            </div>

            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-900">
                    {lead.budget === null
                        ? "Não definido"
                        : formatCompactCurrency(lead.budget)}
                </span>

                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-600">
                    {STATUS_LABELS[lead.status]}
                </span>
            </div>

            {lead.location && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{lead.location}</span>
                </div>
            )}

            <div className="mt-3 border-t border-neutral-100 pt-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-neutral-400">
                        Criado em {formatDate(lead.created_at)}
                    </span>

                    {pending && (
                        <span
                            role="status"
                            className="text-[10px] font-medium text-[#002950]"
                        >
                            A guardar...
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
