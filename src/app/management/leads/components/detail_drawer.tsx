
"use client";

import {
    Building2,
    Mail,
    Phone,
    Pencil,
    RotateCcw,
    Trophy,
    X,
    XCircle,
} from "lucide-react";

import type { Lead, LeadStatus } from "@/services/leads";
import {
    formatCurrency,
    formatDate,
    getInitials,
    STATUS_LABELS,
} from "../utils";

type LeadDetailDrawerProps = {
    lead: Lead;
    pending: boolean;
    onClose: () => void;
    onEdit: (lead: Lead) => void;
    onChangeStatus: (leadId: string, status: LeadStatus) => void;
};

export default function LeadDetailDrawer({
    lead,
    pending,
    onClose,
    onEdit,
    onChangeStatus,
}: LeadDetailDrawerProps) {
    const isClosed = lead.status === "won" || lead.status === "lost";

    function changeStatus(status: LeadStatus) {
        onChangeStatus(lead.lead_id, status);
    }

    return (
        <>
            <button
                type="button"
                aria-label="Fechar detalhes da lead"
                className="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="lead-detail-title"
                className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-neutral-200 bg-white shadow-2xl"
            >
                <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                            Detalhes da lead
                        </p>

                        <h2
                            id="lead-detail-title"
                            className="mt-1 truncate text-lg font-semibold text-neutral-950"
                        >
                            {lead.name}
                        </h2>
                    </div>

                    <div className="ml-3 flex shrink-0 items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onEdit(lead)}
                            disabled={pending}
                            aria-label="Editar lead"
                            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-[#002950] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Pencil className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar"
                            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#002950] text-sm font-semibold text-white">
                            {getInitials(lead.name)}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-900">
                                {lead.name}
                            </p>

                            {lead.company && (
                                <p className="truncate text-sm text-neutral-500">
                                    {lead.company}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-5">
                        <span
                            className={`inline-flex rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                                lead.status === "lost"
                                    ? "bg-red-50 text-red-700"
                                    : lead.status === "won"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-blue-50 text-blue-700"
                            }`}
                        >
                            {STATUS_LABELS[lead.status]}
                        </span>
                    </div>

                    <section className="mt-6 rounded-2xl border border-neutral-200 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                            Oportunidade
                        </p>

                        <h3 className="mt-2 text-base font-semibold text-neutral-900">
                            {lead.project_name}
                        </h3>

                        <p className="mt-1 text-sm text-neutral-500">
                            {lead.project_type}
                        </p>

                        <div className="mt-4 border-t border-neutral-100 pt-4">
                            <p className="text-xs text-neutral-400">
                                Orçamento estimado
                            </p>

                            <p className="mt-1 text-xl font-semibold text-neutral-950">
                                {formatCurrency(lead.budget)}
                            </p>
                        </div>
                    </section>

                    <section className="mt-4 space-y-2">
                        {lead.phone && (
                            <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 hover:bg-neutral-100"
                            >
                                <Phone className="h-4 w-4 shrink-0 text-neutral-500" />
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                        Telefone
                                    </p>
                                    <p className="truncate text-sm text-neutral-700">
                                        {lead.phone}
                                    </p>
                                </div>
                            </a>
                        )}

                        {lead.email && (
                            <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 hover:bg-neutral-100"
                            >
                                <Mail className="h-4 w-4 shrink-0 text-neutral-500" />
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                        Email
                                    </p>
                                    <p className="truncate text-sm text-neutral-700">
                                        {lead.email}
                                    </p>
                                </div>
                            </a>
                        )}

                        {lead.location && (
                            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                                <Building2 className="h-4 w-4 shrink-0 text-neutral-500" />
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                                        Localização
                                    </p>
                                    <p className="truncate text-sm text-neutral-700">
                                        {lead.location}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="mt-6 rounded-xl bg-neutral-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-neutral-400">
                                Criado em
                            </span>
                            <span className="text-xs font-medium text-neutral-700">
                                {formatDate(lead.created_at)}
                            </span>
                        </div>
                    </section>
                </div>

                <footer className="shrink-0 border-t border-neutral-200 bg-white p-4">
                    {isClosed ? (
                        <button
                            type="button"
                            disabled={pending}
                            onClick={() => changeStatus("new")}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#002950] px-3 text-sm font-medium text-white hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RotateCcw className="h-4 w-4" />
                            {pending ? "A guardar..." : "Reabrir lead"}
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={pending}
                                onClick={() => changeStatus("won")}
                                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-green-50 px-2 text-sm font-medium text-green-800 hover:bg-green-100 disabled:opacity-50"
                            >
                                <Trophy className="h-4 w-4" />
                                Ganho
                            </button>

                            <button
                                type="button"
                                disabled={pending}
                                onClick={() => changeStatus("lost")}
                                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-red-50 px-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                                <XCircle className="h-4 w-4" />
                                Perdido
                            </button>
                        </div>
                    )}
                </footer>
            </aside>
        </>
    );
}
