"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Plus, Search } from "lucide-react";

import {
    KANBAN_COLUMNS,
    Submission,
    SubmissionStatus,
    SubmissionType,
} from "./types";

import CustomSelect from "@/app/components/custom_select";
import SubmissionCard from "./submission_card";
import SubmissionModal from "./submission_modal";

import {
    deleteSubmission,
    updateSubmissionStatus,
    type Submission as ServiceSubmission,
} from "@/services/submissions";

interface Props {
    allSubmissions: Submission[];
}

const normalizeSubmission = (
    submission: ServiceSubmission,
): Submission => ({
    id: submission.id,
    project_id: submission.project_id,
    title: submission.title,
    description: submission.description,
    type: submission.type,
    status: submission.status,
    submitted_by:
        submission.submitted_by_name ||
        submission.submitted_by_user_id ||
        "Utilizador",
    submitted_date: submission.submitted_date,
    due_date: submission.due_date,
    notes: submission.admin_notes,
    created_at: submission.created_at,
    updated_at: submission.updated_at,
});

export default function ApprovalsAndReviews({
    allSubmissions,
}: Props) {
    const params = useParams();
    const projectId = params.projectId as string;

    const [submissions, setSubmissions] =
        useState<Submission[]>(allSubmissions);

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] =
        useState<SubmissionType | "all">("all");

    const [showNewModal, setShowNewModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [toasts, setToasts] = useState<
        {
            id: string;
            message: string;
            type: "success" | "error";
        }[]
    >([]);

    /*
     * Keep the client-side list synchronized with the
     * server-provided submissions.
     */
    useEffect(() => {
        setSubmissions(allSubmissions);
    }, [allSubmissions]);

    const showToast = (
        message: string,
        type: "success" | "error" = "success",
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
                prev.filter((toast) => toast.id !== id),
            );
        }, 3000);
    };

    /*
     * Search and type filtering.
     */
    const filteredSubmissions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return submissions.filter((submission) => {
            const matchesSearch =
                !query ||
                submission.title.toLowerCase().includes(query) ||
                submission.description
                    ?.toLowerCase()
                    .includes(query);

            const matchesType =
                typeFilter === "all" ||
                submission.type === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [submissions, searchQuery, typeFilter]);

    /*
     * Group submissions by workflow status.
     */
    const columnData = useMemo(() => {
        return KANBAN_COLUMNS.map((column) => ({
            ...column,
            items: filteredSubmissions.filter(
                (submission) =>
                    submission.status === column.id,
            ),
        }));
    }, [filteredSubmissions]);

    /*
     * Status changes are kept here because the page can later
     * be shared with reviewers.
     */
    const handleStatusChange = async (
        submissionId: string,
        newStatus: SubmissionStatus,
    ) => {
        const updated = await updateSubmissionStatus(
            submissionId,
            newStatus,
        );

        if (!updated) {
            showToast(
                "Erro ao atualizar o estado da submissão.",
                "error",
            );
            return;
        }

        const normalized = normalizeSubmission(updated);

        setSubmissions((prev) =>
            prev.map((submission) =>
                submission.id === submissionId
                    ? normalized
                    : submission,
            ),
        );

        showToast("Estado da submissão atualizado.");
    };

    /*
     * Delete submission.
     *
     * This keeps the confirmation inside the page for now.
     * You can replace this with your reusable confirmation
     * dialog later without changing the rest of the flow.
     */
    const handleDelete = async (submissionId: string) => {
        const confirmed = window.confirm(
            "Tem a certeza de que deseja eliminar esta submissão?",
        );

        if (!confirmed) return;

        const success = await deleteSubmission(submissionId);

        if (!success) {
            showToast(
                "Erro ao eliminar a submissão.",
                "error",
            );
            return;
        }

        setSubmissions((prev) =>
            prev.filter(
                (submission) =>
                    submission.id !== submissionId,
            ),
        );

        showToast("Submissão eliminada.");
    };

    /*
     * Open create modal.
     */
    const handleCreate = () => {
        setEditingId(null);
        setShowNewModal(true);
    };

    /*
     * Open edit modal.
     */
    const handleEdit = (submission: Submission) => {
        setEditingId(submission.id);
        setShowNewModal(true);
    };

    /*
     * Called by SubmissionModal after a successful operation.
     *
     * The server page is the source of truth, so refresh it.
     */
    const handleSubmissionSaved = () => {
        setShowNewModal(false);
        setEditingId(null);

        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* =====================================================
                Header
            ===================================================== */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Submissões &amp; Aprovações
                                </h1>

                                <p className="mt-1 text-gray-600">
                                    Envie os seus ficheiros e acompanhe
                                    o estado das revisões do projeto.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCreate}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                            >
                                <Plus size={18} />
                                Nova Submissão
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                Content
            ===================================================== */}
            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Filters */}
                <div className="mb-8 flex flex-col gap-3 sm:flex-row">
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
                                event.target.value as
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
                </div>

                {/* =================================================
                    Empty state
                ================================================= */}
                {filteredSubmissions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <FileText
                            className="mx-auto mb-4 text-gray-300"
                            size={48}
                        />

                        <p className="text-lg text-gray-600">
                            {submissions.length === 0
                                ? "Ainda não existem submissões."
                                : "Nenhuma submissão encontrada."}
                        </p>

                        {submissions.length === 0 && (
                            <>
                                <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
                                    Envie um ficheiro para iniciar
                                    o processo de revisão deste
                                    projeto.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleCreate}
                                    className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                                >
                                    <Plus size={16} />
                                    Criar primeira submissão
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    /* =================================================
                       Kanban
                    ================================================= */
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {columnData.map((column) => (
                            <div key={column.id}>
                                {/* Column header */}
                                <div
                                    className="mb-4 flex items-center gap-2 border-b-2 pb-3"
                                    style={{
                                        borderColor:
                                            "rgb(209 213 219)",
                                    }}
                                >
                                    <column.icon
                                        size={18}
                                        className={
                                            column.textColor
                                        }
                                    />

                                    <h2 className="font-semibold text-gray-900">
                                        {column.title}
                                    </h2>

                                    <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                                        {column.items.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="space-y-3">
                                    {column.items.length === 0 ? (
                                        <div className="py-8 text-center text-gray-400">
                                            <p className="text-xs">
                                                Nenhuma submissão
                                            </p>
                                        </div>
                                    ) : (
                                        column.items.map(
                                            (submission) => (
                                                <SubmissionCard
                                                    key={
                                                        submission.id
                                                    }
                                                    submission={
                                                        submission
                                                    }
                                                    onStatusChange={(
                                                        status,
                                                    ) =>
                                                        handleStatusChange(
                                                            submission.id,
                                                            status,
                                                        )
                                                    }
                                                    onEdit={() =>
                                                        handleEdit(
                                                            submission,
                                                        )
                                                    }
                                                    onDelete={() =>
                                                        handleDelete(
                                                            submission.id,
                                                        )
                                                    }
                                                />
                                            ),
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* =====================================================
                Submission modal
            ===================================================== */}
            {showNewModal && (
                <SubmissionModal
                    projectId={projectId}
                    editingId={editingId || ""}
                    onClose={() => {
                        setShowNewModal(false);
                        setEditingId(null);
                    }}
                />
            )}

            {/* =====================================================
                Toasts
            ===================================================== */}
            <div className="fixed bottom-6 right-6 z-40 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
                            toast.type === "success"
                                ? "bg-emerald-600"
                                : "bg-red-600"
                        }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </div>
    );
}