"use client";

import {
    CheckCircle2,
    Check,
    ChevronDown,
    Clock3,
    Loader2,
    XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Adjust this import to the location of your existing useToast hook.

import type {
    AttendanceActionLoading,
    AttendanceRecord,
    Profile,
} from "../types";
import { useToast } from "@/app/components/toast/use_toast";

type Props = {
    profile: Profile;
    record: AttendanceRecord | null;
    loading: AttendanceActionLoading;
    isFuture?: boolean;

    onCheckIn: (id: string) => Promise<void>;
    onCheckOut: (id: string) => Promise<void>;
    onMarkLate: (id: string) => Promise<void>;
    onMarkAbsent: (id: string) => Promise<void>;
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
    const menuRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    const id = profile.profile_id;
    const label =
        `${profile.first_name} ${profile.last_name}`.trim();

    const busy = loading?.profileId === id;
    const action = busy ? loading?.action : null;

    const button =
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [menuOpen]);

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

    const handleAbsent = async () => {
        setMenuOpen(false);

        const confirmed = await toast.confirm({
            title: "Marcar como ausente",
            message: `Tem a certeza que pretende marcar ${label} como ausente?`,
            confirmText: "Marcar como ausente",
            cancelText: "Cancelar",
            variant: "destructive",
        });

        if (!confirmed) {
            return;
        }

        await onMarkAbsent(id);
    };

    const handleLate = async () => {
        setMenuOpen(false);
        await onMarkLate(id);
    };

    if (!record?.check_in) {
        return (
            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={() => onCheckIn(id)}
                    disabled={busy}
                    className={`${button} border border-[#BD9655] text-[#BD9655] hover:bg-[#BD9655] hover:text-white`}
                    aria-label={`Registar entrada de ${label}`}
                >
                    {action === "check-in" ? (
                        <>
                            <Loader2
                                className="mr-1.5 h-3.5 w-3.5 animate-spin"
                                aria-hidden="true"
                            />
                            A registar...
                        </>
                    ) : (
                        "Registar entrada"
                    )}
                </button>

                {!record && (
                    <div ref={menuRef} className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setMenuOpen((value) => !value)
                            }
                            disabled={busy}
                            aria-label={`Mais ações para ${label}`}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronDown
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </button>

                        {menuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleLate}
                                    disabled={busy}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
                                >
                                    <Clock3
                                        className="h-3.5 w-3.5 text-amber-600"
                                        aria-hidden="true"
                                    />
                                    Marcar como atrasado
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleAbsent}
                                    disabled={busy}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                >
                                    <XCircle
                                        className="h-3.5 w-3.5 text-red-500"
                                        aria-hidden="true"
                                    />
                                    Marcar como ausente
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
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
                {action === "check-out" ? (
                    <>
                        <Loader2
                            className="mr-1.5 h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                        />
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