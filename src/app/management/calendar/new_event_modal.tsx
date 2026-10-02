"use client";

import { CalendarDays, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { searchCalendarParticipants } from "@/actions/calendar";

import type { CalendarParticipant } from "@/actions/calendar";

import type { EventType } from "./types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type EventForm = {
    title: string;
    type: EventType;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
};

export type NewEventPayload = EventForm & {
    participantIds: string[];
};

type NewEventModalProps = {
    open: boolean;
    onCloseAction: () => void;
    initialDate?: string;
    onSubmitAction?: (event: NewEventPayload) => Promise<void> | void;
};

type DropdownPosition = {
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const EVENT_TYPE_OPTIONS: Array<{ value: EventType; label: string }> = [
    { value: "meeting", label: "Reunião" },
    { value: "site_visit", label: "Visita à obra" },
    { value: "task", label: "Tarefa" },
    { value: "deadline", label: "Prazo" },
    { value: "submission", label: "Submissão" },
    { value: "project", label: "Projecto" },
];

const inputClass =
    "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-700";

const optionalHint = (
    <span className="ml-1 font-normal text-neutral-400">(opcional)</span>
);

const DROPDOWN_MAX_HEIGHT = 224;
const DROPDOWN_GAP = 4;
const VIEWPORT_MARGIN = 8;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getTodayKey() {
    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
}

function addOneHour(time: string) {
    const [hours = 0, minutes = 0] = time.split(":").map(Number);

    if (hours >= 23) {
        return "23:59";
    }

    return `${String(hours + 1).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
    )}`;
}

function createInitialForm(date?: string): EventForm {
    return {
        title: "",
        type: "meeting",
        date: date ?? getTodayKey(),
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        description: "",
    };
}

function getParticipantName(participant: CalendarParticipant) {
    return [participant.first_name, participant.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
}

function getInitials(participant: CalendarParticipant) {
    const first = participant.first_name?.[0] ?? "";
    const last = participant.last_name?.[0] ?? "";

    return `${first}${last}`.toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function NewEventModal({
    open,
    onCloseAction,
    initialDate,
    onSubmitAction,
}: NewEventModalProps) {
    const [form, setForm] = useState<EventForm>(() =>
        createInitialForm(initialDate),
    );

    const [selectedParticipants, setSelectedParticipants] = useState<
        CalendarParticipant[]
    >([]);

    const [participantSearch, setParticipantSearch] = useState("");

    const [participantResults, setParticipantResults] = useState<
        CalendarParticipant[]
    >([]);

    const [isSearchingParticipants, setIsSearchingParticipants] =
        useState(false);

    const [showParticipantResults, setShowParticipantResults] =
        useState(false);

    const [dropdownPosition, setDropdownPosition] =
        useState<DropdownPosition | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const participantSearchRef = useRef<HTMLInputElement>(null);
    const participantFieldRef = useRef<HTMLDivElement>(null);
    const participantContainerRef = useRef<HTMLDivElement>(null);
    const participantDropdownRef = useRef<HTMLDivElement>(null);

    const closeRef = useRef(onCloseAction);

    useEffect(() => {
        closeRef.current = onCloseAction;
    }, [onCloseAction]);

    const isDropdownVisible =
        open && showParticipantResults && participantSearch.trim() !== "";

    /* ---------------------------------------------------------------------- */
    /* Reset                                                                   */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(createInitialForm(initialDate));
        setSelectedParticipants([]);
        setParticipantSearch("");
        setParticipantResults([]);
        setShowParticipantResults(false);
        setSubmitError(null);
    }, [open, initialDate]);

    /* ---------------------------------------------------------------------- */
    /* Escape + body scroll                                                    */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeRef.current();
            }
        };

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    /* ---------------------------------------------------------------------- */
    /* Search participants                                                     */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        const query = participantSearch.trim();

        if (!query) {
            setParticipantResults([]);
            setIsSearchingParticipants(false);
            return;
        }

        let cancelled = false;

        const timer = window.setTimeout(async () => {
            try {
                setIsSearchingParticipants(true);

                const results = await searchCalendarParticipants(query);

                if (!cancelled) {
                    const selectedIds = new Set(
                        selectedParticipants.map(
                            (participant) => participant.profile_id,
                        ),
                    );

                    setParticipantResults(
                        results.filter(
                            (participant) =>
                                !selectedIds.has(participant.profile_id),
                        ),
                    );

                    setShowParticipantResults(true);
                }
            } catch {
                if (!cancelled) {
                    setParticipantResults([]);
                }
            } finally {
                if (!cancelled) {
                    setIsSearchingParticipants(false);
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [participantSearch, selectedParticipants]);

    /* ---------------------------------------------------------------------- */
    /* Position the floating results list                                      */
    /* ---------------------------------------------------------------------- */

    // The list is rendered in a portal with fixed positioning, so it floats
    // above the modal instead of growing the scrollable form. Its position is
    // recalculated when the window resizes or anything scrolls (including the
    // modal body), and it flips above the field when there is no room below.
    useEffect(() => {
        if (!isDropdownVisible) {
            setDropdownPosition(null);
            return;
        }

        const updatePosition = () => {
            const field = participantFieldRef.current;

            if (!field) {
                return;
            }

            const rect = field.getBoundingClientRect();

            const spaceBelow =
                window.innerHeight -
                rect.bottom -
                DROPDOWN_GAP -
                VIEWPORT_MARGIN;

            const spaceAbove =
                rect.top - DROPDOWN_GAP - VIEWPORT_MARGIN;

            const openUpwards =
                spaceBelow < 160 && spaceAbove > spaceBelow;

            const availableSpace = openUpwards ? spaceAbove : spaceBelow;

            setDropdownPosition({
                left: rect.left,
                width: rect.width,
                top: openUpwards ? undefined : rect.bottom + DROPDOWN_GAP,
                bottom: openUpwards
                    ? window.innerHeight - rect.top + DROPDOWN_GAP
                    : undefined,
                maxHeight: Math.max(
                    96,
                    Math.min(DROPDOWN_MAX_HEIGHT, availableSpace),
                ),
            });
        };

        updatePosition();

        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [
        isDropdownVisible,
        selectedParticipants.length,
        participantResults.length,
        isSearchingParticipants,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Close participant dropdown on outside click                             */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            // The list lives in a portal, so check it separately.
            const insideField =
                participantContainerRef.current?.contains(target) ?? false;

            const insideDropdown =
                participantDropdownRef.current?.contains(target) ?? false;

            if (!insideField && !insideDropdown) {
                setShowParticipantResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!open) {
        return null;
    }

    /* ---------------------------------------------------------------------- */
    /* Form helpers                                                            */
    /* ---------------------------------------------------------------------- */

    const updateField = <K extends keyof EventForm>(
        field: K,
        value: EventForm[K],
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleStartTimeChange = (value: string) => {
        setForm((current) => ({
            ...current,
            startTime: value,
            endTime:
                current.endTime <= value
                    ? addOneHour(value)
                    : current.endTime,
        }));
    };

    const selectParticipant = (participant: CalendarParticipant) => {
        setSelectedParticipants((current) => [...current, participant]);

        setParticipantSearch("");
        setParticipantResults([]);
        setShowParticipantResults(false);

        window.setTimeout(() => {
            participantSearchRef.current?.focus();
        }, 0);
    };

    const removeParticipant = (profileId: string) => {
        setSelectedParticipants((current) =>
            current.filter(
                (participant) => participant.profile_id !== profileId,
            ),
        );
    };

    const endBeforeStart = form.endTime <= form.startTime;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (endBeforeStart || isSubmitting) {
            return;
        }

        const payload: NewEventPayload = {
            ...form,
            title: form.title.trim(),
            location: form.location.trim(),
            description: form.description.trim(),
            participantIds: selectedParticipants.map(
                (participant) => participant.profile_id,
            ),
        };

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            await onSubmitAction?.(payload);

            onCloseAction();
        } catch {
            setSubmitError(
                "Não foi possível criar o evento. Tente novamente.",
            );

            setIsSubmitting(false);
        }
    };

    /* ---------------------------------------------------------------------- */
    /* Render                                                                  */
    /* ---------------------------------------------------------------------- */

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-event-title"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCloseAction();
                }
            }}
        >
            <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-start justify-between border-b border-neutral-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#002950]/5">
                            <CalendarDays className="h-4 w-4 text-[#002950]" />
                        </div>

                        <div>
                            <h2
                                id="new-event-title"
                                className="text-lg font-semibold text-neutral-950"
                            >
                                Novo evento
                            </h2>

                            <p className="text-xs text-neutral-500">
                                Adicione um evento ao calendário.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                        aria-label="Fechar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        {/* Title */}
                        <div>
                            <label htmlFor="event-title" className={labelClass}>
                                Título
                                <span className="ml-0.5 text-red-500">*</span>
                            </label>

                            <input
                                id="event-title"
                                value={form.title}
                                onChange={(event) =>
                                    updateField("title", event.target.value)
                                }
                                placeholder="Ex.: Reunião com cliente"
                                required
                                autoFocus
                                className={inputClass}
                            />
                        </div>

                        {/* Type */}
                        <div>
                            <label htmlFor="event-type" className={labelClass}>
                                Tipo de evento
                            </label>

                            <select
                                id="event-type"
                                value={form.type}
                                onChange={(event) =>
                                    updateField(
                                        "type",
                                        event.target.value as EventType,
                                    )
                                }
                                className={inputClass}
                            >
                                {EVENT_TYPE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date / time */}
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="event-date"
                                    className={labelClass}
                                >
                                    Data
                                    <span className="ml-0.5 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    id="event-date"
                                    type="date"
                                    value={form.date}
                                    onChange={(event) =>
                                        updateField("date", event.target.value)
                                    }
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="event-start-time"
                                        className={labelClass}
                                    >
                                        Início
                                    </label>

                                    <input
                                        id="event-start-time"
                                        type="time"
                                        value={form.startTime}
                                        onChange={(event) =>
                                            handleStartTimeChange(
                                                event.target.value,
                                            )
                                        }
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="event-end-time"
                                        className={labelClass}
                                    >
                                        Fim
                                    </label>

                                    <input
                                        id="event-end-time"
                                        type="time"
                                        value={form.endTime}
                                        onChange={(event) =>
                                            updateField(
                                                "endTime",
                                                event.target.value,
                                            )
                                        }
                                        required
                                        aria-invalid={endBeforeStart}
                                        aria-describedby={
                                            endBeforeStart
                                                ? "event-time-error"
                                                : undefined
                                        }
                                        className={[
                                            inputClass,
                                            endBeforeStart
                                                ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                                                : "",
                                        ].join(" ")}
                                    />
                                </div>
                            </div>

                            {endBeforeStart && (
                                <p
                                    id="event-time-error"
                                    role="alert"
                                    className="text-xs text-red-600"
                                >
                                    A hora de fim tem de ser depois da hora de
                                    início.
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label
                                htmlFor="event-location"
                                className={labelClass}
                            >
                                Local
                                {optionalHint}
                            </label>

                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                                <input
                                    id="event-location"
                                    value={form.location}
                                    onChange={(event) =>
                                        updateField(
                                            "location",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Local ou endereço"
                                    className={`${inputClass} pl-9`}
                                />
                            </div>
                        </div>

                        {/* Participants */}
                        <div ref={participantContainerRef}>
                            <label
                                htmlFor="event-participants"
                                className={labelClass}
                            >
                                Participantes
                                {optionalHint}
                            </label>

                            <div
                                ref={participantFieldRef}
                                className={[
                                    "min-h-10 w-full rounded-lg border bg-white px-2 py-1.5",
                                    "transition focus-within:border-[#002950] focus-within:ring-2 focus-within:ring-[#002950]/10",
                                    isDropdownVisible
                                        ? "border-[#002950]"
                                        : "border-neutral-200",
                                ].join(" ")}
                            >
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {selectedParticipants.map((participant) => (
                                        <span
                                            key={participant.profile_id}
                                            className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[#002950]/5 px-2 py-1 text-xs font-medium text-[#002950]"
                                        >
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#002950] text-[9px] font-semibold text-white">
                                                {getInitials(participant)}
                                            </span>

                                            <span className="max-w-[180px] truncate">
                                                {getParticipantName(
                                                    participant,
                                                )}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeParticipant(
                                                        participant.profile_id,
                                                    )
                                                }
                                                className="rounded p-0.5 text-[#002950]/50 transition hover:bg-[#002950]/10 hover:text-[#002950]"
                                                aria-label={`Remover ${getParticipantName(
                                                    participant,
                                                )}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}

                                    <input
                                        id="event-participants"
                                        ref={participantSearchRef}
                                        value={participantSearch}
                                        onChange={(event) => {
                                            setParticipantSearch(
                                                event.target.value,
                                            );

                                            setShowParticipantResults(true);
                                        }}
                                        onFocus={() => {
                                            if (participantSearch.trim()) {
                                                setShowParticipantResults(true);
                                            }
                                        }}
                                        placeholder={
                                            selectedParticipants.length
                                                ? "Adicionar outro..."
                                                : "Pesquisar participante..."
                                        }
                                        autoComplete="off"
                                        className="h-7 min-w-[160px] flex-1 border-0 bg-transparent px-1 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="event-description"
                                className={labelClass}
                            >
                                Descrição
                                {optionalHint}
                            </label>

                            <textarea
                                id="event-description"
                                value={form.description}
                                onChange={(event) =>
                                    updateField(
                                        "description",
                                        event.target.value,
                                    )
                                }
                                rows={3}
                                placeholder="Detalhes do evento..."
                                className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#002950] focus:ring-2 focus:ring-[#002950]/10"
                            />
                        </div>

                        {submitError && (
                            <p
                                role="alert"
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                            >
                                {submitError}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 justify-end gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            disabled={isSubmitting}
                            className="h-10 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={endBeforeStart || isSubmitting}
                            className="h-10 rounded-lg bg-[#BD9655] px-5 text-sm font-semibold text-[#002950] transition hover:bg-[#a9854b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#BD9655]/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? "A criar..." : "Criar evento"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Participant results: portal + fixed, so the list floats above
                the modal and never changes the height of the scrollable form */}
            {isDropdownVisible &&
                dropdownPosition &&
                createPortal(
                    <div
                        ref={participantDropdownRef}
                        role="listbox"
                        aria-label="Resultados da pesquisa de participantes"
                        style={{
                            position: "fixed",
                            left: dropdownPosition.left,
                            width: dropdownPosition.width,
                            top: dropdownPosition.top,
                            bottom: dropdownPosition.bottom,
                        }}
                        className="z-[60] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl"
                    >
                        {isSearchingParticipants ? (
                            <div className="px-3 py-3 text-sm text-neutral-500">
                                A pesquisar...
                            </div>
                        ) : participantResults.length > 0 ? (
                            <div
                                className="overflow-y-auto py-1"
                                style={{
                                    maxHeight: dropdownPosition.maxHeight,
                                }}
                            >
                                {participantResults.map((participant) => (
                                    <button
                                        key={participant.profile_id}
                                        type="button"
                                        role="option"
                                        aria-selected={false}
                                        onClick={() =>
                                            selectParticipant(participant)
                                        }
                                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-neutral-50"
                                    >
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#002950]/5 text-xs font-semibold text-[#002950]">
                                            {getInitials(participant)}
                                        </span>

                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-medium text-neutral-800">
                                                {getParticipantName(
                                                    participant,
                                                )}
                                            </span>

                                            {participant.email && (
                                                <span className="block truncate text-xs text-neutral-400">
                                                    {participant.email}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-3 py-3 text-sm text-neutral-500">
                                Nenhum participante encontrado.
                            </div>
                        )}
                    </div>,
                    document.body,
                )}
        </div>
    );
}