"use client";

import { useMemo, useState } from "react";
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Search,
    Users,
    XCircle,
} from "lucide-react";

type AttendanceStatus =
    | "Presente"
    | "Ausente"
    | "Atrasado"
    | "Em falta";

type AttendanceRecord = {
    id: string;
    name: string;
    role: string;
    checkIn: string | null;
    checkOut: string | null;
    status: AttendanceStatus;
};

const attendanceData: AttendanceRecord[] = [
    {
        id: "1",
        name: "João Manuel",
        role: "Architect",
        checkIn: "08:12",
        checkOut: null,
        status: "Atrasado",
    },
    {
        id: "2",
        name: "Ana Silva",
        role: "Project Manager",
        checkIn: "07:54",
        checkOut: null,
        status: "Presente",
    },
    {
        id: "3",
        name: "Carlos Pedro",
        role: "Engineer",
        checkIn: "08:01",
        checkOut: null,
        status: "Presente",
    },
    {
        id: "4",
        name: "Maria José",
        role: "Architect",
        checkIn: null,
        checkOut: null,
        status: "Ausente",
    },
    {
        id: "5",
        name: "Paulo António",
        role: "Coordinator",
        checkIn: "08:27",
        checkOut: null,
        status: "Atrasado",
    },
    {
        id: "6",
        name: "Marta Francisco",
        role: "Architect",
        checkIn: null,
        checkOut: null,
        status: "Em falta",
    },
];

const statusStyles: Record<AttendanceStatus, string> = {
    Presente:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    Ausente:
        "border-red-200 bg-red-50 text-red-700",
    Atrasado:
        "border-amber-200 bg-amber-50 text-amber-700",
    "Em falta":
        "border-neutral-200 bg-neutral-100 text-neutral-600",
};

export default function Attendance() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "Todos" | AttendanceStatus
    >("Todos");

    const filteredAttendance = useMemo(() => {
        return attendanceData.filter((person) => {
            const matchesSearch =
                person.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                person.role
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "Todos" ||
                person.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [search, statusFilter]);

    const presentCount = attendanceData.filter(
        (person) => person.status === "Presente"
    ).length;

    const lateCount = attendanceData.filter(
        (person) => person.status === "Atrasado"
    ).length;

    const absentCount = attendanceData.filter(
        (person) =>
            person.status === "Ausente" ||
            person.status === "Em falta"
    ).length;

    return (
        <div className="space-y-6 my-4 mx-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                            {new Intl.DateTimeFormat("pt-AO", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            }).format(new Date())}
                        </span>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight text-[#002950]">
                        Presença
                    </h1>

                    <p className="mt-1 text-sm text-neutral-500">
                        Acompanhe a presença e os horários da equipa.
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#002950] px-4 text-sm font-medium text-white transition hover:bg-[#003b70]"
                >
                    <Clock3 className="h-4 w-4" />
                    Registar presença
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    label="Total da equipa"
                    value={attendanceData.length}
                    icon={Users}
                    description="Membros registados"
                />

                <SummaryCard
                    label="Presentes"
                    value={presentCount}
                    icon={CheckCircle2}
                    description="A trabalhar hoje"
                />

                <SummaryCard
                    label="Atrasados"
                    value={lateCount}
                    icon={Clock3}
                    description="Após o horário previsto"
                />

                <SummaryCard
                    label="Ausentes"
                    value={absentCount}
                    icon={XCircle}
                    description="Sem registo de entrada"
                />
            </div>

            {/* Attendance table */}
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-[#002950]">
                            Registos de hoje
                        </h2>
                        <p className="mt-0.5 text-xs text-neutral-500">
                            Estado de presença da equipa.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Pesquisar membro..."
                                className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#BD9655] focus:bg-white sm:w-64"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value as
                                        | "Todos"
                                        | AttendanceStatus
                                )
                            }
                            className="h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-700 outline-none focus:border-[#BD9655] focus:bg-white"
                        >
                            <option value="Todos">Todos os estados</option>
                            <option value="Presente">Presentes</option>
                            <option value="Atrasado">Atrasados</option>
                            <option value="Ausente">Ausentes</option>
                            <option value="Em falta">Em falta</option>
                        </select>
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50/70">
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                                    Membro
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                                    Função
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                                    Entrada
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                                    Saída
                                </th>
                                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
                                    Estado
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-100">
                            {filteredAttendance.map((person) => (
                                <tr
                                    key={person.id}
                                    className="transition hover:bg-neutral-50/70"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002950]/10 text-sm font-semibold text-[#002950]">
                                                {person.name
                                                    .split(" ")
                                                    .map((name) => name[0])
                                                    .slice(0, 2)
                                                    .join("")}
                                            </div>

                                            <span className="text-sm font-medium text-neutral-800">
                                                {person.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-neutral-500">
                                        {person.role}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-neutral-700">
                                        {person.checkIn ?? "—"}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-neutral-500">
                                        {person.checkOut ?? "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[person.status]}`}
                                        >
                                            {person.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-neutral-100 md:hidden">
                    {filteredAttendance.map((person) => (
                        <div
                            key={person.id}
                            className="space-y-4 p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#002950]/10 text-sm font-semibold text-[#002950]">
                                        {person.name
                                            .split(" ")
                                            .map((name) => name[0])
                                            .slice(0, 2)
                                            .join("")}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-neutral-800">
                                            {person.name}
                                        </p>

                                        <p className="truncate text-xs text-neutral-500">
                                            {person.role}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[person.status]}`}
                                >
                                    {person.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-3">
                                <div>
                                    <p className="text-xs text-neutral-400">
                                        Entrada
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-neutral-700">
                                        {person.checkIn ?? "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-neutral-400">
                                        Saída
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-neutral-700">
                                        {person.checkOut ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAttendance.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <Users className="mx-auto h-8 w-8 text-neutral-300" />

                        <p className="mt-3 text-sm font-medium text-neutral-700">
                            Nenhum registo encontrado
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                            Tente alterar a pesquisa ou o filtro.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon: Icon,
    description,
}: {
    label: string;
    value: number;
    icon: typeof Users;
    description: string;
}) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-neutral-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[#002950]">
                        {value}
                    </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                    <Icon className="h-4 w-4 text-[#002950]" />
                </div>
            </div>

            <p className="mt-3 text-xs text-neutral-400">
                {description}
            </p>
        </div>
    );
}
