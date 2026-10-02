"use client";

import { X } from "lucide-react";

import type { AttendanceStatus } from "@/services/attendance";
import type { AttendanceEmployeeDrawerProps } from "../types";

import AttendanceStatusBadge from "./attendance_status_badge";

import {
    formatDate,
    formatTime,
    getInitials,
    getTodayDate,
} from "../utils/attendance_dates";

type Stats = Record<AttendanceStatus, number>;

const EMPTY_STATS: Stats = {
    Presente: 0,
    Atrasado: 0,
    Ausente: 0,
    "Em falta": 0,
};

export default function AttendanceEmployeeDrawer({
    profile,
    selectedDate,
    attendance,
    monthlyRecords,
    open,
    onClose,
}: AttendanceEmployeeDrawerProps) {
    if (!open || !profile) {
        return null;
    }

    const today = getTodayDate();
    const name =
        `${profile.first_name} ${profile.last_name}`.trim();

    const initials = getInitials(
        profile.first_name,
        profile.last_name,
    );

    const mine = monthlyRecords
        .filter(
            (record) =>
                record.profileId === profile.profile_id,
        )
        .slice()
        .sort((a, b) =>
            b.attendanceDate.localeCompare(
                a.attendanceDate,
            ),
        );

    const stats = mine.reduce<Stats>(
        (acc, record) => {
            acc[record.status] += 1;
            return acc;
        },
        { ...EMPTY_STATS },
    );

    const recordedDays =
        stats.Presente + stats.Atrasado;

    return (
        <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-drawer-title"
        >
            {/* Backdrop */}
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]"
                aria-label="Fechar detalhes"
            />

            {/* Drawer */}
            <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
                {/* Header */}
                <header className="flex shrink-0 items-start justify-between border-b border-slate-200 bg-white px-5 py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        {profile.profile_picture ? (
                            <img
                                src={profile.profile_picture}
                                alt={name}
                                className="h-12 w-12 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div
                                aria-hidden="true"
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#002950]/10 text-sm font-semibold text-[#002950]"
                            >
                                {initials}
                            </div>
                        )}

                        <div className="min-w-0">
                            <h2
                                id="attendance-drawer-title"
                                className="truncate font-semibold text-[#002950]"
                            >
                                {name}
                            </h2>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                {profile.job_title ?? "—"}

                                {profile.department
                                    ? ` · ${profile.department}`
                                    : ""}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X
                            className="h-5 w-5"
                            aria-hidden="true"
                        />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Selected day */}
                    <section
                        aria-labelledby="attendance-selected-day"
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                        <p
                            id="attendance-selected-day"
                            className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                        >
                            {selectedDate === today
                                ? "Hoje"
                                : formatDate(selectedDate)}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-400">
                                    Entrada
                                </p>

                                <p className="mt-1 text-lg font-semibold text-[#002950]">
                                    {formatTime(
                                        attendance?.check_in ?? "-",
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400">
                                    Saída
                                </p>

                                <p className="mt-1 text-lg font-semibold text-[#002950]">
                                    {formatTime(
                                        attendance?.check_out ?? "-",
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <AttendanceStatusBadge
                                status={
                                    attendance?.status ??
                                    "Em falta"
                                }
                            />
                        </div>
                    </section>

                    {/* Monthly summary */}
                    <section
                        className="mt-5"
                        aria-labelledby="attendance-month-summary"
                    >
                        <h3
                            id="attendance-month-summary"
                            className="text-sm font-semibold text-[#002950]"
                        >
                            Resumo do mês
                        </h3>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <Stat
                                label="Dias registados"
                                value={recordedDays}
                            />

                            <Stat
                                label="Atrasos"
                                value={stats.Atrasado}
                            />

                            <Stat
                                label="Ausências"
                                value={stats.Ausente}
                            />

                            <Stat
                                label="Em falta"
                                value={stats["Em falta"]}
                            />
                        </div>
                    </section>

                    {/* History */}
                    <section
                        className="mt-6"
                        aria-labelledby="attendance-history"
                    >
                        <h3
                            id="attendance-history"
                            className="text-sm font-semibold text-[#002950]"
                        >
                            Histórico
                        </h3>

                        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
                            {mine.length === 0 ? (
                                <p className="p-4 text-sm text-slate-500">
                                    Sem registos neste mês.
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {mine.map((record) => (
                                        <div
                                            key={`${record.profileId}-${record.attendanceDate}`}
                                            className="flex items-center justify-between gap-3 px-4 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {formatDate(
                                                        record.attendanceDate,
                                                    )}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    {formatTime(
                                                        record.checkIn,
                                                    )}{" "}
                                                    —{" "}
                                                    {formatTime(
                                                        record.checkOut,
                                                    )}
                                                </p>
                                            </div>

                                            <AttendanceStatusBadge
                                                status={
                                                    record.status
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </aside>
        </div>
    );
}

function Stat({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-xl font-semibold text-[#002950]">
                {value}
            </p>
        </div>
    );
}