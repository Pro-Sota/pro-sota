"use client";

import {
    useCallback,
    useEffect,
    useState,
    useTransition,
} from "react";

import {
    Bell,
    CalendarClock,
    Check,
    Clock3,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import {
    createLeadReminderAction,
    deleteLeadReminderAction,
    getLeadRemindersAction,
    updateLeadReminderAction,
} from "@/actions/leads";

import type {
    LeadReminder,
    LeadReminderStatus,
} from "@/app/management/leads/types";;

type Props = {
    leadId: string;
    teamMembers?: {
        profile_id: string;
        name: string;
    }[];
};

type ReminderForm = {
    title: string;
    description: string;
    due_at: string;
    assigned_to: string;
};

const EMPTY_FORM: ReminderForm = {
    title: "",
    description: "",
    due_at: "",
    assigned_to: "",
};

function toLocalDateTime(value: string) {
    const date = new Date(value);

    const local = new Date(
        date.getTime() - date.getTimezoneOffset() * 60_000,
    );

    return local.toISOString().slice(0, 16);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function getReminderState(
    reminder: LeadReminder,
): {
    label: string;
    className: string;
} {
    if (reminder.status === "completed") {
        return {
            label: "Concluído",
            className: "bg-emerald-50 text-emerald-700",
        };
    }

    if (reminder.status === "cancelled") {
        return {
            label: "Cancelado",
            className: "bg-neutral-100 text-neutral-500",
        };
    }

    if (new Date(reminder.due_at).getTime() < Date.now()) {
        return {
            label: "Atrasado",
            className: "bg-red-50 text-red-700",
        };
    }

    return {
        label: "Pendente",
        className: "bg-amber-50 text-amber-700",
    };
}

export default function LeadReminders({
    leadId,
    teamMembers = [],
}: Props) {
    const [reminders, setReminders] = useState<LeadReminder[]>([]);
    const [form, setForm] = useState<ReminderForm>(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const loadReminders = useCallback(async () => {
        setLoading(true);
        setError(null);

        const result = await getLeadRemindersAction(leadId);

        if (result.success && result.data) {
            setReminders(result.data);
        } else {
            setError(
                result.error ?? "Não foi possível carregar os lembretes.",
            );
        }

        setLoading(false);
    }, [leadId]);

    useEffect(() => {
        void loadReminders();
    }, [loadReminders]);

    function openCreateForm() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setError(null);
        setFormOpen(true);
    }

    function openEditForm(reminder: LeadReminder) {
        setEditingId(reminder.reminder_id);

        setForm({
            title: reminder.title,
            description: reminder.description ?? "",
            due_at: toLocalDateTime(reminder.due_at),
            assigned_to: reminder.assigned_to ?? "",
        });

        setError(null);
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setError(null);
    }

    function handleSave() {
        if (!form.title.trim()) {
            setError("Indique o título do lembrete.");
            return;
        }

        if (!form.due_at) {
            setError("Seleccione a data e a hora do lembrete.");
            return;
        }

        const timestamp = new Date(form.due_at).getTime();

        if (!Number.isFinite(timestamp)) {
            setError("A data do lembrete não é válida.");
            return;
        }

        const dueAt = new Date(timestamp).toISOString();

        startTransition(async () => {
            setError(null);

            const result = editingId
                ? await updateLeadReminderAction({
                    reminder_id: editingId,
                    title: form.title,
                    description: form.description,
                    due_at: dueAt,
                    assigned_to: form.assigned_to || null,
                })
                : await createLeadReminderAction({
                    lead_id: leadId,
                    title: form.title,
                    description: form.description,
                    due_at: dueAt,
                    assigned_to: form.assigned_to || null,
                });

            if (!result.success || !result.data) {
                setError(
                    result.error ?? "Não foi possível guardar o lembrete.",
                );
                return;
            }

            if (editingId) {
                setReminders((current) =>
                    current.map((item) =>
                        item.reminder_id === editingId
                            ? result.data!
                            : item,
                    ),
                );
            } else {
                setReminders((current) =>
                    [...current, result.data!].sort(
                        (a, b) =>
                            new Date(a.due_at).getTime() -
                            new Date(b.due_at).getTime(),
                    ),
                );
            }

            closeForm();
        });
    }

    function changeStatus(
        reminderId: string,
        status: LeadReminderStatus,
    ) {
        startTransition(async () => {
            const result = await updateLeadReminderAction({
                reminder_id: reminderId,
                status,
            });

            if (!result.success || !result.data) {
                setError(
                    result.error ?? "Não foi possível actualizar o lembrete.",
                );
                return;
            }

            setReminders((current) =>
                current.map((item) =>
                    item.reminder_id === reminderId
                        ? result.data!
                        : item,
                ),
            );
        });
    }

    function handleDelete(reminderId: string) {
        const confirmed = window.confirm(
            "Tem a certeza de que pretende eliminar este lembrete?",
        );

        if (!confirmed) return;

        startTransition(async () => {
            const result = await deleteLeadReminderAction(reminderId);

            if (!result.success) {
                setError(
                    result.error ?? "Não foi possível eliminar o lembrete.",
                );
                return;
            }

            setReminders((current) =>
                current.filter(
                    (item) => item.reminder_id !== reminderId,
                ),
            );
        });
    }

    const pendingCount = reminders.filter(
        (item) => item.status === "pending",
    ).length;

    return (
        <section className="border-t border-neutral-200 pt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                        <Bell className="h-4 w-4 text-[#BD9655]" />
                        Lembretes
                    </h3>

                    <p className="mt-1 text-xs text-neutral-500">
                        Acompanhe os próximos contactos e seguimentos.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        {pendingCount} pendentes
                    </span>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#002950] text-white transition hover:bg-[#003b70]"
                        title="Novo lembrete"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                </div>
            )}

            {formOpen && (
                <div className="mb-4 rounded-xl border border-[#BD9655]/40 bg-[#BD9655]/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-neutral-900">
                            {editingId ? "Editar lembrete" : "Novo lembrete"}
                        </h4>

                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-md p-1 text-neutral-400 hover:bg-white hover:text-neutral-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                Título
                            </label>

                            <input
                                value={form.title}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        title: event.target.value,
                                    }))
                                }
                                placeholder="Ex.: Contactar cliente"
                                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#BD9655]"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                Descrição
                            </label>

                            <textarea
                                value={form.description}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                                rows={2}
                                placeholder="Detalhes adicionais..."
                                className="w-full resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-[#BD9655]"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                Data e hora
                            </label>

                            <input
                                type="datetime-local"
                                value={form.due_at}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        due_at: event.target.value,
                                    }))
                                }
                                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#BD9655]"
                            />
                        </div>

                        {teamMembers.length > 0 && (
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                    Responsável
                                </label>

                                <select
                                    value={form.assigned_to}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            assigned_to: event.target.value,
                                        }))
                                    }
                                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#BD9655]"
                                >
                                    <option value="">Sem responsável atribuído</option>

                                    {teamMembers.map((member) => (
                                        <option
                                            key={member.profile_id}
                                            value={member.profile_id}
                                        >
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="h-9 rounded-lg px-3 text-xs font-medium text-neutral-500 hover:bg-white"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isPending}
                                className="h-9 rounded-lg bg-[#002950] px-4 text-xs font-semibold text-white hover:bg-[#003b70] disabled:opacity-50"
                            >
                                {isPending ? "A guardar..." : "Guardar lembrete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="py-4 text-center text-xs text-neutral-400">
                    A carregar lembretes...
                </p>
            ) : reminders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center">
                    <CalendarClock className="mx-auto mb-2 h-5 w-5 text-neutral-300" />
                    <p className="text-xs text-neutral-500">
                        Ainda não existem lembretes para este lead.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reminders.map((reminder) => {
                        const state = getReminderState(reminder);

                        return (
                            <article
                                key={reminder.reminder_id}
                                className="rounded-xl border border-neutral-200 bg-white p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${state.className}`}
                                            >
                                                {state.label}
                                            </span>
                                        </div>

                                        <h4 className="text-sm font-semibold text-neutral-800">
                                            {reminder.title}
                                        </h4>

                                        {reminder.description && (
                                            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-neutral-500">
                                                {reminder.description}
                                            </p>
                                        )}

                                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {formatDate(reminder.due_at)}
                                        </p>

                                        {reminder.assigned_to && (
                                            <p className="mt-1 text-[11px] text-neutral-400">
                                                Responsável atribuído
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1">
                                        {reminder.status === "pending" && (
                                            <button
                                                type="button"
                                                title="Marcar como concluído"
                                                onClick={() =>
                                                    changeStatus(
                                                        reminder.reminder_id,
                                                        "completed",
                                                    )
                                                }
                                                disabled={isPending}
                                                className="rounded-md p-1.5 text-emerald-600 transition hover:bg-emerald-50"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            title="Editar lembrete"
                                            onClick={() => openEditForm(reminder)}
                                            className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-[#002950]"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>

                                        <button
                                            type="button"
                                            title="Eliminar lembrete"
                                            onClick={() =>
                                                handleDelete(reminder.reminder_id)
                                            }
                                            disabled={isPending}
                                            className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {reminder.status === "completed" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeStatus(
                                                reminder.reminder_id,
                                                "pending",
                                            )
                                        }
                                        disabled={isPending}
                                        className="mt-3 text-[11px] font-medium text-neutral-400 hover:text-[#002950]"
                                    >
                                        Reabrir lembrete
                                    </button>
                                )}

                                {reminder.status === "pending" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeStatus(
                                                reminder.reminder_id,
                                                "cancelled",
                                            )
                                        }
                                        disabled={isPending}
                                        className="mt-3 text-[11px] font-medium text-neutral-400 hover:text-red-600"
                                    >
                                        Cancelar lembrete
                                    </button>
                                )}

                                {reminder.status === "cancelled" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changeStatus(
                                                reminder.reminder_id,
                                                "pending",
                                            )
                                        }
                                        disabled={isPending}
                                        className="mt-3 text-[11px] font-medium text-neutral-400 hover:text-[#002950]"
                                    >
                                        Reabrir lembrete
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}