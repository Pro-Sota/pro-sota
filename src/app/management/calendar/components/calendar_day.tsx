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
                "min-h-[105px] cursor-pointer border-r border-b border-black/[0.06] p-2 transition-colors focus-within:bg-[#002950]/[0.03]",
                isSelected
                    ? "bg-[#002950]/[0.025]"
                    : !isCurrentMonth
                        ? "bg-black/[0.015] hover:bg-black/[0.03]"
                        : "bg-white hover:bg-black/[0.02]",
            ].join(" ")}
        >
            {/* Date number: no onClick, the click bubbles up to the cell.
                Still a button so keyboard users can focus it and press Enter. */}

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
                            "block w-full truncate rounded-md px-1.5 py-1 text-left text-[11px]",
                            isCurrentMonth
                                ? "bg-[#002950]/[0.06] text-[#002950] hover:bg-[#002950]/[0.10]"
                                : "bg-black/[0.03] text-black/30",
                        ].join(" ")}
                        title={event.title}
                    >
                        {event.time && (
                            <span className="mr-1 font-medium">
                                {event.time}
                            </span>
                        )}

                        <span>{event.title}</span>
                    </button>
                ))}

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