"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    CheckCircle2,
    Clock3,
    FileText,
    Plus,
    Search,
    XCircle,
    RotateCcw,
} from "lucide-react";

import {
    Submission,
    SubmissionStatus,
    SubmissionType,
} from "./types";

import CustomSelect from "@/app/components/custom_select";
import SubmissionModal from "./submission_modal";
import { UserProjectDocument } from "@/services/documents";
import Link from "next/link";

interface Props {
    submissions: Submission[];
    userDocuments: UserProjectDocument[];
}

type ViewFilter =
    | "all"
    | "pending"
    | "under_review"
    | "approved"
    | "changes_requested"
    | "rejected";

type StatusConfig = {
    title: string;
    description: string;
    icon: typeof Clock3;
    className: string;
    iconClassName: string;
    badgeClassName: string;
};

const STATUS_CONFIG: Record<
    SubmissionStatus,
    StatusConfig
> = {
    draft: {
        title: "Rascunho",
        description: "Ainda não submetida para revisão.",
        icon: FileText,
        className: "border-gray-200 bg-gray-50",
        iconClassName: "text-gray-500",
        badgeClassName:
            "bg-gray-100 text-gray-600",
    },

    pending: {
        title: "Pendente",
        description: "A aguardar revisão.",
        icon: Clock3,
        className: "border-amber-200 bg-amber-50",
        iconClassName: "text-amber-600",
        badgeClassName:
            "bg-amber-100 text-amber-700",
    },

    under_review: {
        title: "Em revisão",
        description: "A submissão está a ser analisada.",
        icon: Clock3,
        className: "border-blue-200 bg-blue-50",
        iconClassName: "text-blue-600",
        badgeClassName:
            "bg-blue-100 text-blue-700",
    },

    approved: {
        title: "Aprovada",
        description: "A submissão foi aprovada.",
        icon: CheckCircle2,
        className:
            "border-emerald-200 bg-emerald-50",
        iconClassName: "text-emerald-600",
        badgeClassName:
            "bg-emerald-100 text-emerald-700",
    },

    rejected: {
        title: "Rejeitada",
        description: "A submissão não foi aprovada.",
        icon: XCircle,
        className: "border-red-200 bg-red-50",
        iconClassName: "text-red-600",
        badgeClassName:
            "bg-red-100 text-red-700",
    },

    changes_requested: {
        title: "Alterações solicitadas",
        description:
            "É necessário fazer alterações antes de uma nova revisão.",
        icon: RotateCcw,
        className:
            "border-orange-200 bg-orange-50",
        iconClassName: "text-orange-600",
        badgeClassName:
            "bg-orange-100 text-orange-700",
    },
};

const TYPE_LABELS: Record<
    SubmissionType,
    string
> = {
    design: "Design",
    technical: "Técnico",
    client_approval: "Aprovação do cliente",
};

const FILTERS: {
    value: ViewFilter;
    label: string;
}[] = [
        {
            value: "all",
            label: "Todas",
        },
        {
            value: "pending",
            label: "Pendentes",
        },
        {
            value: "under_review",
            label: "Em revisão",
        },
        {
            value: "approved",
            label: "Aprovadas",
        },
        {
            value: "changes_requested",
            label: "Alterações solicitadas",
        },
        {
            value: "rejected",
            label: "Rejeitadas",
        },
    ];


