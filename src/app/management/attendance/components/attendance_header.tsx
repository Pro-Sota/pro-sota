import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
} from "lucide-react";
import type { ViewMode } from "../types";
import {
    formatDate,
    getMonthLabel,
    getTodayDate,
} from "../utils/attendance_dates";

type AttendanceHeaderProps = {
    view: ViewMode;
    selectedDate: string;
    selectedMonth: string;
    onChangeView: (view: ViewMode) => void;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onCurrentMonth: () => void;
    onToday: () => void;
};

export default function AttendanceHeader({
    view,
    selectedDate,
    selectedMonth,
    onChangeView,
    onPreviousMonth,
    onNextMonth,
    onCurrentMonth,
    onToday,
}: AttendanceHeaderProps) {
    const today = getTodayDate();
    const currentMonth = today.slice(0, 7);
    const isToday = selectedDate === today;
    const isCurrentMonth = selectedMonth === currentMonth;

    return (
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-[#BD9655]">
                    <Clock3
                        className="h-4 w-4"
                        aria-hidden="true"
                    />
                    Presença
                </div>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#002950]">
                    Registo de presença
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Consulte e registe a presença da equipa.
                </p>

                {view === "day" ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <CalendarDays
                            className="h-4 w-4"
                            aria-hidden="true"
                        />

                        <span className="font-medium text-[#002950]">
                            {isToday
                                ? "Hoje"
                                : formatDate(selectedDate)}
                        </span>

                        {!isToday && (
                            <button
                                type="button"
                                onClick={onToday}
                                className="font-semibold text-[#BD9655] hover:underline focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30"
                            >
                                Voltar a hoje
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={onPreviousMonth}
                            aria-label="Mês anterior"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#BD9655] hover:text-[#BD9655] focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30"
                        >
                            <ChevronLeft
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </button>

                        <span className="min-w-[145px] text-center text-sm font-semibold text-[#002950]">
                            {getMonthLabel(selectedMonth)}
                        </span>

                        <button
                            type="button"
                            onClick={onNextMonth}
                            aria-label="Mês seguinte"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#BD9655] hover:text-[#BD9655] focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30"
                        >
                            <ChevronRight
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </button>

                        {!isCurrentMonth && (
                            <button
                                type="button"
                                onClick={onCurrentMonth}
                                className="ml-1 text-xs font-semibold text-[#BD9655] hover:underline focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30"
                            >
                                Este mês
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div
                className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
                role="tablist"
                aria-label="Modo de visualização da presença"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={view === "day"}
                    onClick={() => onChangeView("day")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30 ${
                        view === "day"
                            ? "bg-[#002950] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    Hoje
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={view === "month"}
                    onClick={() => onChangeView("month")}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30 ${
                        view === "month"
                            ? "bg-[#002950] text-white"
                            : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                    Mês
                </button>
            </div>
        </div>
    );
}