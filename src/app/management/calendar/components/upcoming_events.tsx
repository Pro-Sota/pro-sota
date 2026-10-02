"use client";

import {
    CalendarDays,
    ChevronRight,
    Clock3,
} from "lucide-react";

import type { CalendarEvent } from "../types";

type Props = {
    events: CalendarEvent[];
    onSelectDate: (
        date: string,
    ) => void;
};

export default function UpcomingEvents({
    events,
    onSelectDate,
}: Props) {
    return (
        <section className="rounded-2xl border border-black/[0.06] bg-white">
            <div className="border-b border-black/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#002950]">
                    Próximos eventos
                </h2>

                <p className="mt-0.5 text-xs text-black/40">
                    Os próximos eventos do
                    calendário
                </p>
            </div>

            {events.length === 0 ? (
                <div className="px-5 py-10 text-center">
                    <CalendarDays
                        size={20}
                        className="mx-auto text-black/20"
                    />

                    <p className="mt-2 text-sm text-black/45">
                        Não existem próximos
                        eventos.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-black/[0.06]">
                    {events.map(
                        (event) => (
                            <button
                                key={
                                    event.id
                                }
                                type="button"
                                onClick={() =>
                                    onSelectDate(
                                        event.date,
                                    )
                                }
                                className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-black/[0.02]"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F7F5]">
                                    <Clock3
                                        size={
                                            16
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

                                    <div className="mt-1 flex items-center gap-2 text-xs text-black/40">
                                        <span>
                                            {new Intl.DateTimeFormat(
                                                "pt-PT",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                },
                                            ).format(
                                                new Date(
                                                    `${event.date}T00:00:00`,
                                                ),
                                            )}
                                        </span>

                                        {event.time && (
                                            <>
                                                <span>
                                                    ·
                                                </span>
                                                <span>
                                                    {
                                                        event.time
                                                    }
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <ChevronRight
                                    size={
                                        16
                                    }
                                    className="shrink-0 text-black/25"
                                />
                            </button>
                        ),
                    )}
                </div>
            )}
        </section>
    );
}