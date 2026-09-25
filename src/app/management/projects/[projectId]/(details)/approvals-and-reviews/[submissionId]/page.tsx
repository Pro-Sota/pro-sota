import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    FileText,
    RotateCcw,
    User,
    XCircle,
} from "lucide-react";

import {
    getSubmission,
    getSubmissionFiles,
} from "@/services/submissions";

import {
    SubmissionStatus,
    SubmissionType,
} from "@/app/actions/types";

type Props = {
    params: Promise<{
        projectId: string;
        submissionId: string;
    }>;
};

type PageSubmissionStatus =
    | SubmissionStatus
    | "draft"
    | "under_review";

const STATUS_CONFIG: Record<
    PageSubmissionStatus,
    {
        title: string;
        description: string;
        icon: typeof Clock3;
        wrapper: string;
        iconClass: string;
        badge: string;
    }
> = {
    draft: {
        title: "Rascunho",
        description: "Esta submissão ainda não foi enviada para revisão.",
        icon: FileText,
        wrapper: "border-gray-200 bg-gray-50",
        iconClass: "text-gray-500",
        badge: "bg-gray-100 text-gray-700",
    },

    pending: {
        title: "Pendente",
        description: "A submissão foi enviada e aguarda revisão.",
        icon: Clock3,
        wrapper: "border-amber-200 bg-amber-50",
        iconClass: "text-amber-600",
        badge: "bg-amber-100 text-amber-700",
    },

    under_review: {
        title: "Em revisão",
        description: "A submissão está a ser analisada.",
        icon: Clock3,
        wrapper: "border-blue-200 bg-blue-50",
        iconClass: "text-blue-600",
        badge: "bg-blue-100 text-blue-700",
    },

    approved: {
        title: "Aprovada",
        description: "A submissão foi aprovada.",
        icon: CheckCircle2,
        wrapper: "border-emerald-200 bg-emerald-50",
        iconClass: "text-emerald-600",
        badge: "bg-emerald-100 text-emerald-700",
    },

    rejected: {
        title: "Rejeitada",
        description: "A submissão não foi aprovada.",
        icon: XCircle,
        wrapper: "border-red-200 bg-red-50",
        iconClass: "text-red-600",
        badge: "bg-red-100 text-red-700",
    },

    changes_requested: {
        title: "Alterações solicitadas",
        description:
            "É necessário fazer alterações antes de uma nova revisão.",
        icon: RotateCcw,
        wrapper: "border-orange-200 bg-orange-50",
        iconClass: "text-orange-600",
        badge: "bg-orange-100 text-orange-700",
    },
};

const TYPE_LABELS: Record<string, string> = {
    design: "Design",
    technical: "Técnico",
    client_approval: "Aprovação do cliente",
    permit: "Licenciamento",
    tender: "Concurso",
    construction: "Construção",
    as_built: "As Built",
    other: "Outro",
};

