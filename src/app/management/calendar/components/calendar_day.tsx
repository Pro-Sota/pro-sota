
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

function getSource(event: CalendarEvent) {
    return event.source || event.type;
}

function getEventStyle(event: CalendarEvent) {
    switch (getSource(event)) {
        case "project":
            return "border-l-2 border-[#002950] bg-[#002950]/[0.07] text-[#002950]";

        case "task":
            return "border-l-2 border-[#BD9655] bg-[#BD9655]/[0.14] text-[#78551F]";

        case "submission":
            return "border-l-2 border-[#648A78] bg-[#648A78]/[0.12] text-[#426B58]";

        case "deadline":
            return "border-l-2 border-red-400 bg-red-50 text-red-800";

        case "meeting":
            return "border-l-2 border-blue-500 bg-blue-50 text-blue-800";

        case "site_visit":
            return "border-l-2 border-violet-500 bg-violet-50 text-violet-800";

        default:
            return "border-l-2 border-[#002950]/30 bg-[#002950]/[0.04] text-[#002950]";
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

    const MAX_VISIBLE = 3;

    const visibleEvents = events.slice(0, MAX_VISIBLE);
    const remainingCount = Math.max(events.length - MAX_VISIBLE, 0);

    return (
        <div
            onClick={() => onSelectDate(dateKey)}
            className={[
                "min-h-[115px] min-w-0 cursor-pointer border-r border-b border-black/[0.06] p-1.5 transition-colors sm:p-2",
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
                className="mb-2 flex w-full items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655]"
                aria-label={`Selecionar ${date.toLocaleDateString("pt-PT", {
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
                {visibleEvents.map((event) => (
                    <button
                        key={event.id}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectDate(dateKey);
                            onSelectEvent?.(event);
                        }}
                        className={[
                            "block w-full min-w-0 truncate rounded-r-md px-1.5 py-1 text-left text-[10px] font-medium transition-colors sm:text-[11px]",
                            getEventStyle(event),
                            !isCurrentMonth
                                ? "opacity-40"
                                : "hover:brightness-95",
                        ].join(" ")}
                        title={event.title}
                        aria-label={event.title}
                    >
                        {event.time && (
                            <span className="mr-1 font-semibold">
                                {event.time}
                            </span>
                        )}

                        {event.title}
                    </button>
                ))}

                {remainingCount > 0 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectDate(dateKey);
                        }}
                        className="px-1.5 py-0.5 text-[10px] font-semibold text-[#002950]/60 hover:text-[#002950] sm:text-[11px]"
                    >
                        + {remainingCount} mais
                    </button>
                )}
            </div>
        </div>
    );
}
