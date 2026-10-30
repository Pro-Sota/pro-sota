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
    StickyNote,
    Plus,
    CalendarClock,
    Check,
    Clock3,
    Loader2,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useState,
    useTransition,
} from "react";


import {
    formatCurrency,
    formatDate,
    getInitials,
    STATUS_LABELS,
} from "../utils";

import {
    createLeadNoteAction,
    createLeadReminderAction,
    getLeadActivityAction,
    updateLeadReminderStatusAction,
} from "@/actions/leads";

import type {
    Lead,
    LeadStatus,
} from "@/app/management/leads/types";;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type LeadNote = {
    note_id: string;
    lead_id: string;
    content: string;
    created_by: string | null;
    created_at: string;
    author_name?: string | null;
};

type LeadReminder = {
    reminder_id: string;
    lead_id: string;
    event_id: string;
    title: string;
    description: string | null;
    due_at: string;
    status: "pending" | "completed" | "cancelled";
    created_at: string;
};

type LeadDetailDrawerProps = {
    lead: Lead;
    pending: boolean;
    onClose: () => void;
    onEdit: (lead: Lead) => void;
    onChangeStatus: (
        leadId: string,
        status: LeadStatus,
    ) => void;
};

type ActivityResult = {
    success: boolean;
    error?: string | null;
    notes?: LeadNote[];
    reminders?: LeadReminder[];
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatReminderDate(value: string) {
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getDefaultReminderDate() {
    const date = new Date();

    date.setHours(date.getHours() + 1);
    date.setMinutes(0, 0, 0);

    return new Date(
        date.getTime() -
            date.getTimezoneOffset() * 60_000,
    )
        .toISOString()
        .slice(0, 16);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function LeadDetailDrawer({
    lead,
    pending,
    onClose,
    onEdit,
    onChangeStatus,
}: LeadDetailDrawerProps) {
    const isClosed =
        lead.status === "won" ||
        lead.status === "lost";

    const [notes, setNotes] = useState<LeadNote[]>([]);
    const [reminders, setReminders] = useState<LeadReminder[]>([]);

    const [noteContent, setNoteContent] = useState("");

    const [reminderTitle, setReminderTitle] = useState("");
    const [reminderDescription, setReminderDescription] = useState("");
    const [reminderDate, setReminderDate] = useState(
        getDefaultReminderDate,
    );

    const [showNoteForm, setShowNoteForm] = useState(false);
    const [showReminderForm, setShowReminderForm] = useState(false);

    const [activityLoading, setActivityLoading] = useState(true);
    const [activityError, setActivityError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isSaving, startTransition] = useTransition();

    /* ---------------------------------------------------------------------- */
    /* Load notes and reminders                                               */
    /* ---------------------------------------------------------------------- */

    const loadActivity = useCallback(async () => {
        setActivityLoading(true);
        setActivityError(null);

        try {
            const result: ActivityResult =
                await getLeadActivityAction(lead.lead_id);

            if (!result.success) {
                throw new Error(
                    result.error || "Não foi possível carregar a actividade.",
                );
            }

            setNotes(result.notes ?? []);
            setReminders(result.reminders ?? []);
        } catch (error) {
            setActivityError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar a actividade.",
            );
        } finally {
            setActivityLoading(false);
        }
    }, [lead.lead_id]);

    useEffect(() => {
        void loadActivity();
    }, [loadActivity]);

    /* ---------------------------------------------------------------------- */
    /* Status                                                                 */
    /* ---------------------------------------------------------------------- */

    function changeStatus(status: LeadStatus) {
        onChangeStatus(lead.lead_id, status);
    }

    /* ---------------------------------------------------------------------- */
    /* Create note                                                            */
    /* ---------------------------------------------------------------------- */

    function handleCreateNote() {
        const content = noteContent.trim();

        if (!content) {
            return;
        }

        startTransition(async () => {
            setActivityError(null);
            setSuccessMessage(null);

            try {
                const result = await createLeadNoteAction({
                    lead_id: lead.lead_id,
                    content,
                });

                if (!result.success) {
                    throw new Error(
                        result.error || "Não foi possível guardar a nota.",
                    );
                }

                setNoteContent("");
                setShowNoteForm(false);
                setSuccessMessage("Nota adicionada com sucesso.");

                await loadActivity();
            } catch (error) {
                setActivityError(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível guardar a nota.",
                );
            }
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Create reminder                                                        */
    /* ---------------------------------------------------------------------- */

    function handleCreateReminder() {
        const title = reminderTitle.trim();

        if (!title || !reminderDate) {
            return;
        }

        const dueAt = new Date(reminderDate);

        if (!Number.isFinite(dueAt.getTime())) {
            setActivityError("A data do lembrete não é válida.");
            return;
        }

        startTransition(async () => {
            setActivityError(null);
            setSuccessMessage(null);

            try {
                const result = await createLeadReminderAction({
                    lead_id: lead.lead_id,
                    title,
                    description:
                        reminderDescription.trim() || null,
                    due_at: dueAt.toISOString(),
                });

                if (!result.success) {
                    throw new Error(
                        result.error ||
                            "Não foi possível criar o lembrete.",
                    );
                }

                setReminderTitle("");
                setReminderDescription("");
                setReminderDate(getDefaultReminderDate());
                setShowReminderForm(false);

                setSuccessMessage(
                    "Lembrete criado e adicionado ao calendário.",
                );

                await loadActivity();
            } catch (error) {
                setActivityError(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível criar o lembrete.",
                );
            }
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Complete reminder                                                      */
    /* ---------------------------------------------------------------------- */

    function handleCompleteReminder(reminderId: string) {
        startTransition(async () => {
            setActivityError(null);

            try {
                const result =
                    await updateLeadReminderStatusAction(
                        reminderId,
                        "completed",
                    );

                if (!result.success) {
                    throw new Error(
                        result.error ||
                            "Não foi possível actualizar o lembrete.",
                    );
                }

                setSuccessMessage("Lembrete concluído.");
                await loadActivity();
            } catch (error) {
                setActivityError(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível actualizar o lembrete.",
                );
            }
        });
    }

    const pendingReminders = reminders.filter(
        (reminder) => reminder.status === "pending",
    );

    const completedReminders = reminders.filter(
        (reminder) => reminder.status === "completed",
    );

    /* ---------------------------------------------------------------------- */
    /* Render                                                                 */
    /* ---------------------------------------------------------------------- */

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
                {/* Header */}
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
                            disabled={pending || isSaving}
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

                {/* Scrollable content */}
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    {/* Contact */}
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

                    {/* Status */}
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

                    {/* Opportunity */}
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

                    {/* Contact information */}
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

                    {/* Activity feedback */}
                    {activityError && (
                        <div
                            role="alert"
                            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {activityError}
                        </div>
                    )}

                    {successMessage && (
                        <div
                            role="status"
                            className="mt-5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
                        >
                            {successMessage}
                        </div>
                    )}

                    {/* Notes timeline */}
                    <section className="mt-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                                    <StickyNote className="h-4 w-4 text-[#BD9655]" />
                                    Notas
                                </h3>

                                <p className="mt-0.5 text-xs text-neutral-400">
                                    Histórico de acompanhamento
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowNoteForm((value) => !value)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-[#002950] transition hover:bg-neutral-50"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Adicionar
                            </button>
                        </div>

                        {showNoteForm && (
                            <div className="mt-3 rounded-xl border border-neutral-200 p-3">
                                <textarea
                                    value={noteContent}
                                    onChange={(event) =>
                                        setNoteContent(event.target.value)
                                    }
                                    rows={3}
                                    maxLength={5000}
                                    placeholder="Escreva uma nota sobre esta lead..."
                                    className="w-full resize-none rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:bg-white"
                                />

                                <div className="mt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNoteForm(false);
                                            setNoteContent("");
                                        }}
                                        className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!noteContent.trim() || isSaving}
                                        onClick={handleCreateNote}
                                        className="rounded-lg bg-[#002950] px-3 py-2 text-xs font-semibold text-white hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSaving ? "A guardar..." : "Guardar nota"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activityLoading ? (
                            <div className="flex items-center justify-center py-6 text-sm text-neutral-400">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                A carregar notas...
                            </div>
                        ) : notes.length === 0 ? (
                            <p className="mt-3 rounded-xl bg-neutral-50 px-3 py-4 text-center text-xs text-neutral-400">
                                Ainda não existem notas para esta lead.
                            </p>
                        ) : (
                            <div className="mt-4 space-y-0">
                                {notes.map((note, index) => (
                                    <div
                                        key={note.note_id}
                                        className="relative flex gap-3 pb-5 last:pb-0"
                                    >
                                        <div className="relative flex w-3 shrink-0 justify-center">
                                            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#BD9655]" />

                                            {index !== notes.length - 1 && (
                                                <span className="absolute top-4 bottom-0 w-px bg-neutral-200" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">
                                                {note.content}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-[11px] text-neutral-400">
                                                    {note.author_name || "Equipa"}
                                                </span>

                                                <span className="text-[11px] text-neutral-400">
                                                    {formatDate(note.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Reminders */}
                    <section className="mt-7 border-t border-neutral-100 pt-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                                    <CalendarClock className="h-4 w-4 text-[#BD9655]" />
                                    Lembretes
                                </h3>

                                <p className="mt-0.5 text-xs text-neutral-400">
                                    Compromissos no calendário
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowReminderForm((value) => !value)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-[#002950] transition hover:bg-neutral-50"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Novo
                            </button>
                        </div>

                        {showReminderForm && (
                            <div className="mt-3 space-y-3 rounded-xl border border-neutral-200 p-3">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                        Título
                                    </label>

                                    <input
                                        value={reminderTitle}
                                        onChange={(event) =>
                                            setReminderTitle(event.target.value)
                                        }
                                        maxLength={150}
                                        placeholder="Ex.: Contactar o cliente"
                                        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-[#BD9655]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                        Data e hora
                                    </label>

                                    <input
                                        type="datetime-local"
                                        value={reminderDate}
                                        onChange={(event) =>
                                            setReminderDate(event.target.value)
                                        }
                                        className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-[#BD9655]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                        Descrição (opcional)
                                    </label>

                                    <textarea
                                        value={reminderDescription}
                                        onChange={(event) =>
                                            setReminderDescription(event.target.value)
                                        }
                                        rows={2}
                                        maxLength={2000}
                                        placeholder="Detalhes do lembrete..."
                                        className="w-full resize-none rounded-lg border border-neutral-200 p-3 text-sm outline-none focus:border-[#BD9655]"
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowReminderForm(false)
                                        }
                                        className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            !reminderTitle.trim() ||
                                            !reminderDate ||
                                            isSaving
                                        }
                                        onClick={handleCreateReminder}
                                        className="rounded-lg bg-[#002950] px-3 py-2 text-xs font-semibold text-white hover:bg-[#002950]/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSaving
                                            ? "A guardar..."
                                            : "Criar lembrete"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activityLoading ? (
                            <div className="flex items-center justify-center py-6 text-sm text-neutral-400">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                A carregar lembretes...
                            </div>
                        ) : pendingReminders.length === 0 ? (
                            <p className="mt-3 rounded-xl bg-neutral-50 px-3 py-4 text-center text-xs text-neutral-400">
                                Não existem lembretes pendentes.
                            </p>
                        ) : (
                            <div className="mt-3 space-y-2">
                                {pendingReminders.map((reminder) => (
                                    <div
                                        key={reminder.reminder_id}
                                        className="rounded-xl border border-neutral-200 p-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-neutral-800">
                                                    {reminder.title}
                                                </p>

                                                {reminder.description && (
                                                    <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-neutral-500">
                                                        {reminder.description}
                                                    </p>
                                                )}

                                                <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    {formatReminderDate(reminder.due_at)}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                disabled={isSaving}
                                                onClick={() =>
                                                    handleCompleteReminder(
                                                        reminder.reminder_id,
                                                    )
                                                }
                                                aria-label="Concluir lembrete"
                                                title="Concluir lembrete"
                                                className="shrink-0 rounded-lg border border-neutral-200 p-2 text-neutral-500 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {completedReminders.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs font-medium text-neutral-400">
                                    Concluídos ({completedReminders.length})
                                </p>

                                <div className="space-y-2">
                                    {completedReminders.map((reminder) => (
                                        <div
                                            key={reminder.reminder_id}
                                            className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2.5"
                                        >
                                            <Check className="h-4 w-4 shrink-0 text-green-600" />

                                            <span className="min-w-0 flex-1 truncate text-xs text-neutral-500 line-through">
                                                {reminder.title}
                                            </span>

                                            <span className="shrink-0 text-[10px] text-neutral-400">
                                                {formatReminderDate(reminder.due_at)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Created date */}
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

                {/* Footer */}
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