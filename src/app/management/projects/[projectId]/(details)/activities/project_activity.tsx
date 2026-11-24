
"use client";

import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Loader2,
  MessageSquare,
  Search,
  Settings2,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { loadProjectActivityPage } from "@/actions/project_activity";

import type {
  ActivityLog,
  ActivityProfile,
  ProjectActivityData,
} from "@/app/management/projects/types";

type Props = {
  projectId: string;
  initialData: ProjectActivityData;
};

type PeriodFilter = "all" | "today" | "7days" | "30days";

const MODULE_LABELS: Record<string, string> = {
  project: "Projecto",
  projects: "Projecto",
  task: "Tarefas",
  tasks: "Tarefas",
  document: "Documentos",
  documents: "Documentos",
  calendar_event: "Calendário",
  calendar_events: "Calendário",
  message: "Mensagens",
  messages: "Mensagens",
  resource: "Recursos",
  resources: "Recursos",
  supplier: "Fornecedores",
  suppliers: "Fornecedores",
  milestone: "Marcos",
  milestones: "Marcos",
  briefing: "Briefing",
  attendance: "Presença",
};

const ACTION_LABELS: Record<string, string> = {
  INSERT: "Criado",
  UPDATE: "Actualizado",
  DELETE: "Eliminado",
  CREATE: "Criado",
  CREATED: "Criado",
  UPDATED: "Actualizado",
  DELETED: "Eliminado",
  COMPLETED: "Concluído",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  ASSIGNED: "Atribuído",
  UPLOADED: "Carregado",
  STATUS_CHANGED: "Estado alterado",
};

const TIME_FORMAT = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Luanda",
});

function getModuleLabel(entityType: string) {
  const key = entityType.toLowerCase();

  return (
    MODULE_LABELS[key] ??
    entityType.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    )
  );
}

function getActionLabel(action: string) {
  const key = action.toUpperCase();

  return (
    ACTION_LABELS[key] ??
    action.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
      letter.toLowerCase(),
    )
  );
}

function getUserName(
  userId: string | null,
  profiles: ActivityProfile[],
) {
  if (!userId) return "Sistema";

  const profile = profiles.find(
    (item) => item.profile_id === userId,
  );

  if (!profile) return "Utilizador";

  const name = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Utilizador";
}

function getDateKey(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Luanda",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

function getTodayKey() {
  return getDateKey(new Date().toISOString());
}

function isWithinPeriod(
  createdAt: string,
  period: PeriodFilter,
) {
  if (period === "all") return true;

  const timestamp = new Date(createdAt).getTime();

  if (!Number.isFinite(timestamp)) return false;

  const now = Date.now();
  const age = now - timestamp;

  if (period === "today") {
    return getDateKey(createdAt) === getTodayKey();
  }

  if (period === "7days") {
    return age >= 0 && age <= 7 * 24 * 60 * 60 * 1000;
  }

  return age >= 0 && age <= 30 * 24 * 60 * 60 * 1000;
}

function getActivityIcon(entityType: string) {
  const type = entityType.toLowerCase();

  if (type.includes("task")) return CheckCircle2;
  if (type.includes("document")) return FileText;
  if (type.includes("message")) return MessageSquare;
  if (type.includes("calendar") || type.includes("event")) {
    return CalendarDays;
  }
  if (type.includes("profile") || type.includes("member")) {
    return UserRound;
  }

  return Activity;
}

function formatMetadata(metadata: Record<string, unknown>) {
  return Object.entries(metadata).filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      typeof value !== "object",
  );
}

