"use client";

import {
    CalendarPlus,
    ChevronRight,
    Clock3,
    X,
} from "lucide-react";

import type { CalendarEvent } from "../types";

type Props = {
    selectedDate: string | null;
    selectedEvents: CalendarEvent[];
    onClear: () => void;
    onAddEvent: () => void;
    onSelectEvent?: (
        event: CalendarEvent,
    ) => void;
};

export default function SelectedDayAgenda({
    selectedDate,
    selectedEvents,
    onClear,
    onAddEvent,
    onSelectEvent,
}: Props) {
    if (!selectedDate) {
        return (
            <section className="rounded-2xl border border-black/[0.06] bg-white p-5">
                <p className="text-sm text-black/45">
                    Seleccione um dia para
                    consultar os eventos.
                </p>
            </section>
        );
    }

    const date = new Date(
        `${selectedDate}T00:00:00`,
    );

    const label =
        new Intl.DateTimeFormat(
            "pt-PT",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
            },
        ).format(date);

    return (
        <section className="rounded-2xl border border-black/[0.06] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/35">
                        Agenda
                    </p>

                    <h2 className="mt-1 text-sm font-semibold capitalize text-[#002950]">
                        {label}
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClear}
                    className="flex size-8 items-center justify-center rounded-lg text-black/35 hover:bg-black/[0.04] hover:text-black/60"
                    aria-label="Limpar dia seleccionado"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-5">
                {selectedEvents.length ===
                0 ? (
                    <div className="py-4 text-center">
                        <p className="text-sm text-black/40">
                            Não existem eventos
                            neste dia.
                        </p>

                        <button
                            type="button"
                            onClick={
                                onAddEvent
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#002950] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#002950]/90"
                        >
                            <CalendarPlus
                                size={15}
                            />
                            Adicionar evento
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {selectedEvents.map(
                                (event) => (
                                    <button
                                        key={
                                            event.id
                                        }
                                        type="button"
                                        onClick={() =>
                                            onSelectEvent?.(
                                                event,
                                            )
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl border border-black/[0.06] p-3 text-left hover:bg-black/[0.02]"
                                    >
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F7F7F5]">
                                            <Clock3
                                                size={
                                                    15
                                                }
                                                className="text-[#002950]"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-[#002950]">
                                                {
                                                    event.title
                                                }
                                            </p>

                                            <p className="mt-0.5 text-xs text-black/40">
                                                {event.time ||
                                                    "Sem hora definida"}

                                                {event.project
                                                    ? ` · ${event.project}`
                                                    : ""}
                                            </p>
                                        </div>

                                        <ChevronRight
                                            size={
                                                15
                                            }
                                            className="shrink-0 text-black/25"
                                        />
                                    </button>
                                ),
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={
                                onAddEvent
                            }
                            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#002950] hover:text-[#BD9655]"
                        >
                            <CalendarPlus
                                size={15}
                            />
                            Adicionar evento
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}