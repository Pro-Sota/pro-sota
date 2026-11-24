
"use client";

import {
    Activity,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Filter,
    Plus,
    Search,
    Settings2,
    ShieldCheck,
    Trash2,
    Upload,
    UserPlus,
    CalendarDays,
    X,
} from "lucide-react";
import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";

export type ActivityLog = {
    activity_id: string;
    user_id: string | null;
    project_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string | null;
    description: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
};

export type ActivityProfile = {
    profile_id: string;
    first_name: string | null;
    last_name: string | null;
};

type Props = {
    activities: ActivityLog[];
    profiles: ActivityProfile[];
    totalCount: number;
};

const PAGE_SIZE = 25;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const MODULE_LABELS: Record<string, string> = {
    project: "Projectos",
    task: "Tarefas",
    client: "Clientes",
    lead: "Leads",
    document: "Documentos",
    supplier: "Fornecedores",
    team: "Equipa",
    profile: "Utilizadores",
    attendance: "Presença",
    calendar: "Calendário",
    resource: "Recursos",
    comment: "Comentários",
    system: "Sistema",
};

const ACTION_LABELS: Record<string, string> = {
    created: "Criado",
    updated: "Actualizado",
    deleted: "Eliminado",
    completed: "Concluído",
    uploaded: "Carregado",
    added: "Adicionado",
    removed: "Removido",
    assigned: "Atribuído",
    status_changed: "Estado alterado",
    member_added: "Membro adicionado",
    member_removed: "Membro removido",
    login: "Iniciou sessão",
    logout: "Terminou sessão",
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Luanda",
});

const TIME_FORMAT = new Intl.DateTimeFormat("pt-AO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Luanda",
});

function getLuandaDate(date: Date): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Africa/Luanda",
    }).formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
}

function getActionIcon(action: string) {
    if (action.includes("created")) return Plus;
    if (action.includes("deleted")) return Trash2;
    if (action.includes("completed")) return CheckCircle2;
    if (action.includes("uploaded")) return Upload;
    if (action.includes("member") || action.includes("added")) return UserPlus;
    if (action.includes("status")) return ArrowUpRight;
    if (action.includes("updated")) return Settings2;
    if (action.includes("login") || action.includes("logout")) return ShieldCheck;

    return Activity;
}

function getActionLabel(action: string) {
    return (
        ACTION_LABELS[action] ??
        action.replaceAll("_", " ").replace(/^./, (char) => char.toUpperCase())
    );
}

function getModuleLabel(module: string) {
    return MODULE_LABELS[module] ?? module.replaceAll("_", " ");
}

function getInitials(name: string) {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "U"
    );
}

function getPageNumbers(current: number, total: number) {
    const pages: (number | "ellipsis")[] = [];

    if (total <= 5) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(current - 2, total - 4));
    const end = Math.min(total, start + 4);

    if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("ellipsis");
    }

    for (let page = start; page <= end; page++) {
        pages.push(page);
    }

    if (end < total) {
        if (end < total - 1) pages.push("ellipsis");
        pages.push(total);
    }

    return pages;
}

