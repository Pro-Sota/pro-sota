"use client";

import {
    CheckCircle2,
    Check,
    ChevronDown,
    Clock3,
    Loader2,
    X,
    XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import type {
    AttendanceActionLoading,
    AttendanceRecord,
    Profile,
} from "../types";

type Props = {
    profile: Profile;
    record: AttendanceRecord | null;
    loading: AttendanceActionLoading;
    isFuture?: boolean;

    onCheckIn: (id: string, time: string) => Promise<void>;
    onCheckOut: (id: string) => Promise<void>;
    onMarkLate: (id: string) => Promise<void>;
    onMarkAbsent: (id: string, reason?: string) => Promise<void>;
};

export default function AttendanceActions({
    profile,
    record,
    loading,
    isFuture = false,
    onCheckIn,
    onCheckOut,
    onMarkLate,
    onMarkAbsent,
}: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState("");
    const [showAbsentModal, setShowAbsentModal] = useState(false);
    const [absentReason, setAbsentReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const id = profile.profile_id;
    const label = `${profile.first_name} ${profile.last_name}`.trim();

    const busy = loading?.profileId === id || submitting;
    const action = loading?.profileId === id ? loading.action : null;

    const button =
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

    useEffect(() => {
        if (!menuOpen && !showAbsentModal) return;

        function handleClickOutside(event: MouseEvent) {
            if (
                menuOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape" && !submitting) {
                setMenuOpen(false);
                setShowAbsentModal(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [menuOpen, showAbsentModal, submitting]);

    async function handleCheckIn(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedTime || busy) return;

        setSubmitting(true);

        try {
            await onCheckIn(id, selectedTime);
            setShowTimePicker(false);
            setSelectedTime("");
        } finally {
            setSubmitting(false);
        }
    }

    function openAbsentModal() {
        setMenuOpen(false);
        setAbsentReason("");
        setShowAbsentModal(true);
    }

    async function handleConfirmAbsent(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (busy) return;

        setSubmitting(true);

        try {
            await onMarkAbsent(id, absentReason.trim() || undefined);
            setShowAbsentModal(false);
            setAbsentReason("");
        } finally {
            setSubmitting(false);
        }
    }

    function closeAbsentModal() {
        if (submitting) return;

        setShowAbsentModal(false);
        setAbsentReason("");
    }

    if (isFuture) {
        return (
            <span className="text-xs text-slate-400">
                Indisponível
            </span>
        );
    }

    if (record?.status === "Ausente") {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Ausente registado
            </span>
        );
    }

    if (record?.check_in && record?.check_out) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Dia concluído
            </span>
        );
    }

    const handleLate = async () => {
        setMenuOpen(false);
        await onMarkLate(id);
    };

    if (!record?.check_in) {
        return (
            <>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setShowTimePicker((open) => !open)}
                        disabled={busy}
                        className={`${button} border border-[#BD9655] text-[#BD9655] hover:bg-[#BD9655] hover:text-white`}
                        aria-label={`Escolher hora de entrada de ${label}`}
                        aria-expanded={showTimePicker}
                    >
                        <Clock3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        {showTimePicker ? "Cancelar entrada" : "Escolher hora"}
                    </button>

                    {!record && (
                        <div ref={menuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((value) => !value)}
                                disabled={busy}
                                aria-label={`Mais ações para ${label}`}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
                            >
                                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            </button>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                                >
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={handleLate}
                                        disabled={busy}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                                    >
                                        <Clock3 className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                                        Marcar como atrasado
                                    </button>

                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={openAbsentModal}
                                        disabled={busy}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >
                                        <XCircle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                                        Marcar como ausente
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {showTimePicker && (
                        <form
                            className="flex w-full flex-wrap items-center justify-end gap-2"
                            onSubmit={handleCheckIn}
                        >
                            <label
                                htmlFor={`attendance-time-${id}`}
                                className="sr-only"
                            >
                                Hora de entrada de {label}
                            </label>

                            <input
                                id={`attendance-time-${id}`}
                                type="time"
                                required
                                autoFocus
                                value={selectedTime}
                                onChange={(event) => setSelectedTime(event.target.value)}
                                disabled={busy}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#002950] focus:border-[#BD9655] focus:outline-none"
                            />

                            <button
                                type="submit"
                                disabled={!selectedTime || busy}
                                className={`${button} bg-[#002950] text-white hover:bg-[#003b70]`}
                            >
                                {busy ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                        A registar...
                                    </>
                                ) : (
                                    "Confirmar"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowTimePicker(false);
                                    setSelectedTime("");
                                }}
                                disabled={busy}
                                className={`${button} border border-slate-200 text-slate-600 hover:bg-slate-50`}
                            >
                                Cancelar
                            </button>
                        </form>
                    )}
                </div>

                {showAbsentModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeAbsentModal();
                            }
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={`absence-title-${id}`}
                            aria-describedby={`absence-description-${id}`}
                            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
                        >
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                        <XCircle className="h-5 w-5" aria-hidden="true" />
                                    </div>

                                    <div>
                                        <h2
                                            id={`absence-title-${id}`}
                                            className="text-base font-semibold text-[#002950]"
                                        >
                                            Marcar como ausente
                                        </h2>
                                        <p
                                            id={`absence-description-${id}`}
                                            className="mt-1 text-sm text-slate-500"
                                        >
                                            Registar a ausência de {label}.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeAbsentModal}
                                    disabled={submitting}
                                    aria-label="Fechar"
                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>

                            <form onSubmit={handleConfirmAbsent}>
                                <label
                                    htmlFor={`absence-reason-${id}`}
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Motivo da ausência
                                    <span className="ml-1 font-normal text-slate-400">
                                        (opcional)
                                    </span>
                                </label>

                                <textarea
                                    id={`absence-reason-${id}`}
                                    value={absentReason}
                                    onChange={(event) => setAbsentReason(event.target.value)}
                                    disabled={submitting}
                                    rows={4}
                                    maxLength={1000}
                                    placeholder="Ex.: falta justificada, assunto pessoal ou ausência sem comunicação..."
                                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15 disabled:bg-slate-50"
                                />

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Não inclua informações pessoais sensíveis desnecessárias.
                                </p>

                                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeAbsentModal}
                                        disabled={submitting}
                                        className={`${button} border border-slate-200 text-slate-600 hover:bg-slate-50`}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`${button} bg-red-600 text-white hover:bg-red-700`}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                                A guardar...
                                            </>
                                        ) : (
                                            "Confirmar ausência"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </>
        );
    }

    if (!record.check_out) {
        return (
            <button
                type="button"
                onClick={() => onCheckOut(id)}
                disabled={busy}
                className={`${button} bg-[#BD9655] text-white hover:bg-[#a98245]`}
                aria-label={`Registar saída de ${label}`}
            >
                {action === "check-out" || submitting ? (
                    <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        A registar...
                    </>
                ) : (
                    "Registar saída"
                )}
            </button>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <Check className="h-4 w-4" aria-hidden="true" />
            Dia concluído
        </span>
    );
}
