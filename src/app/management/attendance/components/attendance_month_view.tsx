import {
    ChevronLeft,
    ChevronRight,
    Users,
} from "lucide-react";

import type { AttendanceStatus } from "@/services/attendance";
import type {
    MonthlyAttendanceRecord,
    Profile,
} from "../types";

import AttendanceLegend from "./attendance_legend";

import {
    getInitials,
    getMonthLabel,
    getTodayDate,
    isFutureDate,
    isWeekend,
} from "../utils/attendance_dates";

function dotClass(status: AttendanceStatus): string {
    return {
        Presente: "bg-emerald-500",
        Atrasado: "bg-amber-500",
        Ausente: "bg-red-500",
        "Em falta": "bg-slate-300",
    }[status];
}

type Props = {
    profiles: Profile[];
    monthlyAttendanceMap: Map<string, MonthlyAttendanceRecord>;
    monthDays: string[];
    selectedMonth: string;

    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onCurrentMonth: () => void;

    onOpenEmployee: (profile: Profile) => void;
    onOpenDay: (profile: Profile, date: string) => void;
};

export default function AttendanceMonthView({
    profiles,
    monthlyAttendanceMap,
    monthDays,
    selectedMonth,
    onPreviousMonth,
    onNextMonth,
    onCurrentMonth,
    onOpenEmployee,
    onOpenDay,
}: Props) {
    const today = getTodayDate();
    const currentMonth = today.slice(0, 7);

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onPreviousMonth}
                        aria-label="Mês anterior"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#BD9655] hover:text-[#BD9655]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="min-w-[170px] text-center">
                        <h2 className="font-semibold text-[#002950]">
                            {getMonthLabel(selectedMonth)}
                        </h2>

                        <p className="text-xs text-slate-500">
                            {monthlyAttendanceMap.size} registos
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onNextMonth}
                        aria-label="Mês seguinte"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#BD9655] hover:text-[#BD9655]"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {selectedMonth !== currentMonth && (
                    <button
                        type="button"
                        onClick={onCurrentMonth}
                        className="text-sm font-semibold text-[#BD9655] hover:underline"
                    >
                        Ir para este mês
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse text-left">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="sticky left-0 z-20 min-w-[220px] border-b border-r border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Membro
                            </th>

                            <th className="sticky left-[220px] z-20 min-w-[150px] border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Área
                            </th>

                            {monthDays.map((day) => {
                                const weekend = isWeekend(day);
                                const isToday = day === today;

                                return (
                                    <th
                                        key={day}
                                        className={`min-w-[48px] border-b border-slate-200 px-2 py-3 text-center text-xs font-semibold ${
                                            isToday
                                                ? "bg-[#BD9655]/10 text-[#BD9655]"
                                                : weekend
                                                  ? "bg-slate-100/70 text-slate-400"
                                                  : "text-slate-500"
                                        }`}
                                    >
                                        {Number(day.slice(-2))}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {profiles.map((profile) => (
                            <tr
                                key={profile.profile_id}
                                className="group"
                            >
                                <td className="sticky left-0 z-10 min-w-[220px] border-r border-slate-200 bg-white px-5 py-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onOpenEmployee(profile)
                                        }
                                        className="flex items-center gap-3 text-left"
                                    >
                                        {profile.profile_picture ? (
                                            <img
                                                src={profile.profile_picture}
                                                alt={`${profile.first_name} ${profile.last_name}`}
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002950]/10 text-[11px] font-semibold text-[#002950]">
                                                {getInitials(
                                                    profile.first_name,
                                                    profile.last_name,
                                                )}
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-[#002950]">
                                                {profile.first_name}{" "}
                                                {profile.last_name}
                                            </p>

                                            <p className="truncate text-xs text-slate-500">
                                                {profile.job_title ?? "—"}
                                            </p>
                                        </div>
                                    </button>
                                </td>

                                <td className="sticky left-[220px] z-10 min-w-[150px] border-r border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                                    {profile.department ?? "—"}
                                </td>

                                {monthDays.map((day) => {
                                    const record =
                                        monthlyAttendanceMap.get(
                                            `${profile.profile_id}-${day}`,
                                        );

                                    const future = isFutureDate(day);
                                    const weekend = isWeekend(day);
                                    const isToday = day === today;

                                    return (
                                        <td
                                            key={day}
                                            className={`px-2 py-3 text-center ${
                                                isToday
                                                    ? "bg-[#BD9655]/5"
                                                    : weekend
                                                      ? "bg-slate-50/60"
                                                      : ""
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                disabled={future}
                                                onClick={() =>
                                                    onOpenDay(
                                                        profile,
                                                        day,
                                                    )
                                                }
                                                aria-label={`${profile.first_name} ${profile.last_name}, ${day}: ${
                                                    record?.status ??
                                                    "Sem registo"
                                                }`}
                                                className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100 disabled:cursor-default disabled:hover:bg-transparent"
                                            >
                                                {future ? (
                                                    <span className="block h-2 w-2 rounded-full bg-slate-100" />
                                                ) : record ? (
                                                    <span
                                                        className={`block h-2.5 w-2.5 rounded-full ${dotClass(
                                                            record.status,
                                                        )}`}
                                                    />
                                                ) : (
                                                    <span className="block h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" />
                                                )}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {profiles.length === 0 && (
                <div className="px-5 py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-3 text-sm font-medium text-slate-600">
                        Nenhum membro encontrado.
                    </p>
                </div>
            )}

            <AttendanceLegend />
        </section>
    );
}