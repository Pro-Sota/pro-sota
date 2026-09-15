"use client";

import { useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Filter,
    MapPin,
    Plus,
    Search,
    Users,
    X,
} from "lucide-react";

type EventType =
    | "project"
    | "task"
    | "meeting"
    | "site_visit"
    | "deadline";

type CalendarEvent = {
    id: number;
    title: string;
    date: string;
    time: string;
    type: EventType;
    project?: string;
    location?: string;
    people?: string;
};

const eventStyles: Record<
    EventType,
    { label: string; className: string }
> = {
    project: {
        label: "Projecto",
        className: "bg-orange-50 text-orange-700 border-orange-100",
    },
    task: {
        label: "Tarefa",
        className: "bg-blue-50 text-blue-700 border-blue-100",
    },
    meeting: {
        label: "Reunião",
        className: "bg-purple-50 text-purple-700 border-purple-100",
    },
    site_visit: {
        label: "Visita à obra",
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    deadline: {
        label: "Prazo",
        className: "bg-red-50 text-red-700 border-red-100",
    },
};

const events: CalendarEvent[] = [
    {
        id: 1,
        title: "Reunião com cliente",
        date: "2026-09-15",
        time: "09:00",
        type: "meeting",
        project: "Villa Talatona",
        people: "3 participantes",
    },
    {
        id: 2,
        title: "Visita à obra",
        date: "2026-09-15",
        time: "11:30",
        type: "site_visit",
        project: "Residencial Kilamba",
        location: "Kilamba, Luanda",
    },
    {
        id: 3,
        title: "Entrega de plantas",
        date: "2026-09-16",
        time: "14:00",
        type: "deadline",
        project: "Casa Miramar",
    },
    {
        id: 4,
        title: "Revisão de projecto",
        date: "2026-09-17",
        time: "10:00",
        type: "project",
        project: "Edifício Maianga",
    },
    {
        id: 5,
        title: "Orçamento final",
        date: "2026-09-18",
        time: "16:00",
        type: "task",
        project: "Villa Talatona",
    },
    {
        id: 6,
        title: "Reunião da equipa",
        date: "2026-09-21",
        time: "08:30",
        type: "meeting",
        people: "8 participantes",
    },
];

const weekDays = [
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
    "Dom",
];

function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getCalendarDays(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const totalDays = lastDay.getDate();
    const days: Date[] = [];

    for (let i = 0; i < startDay; i++) {
        days.push(new Date(year, month, -startDay + i + 1));
    }

    for (let day = 1; day <= totalDays; day++) {
        days.push(new Date(year, month, day));
    }

    while (days.length < 52) {
        const nextDay = days.length - startDay - totalDays + 1;
        days.push(new Date(year, month + 1, nextDay));
    }

    return days;
}

export default function CalendarPageInit() {
    const today = new Date(2026, 8, 15);

    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );

    const [selectedDate, setSelectedDate] = useState(formatDateKey(today));

    const [activeFilter, setActiveFilter] = useState<EventType | "all">(
        "all",
    );

    const [search, setSearch] = useState("");

    const calendarDays = useMemo(
        () => getCalendarDays(currentDate),
        [currentDate],
    );

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesFilter =
                activeFilter === "all" || event.type === activeFilter;

            const searchValue = search.toLowerCase();

            const matchesSearch =
                !searchValue ||
                event.title.toLowerCase().includes(searchValue) ||
                event.project?.toLowerCase().includes(searchValue);

            return matchesFilter && matchesSearch;
        });
    }, [activeFilter, search]);

    const selectedEvents = filteredEvents.filter(
        (event) => event.date === selectedDate,
    );

    const upcomingEvents = [...filteredEvents]
        .filter((event) => event.date >= formatDateKey(today))
        .sort((a, b) => {
            return `${a.date}${a.time}`.localeCompare(
                `${b.date}${b.time}`,
            );
        })
        .slice(0, 5);

    const changeMonth = (amount: number) => {
        setCurrentDate(
            new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + amount,
                1,
            ),
        );
    };

    const goToday = () => {
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(formatDateKey(today));
    };

    const monthLabel = currentDate.toLocaleDateString("pt-AO", {
        month: "long",
        year: "numeric",
    });

    return (
        <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
                            <CalendarDays className="h-4 w-4" />
                            <span>Planeamento</span>
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
                            Calendário
                        </h1>

                        <p className="mt-1 text-sm text-neutral-500">
                            Acompanhe projectos, tarefas, reuniões e prazos.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        <Plus className="h-4 w-4" />
                        Novo evento
                    </button>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                        <p className="text-xs font-medium text-neutral-500">
                            Eventos este mês
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-neutral-950">
                            24
                        </p>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                        <p className="text-xs font-medium text-neutral-500">
                            Hoje
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-neutral-950">
                            2
                        </p>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                        <p className="text-xs font-medium text-neutral-500">
                            Próximos 7 dias
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-neutral-950">
                            9
                        </p>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                        <p className="text-xs font-medium text-neutral-500">
                            Prazos próximos
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-red-600">
                            3
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    {/* Main Calendar */}
                    <section className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white">
                        {/* Calendar Toolbar */}
                        <div className="flex flex-col gap-4 border-b border-neutral-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={goToday}
                                    className="h-9 rounded-lg border border-neutral-200 px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                                >
                                    Hoje
                                </button>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(-1)}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                        aria-label="Mês anterior"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => changeMonth(1)}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                                        aria-label="Próximo mês"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                <h2 className="ml-1 text-lg font-semibold capitalize text-neutral-950">
                                    {monthLabel}
                                </h2>
                            </div>

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Pesquisar eventos..."
                                    className="h-9 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 px-5 py-3">
                            <button
                                type="button"
                                onClick={() => setActiveFilter("all")}
                                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                    activeFilter === "all"
                                        ? "bg-neutral-950 text-white"
                                        : "text-neutral-500 hover:bg-neutral-100"
                                }`}
                            >
                                Todos
                            </button>

                            {(
                                Object.keys(eventStyles) as EventType[]
                            ).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setActiveFilter(type)}
                                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                        activeFilter === type
                                            ? "bg-neutral-950 text-white"
                                            : "text-neutral-500 hover:bg-neutral-100"
                                    }`}
                                >
                                    {eventStyles[type].label}
                                </button>
                            ))}
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 border-b border-neutral-200">
                            {weekDays.map((day) => (
                                <div
                                    key={day}
                                    className="border-r border-neutral-100 px-3 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-400 last:border-r-0"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map((date, index) => {
                                const dateKey = formatDateKey(date);
                                const isCurrentMonth =
                                    date.getMonth() === currentDate.getMonth();

                                const isToday =
                                    dateKey === formatDateKey(today);

                                const isSelected =
                                    dateKey === selectedDate;

                                const dayEvents = filteredEvents
                                    .filter(
                                        (event) => event.date === dateKey,
                                    )
                                    .slice(0, 3);

                                return (
                                    <button
                                        key={`${dateKey}-${index}`}
                                        type="button"
                                        onClick={() =>
                                            setSelectedDate(dateKey)
                                        }
                                        className={`group relative min-h-[120px] border-b border-r border-neutral-100 p-2 text-left transition hover:bg-neutral-50 ${
                                            !isCurrentMonth
                                                ? "bg-neutral-50/50"
                                                : "bg-white"
                                        } ${
                                            isSelected
                                                ? "ring-2 ring-inset ring-neutral-900"
                                                : ""
                                        }`}
                                    >
                                        <div className="mb-2 flex justify-end">
                                            <span
                                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                                                    isToday
                                                        ? "bg-neutral-950 text-white"
                                                        : isCurrentMonth
                                                          ? "text-neutral-700"
                                                          : "text-neutral-300"
                                                }`}
                                            >
                                                {date.getDate()}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            {dayEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    className={`truncate rounded-md border px-2 py-1.5 text-[10px] font-medium ${eventStyles[event.type].className}`}
                                                >
                                                    <span className="mr-1 opacity-70">
                                                        {event.time}
                                                    </span>
                                                    {event.title}
                                                </div>
                                            ))}

                                            {filteredEvents.filter(
                                                (event) =>
                                                    event.date === dateKey,
                                            ).length > 3 && (
                                                <div className="px-2 text-[10px] font-medium text-neutral-400">
                                                    +{" "}
                                                    {filteredEvents.filter(
                                                        (event) =>
                                                            event.date ===
                                                            dateKey,
                                                    ).length - 3}{" "}
                                                    mais
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Right Panel */}
                    <aside className="space-y-6">
                        {/* Selected day */}
                        <section className="rounded-2xl border border-neutral-200/80 bg-white p-5">
                            <div className="mb-5 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                        Agenda
                                    </p>

                                    <h3 className="mt-1 text-lg font-semibold capitalize text-neutral-950">
                                        {new Date(
                                            `${selectedDate}T12:00:00`,
                                        ).toLocaleDateString("pt-AO", {
                                            weekday: "long",
                                            day: "numeric",
                                            month: "long",
                                        })}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedDate("")}
                                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                                    aria-label="Limpar seleção"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {selectedEvents.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-8 text-center">
                                    <CalendarDays className="mx-auto h-7 w-7 text-neutral-300" />
                                    <p className="mt-2 text-sm font-medium text-neutral-600">
                                        Sem eventos
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                        Não existem eventos para este dia.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="rounded-xl border border-neutral-200 p-3"
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                                                    <Clock3 className="h-4 w-4 text-neutral-600" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-neutral-900">
                                                        {event.title}
                                                    </p>

                                                    <p className="mt-1 text-xs text-neutral-500">
                                                        {event.time}
                                                    </p>

                                                    {event.project && (
                                                        <p className="mt-2 text-xs text-neutral-500">
                                                            {event.project}
                                                        </p>
                                                    )}

                                                    <span
                                                        className={`mt-2 inline-flex rounded-md border px-2 py-1 text-[10px] font-medium ${eventStyles[event.type].className}`}
                                                    >
                                                        {
                                                            eventStyles[
                                                                event.type
                                                            ].label
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                type="button"
                                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                            >
                                <Plus className="h-4 w-4" />
                                Adicionar evento
                            </button>
                        </section>

                        {/* Upcoming */}
                        <section className="rounded-2xl border border-neutral-200/80 bg-white p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                                        Próximos
                                    </p>
                                    <h3 className="mt-1 text-lg font-semibold text-neutral-950">
                                        Próximos eventos
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                                    aria-label="Filtrar eventos"
                                >
                                    <Filter className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-1">
                                {upcomingEvents.map((event) => (
                                    <button
                                        type="button"
                                        key={event.id}
                                        onClick={() =>
                                            setSelectedDate(event.date)
                                        }
                                        className="flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-neutral-50"
                                    >
                                        <div className="flex w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-neutral-100">
                                            <span className="text-[9px] font-semibold uppercase text-neutral-400">
                                                {new Date(
                                                    `${event.date}T12:00:00`,
                                                ).toLocaleDateString(
                                                    "pt-AO",
                                                    {
                                                        month: "short",
                                                    },
                                                )}
                                            </span>

                                            <span className="text-base font-semibold text-neutral-900">
                                                {new Date(
                                                    `${event.date}T12:00:00`,
                                                ).getDate()}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-neutral-900">
                                                {event.title}
                                            </p>

                                            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                                                <Clock3 className="h-3 w-3" />
                                                {event.time}
                                            </div>

                                            {event.project && (
                                                <p className="mt-1 truncate text-xs text-neutral-500">
                                                    {event.project}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Quick summary */}
                        <section className="rounded-2xl border border-neutral-200/80 bg-neutral-950 p-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                    <CalendarDays className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        Esta semana
                                    </p>
                                    <p className="text-xs text-white/50">
                                        15 — 21 Setembro
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-white/5 p-3">
                                    <p className="text-xl font-semibold">
                                        9
                                    </p>
                                    <p className="mt-1 text-xs text-white/50">
                                        eventos
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white/5 p-3">
                                    <p className="text-xl font-semibold">
                                        3
                                    </p>
                                    <p className="mt-1 text-xs text-white/50">
                                        projectos
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}