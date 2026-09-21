"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Search,
    Users,
    XCircle,
} from "lucide-react";

import type {
    AttendanceProfile,
    AttendanceStatus,
    AttendanceWithProfile,
} from "@/services/attendance";

type ViewMode = "day" | "month";

type Profile = AttendanceProfile;

type AttendanceRecord = AttendanceWithProfile;

type MonthlyAttendanceRecord = {
    profileId: string;
    attendanceDate: string;
    checkIn: string | null;
    checkOut: string | null;
    status: AttendanceStatus;
};

type StatusFilter = "Todos" | AttendanceStatus;

type AttendanceProps = {
    profiles: Profile[];
    attendanceRecords: AttendanceRecord[];
    monthlyRecords: MonthlyAttendanceRecord[];
    selectedDate: string;
    selectedMonth: string;
    view: ViewMode;
    onCheckIn: (profileId: string) => Promise<void>;
    onCheckOut: (profileId: string) => Promise<void>;
};

const statusLabels: Record<AttendanceStatus, string> = {
    Presente: "Presente",
    Ausente: "Ausente",
    Atrasado: "Atrasado",
    "Em falta": "Em falta",
};

const monthFormatter = new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    year: "numeric",
});

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
});

function getInitials(
    firstName: string,
    lastName: string,
): string {
    return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`
        .toUpperCase()
        .trim();
}

function formatTime(value: string | null): string {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return timeFormatter.format(date);
}

function formatDate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return dateFormatter.format(parsed);
}

function getMonthLabel(month: string): string {
    const [year, monthNumber] = month.split("-").map(Number);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(monthNumber)
    ) {
        return month;
    }

    const date = new Date(year, monthNumber - 1, 1);

    return monthFormatter.format(date).replace(/^./, (char) =>
        char.toUpperCase(),
    );
}

function getMonthDays(month: string): string[] {
    const [year, monthNumber] = month.split("-").map(Number);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(monthNumber) ||
        monthNumber < 1 ||
        monthNumber > 12
    ) {
        return [];
    }

    const daysInMonth = new Date(
        year,
        monthNumber,
        0,
    ).getDate();

    return Array.from(
        { length: daysInMonth },
        (_, index) =>
            `${year}-${String(monthNumber).padStart(2, "0")}-${String(
                index + 1,
            ).padStart(2, "0")}`,
    );
}

function getPreviousMonth(month: string): string {
    const [year, monthNumber] = month.split("-").map(Number);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(monthNumber)
    ) {
        return month;
    }

    const date = new Date(
        year,
        monthNumber - 2,
        1,
    );

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1,
    ).padStart(2, "0")}`;
}

