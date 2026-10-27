"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerManualCheckInAction } from "@/actions/attendance";

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

    const router = useRouter();
    const [arrivalTime, setArrivalTime] = useState("");
    const [savingArrival, setSavingArrival] = useState(false);
    const [arrivalError, setArrivalError] = useState<string | null>(null);
    const [arrivalSuccess, setArrivalSuccess] = useState(false);

    async function handleManualCheckIn() {
        if (!arrivalTime || savingArrival) return;

        setSavingArrival(true);
        setArrivalError(null);
        setArrivalSuccess(false);

        try {
            await registerManualCheckInAction(
                profile!.profile_id,
                selectedDate,
                arrivalTime,
            );

            setArrivalSuccess(true);
            setArrivalTime("");
            router.refresh();
        } catch (error) {
            setArrivalError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível registar a entrada.",
            );
        } finally {
            setSavingArrival(false);
        }
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
                        className="mt-5"
                        aria-labelledby="attendance-manual-entry"
                    >
                        <h3
                            id="attendance-manual-entry"
                            className="text-sm font-semibold text-[#002950]"
                        >
                            Registar entrada manualmente
                        </h3>

                        {attendance?.check_in ? (
                            <p className="mt-2 text-sm text-slate-500">
                                A entrada já está registada. Para evitar alterações acidentais,
                                não pode ser substituída por este formulário.
                            </p>
                        ) : attendance?.status === "Ausente" ? (
                            <p className="mt-2 text-sm text-red-600">
                                O colaborador está marcado como ausente. Corrija o estado antes
                                de registar a entrada.
                            </p>
                        ) : selectedDate > today ? (
                            <p className="mt-2 text-sm text-slate-500">
                                Não é possível registar entradas para datas futuras.
                            </p>
                        ) : (
                            <form
                                className="mt-3 space-y-3 rounded-xl border border-slate-200 p-3"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handleManualCheckIn();
                                }}
                            >
                                <label
                                    htmlFor="attendance-arrival-time"
                                    className="block text-xs font-medium text-slate-600"
                                >
                                    Hora de chegada
                                </label>

                                <div className="flex items-center gap-2">
                                    <input
                                        id="attendance-arrival-time"
                                        type="time"
                                        required
                                        value={arrivalTime}
                                        onChange={(event) => {
                                            setArrivalTime(event.target.value);
                                            setArrivalError(null);
                                            setArrivalSuccess(false);
                                        }}
                                        disabled={savingArrival}
                                        className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#002950] outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/20 disabled:opacity-50"
                                    />

                                    <button
                                        type="submit"
                                        disabled={!arrivalTime || savingArrival}
                                        className="inline-flex items-center justify-center rounded-lg bg-[#002950] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {savingArrival ? "A registar..." : "Registar"}
                                    </button>
                                </div>

                                <p className="text-xs text-slate-400">
                                    A hora será interpretada no fuso horário de Luanda.
                                </p>

                                {arrivalError && (
                                    <p role="alert" className="text-sm text-red-600">
                                        {arrivalError}
                                    </p>
                                )}

                                {arrivalSuccess && (
                                    <p role="status" className="text-sm text-emerald-700">
                                        Entrada registada com sucesso.
                                    </p>
                                )}
                            </form>
                        )}
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