export default function ApprovalsAndReviews({
    submissions: initialSubmissions, userDocuments
}: Props) {
    const params = useParams();

    const projectId = params.projectId as string;
    const submissionId = params.submissionId as string;

    const [submissions, setSubmissions] =
        useState<Submission[]>(
            initialSubmissions,
        );

    const [searchQuery, setSearchQuery] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState<SubmissionType | "all">("all");

    const [statusFilter, setStatusFilter] =
        useState<ViewFilter>("all");

    const [showNewModal, setShowNewModal] =
        useState(false);

    useEffect(() => {
        setSubmissions(initialSubmissions);
    }, [initialSubmissions]);

    const statistics = useMemo(() => {
        return {
            total: submissions.filter(
                (submission) =>
                    submission.status !== "draft",
            ).length,

            pending: submissions.filter(
                (submission) =>
                    submission.status === "pending",
            ).length,

            underReview: submissions.filter(
                (submission) =>
                    submission.status === "under_review",
            ).length,

            approved: submissions.filter(
                (submission) =>
                    submission.status === "approved",
            ).length,

            changesRequested: submissions.filter(
                (submission) =>
                    submission.status ===
                    "changes_requested",
            ).length,

            rejected: submissions.filter(
                (submission) =>
                    submission.status === "rejected",
            ).length,
        };
    }, [submissions]);

    const filteredSubmissions = useMemo(() => {
        const query = searchQuery
            .trim()
            .toLowerCase();

        return submissions
            .filter(
                (submission) =>
                    submission.status !== "draft",
            )
            .filter((submission) => {
                const matchesSearch =
                    !query ||
                    submission.title
                        .toLowerCase()
                        .includes(query) ||
                    Boolean(
                        submission.description
                            ?.toLowerCase()
                            .includes(query),
                    );

                const matchesType =
                    typeFilter === "all" ||
                    submission.type === typeFilter;

                const matchesStatus =
                    statusFilter === "all" ||
                    submission.status ===
                    statusFilter;

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesStatus
                );
            });
    }, [
        submissions,
        searchQuery,
        typeFilter,
        statusFilter,
    ]);

    const handleCreate = () => {
        setShowNewModal(true);
    };

    const formatDate = (
        value: string | null | undefined,
    ) => {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return new Intl.DateTimeFormat(
            "pt-PT",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            },
        ).format(date);
    };

    const getSubmissionDate = (
        submission: Submission,
    ) => {
        const possibleSubmission =
            submission as Submission & {
                submitted_at?: string | null;
                created_at?: string | null;
            };

        return (
            possibleSubmission.submitted_at ??
            possibleSubmission.created_at ??
            null
        );
    };

    const renderStatusMessage = (
        status: SubmissionStatus,
    ) => {
        switch (status) {
            case "approved":
                return "A submissão foi aprovada.";

            case "rejected":
                return "A submissão não foi aprovada.";

            case "changes_requested":
                return "Foram solicitadas alterações antes de uma nova revisão.";

            case "under_review":
                return "A submissão está a ser analisada.";

            case "pending":
                return "A submissão foi enviada e aguarda revisão.";

            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F7F5]">
            {/* ------------------------------------------------------------------ */}
            {/* Header                                                             */}
            {/* ------------------------------------------------------------------ */}

            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Submissões &amp; Revisões
                            </h1>

                            <p className="mt-1 max-w-2xl text-gray-600">
                                Envie documentos para revisão,
                                acompanhe o processo e consulte
                                o resultado das suas submissões.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleCreate}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                        >
                            <Plus size={18} />
                            Nova submissão
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* ------------------------------------------------------------------ */}
                {/* Summary                                                             */}
                {/* ------------------------------------------------------------------ */}

                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter("all")
                        }
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-300"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">
                                Submissões
                            </p>

                            <FileText
                                size={18}
                                className="text-gray-400"
                            />
                        </div>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {statistics.total}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter(
                                "pending",
                            )
                        }
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-300"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">
                                Pendentes
                            </p>

                            <Clock3
                                size={18}
                                className="text-amber-500"
                            />
                        </div>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {statistics.pending}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter(
                                "under_review",
                            )
                        }
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-300"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">
                                Em revisão
                            </p>

                            <Clock3
                                size={18}
                                className="text-blue-500"
                            />
                        </div>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {statistics.underReview}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter(
                                "approved",
                            )
                        }
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-300"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">
                                Aprovadas
                            </p>

                            <CheckCircle2
                                size={18}
                                className="text-emerald-500"
                            />
                        </div>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {statistics.approved}
                        </p>
                    </button>
                </div>

                {/* ------------------------------------------------------------------ */}
                {/* Filters                                                             */}
                {/* ------------------------------------------------------------------ */}

                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                placeholder="Procurar por título ou descrição..."
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            />
                        </div>

                        <CustomSelect
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(
                                    event.target
                                        .value as
                                    | SubmissionType
                                    | "all",
                                )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        >
                            <option value="all">
                                Todos os tipos
                            </option>

                            <option value="design">
                                Design
                            </option>

                            <option value="technical">
                                Técnico
                            </option>

                            <option value="client_approval">
                                Aprovação do cliente
                            </option>
                        </CustomSelect>

                        <CustomSelect
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target
                                        .value as ViewFilter,
                                )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        >
                            {FILTERS.map((filter) => (
                                <option
                                    key={filter.value}
                                    value={filter.value}
                                >
                                    {filter.label}
                                </option>
                            ))}
                        </CustomSelect>
                    </div>
                </div>

                {/* ------------------------------------------------------------------ */}
                {/* Submission list                                                     */}
                {/* ------------------------------------------------------------------ */}

                {filteredSubmissions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                        <FileText
                            className="mx-auto mb-4 text-gray-300"
                            size={48}
                        />

                        <p className="text-lg font-medium text-gray-700">
                            {submissions.length === 0
                                ? "Ainda não existem submissões."
                                : "Nenhuma submissão encontrada."}
                        </p>

                        {submissions.length === 0 ? (
                            <>
                                <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
                                    Envie o primeiro documento
                                    deste projeto para iniciar
                                    o processo de revisão.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                                >
                                    <Plus size={16} />
                                    Criar primeira submissão
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setTypeFilter("all");
                                    setStatusFilter("all");
                                }}
                                className="mt-4 text-sm font-medium text-[#002950] underline underline-offset-4"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSubmissions.map(
                            (submission) => {
                                const config =
                                    STATUS_CONFIG[
                                    submission.status
                                    ];

                                const StatusIcon =
                                    config.icon;

                                const submittedDate =
                                    formatDate(
                                        getSubmissionDate(
                                            submission,
                                        ),
                                    );
                                const submissionLinkUrl = `/management/projects/${projectId}/approvals-and-reviews/${submission.id}`
                                return (
                                    <div
                                        key={
                                            submission.id
                                        }
                                        className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-gray-300"
                                    >
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            {/* Main information */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${config.className}`}
                                                    >
                                                        <StatusIcon
                                                            size={
                                                                21
                                                            }
                                                            className={
                                                                config.iconClassName
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h2 className="font-semibold text-gray-900">
                                                                {
                                                                    submission.title
                                                                }
                                                            </h2>

                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.badgeClassName}`}
                                                            >
                                                                {
                                                                    config.title
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                                                            <span>
                                                                {
                                                                    TYPE_LABELS[
                                                                    submission
                                                                        .type
                                                                    ]
                                                                }
                                                            </span>

                                                            {submittedDate && (
                                                                <>
                                                                    <span className="text-gray-300">
                                                                        •
                                                                    </span>

                                                                    <span>
                                                                        Enviada
                                                                        em{" "}
                                                                        {
                                                                            submittedDate
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {submission.description && (
                                                    <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600">
                                                        {
                                                            submission.description
                                                        }
                                                    </p>
                                                )}

                                                <div
                                                    className={`mt-4 rounded-lg border px-4 py-3 ${config.className}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <StatusIcon
                                                            size={
                                                                17
                                                            }
                                                            className={`mt-0.5 shrink-0 ${config.iconClassName}`}
                                                        />

                                                        <div>
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {
                                                                    config.title
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-sm text-gray-600">
                                                                {renderStatusMessage(
                                                                    submission.status,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Result / action */}
                                            <div className="flex shrink-0 flex-col gap-2 lg:w-44">
                                                <Link
                                                    type="button"
                                                    href={submissionLinkUrl}
                                                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                                                >
                                                    Ver submissão
                                                </Link>

                                                {submission.status ===
                                                    "changes_requested" && (
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                handleCreate
                                                            }
                                                            className="w-full rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                                                        >
                                                            Nova versão
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                )}

                {/* ------------------------------------------------------------------ */}
                {/* Review explanation                                                  */}
                {/* ------------------------------------------------------------------ */}

                {filteredSubmissions.length > 0 && (
                    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
                        <div className="flex items-start gap-3">
                            <FileText
                                size={19}
                                className="mt-0.5 shrink-0 text-[#BD9655]"
                            />

                            <div>
                                <h3 className="font-medium text-gray-900">
                                    Como funciona a revisão?
                                </h3>

                                <p className="mt-1 text-sm word-break text-gray-600">
                                    Depois de enviar uma submissão,
                                    a sua submissão será analisada e atualizar o estado.

                                    Quando a revisão terminar, poderá
                                    consultar aqui o resultado e os
                                    comentários associados.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* New submission modal                                                */}
            {/* ------------------------------------------------------------------ */}

            {showNewModal && (
                <SubmissionModal
                    projectId={projectId}
                    editingId=""
                    onClose={() => setShowNewModal(false)}
                    documents={userDocuments}
                />
            )}
        </div>
    );
}