"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowUpDown,
    CheckCircle2,
    Clock3,
    Edit,
    Eye,
    FileText,
    Inbox,
    MessageSquare,
    Plus,
    RotateCcw,
    Search,
    Send,
    X,
    AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import Loader from "@/app/components/loader";

type SubmissionStatus =
    | "Aprovado"
    | "Mudanças Solicitadas"
    | "Em Revisão"
    | "Rejeitado";

type SubmissionType =
    | "Design"
    | "Técnico"
    | "Aprovação Cliente";

type ToastType = "success" | "error" | "info";

type Submission = {
    id: number;
    title: string;
    submittedDate: string;
    dueDate: string;
    status: SubmissionStatus;
    type: SubmissionType;
    description?: string;
    reviewerComment?: string;
    reviewedDate?: string;
};

type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

type SortKey = "date" | "title" | "status" | "submittedDate";

const STORAGE_KEY = "member_submissions";

const INITIAL_SUBMISSIONS: Submission[] = [
    {
        id: 1,
        title: "Desenhos Arquitetónicos - Revisão 03",
        submittedDate: "2026-07-10",
        dueDate: "2026-07-17",
        status: "Em Revisão",
        type: "Design",
        description:
            "Conjunto completo de desenhos para aprovação inicial.",
    },
    {
        id: 2,
        title: "Pacote Estrutural - Revisão 02",
        submittedDate: "2026-07-08",
        dueDate: "2026-07-15",
        status: "Mudanças Solicitadas",
        type: "Técnico",
        description:
            "Cálculos estruturais e detalhes de reforço.",
        reviewerComment:
            "Por favor, rever os detalhes de reforço da estrutura no piso 2 e atualizar as plantas correspondentes.",
        reviewedDate: "2026-07-16",
    },
    {
        id: 3,
        title: "Seleção de Materiais Interiores",
        submittedDate: "2026-07-05",
        dueDate: "2026-07-12",
        status: "Aprovado",
        type: "Aprovação Cliente",
        description:
            "Paleta de cores e acabamentos finais.",
        reviewerComment:
            "A seleção de materiais foi aprovada.",
        reviewedDate: "2026-07-11",
    },
    {
        id: 4,
        title: "Detalhe Revestimento Fachada — Elevação Norte",
        submittedDate: "2026-07-02",
        dueDate: "2026-07-09",
        status: "Rejeitado",
        type: "Técnico",
        description:
            "Especificações de revestimento e fixação.",
        reviewerComment:
            "A solução apresentada não corresponde às especificações definidas para esta fachada.",
        reviewedDate: "2026-07-10",
    },
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
    Aprovado: "bg-green-100 text-green-700",
    "Mudanças Solicitadas": "bg-orange-100 text-orange-700",
    "Em Revisão": "bg-blue-100 text-blue-700",
    Rejeitado: "bg-red-100 text-red-700",
};

const TYPE_STYLES: Record<
    SubmissionType,
    {
        badge: string;
        icon: React.ComponentType<{
            size?: number;
            strokeWidth?: number;
        }>;
    }
> = {
    Design: {
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        icon: FileText,
    },
    Técnico: {
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        icon: FileText,
    },
    "Aprovação Cliente": {
        badge: "bg-teal-50 text-teal-700 border-teal-200",
        icon: CheckCircle2,
    },
};

const getToday = () => new Date();

function isOverdue(submission: Submission) {
    if (
        submission.status !== "Em Revisão" &&
        submission.status !== "Mudanças Solicitadas"
    ) {
        return false;
    }

    return (
        new Date(`${submission.dueDate}T23:59:59`).getTime() <
        getToday().getTime()
    );
}