export default function ActivityClient({
    activities,
    profiles,
    totalCount,
}: Props) {
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [actionFilter, setActionFilter] = useState("all");
    const [periodFilter, setPeriodFilter] = useState("all");
    const [page, setPage] = useState(1);

    const profileMap = useMemo(() => {
        return new Map(
            profiles.map((profile) => [
                profile.profile_id,
                [profile.first_name, profile.last_name]
                    .filter(Boolean)
                    .join(" ") || "Utilizador",
            ]),
        );
    }, [profiles]);

    const modules = useMemo(
        () => [
            ...new Set(
                activities
                    .map((item) => item.entity_type)
                    .filter(Boolean),
            ),
        ].sort(),
        [activities],
    );

    const actions = useMemo(
        () => [
            ...new Set(
                activities
                    .map((item) => item.action)
                    .filter(Boolean),
            ),
        ].sort(),
        [activities],
    );

    const today = getLuandaDate(new Date());

    const todayCount = useMemo(() => {
        return activities.filter((item) => {
            const date = new Date(item.created_at);

            return (
                !Number.isNaN(date.getTime()) &&
                getLuandaDate(date) === today
            );
        }).length;
    }, [activities, today]);

    const weekCount = useMemo(() => {
        const now = Date.now();

        return activities.filter((item) => {
            const timestamp = new Date(item.created_at).getTime();

            if (!Number.isFinite(timestamp)) return false;

            const age = now - timestamp;

            return age >= 0 && age <= 7 * DAY_IN_MS;
        }).length;
    }, [activities]);

    const filteredActivities = useMemo(() => {
        const query = search.trim().toLowerCase();
        const now = Date.now();

        return activities.filter((item) => {
            const userName = item.user_id
                ? profileMap.get(item.user_id) ?? "Utilizador"
                : "Utilizador removido";

            const moduleLabel = getModuleLabel(item.entity_type);
            const actionLabel = getActionLabel(item.action);

            const searchable = [
                item.description,
                item.action,
                actionLabel,
                item.entity_type,
                moduleLabel,
                item.entity_id,
                item.project_id,
                item.user_id,
                userName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (query && !searchable.includes(query)) return false;

            if (
                moduleFilter !== "all" &&
                item.entity_type !== moduleFilter
            ) {
                return false;
            }

            if (
                actionFilter !== "all" &&
                item.action !== actionFilter
            ) {
                return false;
            }

            const activityDate = new Date(item.created_at);
            const timestamp = activityDate.getTime();

            if (!Number.isFinite(timestamp)) return false;

            const age = now - timestamp;

            if (age < 0) return false;

            if (
                periodFilter === "today" &&
                getLuandaDate(activityDate) !== today
            ) {
                return false;
            }

            if (
                periodFilter === "7days" &&
                age > 7 * DAY_IN_MS
            ) {
                return false;
            }

            if (
                periodFilter === "30days" &&
                age > 30 * DAY_IN_MS
            ) {
                return false;
            }

            return true;
        });
    }, [
        activities,
        profileMap,
        search,
        moduleFilter,
        actionFilter,
        periodFilter,
        today,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredActivities.length / PAGE_SIZE),
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedActivities = filteredActivities.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const pageNumbers = getPageNumbers(currentPage, totalPages);

    const hasFilters =
        search.trim() !== "" ||
        moduleFilter !== "all" ||
        actionFilter !== "all" ||
        periodFilter !== "all";

    function resetFilters() {
        setSearch("");
        setModuleFilter("all");
        setActionFilter("all");
        setPeriodFilter("all");
        setPage(1);
    }

    function updateFilter(callback: () => void) {
        callback();
        setPage(1);
    }

    return (
        <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/management"
                            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-black"
                        >
                            <ArrowLeft size={14} />
                            Voltar ao dashboard
                        </Link>

                        <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-medium text-gray-600">
                            <Activity size={14} />
                            Histórico de actividades
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700">
                            <Activity size={21} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                                Actividades
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Acompanhe o histórico de operações e alterações na plataforma.
                            </p>
                        </div>
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard
                        label="Actividades registadas"
                        description="Total na plataforma"
                        value={totalCount.toLocaleString("pt-AO")}
                        icon={Activity}
                    />

                    <StatCard
                        label="Actividades hoje"
                        description="Nos registos carregados"
                        value={todayCount.toLocaleString("pt-AO")}
                        icon={CalendarDays}
                    />

                    <StatCard
                        label="Últimos 7 dias"
                        description="Nos registos carregados"
                        value={weekCount.toLocaleString("pt-AO")}
                        icon={ArrowUpRight}
                    />
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="space-y-5 border-b border-gray-100 p-4 sm:p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-black">
                                    Histórico de actividades
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Consulte e filtre as operações realizadas pelos utilizadores.
                                </p>
                            </div>

                            <span className="text-xs font-medium text-gray-500">
                                {filteredActivities.length.toLocaleString("pt-AO")} resultados
                            </span>
                        </div>

                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    updateFilter(() => setSearch(event.target.value))
                                }
                                placeholder="Pesquisar por actividade, utilizador ou registo..."
                                aria-label="Pesquisar actividades"
                                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-10 text-sm text-black outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 focus:bg-white"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => updateFilter(() => setSearch(""))}
                                    aria-label="Limpar pesquisa"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-black"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <FilterField label="Módulo">
                                <FilterSelect
                                    value={moduleFilter}
                                    onChange={(value) =>
                                        updateFilter(() => setModuleFilter(value))
                                    }
                                    placeholder="Todos os módulos"
                                    options={modules.map((module) => ({
                                        value: module,
                                        label: getModuleLabel(module),
                                    }))}
                                />
                            </FilterField>

                            <FilterField label="Acção">
                                <FilterSelect
                                    value={actionFilter}
                                    onChange={(value) =>
                                        updateFilter(() => setActionFilter(value))
                                    }
                                    placeholder="Todas as acções"
                                    options={actions.map((action) => ({
                                        value: action,
                                        label: getActionLabel(action),
                                    }))}
                                />
                            </FilterField>

                            <FilterField label="Período">
                                <FilterSelect
                                    value={periodFilter}
                                    onChange={(value) =>
                                        updateFilter(() => setPeriodFilter(value))
                                    }
                                    placeholder="Todo o período"
                                    options={[
                                        { value: "today", label: "Hoje" },
                                        { value: "7days", label: "Últimos 7 dias" },
                                        { value: "30days", label: "Últimos 30 dias" },
                                    ]}
                                />
                            </FilterField>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="mr-1 text-[11px] font-medium text-gray-400">
                                    Período:
                                </span>

                                {[
                                    { value: "all", label: "Todos" },
                                    { value: "today", label: "Hoje" },
                                    { value: "7days", label: "7 dias" },
                                    { value: "30days", label: "30 dias" },
                                ].map((period) => (
                                    <button
                                        key={period.value}
                                        type="button"
                                        onClick={() =>
                                            updateFilter(() =>
                                                setPeriodFilter(period.value),
                                            )
                                        }
                                        aria-pressed={periodFilter === period.value}
                                        className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition ${
                                            periodFilter === period.value
                                                ? "bg-gray-900 text-white"
                                                : "border border-gray-200 bg-white text-gray-500 hover:border-gray-400 hover:text-black"
                                        }`}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-gray-500 transition hover:text-black sm:self-auto"
                                >
                                    <X size={13} />
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-4 py-3 sm:px-5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Registos de actividade
                        </span>

                        <span className="text-[11px] text-gray-400">
                            {paginatedActivities.length} nesta página
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {paginatedActivities.length > 0 ? (
                            paginatedActivities.map((item) => {
                                const Icon = getActionIcon(item.action);

                                const userName = item.user_id
                                    ? profileMap.get(item.user_id) ?? "Utilizador"
                                    : "Utilizador removido";

                                const activityDate = new Date(item.created_at);
                                const validDate = !Number.isNaN(activityDate.getTime());

                                return (
                                    <article
                                        key={item.activity_id}
                                        className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50/70 sm:flex-row sm:items-start sm:gap-4 sm:px-5"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition group-hover:border-gray-300 group-hover:bg-white">
                                            <Icon size={17} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    {item.description || getActionLabel(item.action)}
                                                </h3>

                                                <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                                    {getModuleLabel(item.entity_type)}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-[9px] font-semibold text-gray-600">
                                                        {getInitials(userName)}
                                                    </span>

                                                    <span className="text-xs font-medium text-gray-700">
                                                        {userName}
                                                    </span>
                                                </div>

                                                <span className="hidden text-gray-300 sm:inline">
                                                    ·
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    {getActionLabel(item.action)}
                                                </span>

                                                {item.entity_id && (
                                                    <>
                                                        <span className="hidden text-gray-300 sm:inline">
                                                            ·
                                                        </span>

                                                        <span className="font-mono text-[10px] text-gray-400">
                                                            ID: {item.entity_id.slice(0, 8)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {item.metadata &&
                                                Object.keys(item.metadata).length > 0 && (
                                                    <details className="mt-3">
                                                        <summary className="w-fit cursor-pointer list-none text-[11px] font-medium text-gray-400 transition hover:text-gray-800 [&::-webkit-details-marker]:hidden">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <FileText size={12} />
                                                                Ver detalhes técnicos
                                                            </span>
                                                        </summary>

                                                        <pre className="mt-2 max-w-full overflow-x-auto rounded-lg border border-gray-100 bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-600">
                                                            {JSON.stringify(item.metadata, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                        </div>

                                        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-2 sm:flex-col sm:items-end sm:justify-start sm:gap-1 sm:border-0 sm:pt-0">
                                            <span className="text-xs font-semibold tabular-nums text-gray-700">
                                                {validDate ? TIME_FORMAT.format(activityDate) : "—"}
                                            </span>

                                            <span className="text-[11px] text-gray-400">
                                                {validDate ? DATE_FORMAT.format(activityDate) : "Data inválida"}
                                            </span>
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
                                    <Filter size={22} />
                                </div>

                                <h3 className="mt-4 text-sm font-semibold text-gray-900">
                                    Nenhuma actividade encontrada
                                </h3>

                                <p className="mt-1 max-w-sm text-xs leading-relaxed text-gray-500">
                                    Não existem registos que correspondam aos filtros seleccionados.
                                    Experimente alterar os critérios de pesquisa.
                                </p>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-black"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <p className="text-xs font-medium text-gray-700">
                                {filteredActivities.length > 0 ? (
                                    <>
                                        A apresentar{" "}
                                        {(currentPage - 1) * PAGE_SIZE + 1}–
                                        {Math.min(
                                            currentPage * PAGE_SIZE,
                                            filteredActivities.length,
                                        )}{" "}
                                        de {filteredActivities.length} registos
                                    </>
                                ) : (
                                    "Nenhum registo nesta página"
                                )}
                            </p>

                            <p className="mt-1 text-[11px] text-gray-400">
                                Página {currentPage} de {totalPages}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() =>
                                    setPage((value) => Math.max(1, value - 1))
                                }
                                aria-label="Página anterior"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {pageNumbers.map((pageNumber, index) =>
                                pageNumber === "ellipsis" ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="px-1 text-xs text-gray-400"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => setPage(pageNumber)}
                                        aria-current={
                                            currentPage === pageNumber ? "page" : undefined
                                        }
                                        className={`h-9 min-w-9 rounded-lg px-2.5 text-xs font-medium transition ${
                                            currentPage === pageNumber
                                                ? "bg-gray-900 text-white"
                                                : "border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black"
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ),
                            )}

                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setPage((value) =>
                                        Math.min(totalPages, value + 1),
                                    )
                                }
                                aria-label="Página seguinte"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                {totalCount > activities.length && (
                    <p className="text-center text-[11px] leading-relaxed text-gray-400">
                        A apresentar os {activities.length.toLocaleString("pt-AO")} registos
                        mais recentes de um total de{" "}
                        {totalCount.toLocaleString("pt-AO")} actividades.
                        Os filtros e a paginação aplicam-se aos registos carregados.
                    </p>
                )}
            </div>
        </main>
    );
}

function StatCard({
    label,
    description,
    value,
    icon: Icon,
}: {
    label: string;
    description: string;
    value: string;
    icon: ElementType;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-gray-500">
                    {label}
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <Icon size={16} />
                </div>
            </div>

            <p className="mt-3 text-2xl font-semibold tracking-tight text-black tabular-nums sm:text-3xl">
                {value}
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
                {description}
            </p>
        </div>
    );
}

function FilterField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </label>

            {children}
        </div>
    );
}

function FilterSelect({
    value,
    onChange,
    placeholder,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-9 text-xs font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-400"
            >
                <option value="all">{placeholder}</option>

                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <ArrowRight
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400"
            />
        </div>
    );
}
