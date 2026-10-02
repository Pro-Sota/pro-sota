"use client";

import type { CalendarEvent } from "../types";

import CalendarDay from "./calendar_day";

type Props = {
    calendarDays: Date[];
    currentDate: Date;
    todayKey: string;
    selectedDate: string | null;
    eventsByDate: Map<string, CalendarEvent[]>;
    onSelectDate: (date: string) => void;
    onSelectEvent?: (
        event: CalendarEvent,
    ) => void;
};

const WEEKDAYS = [
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
    "Dom",
];

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1,
    ).padStart(2, "0");
    const day = String(
        date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function CalendarGrid({
    calendarDays,
    currentDate,
    todayKey,
    selectedDate,
    eventsByDate,
    onSelectDate,
    onSelectEvent,
}: Props) {
    return (
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            <div className="grid min-w-[700px] grid-cols-7 border-b border-black/[0.06] bg-[#F7F7F5]">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="border-r border-black/[0.06] px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-black/40 last:border-r-0"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid min-w-[700px] grid-cols-7">
                {calendarDays.map((date) => {
                    const dateKey =
                        getDateKey(date);

                    return (
                        <CalendarDay
                            key={dateKey}
                            date={date}
                            currentDate={
                                currentDate
                            }
                            todayKey={
                                todayKey
                            }
                            selectedDate={
                                selectedDate
                            }
                            events={
                                eventsByDate.get(
                                    dateKey,
                                ) ?? []
                            }
                            onSelectDate={
                                onSelectDate
                            }
                            onSelectEvent={
                                onSelectEvent
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}