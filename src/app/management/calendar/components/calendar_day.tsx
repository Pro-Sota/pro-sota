"use client";

import type { CalendarEvent } from "../types";

type Props = {
    date: Date;
    currentDate: Date;
    todayKey: string;
    selectedDate: string | null;
    events: CalendarEvent[];
    onSelectDate: (date: string) => void;
    onSelectEvent?: (event: CalendarEvent) => void;
};

function getDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getEventStart(event: CalendarEvent) {
    return event.startDate || event.date;
}

function getEventEnd(event: CalendarEvent) {
    return event.endDate || event.startDate || event.date;
}

function getEventSegmentClass(
    event: CalendarEvent,
    dateKey: string,
) {
    const start = getEventStart(event);
    const end = getEventEnd(event);

    const isStart = dateKey === start;
    const isEnd = dateKey === end;
    const isRange = start !== end;

    if (!isRange) {
        return "rounded-md";
    }

    if (isStart) {
        return "rounded-l-md rounded-r-none";
    }

    if (isEnd) {
        return "rounded-l-none rounded-r-md";
    }

    return "rounded-none";
}

function getEventStyle(event: CalendarEvent) {
    switch (event.source) {
        case "project":
            return "bg-[#002950]/[0.10] text-[#002950]";

        case "task":
            return "bg-[#BD9655]/20 text-[#78551F]";

        case "submission":
            return "bg-emerald-100 text-emerald-800";

        case "deadline":
            return "bg-red-100 text-red-800";

        case "meeting":
            return "bg-blue-100 text-blue-800";

        case "site_visit":
            return "bg-violet-100 text-violet-800";

        default:
            return "bg-[#002950]/[0.06] text-[#002950]";
    }
}

export default function CalendarDay({
    date,
    currentDate,
    todayKey,
    selectedDate,
    events,
    onSelectDate,
    onSelectEvent,
}: Props) {
    const dateKey = getDateKey(date);

    const isCurrentMonth =
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear();

    const isToday = dateKey === todayKey;
    const isSelected = dateKey === selectedDate;

    const visibleEvents = events.slice(0, 3);

    const remainingCount = Math.max(
        events.length - visibleEvents.length,
        0,
    );

    return (
        <div
            onClick={() => onSelectDate(dateKey)}
            className={[
                "min-h-[105px] min-w-0 cursor-pointer border-r border-b border-black/[0.06] p-2 transition-colors focus-within:bg-[#002950]/[0.03]",
                isSelected
                    ? "bg-[#002950]/[0.025]"
                    : !isCurrentMonth
                        ? "bg-black/[0.015] hover:bg-black/[0.03]"
                        : "bg-white hover:bg-black/[0.02]",
            ].join(" ")}
        >
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    onSelectDate(dateKey);
                }}
                className="mb-2 flex w-full items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-1"
                aria-label={`Seleccionar ${date.toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })}`}
            >
                <span
                    className={[
                        "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                        isToday
                            ? "bg-[#002950] text-white"
                            : isSelected
                                ? "bg-[#BD9655]/15 text-[#002950]"
                                : isCurrentMonth
                                    ? "text-black/70"
                                    : "text-black/25",
                    ].join(" ")}
                >
                    {date.getDate()}
                </span>
            </button>

            <div className="space-y-1">
                {visibleEvents.map((event) => {
                    const isRange =
                        getEventStart(event) !== getEventEnd(event);

                    return (
                        <button
                            key={event.id}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectDate(dateKey);
                                onSelectEvent?.(event);
                            }}
                            className={[
                                "block w-full min-w-0 truncate px-1.5 py-1 text-left text-[11px] transition-colors",
                                getEventSegmentClass(event, dateKey),
                                getEventStyle(event),
                                !isCurrentMonth
                                    ? "opacity-40"
                                    : "hover:brightness-95",
                                isRange ? "-mx-2 w-[calc(100%+1rem)] px-3" : "",
                            ].join(" ")}
                            title={`${event.title} · ${getEventStart(event)} a ${getEventEnd(event)}`}
                            aria-label={`${event.title}, ${getEventStart(event)} a ${getEventEnd(event)}`}
                        >
                            {event.time && (
                                <span className="mr-1 font-medium">
                                    {event.time}
                                </span>
                            )}

                            <span>{event.title}</span>
                        </button>
                    );
                })}

                {remainingCount > 0 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectDate(dateKey);
                        }}
                        className="px-1.5 text-[11px] font-medium text-[#002950]/60 hover:text-[#002950]"
                    >
                        + {remainingCount} mais
                    </button>
                )}
            </div>
        </div>
    );
}