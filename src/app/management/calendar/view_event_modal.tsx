"use client";

import {
    CalendarDays,
    Clock3,
    MapPin,
    Users,
    FileText,
    Pencil,
    Trash2,
    X,
    LoaderCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { EventType } from "./types";
import { useToast } from "@/app/components/toast/use_toast";


export type CalendarEventParticipant = {
    profile_id: string;
    first_name: string | null;
    last_name: string | null;
    email?: string | null;
};

export type CalendarEventDetails = {
    event_id: string;
    title: string;
    event_type: EventType;
    start_at: string;
    end_at: string;
    location: string | null;
    description: string | null;
    all_day: boolean;
    participants?: CalendarEventParticipant[];
};

type ViewEventModalProps = {
    open: boolean;
    event: CalendarEventDetails | null;
    onCloseAction: () => void;
    onEditAction?: (event: CalendarEventDetails) => void;
    onDeleteAction?: (event: CalendarEventDetails) => Promise<void> | void;
};

const EVENT_LABELS: Record<string, string> = {
    meeting: "Reunião",
    site_visit: "Visita à obra",
    deadline: "Prazo",
    task: "Tarefa",
    submission: "Entrega",
    project: "Projecto",
};

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Data não disponível";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        timeZone: "Africa/Luanda",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatTime(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--:--";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        timeZone: "Africa/Luanda",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
}

function getParticipantName(
    participant: CalendarEventParticipant,
) {
    const name = [
        participant.first_name,
        participant.last_name,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name || participant.email || "Utilizador";
}

export default function ViewEventModal({
    open,
    event,
    onCloseAction,
    onEditAction,
    onDeleteAction,
}: ViewEventModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(
        null,
    );
    const toast = useToast();

    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isDeleting) {
                onCloseAction();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, isDeleting, onCloseAction]);

    useEffect(() => {
        if (!open) {
            setIsDeleting(false);
            setDeleteError(null);
        }
    }, [open, event?.event_id]);

    if (!open || !event) {
        return null;
    }

    const selectedEvent: CalendarEventDetails = event;

    async function handleDelete() {
        if (!onDeleteAction || isDeleting) return;

        const confirmed = await toast.confirm({
            title: "Eliminar evento",
            message: "Tem a certeza de que pretende eliminar este evento?",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            variant: "destructive",
        });

        if (!confirmed) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            await onDeleteAction(selectedEvent);
            onCloseAction();
        } catch (error) {
            console.error("Erro ao eliminar evento:", error);

            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível eliminar o evento. Tente novamente.",
            );
        } finally {
            setIsDeleting(false);
        }
    }

    const participants = selectedEvent.participants ?? [];

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(mouseEvent) => {
                if (
                    mouseEvent.target === mouseEvent.currentTarget &&
                    !isDeleting
                ) {
                    onCloseAction();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="view-event-title"
                className="my-auto w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
            >
                <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-5 sm:px-6">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F3EBDD]">
                            <CalendarDays className="h-5 w-5 text-[#002950]" />
                        </div>

                        <div className="min-w-0">
                            <h2
                                id="view-event-title"
                                className="break-words text-lg font-semibold text-gray-900"
                            >
                                {event.title}
                            </h2>

                            <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                {EVENT_LABELS[event.event_type] ??
                                    event.event_type}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCloseAction}
                        disabled={isDeleting}
                        aria-label="Fechar detalhes do evento"
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
                    <div className="flex items-start gap-3">
                        <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#BD9655]" />

                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                Data
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                                {formatDate(event.start_at)}
                            </p>

                            {formatDate(event.start_at) !==
                                formatDate(event.end_at) && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        Até {formatDate(event.end_at)}
                                    </p>
                                )}
                        </div>
                    </div>

                    {!event.all_day && (
                        <div className="flex items-start gap-3">
                            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#BD9655]" />

                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Horário
                                </p>

                                <p className="mt-1 text-sm text-gray-600">
                                    {formatTime(event.start_at)} –{" "}
                                    {formatTime(event.end_at)}
                                    <span className="ml-1 text-xs text-gray-400">
                                        (Luanda)
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {event.all_day && (
                        <div className="flex items-start gap-3">
                            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#BD9655]" />

                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Horário
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    Dia inteiro
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#BD9655]" />

                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                Localização
                            </p>

                            <p className="mt-1 break-words text-sm text-gray-600">
                                {event.location || "Sem localização definida"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#BD9655]" />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Descrição
                            </p>

                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                                {event.description || "Sem descrição."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#BD9655]" />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Participantes
                            </p>

                            {participants.length === 0 ? (
                                <p className="mt-1 text-sm text-gray-500">
                                    Nenhum participante associado.
                                </p>
                            ) : (
                                <ul className="mt-3 space-y-3">
                                    {participants.map((participant) => {
                                        const name = getParticipantName(participant);

                                        return (
                                            <li
                                                key={participant.profile_id}
                                                className="flex min-w-0 items-center gap-3"
                                            >
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002950] text-xs font-semibold text-white">
                                                    {name
                                                        .split(/\s+/)
                                                        .map((part) => part[0])
                                                        .join("")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-gray-800">
                                                        {name}
                                                    </p>

                                                    {participant.email && (
                                                        <p className="truncate text-xs text-gray-500">
                                                            {participant.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    {deleteError && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {deleteError}
                        </p>
                    )}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:px-6">
                    <div>
                        {onDeleteAction && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}

                                Eliminar
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            disabled={isDeleting}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Fechar
                        </button>

                        {onEditAction && (
                            <button
                                type="button"
                                onClick={() => onEditAction(event)}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#002950] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003968] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Pencil className="h-4 w-4" />
                                Editar
                            </button>
                        )}
                    </div>
                </footer>
            </section>
        </div>
    );
}