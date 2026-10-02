import { ArrowRight, LogIn, LogOut } from "lucide-react";
import type {
    AttendanceActionLoading,
    AttendanceRecord,
    Profile,
} from "../types";
import AttendanceActions from "./attendance_actions";
import AttendanceStatusBadge from "./attendance_status_badge";
import {
    formatTime,
    getInitials,
} from "../utils/attendance_dates";

type AttendanceMobileCardProps = {
    profile: Profile;
    record: AttendanceRecord | null;
    loading: AttendanceActionLoading;
    onOpen: () => void;
    onCheckIn: (id: string) => Promise<void>;
    onCheckOut: (id: string) => Promise<void>;
    onMarkLate: (id: string) => Promise<void>;
    onMarkAbsent: (id: string) => Promise<void>;
    isFuture?: boolean;
};

export default function AttendanceMobileCard({
    profile,
    record,
    loading,
    onOpen,
    onCheckIn,
    onCheckOut,
    onMarkLate,
    onMarkAbsent,
    isFuture = false,
}: AttendanceMobileCardProps) {
    const name =
        `${profile.first_name} ${profile.last_name}`.trim();

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <button
                type="button"
                onClick={onOpen}
                className="flex w-full items-center justify-between gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#BD9655]/30"
                aria-label={`Ver detalhes de presença de ${name}`}
            >
                <div className="flex min-w-0 items-center gap-3">
                    {profile.profile_picture ? (
                        <img
                            src={profile.profile_picture}
                            alt={name}
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                    ) : (
                        <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#002950]/10 text-xs font-semibold text-[#002950]"
                            aria-hidden="true"
                        >
                            {getInitials(
                                profile.first_name,
                                profile.last_name,
                            )}
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#002950]">
                            {name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                            {profile.job_title ?? "—"}
                            {profile.department
                                ? ` · ${profile.department}`
                                : ""}
                        </p>
                    </div>
                </div>

                <ArrowRight
                    className="h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden="true"
                />
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Entrada
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatTime(record?.check_in ?? null)}
                    </p>
                </div>

                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Saída
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatTime(record?.check_out ?? null)}
                    </p>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
                <AttendanceStatusBadge
                    status={record?.status ?? "Em falta"}
                />

                <div
                    className="flex min-w-0 items-center gap-2 text-xs text-slate-400"
                    aria-label="Registos"
                >
                    {record?.check_in ? (
                        <LogIn
                            className="h-3.5 w-3.5"
                            aria-label="Entrada registada"
                        />
                    ) : null}

                    {record?.check_out ? (
                        <LogOut
                            className="h-3.5 w-3.5"
                            aria-label="Saída registada"
                        />
                    ) : null}
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <AttendanceActions
                    profile={profile}
                    record={record}
                    loading={loading}
                    onCheckIn={onCheckIn}
                    onCheckOut={onCheckOut}
                    onMarkLate={onMarkLate}
                    onMarkAbsent={onMarkAbsent}
                    isFuture={isFuture}
                />
            </div>
        </article>
    );
}