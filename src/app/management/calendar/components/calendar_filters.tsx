"use client";

import type { EventType } from "../types";

type Props = {
    activeFilter: EventType | "all";
    onChange: (filter: EventType | "all") => void;
};

const FILTERS: Array<{
    value: EventType | "all";
    label: string;
}> = [
    { value: "all", label: "Todos" },
    { value: "meeting", label: "Reuniões" },
    { value: "task", label: "Tarefas" },
    { value: "deadline", label: "Prazos" },
    { value: "submission", label: "Submissões" },
    { value: "project", label: "Projectos" },
];

export default function CalendarFilters({
    activeFilter,
    onChange,
}: Props) {
    return (
        <div
            role="group"
            aria-label="Filtrar eventos"
            className="-mx-1 flex items-center gap-3 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {FILTERS.map((filter) => {
                const active = activeFilter === filter.value;

                return (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => onChange(filter.value)}
                        aria-pressed={active}
                        className={[
                            "h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[#BD9655]/20",
                            active
                                ? "border-[#002950] bg-[#002950] text-white"
                                : "border-black/[0.08] bg-white text-black/55 hover:bg-black/[0.025] hover:text-[#002950]",
                        ].join(" ")}
                    >
                        {filter.label}
                    </button>
                );
            })}
        </div>
    );
}