function formatDate(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const dateValue = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(dateValue.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(dateValue);
}

function formatShortDate(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const dateValue = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(dateValue.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(dateValue);
}

function formatFileSize(
    value: number | null | undefined,
) {
    if (!value || value <= 0) {
        return null;
    }

    if (value < 1024) {
        return `${value} B`;
    }

    if (value < 1024 * 1024) {
        return `${(value / 1024).toFixed(1)} KB`;
    }

    if (value < 1024 * 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default async function SubmissionDetailsPage({
    params,
}: Props) {
    const {
        projectId,
        submissionId,
    } = await params;

    const [submission, submissionFiles] =
        await Promise.all([
            getSubmission(submissionId),
            getSubmissionFiles(submissionId),
        ]);

    if (
        !submission ||
        submission.project_id !== projectId
    ) {
        return (
            <div className="min-h-screen bg-[#F7F7F5]">
                <div className="mx-auto max-w-4xl px-6 py-12">
                    <Link
                        href={`/management/projects/${projectId}/approvals-and-reviews`}
                        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#002950]"
                    >
                        <ArrowLeft size={17} />
                        Voltar para submissões
                    </Link>

                    <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                        <FileText
                            size={44}
                            className="mx-auto mb-4 text-gray-300"
                        />

                        <h1 className="text-xl font-semibold text-gray-900">
                            Submissão não encontrada
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            A submissão solicitada não existe
                            ou não pertence a este projeto.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const status =
        submission.status as SubmissionStatus;

    const type =
        submission.type as SubmissionType;

    const config =
        STATUS_CONFIG[status] ??
        STATUS_CONFIG.pending;

    const StatusIcon = config.icon;

    return (
        <div className="min-h-screen bg-[#F7F7F5]">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-6xl px-6 py-6">
                    <Link
                        href={`/management/projects/${projectId}/approvals-and-reviews`}
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#002950]"
                    >
                        <ArrowLeft size={17} />
                        Submissões &amp; Revisões
                    </Link>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {submission.title}
                                </h1>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${config.badge}`}
                                >
                                    {config.title}
                                </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                                <span>
                                    {TYPE_LABELS[type] ??
                                        submission.type}
                                </span>

                                <span className="text-gray-300">
                                    •
                                </span>

                                <span>
                                    Versão{" "}
                                    {submission.revision_number ??
                                        1}
                                </span>

                                <span className="text-gray-300">
                                    •
                                </span>

                                <span>
                                    Criada em{" "}
                                    {formatShortDate(
                                        submission.created_at,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    {/* Main content */}
                    <div className="space-y-6">
                        {/* Status */}
                        <section
                            className={`rounded-xl border p-5 ${config.wrapper}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white">
                                    <StatusIcon
                                        size={22}
                                        className={
                                            config.iconClass
                                        }
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        {config.title}
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                        {
                                            config.description
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50">
                                    <FileText
                                        size={18}
                                        className="text-gray-500"
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Detalhes da submissão
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Informações enviadas para
                                        revisão.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Descrição
                                </p>

                                {submission.description ? (
                                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                                        {
                                            submission.description
                                        }
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400">
                                        Nenhuma descrição
                                        adicionada.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Documents */}
                        <section className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Documentos submetidos
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Documentos selecionados da
                                        pasta de documentos do projeto.
                                    </p>
                                </div>

                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {submissionFiles.length}{" "}
                                    {submissionFiles.length ===
                                    1
                                        ? "documento"
                                        : "documentos"}
                                </span>
                            </div>

                            {submissionFiles.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 px-5 py-10 text-center">
                                    <FileText
                                        size={36}
                                        className="mx-auto mb-3 text-gray-300"
                                    />

                                    <p className="text-sm font-medium text-gray-700">
                                        Nenhum documento associado
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Esta submissão não possui
                                        documentos associados.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                                    {submissionFiles.map(
                                        (file) => (
                                            <div
                                                key={
                                                    file.submission_file_id
                                                }
                                                className="flex items-center gap-4 px-4 py-4"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                                                    <FileText
                                                        size={
                                                            19
                                                        }
                                                        className="text-gray-500"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-gray-900">
                                                        {
                                                            file.file_name
                                                        }
                                                    </p>

                                                    <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-gray-500">
                                                        {file.file_type && (
                                                            <span>
                                                                {
                                                                    file.file_type
                                                                }
                                                            </span>
                                                        )}

                                                        {formatFileSize(
                                                            file.file_size,
                                                        ) && (
                                                            <>
                                                                <span>
                                                                    •
                                                                </span>

                                                                <span>
                                                                    {formatFileSize(
                                                                        file.file_size,
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}

                                                        {file.created_at && (
                                                            <>
                                                                <span>
                                                                    •
                                                                </span>

                                                                <span>
                                                                    Adicionado{" "}
                                                                    {formatShortDate(
                                                                        file.created_at,
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {file.file_url && (
                                                    <a
                                                        href={
                                                            file.file_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                                                    >
                                                        Ver
                                                    </a>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Review notes */}
                        {(submission.notes ||
                            submission.reviewed_at ||
                            submission.reviewed_by) && (
                            <section className="rounded-xl border border-gray-200 bg-white p-6">
                                <div className="mb-5">
                                    <h2 className="font-semibold text-gray-900">
                                        Resultado da revisão
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Informação adicionada pelo
                                        responsável pela revisão.
                                    </p>
                                </div>

                                {submission.notes ? (
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                            {
                                                submission.notes
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">
                                        Não foram adicionados
                                        comentários à revisão.
                                    </p>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Submission information */}
                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="font-semibold text-gray-900">
                                Informação
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Tipo
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                        {TYPE_LABELS[type] ??
                                            submission.type}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Versão
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                        {submission.revision_number ??
                                            1}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Data de envio
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                        {formatDate(
                                            submission.submitted_at,
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Prazo
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                        {formatDate(
                                            submission.due_date,
                                        )}
                                    </p>
                                </div>

                                {submission.reviewed_at && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                            Revisto em
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-gray-800">
                                            {formatDate(
                                                submission.reviewed_at,
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* People */}
                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-center gap-2">
                                <User
                                    size={17}
                                    className="text-gray-400"
                                />

                                <h2 className="font-semibold text-gray-900">
                                    Participantes
                                </h2>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Submetido por
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                        {submission.submitted_by_name ??
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        Revisto por
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-800">
                                        {submission.reviewed_by ??
                                            "—"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Dates */}
                        <section className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="font-semibold text-gray-900">
                                Histórico
                            </h2>

                            <div className="mt-5 space-y-4">
                                <div className="relative pl-6">
                                    <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-gray-400" />

                                    <p className="text-sm font-medium text-gray-800">
                                        Submissão criada
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {formatDate(
                                            submission.created_at,
                                        )}
                                    </p>
                                </div>

                                {submission.submitted_at && (
                                    <div className="relative pl-6">
                                        <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-amber-500" />

                                        <p className="text-sm font-medium text-gray-800">
                                            Enviada para revisão
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDate(
                                                submission.submitted_at,
                                            )}
                                        </p>
                                    </div>
                                )}

                                {submission.reviewed_at && (
                                    <div className="relative pl-6">
                                        <span
                                            className={`absolute left-0 top-1.5 h-2.5 w-2.5 ${
                                                status ===
                                                "approved"
                                                    ? "bg-emerald-500"
                                                    : status ===
                                                        "rejected"
                                                      ? "bg-red-500"
                                                      : "bg-orange-500"
                                            }`}
                                        />

                                        <p className="text-sm font-medium text-gray-800">
                                            Revisão concluída
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDate(
                                                submission.reviewed_at,
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}