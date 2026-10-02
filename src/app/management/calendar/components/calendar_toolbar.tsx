"use client";

import {
    ChevronLeft,
    ChevronRight,
    Search,
} from "lucide-react";

type Props = {
    monthLabel: string;
    search: string;
    onSearchChange: (value: string) => void;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
};

export default function CalendarToolbar({
    monthLabel,
    search,
    onSearchChange,
    onPreviousMonth,
    onNextMonth,
    onToday,
}: Props) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: today + month navigation */}
            <div className="flex w-full items-center gap-3 lg:w-auto">
                <button
                    type="button"
                    onClick={onToday}
                    className="h-10 shrink-0 rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-medium text-[#002950] transition hover:bg-black/[0.025] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#BD9655]/20"
                >
                    Hoje
                </button>

                <div className="flex h-10 flex-1 items-center rounded-xl border border-black/[0.08] bg-white p-1 lg:flex-none">
                    <button
                        type="button"
                        onClick={onPreviousMonth}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-black/50 transition hover:bg-black/[0.04] hover:text-[#002950] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#BD9655]/20"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft size={17} />
                    </button>

                    <div className="flex-1 px-3 text-center text-sm font-semibold capitalize text-[#002950] lg:min-w-[170px] lg:flex-none">
                        {monthLabel}
                    </div>

                    <button
                        type="button"
                        onClick={onNextMonth}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-black/50 transition hover:bg-black/[0.04] hover:text-[#002950] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#BD9655]/20"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight size={17} />
                    </button>
                </div>
            </div>

            {/* Right: search */}
            <label className="relative block w-full lg:w-[280px]">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/35"
                />

                <input
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Pesquisar eventos..."
                    className="h-10 w-full rounded-xl border border-black/[0.08] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#BD9655] focus:ring-4 focus:ring-[#BD9655]/20"
                />
            </label>
        </div>
    );
}