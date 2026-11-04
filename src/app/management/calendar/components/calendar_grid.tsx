
"use client";

import { useMemo } from "react";

import type { CalendarEvent } from "../types";
import CalendarDay from "./calendar_day";

type Props = {
    calendarDays: Date[];
    currentDate: Date;
    todayKey: string;
    selectedDate: string | null;
    eventsByDate: Map<string, CalendarEvent[]>;
    rangeEvents?: CalendarEvent[];
    onSelectDate: (date: string) => void;
    onSelectEvent?: (event: CalendarEvent) => void;
};

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const RANGE_SOURCES = ["project", "task", "submission"];

function dateKey(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}

function normalizeDate(value?: string | null) {
    return value?.slice(0, 10) ?? "";
}

function getStart(event: CalendarEvent) {
    return normalizeDate(event.startDate || event.start_at || event.date);
}

function getEnd(event: CalendarEvent) {
    return normalizeDate(
        event.endDate ||
        event.end_at ||
        event.startDate ||
        event.start_at ||
        event.date,
    );
}

function getSource(event: CalendarEvent) {
    return event.source || event.type;
}

function expandRangeEvents(
    events: CalendarEvent[],
    calendarDays: Date[],
) {
    const result = new Map<string, CalendarEvent[]>();

    for (const event of events) {
        if (!RANGE_SOURCES.includes(getSource(event))) continue;

        const start = getStart(event);
        const end = getEnd(event);

        if (!start || !end || start > end) continue;

        for (const date of calendarDays) {
            const key = dateKey(date);

            if (key < start || key > end) continue;

            const current = result.get(key) ?? [];

            current.push(event);
            result.set(key, current);
        }
    }

    return result;
}

export default function CalendarGrid({
    calendarDays,
    currentDate,
    todayKey,
    selectedDate,
    eventsByDate,
    rangeEvents = [],
    onSelectDate,
    onSelectEvent,
}: Props) {
    const weeks = useMemo(() => {
        const result: Date[][] = [];

        for (let i = 0; i < calendarDays.length; i += 7) {
            result.push(calendarDays.slice(i, i + 7));
        }

        return result;
    }, [calendarDays]);

    const rangeEventsByDate = useMemo(
        () => expandRangeEvents(rangeEvents, calendarDays),
        [rangeEvents, calendarDays],
    );

    return (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            <div className="grid grid-cols-7 border-b border-black/[0.06] bg-[#F7F7F5]">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="border-r border-black/[0.06] px-1 py-3 text-center text-[9px] font-semibold uppercase text-black/40 last:border-r-0 sm:text-[11px]"
                    >
                        <span className="sm:hidden">{day.charAt(0)}</span>
                        <span className="hidden sm:inline">{day}</span>
                    </div>
                ))}
            </div>

            {weeks.map((week) => (
                <div
                    key={dateKey(week[0])}
                    className="grid grid-cols-7 border-b border-black/[0.06] last:border-b-0"
                >
                    {week.map((date) => {
                        const key = dateKey(date);

                        const ordinaryEvents = (
                            eventsByDate.get(key) ?? []
                        ).filter(
                            (event) =>
                                !RANGE_SOURCES.includes(getSource(event)),
                        );

                        const ranges = rangeEventsByDate.get(key) ?? [];

                        // Merge both types of events and avoid duplicates.
                        const uniqueEvents = new Map<string, CalendarEvent>();

                        for (const event of [...ranges, ...ordinaryEvents]) {
                            uniqueEvents.set(event.id, event);
                        }

                        const dailyEvents = [...uniqueEvents.values()].sort(
                            (a, b) => {
                                const priority = (event: CalendarEvent) => {
                                    switch (getSource(event)) {
                                        case "project": return 1;
                                        case "task": return 2;
                                        case "submission": return 3;
                                        default: return 4;
                                    }
                                };

                                return priority(a) - priority(b);
                            },
                        );

                        return (
                            <div key={key} className="min-w-0">
                                <CalendarDay
                                    date={date}
                                    currentDate={currentDate}
                                    todayKey={todayKey}
                                    selectedDate={selectedDate}
                                    events={dailyEvents}
                                    onSelectDate={onSelectDate}
                                    onSelectEvent={onSelectEvent}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
