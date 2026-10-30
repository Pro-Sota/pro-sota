"use client";

import {
    useCallback,
    useEffect,
    useState,
    useTransition,
} from "react";

import {
    MessageSquare,
    Pencil,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";

import {
    createLeadNoteAction,
    deleteLeadNoteAction,
    getLeadNotesAction,
    updateLeadNoteAction,
} from "@/actions/leads";

import type { LeadNote } from "@/app/management/leads/types";;

type Props = {
    leadId: string;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export default function LeadNotesTimeline({ leadId }: Props) {
    const [notes, setNotes] = useState<LeadNote[]>([]);
    const [content, setContent] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(true);

    const loadNotes = useCallback(async () => {
        setLoading(true);
        setError(null);

        const result = await getLeadNotesAction(leadId);

        if (result.success && result.data) {
            setNotes(result.data);
        } else {
            setError(result.error ?? "Não foi possível carregar as notas.");
        }

        setLoading(false);
    }, [leadId]);

    useEffect(() => {
        void loadNotes();
    }, [loadNotes]);

    function handleCreate() {
        if (!content.trim()) {
            setError("Escreva uma nota antes de guardar.");
            return;
        }

        startTransition(async () => {
            setError(null);

            const result = await createLeadNoteAction({
                lead_id: leadId,
                content,
            });

            if (!result.success || !result.data) {
                setError(result.error ?? "Não foi possível guardar a nota.");
                return;
            }

            setNotes((current) => [result.data!, ...current]);
            setContent("");
        });
    }

    function handleUpdate(noteId: string) {
        if (!editingContent.trim()) {
            setError("A nota não pode estar vazia.");
            return;
        }

        startTransition(async () => {
            setError(null);

            const result = await updateLeadNoteAction({
                note_id: noteId,
                content: editingContent,
            });

            if (!result.success || !result.data) {
                setError(result.error ?? "Não foi possível actualizar a nota.");
                return;
            }

            setNotes((current) =>
                current.map((note) =>
                    note.note_id === noteId ? result.data! : note,
                ),
            );

            setEditingId(null);
            setEditingContent("");
        });
    }

    function handleDelete(noteId: string) {
        const confirmed = window.confirm(
            "Tem a certeza de que pretende eliminar esta nota?",
        );

        if (!confirmed) return;

        startTransition(async () => {
            setError(null);

            const result = await deleteLeadNoteAction(noteId);

            if (!result.success) {
                setError(result.error ?? "Não foi possível eliminar a nota.");
                return;
            }

            setNotes((current) =>
                current.filter((note) => note.note_id !== noteId),
            );
        });
    }

    return (
        <section className="border-t border-neutral-200 pt-5">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                        <MessageSquare className="h-4 w-4 text-[#BD9655]" />
                        Notas e actividade
                    </h3>

                    <p className="mt-1 text-xs text-neutral-500">
                        Histórico de apontamentos deste lead.
                    </p>
                </div>

                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                    {notes.length}
                </span>
            </div>

            <div className="mb-5">
                <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Adicionar uma nota sobre este contacto..."
                    rows={3}
                    disabled={isPending}
                    className="w-full resize-none rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/10"
                />

                <div className="mt-2 flex justify-end">
                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={isPending || !content.trim()}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#002950] px-3.5 text-xs font-semibold text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar nota
                    </button>
                </div>
            </div>

            {error && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                </p>
            )}

            {loading ? (
                <p className="py-4 text-center text-xs text-neutral-400">
                    A carregar notas...
                </p>
            ) : notes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center">
                    <MessageSquare className="mx-auto mb-2 h-5 w-5 text-neutral-300" />
                    <p className="text-xs text-neutral-500">
                        Ainda não existem notas para este lead.
                    </p>
                </div>
            ) : (
                <div className="relative space-y-4 pl-4">
                    <div className="absolute bottom-2 left-[5px] top-2 w-px bg-neutral-200" />

                    {notes.map((note) => (
                        <article
                            key={note.note_id}
                            className="relative"
                        >
                            <span className="absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#BD9655] ring-1 ring-[#BD9655]/30" />

                            <div className="rounded-xl border border-neutral-200 bg-white p-3">
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <time className="text-[11px] text-neutral-400">
                                        {formatDate(note.created_at)}
                                        {note.updated_at !== note.created_at && (
                                            <span> · editada</span>
                                        )}
                                    </time>

                                    {editingId !== note.note_id && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                title="Editar nota"
                                                onClick={() => {
                                                    setEditingId(note.note_id);
                                                    setEditingContent(note.content);
                                                    setError(null);
                                                }}
                                                className="rounded-md p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-[#002950]"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                title="Eliminar nota"
                                                onClick={() => handleDelete(note.note_id)}
                                                disabled={isPending}
                                                className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingId === note.note_id ? (
                                    <div>
                                        <textarea
                                            value={editingContent}
                                            onChange={(event) =>
                                                setEditingContent(event.target.value)
                                            }
                                            rows={3}
                                            className="w-full resize-none rounded-lg border border-neutral-200 p-2.5 text-sm outline-none focus:border-[#BD9655]"
                                        />

                                        <div className="mt-2 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setEditingContent("");
                                                }}
                                                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                                Cancelar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleUpdate(note.note_id)}
                                                disabled={isPending}
                                                className="inline-flex items-center gap-1 rounded-lg bg-[#002950] px-3 py-2 text-xs font-semibold text-white hover:bg-[#003b70] disabled:opacity-50"
                                            >
                                                <Save className="h-3.5 w-3.5" />
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                                        {note.content}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}