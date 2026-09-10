"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Check,
    Download,
    FileText,
    MessageSquare,
    Search,
    X,
} from "lucide-react";

import MetricCard from "./metric_card";
import {
    fetchAllProjectSubmissions,
    Submission,
} from "@/services/submissions";

type SubmissionsReviewPageProps = {
    allSubmissions: Submission[]
};

const statusConfig = {
    pending: {
        label: "Pendente",
        className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    approved: {
        label: "Aprovado",
        className: "bg-green-50 text-green-700 border-green-200",
    },
    rejected: {
        label: "Rejeitado",
        className: "bg-red-50 text-red-700 border-red-200",
    },
    changes_requested: {
        label: "Alterações solicitadas",
        className: "bg-orange-50 text-orange-700 border-orange-200",
    },
};

const typeLabels = {
    design: "Design",
    technical: "Técnico",
    client_approval: "Aprovação do cliente",
};

export default function SubmissionsReviewPage({
    allSubmissions,
}: SubmissionsReviewPageProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const selectedSubmission = useMemo(
        () =>
            submissions.find(
                (submission) => submission.id === selectedId,
            ) ?? null,
        [submissions, selectedId],
    );

    const filteredSubmissions = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return submissions;
        }

        return submissions.filter((submission) => {
            return (
                submission.title.toLowerCase().includes(query) ||
                submission.description?.toLowerCase().includes(query) ||
                submission.submitted_by_name
                    .toLowerCase()
                    .includes(query) ||
                typeLabels[submission.type].toLowerCase().includes(query)
            );
        });
    }, [submissions, search]);

    const metrics = useMemo(
        () => ({
            total: submissions.length,
            pending: submissions.filter(
                (submission) => submission.status === "pending",
            ).length,
            approved: submissions.filter(
                (submission) => submission.status === "approved",
            ).length,
            rejected: submissions.filter(
                (submission) => submission.status === "rejected",
            ).length,
        }),
        [submissions],
    );

    function handleSubmissionUpdated(updated: Submission) {
        setSubmissions((current) =>
            current.map((submission) =>
                submission.id === updated.id ? updated : submission,
            ),
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col bg-[#F7F7F5]">
            {/* Header */}
            <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-5">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Submissões & Aprovações
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Reveja, comente e aprove os ficheiros submetidos ao
                        projecto.
                    </p>
                </div>

                {/* Metrics */}
                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <MetricCard
                        label="Total"
                        value={metrics.total}
                    />

                    <MetricCard
                        label="Pendentes"
                        value={metrics.pending}
                    />

                    <MetricCard
                        label="Aprovadas"
                        value={metrics.approved}
                    />

                    <MetricCard
                        label="Rejeitadas"
                        value={metrics.rejected}
                    />
                </div>
            </div>

            {/* Main content */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
                {/* Left - submissions list */}
                <aside className="flex w-[380px] shrink-0 flex-col border-r border-gray-200 bg-white">
                    {/* Search */}
                    <div className="shrink-0 border-b border-gray-200 p-4">
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Pesquisar submissões..."
                                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {filteredSubmissions.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <FileText
                                    size={32}
                                    className="mx-auto text-gray-300"
                                />

                                <p className="mt-3 text-sm text-gray-500">
                                    {search
                                        ? "Nenhuma submissão encontrada."
                                        : "Ainda não existem submissões neste projecto."}
                                </p>
                            </div>
                        ) : (
                            filteredSubmissions.map((submission) => {
                                const status =
                                    statusConfig[submission.status];

                                const isSelected =
                                    submission.id === selectedSubmission?.id;

                                return (
                                    <button
                                        key={submission.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedId(submission.id)
                                        }
                                        className={`w-full border-b border-gray-100 px-4 py-4 text-left transition ${isSelected
                                                ? "bg-gray-50"
                                                : "hover:bg-gray-50/70"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-medium text-gray-900">
                                                    {submission.title}
                                                </h3>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {
                                                        typeLabels[
                                                        submission.type
                                                        ]
                                                    }
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${status.className}`}
                                            >
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                                            <span>
                                                {submission.submitted_by_name}
                                            </span>

                                            <span>
                                                {formatDate(
                                                    submission.submitted_date,
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* Right - review panel */}
                <main className="min-w-0 flex-1 overflow-y-auto">
                    {!selectedSubmission ? (
                        <div className="flex h-full items-center justify-center px-6">
                            <div className="text-center">
                                <FileText
                                    size={40}
                                    className="mx-auto text-gray-300"
                                />

                                <h2 className="mt-4 text-sm font-semibold text-gray-900">
                                    Nenhuma submissão seleccionada
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Seleccione uma submissão para ver os
                                    detalhes.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-4xl px-8 py-8">
                            {/* Submission header */}
                            <div className="flex items-start justify-between gap-6">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {selectedSubmission.title}
                                        </h2>

                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig[
                                                    selectedSubmission.status
                                                ].className
                                                }`}
                                        >
                                            {
                                                statusConfig[
                                                    selectedSubmission.status
                                                ].label
                                            }
                                        </span>
                                    </div>

                                    {selectedSubmission.description && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            {selectedSubmission.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submission information */}
                            <section className="mt-8 rounded-xl border border-gray-200 bg-white">
                                <div className="border-b border-gray-200 px-5 py-4">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Informações da submissão
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-5 px-5 py-5 md:grid-cols-4">
                                    <InfoItem
                                        label="Tipo"
                                        value={
                                            typeLabels[
                                            selectedSubmission.type
                                            ]
                                        }
                                    />

                                    <InfoItem
                                        label="Submetido por"
                                        value={
                                            selectedSubmission.submitted_by_name
                                        }
                                    />

                                    <InfoItem
                                        label="Data"
                                        value={formatDate(
                                            selectedSubmission.submitted_date,
                                        )}
                                    />

                                    <InfoItem
                                        label="Prazo"
                                        value={formatDate(
                                            selectedSubmission.due_date,
                                        )}
                                    />
                                </div>
                            </section>

                            {/* File */}
                            <section className="mt-5 rounded-xl border border-gray-200 bg-white">
                                <div className="border-b border-gray-200 px-5 py-4">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Ficheiros submetidos
                                    </h3>
                                </div>

                                <div className="px-5 py-4">
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                                                <FileText
                                                    size={19}
                                                    className="text-gray-600"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    Ficheiros da submissão
                                                </p>

                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    Os ficheiros associados a
                                                    esta submissão serão
                                                    apresentados aqui.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled
                                            className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-400"
                                        >
                                            <Download size={16} />
                                            Abrir ficheiro
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Comments */}
                            <section className="mt-5 rounded-xl border border-gray-200 bg-white">
                                <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
                                    <MessageSquare
                                        size={17}
                                        className="text-gray-500"
                                    />

                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Comentário da revisão
                                    </h3>
                                </div>

                                <div className="p-5">
                                    <textarea
                                        rows={5}
                                        placeholder="Adicione um comentário sobre esta submissão..."
                                        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
                                    />

                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="button"
                                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Adicionar comentário
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Review actions */}
                            <ReviewActions
                                submission={selectedSubmission}
                                onUpdated={handleSubmissionUpdated}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function ReviewActions({
    submission,
    onUpdated,
}: {
    submission: Submission;
    onUpdated: (submission: Submission) => void;
}) {
    const [updating, setUpdating] = useState(false);

    async function handleStatusChange(
        status: "approved" | "rejected",
    ) {
        setUpdating(true);

        try {
            const { updateSubmissionStatus } = await import(
                "@/services/submissions"
            );

            const updated = await updateSubmissionStatus(
                submission.id,
                status,
            );

            if (updated) {
                onUpdated(updated);
            }
        } catch (error) {
            console.error(
                "Error updating submission status:",
                error,
            );
        } finally {
            setUpdating(false);
        }
    }

    return (
        <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        Decisão da revisão
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        Escolha o resultado da análise desta submissão.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            handleStatusChange("rejected")
                        }
                        className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={16} />
                        Rejeitar
                    </button>

                    <button
                        type="button"
                        disabled={updating}
                        onClick={() =>
                            handleStatusChange("approved")
                        }
                        className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Check size={16} />
                        Aprovar
                    </button>
                </div>
            </div>
        </section>
    );
}

function InfoItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-1 text-sm font-medium text-gray-800">
                {value}
            </p>
        </div>
    );
}

function formatDate(value: string) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("pt-AO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}