function daysOverdue(submission: Submission) {
    const diff =
        getToday().getTime() -
        new Date(`${submission.dueDate}T23:59:59`).getTime();

    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(
    dateString: string,
    locale = "pt-PT"
): string {
    return new Date(`${dateString}T00:00:00Z`).toLocaleDateString(
        locale,
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function StatusBadge({
    status,
}: {
    status: SubmissionStatus;
}) {
    return (
        <span
            className={clsx(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                STATUS_STYLES[status]
            )}
        >
            {status}
        </span>
    );
}

function TypeBadge({
    type,
}: {
    type: SubmissionType;
}) {
    const { badge, icon: Icon } = TYPE_STYLES[type];

    return (
        <span
            className={clsx(
                "inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium",
                badge
            )}
        >
            <Icon size={12} strokeWidth={2.25} />
            {type}
        </span>
    );
}

function ActionButton({
    onClick,
    icon: Icon,
    label,
    tone = "gray",
    disabled = false,
}: {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    icon: React.ComponentType<{
        size?: number;
        strokeWidth?: number;
    }>;
    label: string;
    tone?: "green" | "blue" | "gray" | "orange";
    disabled?: boolean;
}) {
    const tones = {
        green:
            "text-green-700 hover:bg-green-50 focus-visible:ring-green-500",
        blue:
            "text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-500",
        gray:
            "text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-500",
        orange:
            "text-orange-700 hover:bg-orange-50 focus-visible:ring-orange-500",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={clsx(
                "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                tones[tone],
                disabled && "cursor-not-allowed opacity-50"
            )}
        >
            <Icon size={15} strokeWidth={2.25} />
            <span className="hidden md:inline">{label}</span>
        </button>
    );
}

function ToastNotification({
    toast,
    onClose,
}: {
    toast: Toast;
    onClose: () => void;
}) {
    const colors = {
        success: "bg-green-600",
        error: "bg-red-600",
        info: "bg-gray-900",
    };

    return (
        <div
            className={clsx(
                colors[toast.type],
                "text-white px-5 py-3 rounded-xl shadow-2xl text-sm flex items-center justify-between gap-3"
            )}
        >
            <span>{toast.message}</span>

            <button
                type="button"
                onClick={onClose}
                className="text-white/70 hover:text-white"
                aria-label="Fechar notificação"
            >
                <X size={16} />
            </button>
        </div>
    );
}

type SummaryCardProps = {
    label: string;
    value: React.ReactNode;
    active?: boolean;
    valueClassName?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function SummaryCard({
    label,
    value,
    active = false,
    valueClassName,
    className,
    ...props
}: SummaryCardProps) {
    return (
        <button
            type="button"
            aria-pressed={active}
            {...props}
            className={clsx(
                "group rounded-xl border bg-white p-4 text-left transition cursor-pointer",
                "hover:-translate-y-0.5 hover:shadow-md",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
                active
                    ? "border-slate-500 ring-1 ring-slate-500"
                    : "border-gray-200 hover:border-gray-300",
                className
            )}
        >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p
                className={clsx(
                    "mt-1 text-2xl font-semibold text-gray-900",
                    valueClassName
                )}
            >
                {value}
            </p>
        </button>
    );
}

export default function MemberSubmissionsPage() {
    const [loading, setLoading] = useState(true);

    const [submissions, setSubmissions] = useState<Submission[]>(
        () => {
            if (typeof window === "undefined") {
                return INITIAL_SUBMISSIONS;
            }

            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                return saved
                    ? JSON.parse(saved)
                    : INITIAL_SUBMISSIONS;
            } catch (error) {
                console.error(
                    "Failed to load submissions",
                    error
                );
                return INITIAL_SUBMISSIONS;
            }
        }
    );

    const [toasts, setToasts] = useState<Toast[]>([]);

    const [activeFilter, setActiveFilter] =
        useState("all");

    const [query, setQuery] = useState("");

    const [typeFilter, setTypeFilter] =
        useState<SubmissionType | "all">("all");

    const [sortKey, setSortKey] =
        useState<SortKey>("date");

    const [sortAsc, setSortAsc] = useState(false);

    const [detailItem, setDetailItem] =
        useState<Submission | null>(null);

    const [editItem, setEditItem] =
        useState<Submission | null>(null);

    const [showNewModal, setShowNewModal] =
        useState(false);

    const [showWithdrawConfirm, setShowWithdrawConfirm] =
        useState<number | null>(null);

    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] =
        useState("");
    const [newType, setNewType] =
        useState<SubmissionType>("Design");
    const [newDueDate, setNewDueDate] =
        useState("");

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(submissions)
        );
    }, [submissions]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 700);

        return () => clearTimeout(timer);
    }, []);

    const counts = useMemo(
        () => ({
            pending: submissions.filter(
                (s) => s.status === "Em Revisão"
            ).length,

            approved: submissions.filter(
                (s) => s.status === "Aprovado"
            ).length,

            changesRequested: submissions.filter(
                (s) =>
                    s.status === "Mudanças Solicitadas"
            ).length,

            rejected: submissions.filter(
                (s) => s.status === "Rejeitado"
            ).length,
        }),
        [submissions]
    );

    const filteredSubmissions = useMemo(() => {
        let list = [...submissions];

        switch (activeFilter) {
            case "pending":
                list = list.filter(
                    (s) => s.status === "Em Revisão"
                );
                break;

            case "approved":
                list = list.filter(
                    (s) => s.status === "Aprovado"
                );
                break;

            case "changesRequested":
                list = list.filter(
                    (s) =>
                        s.status ===
                        "Mudanças Solicitadas"
                );
                break;

            case "rejected":
                list = list.filter(
                    (s) => s.status === "Rejeitado"
                );
                break;

            default:
                break;
        }

        if (typeFilter !== "all") {
            list = list.filter(
                (s) => s.type === typeFilter
            );
        }

        if (query.trim()) {
            const q = query.trim().toLowerCase();

            list = list.filter(
                (s) =>
                    s.title
                        .toLowerCase()
                        .includes(q) ||
                    s.description
                        ?.toLowerCase()
                        .includes(q) ||
                    s.reviewerComment
                        ?.toLowerCase()
                        .includes(q)
            );
        }

        list.sort((a, b) => {
            let comparison = 0;

            switch (sortKey) {
                case "date":
                    comparison =
                        new Date(a.dueDate).getTime() -
                        new Date(b.dueDate).getTime();
                    break;

                case "submittedDate":
                    comparison =
                        new Date(
                            a.submittedDate
                        ).getTime() -
                        new Date(
                            b.submittedDate
                        ).getTime();
                    break;

                case "title":
                    comparison =
                        a.title.localeCompare(b.title);
                    break;

                case "status":
                    comparison =
                        a.status.localeCompare(
                            b.status
                        );
                    break;
            }

            return sortAsc
                ? comparison
                : -comparison;
        });

        return list;
    }, [
        submissions,
        activeFilter,
        query,
        typeFilter,
        sortKey,
        sortAsc,
    ]);

    const showToast = (
        message: string,
        type: ToastType = "info"
    ) => {
        const id = Date.now().toString();

        setToasts((prev) => [
            ...prev,
            {
                id,
                message,
                type,
            },
        ]);

        setTimeout(() => {
            setToasts((prev) =>
                prev.filter((toast) => toast.id !== id)
            );
        }, 3000);
    };

    const toggleFilter = (filter: string) => {
        setActiveFilter((current) =>
            current === filter ? "all" : filter
        );
    };

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortAsc((current) => !current);
            return;
        }

        setSortKey(key);
        setSortAsc(true);
    };

    const getSortIcon = (key: SortKey) => {
        if (sortKey !== key) return "↕";

        return sortAsc ? "↑" : "↓";
    };

    const resetForm = () => {
        setNewTitle("");
        setNewDescription("");
        setNewType("Design");
        setNewDueDate("");
        setEditItem(null);
    };

    const closeModals = () => {
        setShowNewModal(false);
        setDetailItem(null);
        setShowWithdrawConfirm(null);
        resetForm();
    };

    const openCreateModal = () => {
        resetForm();
        setShowNewModal(true);
    };

    const openEditModal = (
        submission: Submission
    ) => {
        setEditItem(submission);
        setNewTitle(submission.title);
        setNewDescription(
            submission.description || ""
        );
        setNewType(submission.type);
        setNewDueDate(submission.dueDate);

        setDetailItem(null);
        setShowNewModal(true);
    };

    const handleCreateOrUpdate = () => {
        if (
            !newTitle.trim() ||
            !newDueDate
        ) {
            return;
        }

        if (editItem) {
            setSubmissions((prev) =>
                prev.map((submission) =>
                    submission.id === editItem.id
                        ? {
                              ...submission,
                              title: newTitle.trim(),
                              description:
                                  newDescription.trim(),
                              type: newType,
                              dueDate: newDueDate,
                              status:
                                  editItem.status ===
                                  "Mudanças Solicitadas"
                                      ? "Em Revisão"
                                      : editItem.status,
                              reviewerComment:
                                  editItem.status ===
                                  "Mudanças Solicitadas"
                                      ? undefined
                                      : editItem.reviewerComment,
                          }
                        : submission
                )
            );

            showToast(
                editItem.status ===
                    "Mudanças Solicitadas"
                    ? "Submissão atualizada e reenviada para revisão."
                    : "Submissão atualizada.",
                "success"
            );
        } else {
            const nextId =
                Math.max(
                    0,
                    ...submissions.map(
                        (submission) => submission.id
                    )
                ) + 1;

            const today =
                getToday()
                    .toISOString()
                    .slice(0, 10);

            const newSubmission: Submission = {
                id: nextId,
                title: newTitle.trim(),
                description:
                    newDescription.trim(),
                type: newType,
                submittedDate: today,
                dueDate: newDueDate,
                status: "Em Revisão",
            };

            setSubmissions((prev) => [
                newSubmission,
                ...prev,
            ]);

            showToast(
                "Submissão enviada para revisão.",
                "success"
            );
        }

        closeModals();
    };

    const handleWithdraw = (id: number) => {
        const submission = submissions.find(
            (item) => item.id === id
        );

        if (!submission) return;

        setSubmissions((prev) =>
            prev.filter((item) => item.id !== id)
        );

        setShowWithdrawConfirm(null);
        setDetailItem(null);

        showToast(
            `Submissão "${submission.title}" retirada.`,
            "info"
        );
    };

    const canEdit = (submission: Submission) =>
        submission.status ===
            "Mudanças Solicitadas" ||
        submission.status === "Em Revisão";

    const canWithdraw = (submission: Submission) =>
        submission.status === "Em Revisão";

    useEffect(() => {
        const handleEscape = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                closeModals();
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () =>
            window.removeEventListener(
                "keydown",
                handleEscape
            );
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div
            className="min-h-screen p-4 sm:p-6 space-y-6 text-gray-700"
            role="main"
        >
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        As Minhas Submissões
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Envie documentos para revisão e
                        acompanhe o estado das suas
                        submissões.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-800 text-white px-4 py-2.5 rounded-lg hover:bg-slate-900 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                >
                    <Plus
                        size={16}
                        strokeWidth={2.5}
                    />
                    Nova Submissão
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard
                    label="Em revisão"
                    value={counts.pending}
                    active={
                        activeFilter === "pending"
                    }
                    onClick={() =>
                        toggleFilter("pending")
                    }
                />

                <SummaryCard
                    label="Aprovados"
                    value={counts.approved}
                    valueClassName="text-green-600"
                    active={
                        activeFilter === "approved"
                    }
                    onClick={() =>
                        toggleFilter("approved")
                    }
                />

                <SummaryCard
                    label="Alterações"
                    value={counts.changesRequested}
                    valueClassName="text-orange-500"
                    active={
                        activeFilter ===
                        "changesRequested"
                    }
                    onClick={() =>
                        toggleFilter(
                            "changesRequested"
                        )
                    }
                />

                <SummaryCard
                    label="Rejeitados"
                    value={counts.rejected}
                    valueClassName="text-red-600"
                    active={
                        activeFilter === "rejected"
                    }
                    onClick={() =>
                        toggleFilter("rejected")
                    }
                />
            </div>

            {/* Main panel */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="font-semibold text-gray-900">
                            Submissões (
                            {
                                filteredSubmissions.length
                            }
                            )
                        </h2>

                        {activeFilter !==
                            "all" && (
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveFilter(
                                        "all"
                                    )
                                }
                                className="text-xs font-medium text-slate-600 hover:text-slate-800 hover:underline"
                            >
                                Limpar filtro
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={query}
                                onChange={(event) =>
                                    setQuery(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Procurar..."
                                className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 w-full sm:w-48 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                            />
                        </div>

                        {/* Type */}
                        <select
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(
                                    event.target
                                        .value as
                                        | SubmissionType
                                        | "all"
                                )
                            }
                            className="border border-gray-200 rounded-lg py-2 px-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                        >
                            <option value="all">
                                Todos os tipos
                            </option>
                            <option value="Design">
                                Design
                            </option>
                            <option value="Técnico">
                                Técnico
                            </option>
                            <option value="Aprovação Cliente">
                                Aprovação Cliente
                            </option>
                        </select>

                        {/* Sort */}
                        <div className="flex items-center gap-1">
                            <ArrowUpDown
                                size={13}
                                className="text-gray-400"
                            />

                            <select
                                value={sortKey}
                                onChange={(event) =>
                                    toggleSort(
                                        event.target
                                            .value as SortKey
                                    )
                                }
                                className="border border-gray-200 rounded-lg py-2 px-2 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                            >
                                <option value="date">
                                    Prazo{" "}
                                    {getSortIcon(
                                        "date"
                                    )}
                                </option>

                                <option value="submittedDate">
                                    Data de submissão{" "}
                                    {getSortIcon(
                                        "submittedDate"
                                    )}
                                </option>

                                <option value="title">
                                    Documento{" "}
                                    {getSortIcon(
                                        "title"
                                    )}
                                </option>

                                <option value="status">
                                    Estado{" "}
                                    {getSortIcon(
                                        "status"
                                    )}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Empty */}
                {filteredSubmissions.length ===
                0 ? (
                    <div className="p-12 flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                            <Inbox
                                className="text-gray-300"
                                size={24}
                                strokeWidth={1.5}
                            />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                {query
                                    ? `Nenhum resultado para "${query}".`
                                    : "Ainda não existem submissões."}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Envie o seu primeiro
                                documento para iniciar
                                uma revisão.
                            </p>
                        </div>

                        {!query && (
                            <button
                                type="button"
                                onClick={
                                    openCreateModal
                                }
                                className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm hover:bg-slate-900"
                            >
                                <Plus size={15} />
                                Nova Submissão
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-gray-500">
                                            Documento
                                        </th>

                                        <th className="text-left p-4 font-medium text-gray-500">
                                            Tipo
                                        </th>

                                        <th className="text-left p-4 font-medium text-gray-500">
                                            Submetido
                                        </th>

                                        <th className="text-left p-4 font-medium text-gray-500">
                                            Prazo
                                        </th>

                                        <th className="text-left p-4 font-medium text-gray-500">
                                            Estado
                                        </th>

                                        <th className="text-right p-4 font-medium text-gray-500">
                                            Acções
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {filteredSubmissions.map(
                                        (
                                            item
                                        ) => {
                                            const overdue =
                                                isOverdue(
                                                    item
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="p-4 max-w-xs">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDetailItem(
                                                                    item
                                                                )
                                                            }
                                                            className="text-left block max-w-xs"
                                                        >
                                                            <span className="font-medium text-gray-900 truncate block hover:underline underline-offset-2">
                                                                {
                                                                    item.title
                                                                }
                                                            </span>

                                                            {item.reviewerComment && (
                                                                <span className="mt-1 inline-flex items-center gap-1 text-xs text-orange-600">
                                                                    <MessageSquare
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                    Comentário
                                                                    do
                                                                    revisor
                                                                </span>
                                                            )}
                                                        </button>
                                                    </td>

                                                    <td className="p-4">
                                                        <TypeBadge
                                                            type={
                                                                item.type
                                                            }
                                                        />
                                                    </td>

                                                    <td className="p-4 text-gray-600 whitespace-nowrap text-xs">
                                                        {formatDate(
                                                            item.submittedDate
                                                        )}
                                                    </td>

                                                    <td className="p-4 text-gray-600 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            {formatDate(
                                                                item.dueDate
                                                            )}

                                                            {overdue && (
                                                                <span className="inline-flex items-center gap-0.5 text-red-600 text-xs font-medium">
                                                                    <AlertTriangle
                                                                        size={
                                                                            12
                                                                        }
                                                                    />
                                                                    {daysOverdue(
                                                                        item
                                                                    )}
                                                                    d
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="p-4">
                                                        <StatusBadge
                                                            status={
                                                                item.status
                                                            }
                                                        />
                                                    </td>

                                                    <td className="p-4">
                                                        <div className="flex justify-end items-center gap-1">
                                                            <ActionButton
                                                                onClick={() =>
                                                                    setDetailItem(
                                                                        item
                                                                    )
                                                                }
                                                                icon={
                                                                    Eye
                                                                }
                                                                label="Ver"
                                                                tone="blue"
                                                            />

                                                            {item.status ===
                                                                "Mudanças Solicitadas" && (
                                                                <ActionButton
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            item
                                                                        )
                                                                    }
                                                                    icon={
                                                                        Send
                                                                    }
                                                                    label="Resubmeter"
                                                                    tone="orange"
                                                                />
                                                            )}

                                                            {item.status ===
                                                                    "Em Revisão" && (
                                                                <ActionButton
                                                                    onClick={() =>
                                                                        setShowWithdrawConfirm(
                                                                            item.id
                                                                        )
                                                                    }
                                                                    icon={
                                                                        RotateCcw
                                                                    }
                                                                    label="Retirar"
                                                                    tone="gray"
                                                                />
                                                            )}

                                                            {item.status ===
                                                                "Mudanças Solicitadas" && (
                                                                <ActionButton
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            item
                                                                        )
                                                                    }
                                                                    icon={
                                                                        Edit
                                                                    }
                                                                    label="Editar"
                                                                    tone="gray"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden divide-y divide-gray-100">
                            {filteredSubmissions.map(
                                (item) => {
                                    const overdue =
                                        isOverdue(
                                            item
                                        );

                                    return (
                                        <div
                                            key={
                                                item.id
                                            }
                                            className="p-4 space-y-3"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDetailItem(
                                                        item
                                                    )
                                                }
                                                className="flex items-start gap-2 text-left w-full"
                                            >
                                                <FileText
                                                    className="text-gray-400 mt-0.5 shrink-0"
                                                    size={
                                                        17
                                                    }
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {
                                                            item.title
                                                        }
                                                    </p>

                                                    <div className="mt-1.5">
                                                        <TypeBadge
                                                            type={
                                                                item.type
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </button>

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    Submetido{" "}
                                                    {formatDate(
                                                        item.submittedDate
                                                    )}
                                                </span>

                                                <span className="inline-flex items-center gap-1">
                                                    {formatDate(
                                                        item.dueDate
                                                    )}

                                                    {overdue && (
                                                        <span className="text-red-600 font-medium">
                                                            {daysOverdue(
                                                                item
                                                            )}
                                                            d
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            {item.reviewerComment && (
                                                <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-orange-700">
                                                        <MessageSquare
                                                            size={
                                                                13
                                                            }
                                                        />
                                                        Comentário
                                                        do
                                                        revisor
                                                    </div>

                                                    <p className="mt-1 text-xs text-orange-800">
                                                        {
                                                            item.reviewerComment
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between gap-2">
                                                <StatusBadge
                                                    status={
                                                        item.status
                                                    }
                                                />

                                                <div className="flex gap-1">
                                                    <ActionButton
                                                        onClick={() =>
                                                            setDetailItem(
                                                                item
                                                            )
                                                        }
                                                        icon={
                                                            Eye
                                                        }
                                                        label="Ver"
                                                        tone="blue"
                                                    />

                                                    {item.status ===
                                                        "Mudanças Solicitadas" && (
                                                        <ActionButton
                                                            onClick={() =>
                                                                openEditModal(
                                                                    item
                                                                )
                                                            }
                                                            icon={
                                                                Edit
                                                            }
                                                            label="Editar"
                                                            tone="gray"
                                                        />
                                                    )}

                                                    {item.status ===
                                                        "Em Revisão" && (
                                                        <ActionButton
                                                            onClick={() =>
                                                                setShowWithdrawConfirm(
                                                                    item.id
                                                                )
                                                            }
                                                            icon={
                                                                RotateCcw
                                                            }
                                                            label="Retirar"
                                                            tone="gray"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Detail modal */}
            {detailItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={() =>
                        setDetailItem(null)
                    }
                    role="dialog"
                    aria-labelledby="detail-modal-title"
                    aria-modal="true"
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3
                                    id="detail-modal-title"
                                    className="text-lg font-semibold text-gray-900"
                                >
                                    {
                                        detailItem.title
                                    }
                                </h3>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    <TypeBadge
                                        type={
                                            detailItem.type
                                        }
                                    />

                                    <StatusBadge
                                        status={
                                            detailItem.status
                                        }
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setDetailItem(
                                        null
                                    )
                                }
                                aria-label="Fechar"
                                className="text-gray-400 hover:text-gray-600 shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {isOverdue(
                            detailItem
                        ) && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                                <AlertTriangle
                                    size={16}
                                />
                                <span>
                                    Esta submissão está{" "}
                                    <strong>
                                        {daysOverdue(
                                            detailItem
                                        )}{" "}
                                        dia(s)
                                    </strong>{" "}
                                    fora do prazo.
                                </span>
                            </div>
                        )}

                        {detailItem.description && (
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Descrição
                                </p>

                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {
                                        detailItem.description
                                    }
                                </p>
                            </div>
                        )}

                        {detailItem.reviewerComment && (
                            <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                                    <MessageSquare
                                        size={16}
                                    />
                                    Comentário do
                                    revisor
                                </div>

                                <p className="mt-2 text-sm text-orange-900 leading-relaxed">
                                    {
                                        detailItem.reviewerComment
                                    }
                                </p>

                                {detailItem.reviewedDate && (
                                    <p className="mt-2 text-xs text-orange-600">
                                        Revisto em{" "}
                                        {formatDate(
                                            detailItem.reviewedDate
                                        )}
                                    </p>
                                )}
                            </div>
                        )}

                        <dl className="text-sm border-t border-gray-100 pt-4 space-y-3">
                            <div className="flex justify-between gap-4">
                                <dt className="text-gray-400">
                                    Data de submissão
                                </dt>

                                <dd className="font-medium text-gray-900">
                                    {formatDate(
                                        detailItem.submittedDate
                                    )}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-gray-400">
                                    Prazo
                                </dt>

                                <dd className="font-medium text-gray-900">
                                    {formatDate(
                                        detailItem.dueDate
                                    )}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-gray-400">
                                    Estado
                                </dt>

                                <dd>
                                    <StatusBadge
                                        status={
                                            detailItem.status
                                        }
                                    />
                                </dd>
                            </div>
                        </dl>

                        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                            {canEdit(
                                detailItem
                            ) && (
                                <ActionButton
                                    onClick={() =>
                                        openEditModal(
                                            detailItem
                                        )
                                    }
                                    icon={Edit}
                                    label={
                                        detailItem.status ===
                                        "Mudanças Solicitadas"
                                            ? "Editar e Resubmeter"
                                            : "Editar"
                                    }
                                    tone={
                                        detailItem.status ===
                                        "Mudanças Solicitadas"
                                            ? "orange"
                                            : "gray"
                                    }
                                />
                            )}

                            {canWithdraw(
                                detailItem
                            ) && (
                                <ActionButton
                                    onClick={() =>
                                        setShowWithdrawConfirm(
                                            detailItem.id
                                        )
                                    }
                                    icon={
                                        RotateCcw
                                    }
                                    label="Retirar submissão"
                                    tone="gray"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit modal */}
            {showNewModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={closeModals}
                    role="dialog"
                    aria-labelledby="submission-modal-title"
                    aria-modal="true"
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-5"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3
                                    id="submission-modal-title"
                                    className="text-lg font-semibold text-gray-900"
                                >
                                    {editItem
                                        ? "Editar Submissão"
                                        : "Nova Submissão"}
                                </h3>

                                <p className="mt-1 text-xs text-gray-500">
                                    {editItem?.status ===
                                    "Mudanças Solicitadas"
                                        ? "Atualize o documento de acordo com o comentário do revisor e reenvie para revisão."
                                        : "Preencha os dados da submissão para enviar o documento para revisão."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModals
                                }
                                aria-label="Fechar"
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Título do documento
                                </label>

                                <input
                                    autoFocus
                                    value={newTitle}
                                    onChange={(event) =>
                                        setNewTitle(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="ex: Planta Arquitetónica - Revisão 04"
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Tipo
                                </label>

                                <select
                                    value={newType}
                                    onChange={(event) =>
                                        setNewType(
                                            event
                                                .target
                                                .value as SubmissionType
                                        )
                                    }
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                >
                                    <option value="Design">
                                        Design
                                    </option>

                                    <option value="Técnico">
                                        Técnico
                                    </option>

                                    <option value="Aprovação Cliente">
                                        Aprovação Cliente
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Descrição
                                </label>

                                <textarea
                                    value={
                                        newDescription
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewDescription(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Descreva brevemente o que está a ser submetido..."
                                    rows={4}
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Prazo para revisão
                                </label>

                                <input
                                    type="date"
                                    value={
                                        newDueDate
                                    }
                                    onChange={(event) =>
                                        setNewDueDate(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                            <button
                                type="button"
                                onClick={
                                    closeModals
                                }
                                className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleCreateOrUpdate
                                }
                                disabled={
                                    !newTitle.trim() ||
                                    !newDueDate
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {editItem?.status ===
                                "Mudanças Solicitadas" ? (
                                    <>
                                        <Send
                                            size={15}
                                        />
                                        Resubmeter
                                    </>
                                ) : editItem ? (
                                    <>
                                        <CheckCircle2
                                            size={
                                                15
                                            }
                                        />
                                        Guardar
                                    </>
                                ) : (
                                    <>
                                        <Send
                                            size={15}
                                        />
                                        Enviar para
                                        revisão
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw confirmation */}
            {showWithdrawConfirm !==
                null && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
                    onClick={() =>
                        setShowWithdrawConfirm(
                            null
                        )
                    }
                    role="dialog"
                    aria-labelledby="withdraw-modal-title"
                    aria-modal="true"
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-center h-11 w-11 rounded-full bg-gray-100 mb-4">
                            <RotateCcw
                                size={20}
                                className="text-gray-600"
                            />
                        </div>

                        <h3
                            id="withdraw-modal-title"
                            className="text-lg font-semibold text-gray-900"
                        >
                            Retirar submissão?
                        </h3>

                        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                            A submissão será removida
                            da sua lista e deixará de
                            estar disponível para
                            revisão.
                        </p>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowWithdrawConfirm(
                                        null
                                    )
                                }
                                className="px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleWithdraw(
                                        showWithdrawConfirm
                                    )
                                }
                                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900"
                            >
                                Retirar submissão
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            <div className="fixed bottom-6 right-4 z-[70] flex flex-col gap-2 max-w-sm">
                {toasts.map((toast) => (
                    <ToastNotification
                        key={toast.id}
                        toast={toast}
                        onClose={() =>
                            setToasts((prev) =>
                                prev.filter(
                                    (item) =>
                                        item.id !==
                                        toast.id
                                )
                            )
                        }
                    />
                ))}
            </div>
        </div>
    );
}
