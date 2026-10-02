"use client";

import { useMemo, useState } from "react";

import type {
    CalendarEvent,
    CalendarPageInitProps,
    EventType,
} from "../types";

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
    const result = new Date(date);

    result.setDate(result.getDate() + amount);

    return result;
}

function startOfWeek(date: Date) {
    const result = new Date(date);
    const day = result.getDay();

    const mondayOffset = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + mondayOffset);
    result.setHours(0, 0, 0, 0);

    return result;
}

function endOfWeek(date: Date) {
    const result = startOfWeek(date);

    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);

    return result;
}

function compareEvents(
    first: CalendarEvent,
    second: CalendarEvent,
) {
    const dateComparison =
        first.date.localeCompare(second.date);

    if (dateComparison !== 0) {
        return dateComparison;
    }

    return (first.time ?? "").localeCompare(
        second.time ?? "",
    );
}

function matchesSearch(
    event: CalendarEvent,
    search: string,
) {
    const value = search.trim().toLowerCase();

    if (!value) {
        return true;
    }

    const searchable = [
        event.title,
        event.description,
        event.project,
        event.location,
        event.type,
        event.source,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return searchable.includes(value);
}

export function useCalendar({
    events,
}: CalendarPageInitProps) {
    const [currentDate, setCurrentDate] = useState(
        () => new Date(),
    );

    const [selectedDate, setSelectedDate] =
        useState<string | null>(() =>
            getDateKey(new Date()),
        );

    const [activeFilter, setActiveFilter] = useState<
        EventType | "all"
    >("all");

    const [search, setSearch] = useState("");

    const today = useMemo(() => {
        const value = new Date();

        value.setHours(0, 0, 0, 0);

        return value;
    }, []);

    const todayKey = useMemo(
        () => getDateKey(today),
        [today],
    );

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);

        const weekday = firstDay.getDay();

        const mondayOffset =
            weekday === 0 ? 6 : weekday - 1;

        const startDate = new Date(
            year,
            month,
            1 - mondayOffset,
        );

        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(startDate);

            date.setDate(
                startDate.getDate() + index,
            );

            date.setHours(0, 0, 0, 0);

            return date;
        });
    }, [currentDate]);

    const filteredEvents = useMemo(() => {
        return events
            .filter((event) => {
                if (
                    activeFilter !== "all" &&
                    event.type !== activeFilter
                ) {
                    return false;
                }

                return matchesSearch(event, search);
            })
            .sort(compareEvents);
    }, [
        events,
        activeFilter,
        search,
    ]);

    const eventsByDate = useMemo(() => {
        const result = new Map<
            string,
            CalendarEvent[]
        >();

        for (const event of filteredEvents) {
            const existing = result.get(event.date);

            if (existing) {
                existing.push(event);
            } else {
                result.set(event.date, [event]);
            }
        }

        return result;
    }, [filteredEvents]);

    const selectedEvents = useMemo(() => {
        if (!selectedDate) {
            return [];
        }

        return eventsByDate.get(selectedDate) ?? [];
    }, [
        eventsByDate,
        selectedDate,
    ]);

    const monthEvents = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        return filteredEvents.filter((event) => {
            const date = parseDateKey(event.date);

            return (
                date.getFullYear() === year &&
                date.getMonth() === month
            );
        });
    }, [
        currentDate,
        filteredEvents,
    ]);

    const todayEvents = useMemo(() => {
        return filteredEvents.filter(
            (event) => event.date === todayKey,
        );
    }, [
        filteredEvents,
        todayKey,
    ]);

    const nextSevenDaysKey = useMemo(
        () => getDateKey(addDays(today, 6)),
        [today],
    );

    const nextSevenDaysEvents = useMemo(() => {
        return filteredEvents.filter(
            (event) =>
                event.date >= todayKey &&
                event.date <= nextSevenDaysKey,
        );
    }, [
        filteredEvents,
        todayKey,
        nextSevenDaysKey,
    ]);

    const upcomingDeadlines = useMemo(() => {
        return filteredEvents.filter(
            (event) =>
                event.type === "deadline" &&
                event.date >= todayKey &&
                event.date <= nextSevenDaysKey,
        );
    }, [
        filteredEvents,
        todayKey,
        nextSevenDaysKey,
    ]);

    const upcomingEvents = useMemo(() => {
        return filteredEvents
            .filter(
                (event) => event.date >= todayKey,
            )
            .sort(compareEvents)
            .slice(0, 5);
    }, [
        filteredEvents,
        todayKey,
    ]);

    const weekStart = useMemo(
        () => startOfWeek(today),
        [today],
    );

    const weekEnd = useMemo(
        () => endOfWeek(today),
        [today],
    );

    const weekStartKey = useMemo(
        () => getDateKey(weekStart),
        [weekStart],
    );

    const weekEndKey = useMemo(
        () => getDateKey(weekEnd),
        [weekEnd],
    );

    const thisWeekEvents = useMemo(() => {
        return filteredEvents.filter(
            (event) =>
                event.date >= weekStartKey &&
                event.date <= weekEndKey,
        );
    }, [
        filteredEvents,
        weekStartKey,
        weekEndKey,
    ]);

    const weekProjectCount = useMemo(() => {
        return new Set(
            thisWeekEvents
                .map((event) => event.projectId)
                .filter(Boolean),
        ).size;
    }, [thisWeekEvents]);

    const monthLabel = useMemo(() => {
        return new Intl.DateTimeFormat("pt-PT", {
            month: "long",
            year: "numeric",
        }).format(currentDate);
    }, [currentDate]);

    const weekLabel = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(
            "pt-PT",
            {
                day: "numeric",
                month: "short",
            },
        );

        return `${formatter.format(
            weekStart,
        )} — ${formatter.format(weekEnd)}`;
    }, [
        weekStart,
        weekEnd,
    ]);

    function changeMonth(amount: number) {
        setCurrentDate((current) => {
            const next = new Date(current);

            next.setMonth(
                next.getMonth() + amount,
            );

            return next;
        });
    }

    function goToday() {
        const next = new Date();

        setCurrentDate(next);
        setSelectedDate(getDateKey(next));
    }

    return {
        today,
        todayKey,

        currentDate,
        selectedDate,
        activeFilter,
        search,

        setCurrentDate,
        setSelectedDate,
        setActiveFilter,
        setSearch,

        calendarDays,
        filteredEvents,
        eventsByDate,
        selectedEvents,

        monthEvents,
        todayEvents,
        nextSevenDaysEvents,
        upcomingDeadlines,
        upcomingEvents,

        weekStart,
        weekEnd,
        thisWeekEvents,
        weekProjectCount,

        monthLabel,
        weekLabel,

        changeMonth,
        goToday,
    };
}