function getNextMonth(month: string): string {
    const [year, monthNumber] = month.split("-").map(Number);

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(monthNumber)
    ) {
        return month;
    }

    const date = new Date(
        year,
        monthNumber,
        1,
    );

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1,
    ).padStart(2, "0")}`;
}

function getTodayDate(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Luanda",
    }).format(new Date());
}

function getStatusClasses(
    status: AttendanceStatus,
): string {
    switch (status) {
        case "Presente":
            return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";

        case "Atrasado":
            return "bg-amber-50 text-amber-700 ring-amber-600/10";

        case "Ausente":
            return "bg-red-50 text-red-700 ring-red-600/10";

        case "Em falta":
        default:
            return "bg-slate-100 text-slate-600 ring-slate-500/10";
    }
}

function getStatusDotClasses(
    status: AttendanceStatus,
): string {
    switch (status) {
        case "Presente":
            return "bg-emerald-500";

        case "Atrasado":
            return "bg-amber-500";

        case "Ausente":
            return "bg-red-500";

        case "Em falta":
        default:
            return "bg-slate-300";
    }
}

function isFutureDate(date: string): boolean {
    return date > getTodayDate();
}

export default function Attendance({
    profiles,
    attendanceRecords,
    monthlyRecords,
    selectedDate,
    selectedMonth,
    view,
    onCheckIn,
    onCheckOut,
}: AttendanceProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("Todos");
    const [areaFilter, setAreaFilter] =
        useState<string>("Todas as áreas");
    const [actionLoading, setActionLoading] =
        useState<string | null>(null);

    const areas = useMemo(() => {
        const values = profiles
            .map((profile) => profile.department?.trim())
            .filter(
                (department): department is string =>
                    Boolean(department),
            );

        return Array.from(new Set(values)).sort((a, b) =>
            a.localeCompare(b, "pt"),
        );
    }, [profiles]);

    const attendanceByProfile = useMemo(() => {
        const map = new Map<string, AttendanceRecord>();

        for (const record of attendanceRecords) {
            map.set(record.profile_id, record);
        }

        return map;
    }, [attendanceRecords]);

    const monthlyAttendanceMap = useMemo(() => {
        const map = new Map<
            string,
            MonthlyAttendanceRecord
        >();

        for (const record of monthlyRecords) {
            map.set(
                `${record.profileId}-${record.attendanceDate}`,
                record,
            );
        }

        return map;
    }, [monthlyRecords]);

    const filteredProfiles = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLowerCase();

        return profiles.filter((profile) => {
            const fullName =
                `${profile.first_name} ${profile.last_name}`
                    .trim()
                    .toLowerCase();

            const jobTitle =
                profile.job_title?.toLowerCase() ?? "";

            const department =
                profile.department?.toLowerCase() ?? "";

            const matchesSearch =
                !normalizedSearch ||
                fullName.includes(normalizedSearch) ||
                jobTitle.includes(normalizedSearch) ||
                department.includes(normalizedSearch);

            const matchesArea =
                areaFilter === "Todas as áreas" ||
                profile.department === areaFilter;

            const record =
                attendanceByProfile.get(profile.profile_id);

            const matchesStatus =
                statusFilter === "Todos" ||
                record?.status === statusFilter;

            return (
                matchesSearch &&
                matchesArea &&
                matchesStatus
            );
        });
    }, [
        profiles,
        search,
        areaFilter,
        statusFilter,
        attendanceByProfile,
    ]);

    const daySummary = useMemo(() => {
        const summary: Record<
            AttendanceStatus,
            number
        > = {
            Presente: 0,
            Ausente: 0,
            Atrasado: 0,
            "Em falta": 0,
        };

        for (const profile of filteredProfiles) {
            const record =
                attendanceByProfile.get(
                    profile.profile_id,
                );

            if (record) {
                summary[record.status] += 1;
            } else {
                summary["Em falta"] += 1;
            }
        }

        return summary;
    }, [
        filteredProfiles,
        attendanceByProfile,
    ]);

    const monthDays = useMemo(
        () => getMonthDays(selectedMonth),
        [selectedMonth],
    );

    function updateUrl(
        values: Record<
            string,
            string | null
        >,
    ) {
        const params = new URLSearchParams(
            searchParams.toString(),
        );

        for (const [key, value] of Object.entries(
            values,
        )) {
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }

        router.push(
            `/management/attendance?${params.toString()}`,
        );
    }

    function changeView(nextView: ViewMode) {
        if (nextView === "month") {
            updateUrl({
                view: "month",
                month: selectedMonth,
                date: null,
            });

            return;
        }

        updateUrl({
            view: "day",
            date: selectedDate,
            month: null,
        });
    }

    function changeMonth(month: string) {
        updateUrl({
            view: "month",
            month,
            date: null,
        });
    }

    function goToPreviousMonth() {
        changeMonth(
            getPreviousMonth(selectedMonth),
        );
    }

    function goToNextMonth() {
        changeMonth(
            getNextMonth(selectedMonth),
        );
    }

    function goToCurrentMonth() {
        const today = getTodayDate();

        updateUrl({
            view: "month",
            month: today.slice(0, 7),
            date: null,
        });
    }

    function goToToday() {
        updateUrl({
            view: "day",
            date: getTodayDate(),
            month: null,
        });
    }

    async function handleCheckIn(profileId: string) {
        setActionLoading(
            `check-in-${profileId}`,
        );

        try {
            await onCheckIn(profileId);
            router.refresh();
        } finally {
            setActionLoading(null);
        }
    }

    async function handleCheckOut(profileId: string) {
        setActionLoading(
            `check-out-${profileId}`,
        );

        try {
            await onCheckOut(profileId);
            router.refresh();
        } finally {
            setActionLoading(null);
        }
    }

    function renderAttendanceAction(
        profile: Profile,
    ) {
        const record =
            attendanceByProfile.get(
                profile.profile_id,
            );

        if (!record?.check_in) {
            const loading =
                actionLoading ===
                `check-in-${profile.profile_id}`;

            return (
                <button
                    type="button"
                    onClick={() =>
                        handleCheckIn(
                            profile.profile_id,
                        )
                    }
                    disabled={loading}
                    aria-label={`Registar entrada de ${profile.first_name} ${profile.last_name}`}
                    className="inline-flex items-center justify-center rounded-lg border border-[#BD9655] px-3 py-2 text-xs font-semibold text-[#BD9655] transition hover:bg-[#BD9655] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "A registar..."
                        : "Registar entrada"}
                </button>
            );
        }

        if (!record.check_out) {
            const loading =
                actionLoading ===
                `check-out-${profile.profile_id}`;

            return (
                <button
                    type="button"
                    onClick={() =>
                        handleCheckOut(
                            profile.profile_id,
                        )
                    }
                    disabled={loading}
                    aria-label={`Registar saída de ${profile.first_name} ${profile.last_name}`}
                    className="inline-flex items-center justify-center rounded-lg bg-[#BD9655] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#a98245] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "A registar..."
                        : "Registar saída"}
                </button>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Dia concluído
            </span>
        );
    }

    return (
        <div className="min-h-full bg-[#F7F7F5] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-[#BD9655]">
                            <Clock3 className="h-4 w-4" />
                            Presença
                        </div>

                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#002950]">
                            Registo de presença
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Consulte e registe a presença da equipa.
                        </p>
                    </div>

                    <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() =>
                                changeView("day")
                            }
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                view === "day"
                                    ? "bg-[#002950] text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            Hoje
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                changeView("month")
                            }
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                view === "month"
                                    ? "bg-[#002950] text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            Mês
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Equipa
                            </span>

                            <Users className="h-5 w-5 text-[#BD9655]" />
                        </div>

                        <p className="mt-3 text-2xl font-semibold text-[#002950]">
                            {filteredProfiles.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Presentes
                            </span>

                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>

                        <p className="mt-3 text-2xl font-semibold text-[#002950]">
                            {daySummary.Presente}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Atrasados
                            </span>

                            <Clock3 className="h-5 w-5 text-amber-600" />
                        </div>

                        <p className="mt-3 text-2xl font-semibold text-[#002950]">
                            {daySummary.Atrasado}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                                Em falta
                            </span>

                            <XCircle className="h-5 w-5 text-red-500" />
                        </div>

                        <p className="mt-3 text-2xl font-semibold text-[#002950]">
                            {daySummary["Em falta"]}
                        </p>
                    </div>
                </div>

                <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative w-full xl:max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                                placeholder="Pesquisar membro, cargo ou área..."
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                            />
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <select
                                value={areaFilter}
                                onChange={(event) =>
                                    setAreaFilter(
                                        event.target.value,
                                    )
                                }
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                                aria-label="Filtrar por área"
                            >
                                <option>
                                    Todas as áreas
                                </option>

                                {areas.map((area) => (
                                    <option
                                        key={area}
                                        value={area}
                                    >
                                        {area}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target
                                            .value as StatusFilter,
                                    )
                                }
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#BD9655] focus:ring-2 focus:ring-[#BD9655]/15"
                                aria-label="Filtrar por estado"
                            >
                                <option value="Todos">
                                    Todos os estados
                                </option>

                                <option value="Presente">
                                    Presente
                                </option>

                                <option value="Atrasado">
                                    Atrasado
                                </option>

                                <option value="Ausente">
                                    Ausente
                                </option>

                                <option value="Em falta">
                                    Em falta
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {view === "day" ? (
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold text-[#002950]">
                                    {selectedDate ===
                                    getTodayDate()
                                        ? "Presença de hoje"
                                        : formatDate(
                                              selectedDate,
                                          )}
                                </h2>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    {formatDate(
                                        selectedDate,
                                    )}
                                </p>
                            </div>

                            {selectedDate !==
                                getTodayDate() && (
                                <button
                                    type="button"
                                    onClick={
                                        goToToday
                                    }
                                    className="text-sm font-semibold text-[#BD9655] hover:underline"
                                >
                                    Voltar a hoje
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Membro
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Área
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Entrada
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Saída
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Estado
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Acção
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredProfiles.map(
                                        (profile) => {
                                            const record =
                                                attendanceByProfile.get(
                                                    profile.profile_id,
                                                );

                                            const status =
                                                record?.status ??
                                                "Em falta";

                                            return (
                                                <tr
                                                    key={
                                                        profile.profile_id
                                                    }
                                                    className="transition hover:bg-slate-50/70"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {profile.profile_picture ? (
                                                                <img
                                                                    src={
                                                                        profile.profile_picture
                                                                    }
                                                                    alt={`${profile.first_name} ${profile.last_name}`}
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002950]/10 text-xs font-semibold text-[#002950]">
                                                                    {getInitials(
                                                                        profile.first_name,
                                                                        profile.last_name,
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold text-[#002950]">
                                                                    {
                                                                        profile.first_name
                                                                    }{" "}
                                                                    {
                                                                        profile.last_name
                                                                    }
                                                                </p>

                                                                <p className="truncate text-xs text-slate-500">
                                                                    {profile.job_title ??
                                                                        "—"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {profile.department ??
                                                            "—"}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                        {formatTime(
                                                            record?.check_in ??
                                                                null,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                        {formatTime(
                                                            record?.check_out ??
                                                                null,
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
                                                                status,
                                                            )}`}
                                                        >
                                                            {
                                                                statusLabels[
                                                                    status
                                                                ]
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        {renderAttendanceAction(
                                                            profile,
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredProfiles.length ===
                            0 && (
                            <div className="px-5 py-12 text-center">
                                <Users className="mx-auto h-8 w-8 text-slate-300" />

                                <p className="mt-3 text-sm font-medium text-slate-600">
                                    Nenhum membro encontrado.
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Ajuste a pesquisa ou os
                                    filtros.
                                </p>
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={
                                        goToPreviousMonth
                                    }
                                    aria-label="Mês anterior"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#BD9655] hover:text-[#BD9655]"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="min-w-[170px] text-center">
                                    <h2 className="font-semibold text-[#002950]">
                                        {getMonthLabel(
                                            selectedMonth,
                                        )}
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        {monthlyRecords.length}{" "}
                                        registos
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        goToNextMonth
                                    }
                                    aria-label="Mês seguinte"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#BD9655] hover:text-[#BD9655]"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            {selectedMonth !==
                                getTodayDate().slice(
                                    0,
                                    7,
                                ) && (
                                <button
                                    type="button"
                                    onClick={
                                        goToCurrentMonth
                                    }
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

                                        {monthDays.map(
                                            (day) => {
                                                const dayNumber =
                                                    Number(
                                                        day.slice(
                                                            -2,
                                                        ),
                                                    );

                                                const isToday =
                                                    day ===
                                                    getTodayDate();

                                                return (
                                                    <th
                                                        key={
                                                            day
                                                        }
                                                        className={`min-w-[48px] border-b border-slate-200 px-2 py-3 text-center text-xs font-semibold ${
                                                            isToday
                                                                ? "bg-[#BD9655]/10 text-[#BD9655]"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        {dayNumber}
                                                    </th>
                                                );
                                            },
                                        )}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredProfiles.map(
                                        (profile) => (
                                            <tr
                                                key={
                                                    profile.profile_id
                                                }
                                                className="group"
                                            >
                                                <td className="sticky left-0 z-10 min-w-[220px] border-r border-slate-200 bg-white px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {profile.profile_picture ? (
                                                            <img
                                                                src={
                                                                    profile.profile_picture
                                                                }
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
                                                                {
                                                                    profile.first_name
                                                                }{" "}
                                                                {
                                                                    profile.last_name
                                                                }
                                                            </p>

                                                            <p className="truncate text-xs text-slate-500">
                                                                {profile.job_title ??
                                                                    "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="sticky left-[220px] z-10 min-w-[150px] border-r border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                                                    {profile.department ??
                                                        "—"}
                                                </td>

                                                {monthDays.map(
                                                    (day) => {
                                                        const record =
                                                            monthlyAttendanceMap.get(
                                                                `${profile.profile_id}-${day}`,
                                                            );

                                                        const future =
                                                            isFutureDate(
                                                                day,
                                                            );

                                                        return (
                                                            <td
                                                                key={
                                                                    day
                                                                }
                                                                className={`border-slate-100 px-2 py-3 text-center ${
                                                                    day ===
                                                                    getTodayDate()
                                                                        ? "bg-[#BD9655]/5"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {future ? (
                                                                    <span
                                                                        className="mx-auto block h-2 w-2 rounded-full bg-slate-100"
                                                                        title="Data futura"
                                                                    />
                                                                ) : record ? (
                                                                    <span
                                                                        className={`mx-auto block h-2.5 w-2.5 rounded-full ${getStatusDotClasses(
                                                                            record.status,
                                                                        )}`}
                                                                        title={`${statusLabels[record.status]} — ${day}`}
                                                                    />
                                                                ) : (
                                                                    <span
                                                                        className="mx-auto block h-2.5 w-2.5 rounded-full border border-slate-300 bg-white"
                                                                        title={`Sem registo — ${day}`}
                                                                    />
                                                                )}
                                                            </td>
                                                        );
                                                    },
                                                )}
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredProfiles.length ===
                            0 && (
                            <div className="px-5 py-12 text-center">
                                <Users className="mx-auto h-8 w-8 text-slate-300" />

                                <p className="mt-3 text-sm font-medium text-slate-600">
                                    Nenhum membro encontrado.
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Ajuste a pesquisa ou os
                                    filtros.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-5 border-t border-slate-200 px-5 py-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                Presente
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                Atrasado
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                Ausente
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" />
                                Sem registo
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-slate-100" />
                                Data futura
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}