function ActivityItem({
  activity,
  profiles,
}: {
  activity: ActivityLog;
  profiles: ActivityProfile[];
}) {
  const [expanded, setExpanded] = useState(false);

  const Icon = getActivityIcon(activity.entity_type);
  const metadata = activity.metadata ?? {};
  const metadataEntries = formatMetadata(metadata);

  const date = new Date(activity.created_at);
  const validDate = Number.isFinite(date.getTime());

  return (
    <div className="relative flex gap-5 sm:gap-6">
      <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-neutral-50 text-neutral-600">
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1 border-b border-black/[0.06] pb-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-sm font-medium leading-6 text-neutral-900">
            {activity.description || getActionLabel(activity.action)}
          </p>

          <span className="rounded-md border border-black/[0.08] bg-neutral-50 px-3 py-1 text-[10px] font-medium text-neutral-500">
            {getModuleLabel(activity.entity_type)}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-neutral-500">
          <span>{getUserName(activity.user_id, profiles)}</span>
          <span className="text-neutral-300">·</span>
          <span>{getActionLabel(activity.action)}</span>

          {validDate && (
            <>
              <span className="text-neutral-300">·</span>
              <span>{TIME_FORMAT.format(date)}</span>
            </>
          )}
        </div>

        {metadataEntries.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            {expanded ? (
              <>
                <ChevronDown size={14} />
                Ocultar detalhes
              </>
            ) : (
              <>
                <ChevronRight size={14} />
                Ver detalhes
              </>
            )}
          </button>
        )}

        {expanded && metadataEntries.length > 0 && (
          <div className="mt-4 rounded-lg border border-black/[0.07] bg-neutral-50 p-5 sm:p-6">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {metadataEntries.map(([key, value]) => (
                <div key={key} className="min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                    {key.replaceAll("_", " ")}
                  </dt>
                  <dd className="mt-1.5 break-words text-xs leading-5 text-neutral-700">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>

            {activity.entity_id && (
              <p className="mt-5 border-t border-black/[0.06] pt-4 text-[10px] text-neutral-400">
                Referência: {activity.entity_id}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectActivityClient({
  projectId,
  initialData,
}: Props) {
  const [activities, setActivities] = useState(initialData.activities);
  const [profiles, setProfiles] = useState(initialData.profiles);
  const [totalCount, setTotalCount] = useState(initialData.totalCount);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [periodFilter, setPeriodFilter] =
    useState<PeriodFilter>("all");

  const [expandedFilters, setExpandedFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [loadError, setLoadError] = useState("");

  const moduleOptions = useMemo(
    () =>
      [...new Set(activities.map((item) => item.entity_type))].sort(),
    [activities],
  );

  const userOptions = useMemo(
    () =>
      [
        ...new Set(
          activities
            .map((item) => item.user_id)
            .filter((id): id is string => Boolean(id)),
        ),
      ],
    [activities],
  );

  const filteredActivities = useMemo(() => {
    const term = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const profileName = getUserName(
        activity.user_id,
        profiles,
      ).toLowerCase();

      const matchesSearch =
        !term ||
        [
          activity.description,
          activity.action,
          activity.entity_type,
          activity.entity_id,
          profileName,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(term),
          );

      const matchesModule =
        moduleFilter === "all" ||
        activity.entity_type === moduleFilter;

      const matchesUser =
        userFilter === "all" ||
        activity.user_id === userFilter;

      const matchesPeriod = isWithinPeriod(
        activity.created_at,
        periodFilter,
      );

      return (
        matchesSearch &&
        matchesModule &&
        matchesUser &&
        matchesPeriod
      );
    });
  }, [
    activities,
    profiles,
    search,
    moduleFilter,
    userFilter,
    periodFilter,
  ]);

  const todayKey = getTodayKey();

  const todayCount = activities.filter(
    (activity) => getDateKey(activity.created_at) === todayKey,
  ).length;

  const weekCount = activities.filter((activity) =>
    isWithinPeriod(activity.created_at, "7days"),
  ).length;

  const hasMore = activities.length < totalCount;

  function loadMore() {
    if (isPending || !hasMore) return;

    setLoadError("");

    startTransition(async () => {
      const result = await loadProjectActivityPage(
        projectId,
        page + 1,
      );

      if (result.status !== "success") {
        setLoadError(
          result.status === "error"
            ? result.message
            : "A sessão expirou. Inicie sessão novamente.",
        );
        return;
      }

      setActivities((current) => [
        ...current,
        ...result.data.activities,
      ]);

      setProfiles((current) => {
        const merged = new Map(
          current.map((profile) => [
            profile.profile_id,
            profile,
          ]),
        );

        result.data.profiles.forEach((profile) => {
          merged.set(profile.profile_id, profile);
        });

        return [...merged.values()];
      });

      setTotalCount(result.data.totalCount);
      setPage((current) => current + 1);
    });
  }

  function clearFilters() {
    setSearch("");
    setModuleFilter("all");
    setUserFilter("all");
    setPeriodFilter("all");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    moduleFilter !== "all" ||
    userFilter !== "all" ||
    periodFilter !== "all";

  return (
    <section className="w-full min-w-0 space-y-7 px-5 py-6 sm:px-8 sm:py-8 md:px-10 lg:px-14 lg:py-10 xl:px-16 2xl:px-20">

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-black/[0.08] bg-white p-6 transition-colors hover:border-black/15 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-neutral-500">
              Total de actividades
            </span>
            <Activity size={18} className="shrink-0 text-neutral-400" />
          </div>
          <p className="mt-5 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {totalCount.toLocaleString("pt-AO")}
          </p>
          <p className="mt-2 text-[11px] text-neutral-400">
            Registos neste projecto
          </p>
        </div>

        <div className="rounded-xl border border-black/[0.08] bg-white p-6 transition-colors hover:border-black/15 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-neutral-500">
              Hoje
            </span>
            <Clock3 size={18} className="shrink-0 text-neutral-400" />
          </div>
          <p className="mt-5 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {todayCount.toLocaleString("pt-AO")}
          </p>
          <p className="mt-2 text-[11px] text-neutral-400">
            Actividades registadas
          </p>
        </div>

        <div className="rounded-xl border border-black/[0.08] bg-white p-6 transition-colors hover:border-black/15 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-neutral-500">
              Últimos 7 dias
            </span>
            <CalendarDays size={18} className="shrink-0 text-neutral-400" />
          </div>
          <p className="mt-5 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {weekCount.toLocaleString("pt-AO")}
          </p>
          <p className="mt-2 text-[11px] text-neutral-400">
            Actividades nesta semana
          </p>
        </div>
      </div>

      {/* Activity history */}
      <div className="min-w-0 rounded-xl border border-black/[0.08] bg-white">

        {/* Header and filters */}
        <div className="flex flex-col gap-6 border-b border-black/[0.06] p-6 sm:p-8 lg:p-9">

          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-neutral-900">
                Histórico do projecto
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Acompanhe as alterações e operações realizadas neste projecto.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setExpandedFilters((value) => !value)
              }
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-xs font-medium transition ${
                expandedFilters
                  ? "border-black bg-neutral-900 text-white"
                  : "border-black/10 bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Filter size={14} />
              Filtros
              <Settings2 size={13} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por actividade, utilizador ou referência..."
              className="h-12 w-full rounded-lg border border-black/10 bg-neutral-50 px-5 pl-11 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            />
          </div>

          {/* Advanced filters */}
          {expandedFilters && (
            <div className="grid gap-5 border-t border-black/[0.06] pt-6 sm:grid-cols-3">
              <label className="min-w-0 space-y-2.5">
                <span className="block text-[11px] font-medium text-neutral-500">
                  Módulo
                </span>
                <select
                  value={moduleFilter}
                  onChange={(event) =>
                    setModuleFilter(event.target.value)
                  }
                  className="h-11 w-full rounded-lg border border-black/10 bg-white px-4 text-xs text-neutral-700 outline-none transition focus:border-neutral-400"
                >
                  <option value="all">Todos os módulos</option>
                  {moduleOptions.map((module) => (
                    <option key={module} value={module}>
                      {getModuleLabel(module)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="min-w-0 space-y-2.5">
                <span className="block text-[11px] font-medium text-neutral-500">
                  Utilizador
                </span>
                <select
                  value={userFilter}
                  onChange={(event) =>
                    setUserFilter(event.target.value)
                  }
                  className="h-11 w-full rounded-lg border border-black/10 bg-white px-4 text-xs text-neutral-700 outline-none transition focus:border-neutral-400"
                >
                  <option value="all">Todos os utilizadores</option>
                  {userOptions.map((userId) => (
                    <option key={userId} value={userId}>
                      {getUserName(userId, profiles)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="min-w-0 space-y-2.5">
                <span className="block text-[11px] font-medium text-neutral-500">
                  Período
                </span>
                <select
                  value={periodFilter}
                  onChange={(event) =>
                    setPeriodFilter(
                      event.target.value as PeriodFilter,
                    )
                  }
                  className="h-11 w-full rounded-lg border border-black/10 bg-white px-4 text-xs text-neutral-700 outline-none transition focus:border-neutral-400"
                >
                  <option value="all">Todo o período</option>
                  <option value="today">Hoje</option>
                  <option value="7days">Últimos 7 dias</option>
                  <option value="30days">Últimos 30 dias</option>
                </select>
              </label>

              {hasActiveFilters && (
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-900"
                  >
                    <X size={13} />
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity list */}
        <div className="px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9 xl:px-12">

          {filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                <Activity size={21} />
              </div>
              <p className="mt-5 text-sm font-medium text-neutral-800">
                {activities.length === 0
                  ? "Ainda não existem actividades"
                  : "Nenhuma actividade encontrada"}
              </p>
              <p className="mt-2 max-w-sm text-xs leading-5 text-neutral-500">
                {activities.length === 0
                  ? "As operações realizadas neste projecto serão apresentadas aqui."
                  : "Altere os filtros ou a pesquisa para consultar outros registos."}
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 text-xs font-medium text-neutral-800 underline underline-offset-4"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-neutral-500">
                  A mostrar{" "}
                  <span className="font-semibold text-neutral-800">
                    {filteredActivities.length}
                  </span>{" "}
                  de {activities.length} registos carregados
                </p>
                <span className="text-[10px] text-neutral-400">
                  Mais recentes primeiro
                </span>
              </div>

              <div className="space-y-8">
                {filteredActivities.map((activity) => (
                  <ActivityItem
                    key={activity.activity_id}
                    activity={activity}
                    profiles={profiles}
                  />
                ))}
              </div>
            </>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="mt-8 flex justify-center border-t border-black/[0.06] pt-7">
              <button
                type="button"
                onClick={loadMore}
                disabled={isPending}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-black/10 px-6 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    A carregar...
                  </>
                ) : (
                  "Carregar mais actividades"
                )}
              </button>
            </div>
          )}

          {loadError && (
            <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-xs text-red-700">
              {loadError}
            </p>
          )}

          {!hasMore && activities.length > 0 && (
            <p className="mt-8 border-t border-black/[0.06] pt-6 text-center text-[11px] text-neutral-400">
              Todos os {totalCount.toLocaleString("pt-AO")} registos foram carregados.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
