"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import {
  MS_PER_DAY,
  addDays,
  clampProgress,
  differenceInDays,
  formatDate,
  formatMonthLabel,
  parseDate,
  startOfDay,
} from "./utils";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type GanttPhase = {
  id: string;
  name: string;
  sortOrder?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  progress?: number | null;
};

export type GanttStep = {
  id: string;
  name: string;
  phaseId: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  sortOrder?: number | null;
};

export type GanttDeliverable = {
  id: string;
  name: string;
  phaseId: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  sortOrder?: number | null;
};

type GanttChartProps = {
  phases?: GanttPhase[] | null;
  steps?: GanttStep[] | null;
  deliverables?: GanttDeliverable[] | null;
  startDate?: string | null;
};

type TimelineItemType = "step" | "deliverable";

type TimelineItem = {
  id: string;
  name: string;
  phaseId: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  sortOrder?: number | null;
  kind: TimelineItemType;
};

type ScheduledTimelineItem = TimelineItem & {
  start: Date | null;
  end: Date | null;
  reversed: boolean;
};

/* -------------------------------------------------------------------------- */
/* Layout constants                                                            */
/* -------------------------------------------------------------------------- */

const ROW_HEIGHT = 52;
const MONTH_ROW_HEIGHT = 24;
const DAY_ROW_HEIGHT = 20;
const HEADER_HEIGHT = MONTH_ROW_HEIGHT + DAY_ROW_HEIGHT;
const LABEL_WIDTH = 280;
const MIN_TIMELINE_DAYS = 60;
const START_BUFFER_DAYS = 3;
const END_BUFFER_DAYS = 15;
const TODAY_RANGE_PADDING_DAYS = 45;
const BAR_LABEL_MIN_WIDTH = 60;
const AUTO_SCROLL_LEAD_PX = 120;

const ZOOM_LEVELS = {
  overview: { dayWidth: 8, label: "Visão geral" },
  compact: { dayWidth: 16, label: "Compacto" },
  comfortable: { dayWidth: 26, label: "Confortável" },
} as const;

type ZoomLevel = keyof typeof ZOOM_LEVELS;

const PHASE_PALETTE = [
  {
    bar: "bg-blue-500",
    track: "bg-blue-100",
    border: "border-blue-600",
    dot: "bg-blue-500",
  },
  {
    bar: "bg-emerald-500",
    track: "bg-emerald-100",
    border: "border-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    bar: "bg-purple-500",
    track: "bg-purple-100",
    border: "border-purple-600",
    dot: "bg-purple-500",
  },
  {
    bar: "bg-amber-500",
    track: "bg-amber-100",
    border: "border-amber-600",
    dot: "bg-amber-500",
  },
  {
    bar: "bg-cyan-500",
    track: "bg-cyan-100",
    border: "border-cyan-600",
    dot: "bg-cyan-500",
  },
  {
    bar: "bg-rose-500",
    track: "bg-rose-100",
    border: "border-rose-600",
    dot: "bg-rose-500",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const id = item.id?.trim();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function reportDuplicateIds(label: string, items: { id: string }[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of items) {
    const id = item.id?.trim();

    if (!id) {
      console.warn(`[GanttChart] ID vazio em ${label}.`);
      continue;
    }

    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }

  if (duplicates.size > 0) {
    console.warn(`[GanttChart] IDs duplicados em ${label}:`, [...duplicates]);
  }
}

function getStablePhaseColor(phaseId: string) {
  let hash = 0;
  for (let i = 0; i < phaseId.length; i++) {
    hash = (hash * 31 + phaseId.charCodeAt(i)) | 0;
  }
  return PHASE_PALETTE[Math.abs(hash) % PHASE_PALETTE.length];
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function GanttChart({
  phases: phasesProp,
  steps: stepsProp,
  deliverables: deliverablesProp,
  startDate,
}: GanttChartProps) {
  const phases = useMemo(() => uniqueById(phasesProp ?? []), [phasesProp]);
  const steps = useMemo(() => uniqueById(stepsProp ?? []), [stepsProp]);
  const deliverables = useMemo(
    () => uniqueById(deliverablesProp ?? []),
    [deliverablesProp],
  );

  const [zoom, setZoom] = useState<ZoomLevel>("compact");
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [today, setToday] = useState<Date>(() => startOfDay(new Date()));

  const scrollRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);
  const previousZoom = useRef<ZoomLevel>(zoom);

  const dayWidth = ZOOM_LEVELS[zoom].dayWidth;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    reportDuplicateIds("fases recebidas", phasesProp ?? []);
    reportDuplicateIds("passos recebidos", stepsProp ?? []);
    reportDuplicateIds("entregáveis recebidos", deliverablesProp ?? []);
  }, [phasesProp, stepsProp, deliverablesProp]);

  // Refresh "today" at local midnight, including when a tab is left open overnight.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleMidnightRefresh = () => {
      if (timeout) clearTimeout(timeout);
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 1, 0);

      timeout = setTimeout(() => {
        setToday(startOfDay(new Date()));
        scheduleMidnightRefresh();
      }, Math.max(1000, nextMidnight.getTime() - now.getTime()));
    };

    scheduleMidnightRefresh();
    const refreshOnFocus = () => setToday(startOfDay(new Date()));
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, []);

  const timelineItems = useMemo<TimelineItem[]>(
    () => [
      ...steps.map((step) => ({ ...step, kind: "step" as const })),
      ...deliverables.map((deliverable) => ({
        ...deliverable,
        kind: "deliverable" as const,
      })),
    ],
    [steps, deliverables],
  );

  const { phaseGroups, unscheduledCount, orphanCount } = useMemo(() => {
    const sortedPhases = [...phases].sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        a.name.localeCompare(b.name, "pt") ||
        a.id.localeCompare(b.id),
    );

    const phaseIds = new Set(sortedPhases.map((phase) => phase.id));
    const byPhase = new Map<string, ScheduledTimelineItem[]>();
    let unscheduled = 0;
    let orphans = 0;

    for (const item of timelineItems) {
      const parsedStart = parseDate(item.startDate);
      const parsedEnd = parseDate(item.endDate);
      const hasValidDates = Boolean(parsedStart && parsedEnd);
      const reversed = hasValidDates && parsedStart!.getTime() > parsedEnd!.getTime();

      // Keep unscheduled records visible in their phase; only omit their bar.
      const scheduled: ScheduledTimelineItem = {
        ...item,
        start: hasValidDates
          ? (reversed ? parsedEnd : parsedStart)
          : null,
        end: hasValidDates
          ? (reversed ? parsedStart : parsedEnd)
          : null,
        reversed,
      };

      if (!hasValidDates) unscheduled++;

      const targetPhaseId = phaseIds.has(item.phaseId)
        ? item.phaseId
        : "__gantt_unassigned__";

      if (targetPhaseId === "__gantt_unassigned__") orphans++;

      const existing = byPhase.get(targetPhaseId);
      if (existing) existing.push(scheduled);
      else byPhase.set(targetPhaseId, [scheduled]);
    }

    const groups = sortedPhases.map((phase) => {
      const items = (byPhase.get(phase.id) ?? []).sort(
        (a, b) =>
          (a.start?.getTime() ?? Number.MAX_SAFE_INTEGER) -
            (b.start?.getTime() ?? Number.MAX_SAFE_INTEGER) ||
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          a.name.localeCompare(b.name, "pt") ||
          a.id.localeCompare(b.id),
      );

      const scheduledItems = items.filter(
        (item): item is ScheduledTimelineItem & { start: Date; end: Date } =>
          Boolean(item.start && item.end),
      );
      const weightedProgress = scheduledItems.reduce((total, item) => {
        const weight = Math.max(1, differenceInDays(item.start, item.end) + 1);
        return total + clampProgress(item.progress) * weight;
      }, 0);
      const totalWeight = scheduledItems.reduce(
        (total, item) =>
          total + Math.max(1, differenceInDays(item.start, item.end) + 1),
        0,
      );
      const calculatedProgress =
        totalWeight > 0
          ? Math.round(weightedProgress / totalWeight)
          : clampProgress(phase.progress ?? 0);

      return {
        ...phase,
        items,
        avgProgress:
          phase.progress != null
            ? clampProgress(phase.progress)
            : calculatedProgress,
        color: getStablePhaseColor(phase.id),
      };
    });

    const orphanItems = (byPhase.get("__gantt_unassigned__") ?? []).sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        a.name.localeCompare(b.name, "pt") ||
        a.id.localeCompare(b.id),
    );

    if (orphanItems.length > 0) {
      groups.push({
        id: "__gantt_unassigned__",
        name: "Sem fase associada",
        sortOrder: Number.MAX_SAFE_INTEGER,
        startDate: null,
        endDate: null,
        progress: 0,
        items: orphanItems,
        avgProgress: 0,
        color: getStablePhaseColor("__gantt_unassigned__"),
      });
    }

    return {
      phaseGroups: groups,
      unscheduledCount: unscheduled,
      orphanCount: orphans,
    };
  }, [phases, timelineItems]);

  const { timelineStart, totalDays } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    const include = (date: Date | null) => {
      if (!date || Number.isNaN(date.getTime())) return;
      const time = date.getTime();
      min = Math.min(min, time);
      max = Math.max(max, time);
    };

    for (const phase of phaseGroups) {
      include(parseDate(phase.startDate));
      include(parseDate(phase.endDate));
      for (const item of phase.items) {
        include(item.start);
        include(item.end);
      }
    }
    include(parseDate(startDate));

    const todayTime = today.getTime();
    if (min === Infinity) {
      min = todayTime;
      max = todayTime;
    } else {
      const padding = TODAY_RANGE_PADDING_DAYS * MS_PER_DAY;
      if (todayTime >= min - padding && todayTime <= max + padding) {
        min = Math.min(min, todayTime);
        max = Math.max(max, todayTime);
      }
    }

    const earliest = addDays(startOfDay(new Date(min)), -START_BUFFER_DAYS);
    const latest = startOfDay(new Date(max));
    const span = differenceInDays(earliest, latest);

    return {
      timelineStart: earliest,
      totalDays: Math.max(MIN_TIMELINE_DAYS, span + END_BUFFER_DAYS + 1),
    };
  }, [phaseGroups, startDate, today]);

  const timelineWidth = totalDays * dayWidth;
  const todayOffset = differenceInDays(timelineStart, today);
  const todayVisible = todayOffset >= 0 && todayOffset < totalDays;
  const todayPosition = todayOffset * dayWidth + dayWidth / 2;

  const { monthSegments, dayCells } = useMemo(() => {
    const segments: { key: string; label: string; days: number }[] = [];
    const cells: { key: string; day: number; isToday: boolean }[] = [];

    for (let index = 0; index < totalDays; index++) {
      const date = addDays(timelineStart, index);
      const label = formatMonthLabel(date);
      const last = segments[segments.length - 1];

      if (last && last.label === label) last.days++;
      else {
        segments.push({
          key: `${date.getFullYear()}-${date.getMonth()}`,
          label,
          days: 1,
        });
      }

      cells.push({
        key: formatDate(date),
        day: date.getDate(),
        isToday: index === todayOffset,
      });
    }

    return { monthSegments: segments, dayCells: cells };
  }, [timelineStart, totalDays, todayOffset]);

  const fullHeaderHeight = HEADER_HEIGHT;

  const gridStyle = useMemo(() => {
    const firstSaturday = (6 - timelineStart.getDay() + 7) % 7;
    const week = dayWidth * 7;
    const weekend = dayWidth * 2;

    return {
      backgroundImage: [
        `linear-gradient(to right, rgba(241,245,249,1) 0, rgba(241,245,249,1) ${weekend}px, transparent ${weekend}px)`,
        "linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px)",
      ].join(", "),
      backgroundSize: `${week}px 100%, ${dayWidth}px 100%`,
      backgroundPosition: `${firstSaturday * dayWidth}px 0, 0 0`,
      backgroundRepeat: "repeat-x, repeat-x",
    };
  }, [timelineStart, dayWidth]);

  const hasPhases = phases.length > 0 || timelineItems.length > 0;

  const scrollToToday = useCallback(() => {
    const element = scrollRef.current;
    if (!element || !todayVisible) return;
    element.scrollLeft = clampNumber(
      todayPosition - AUTO_SCROLL_LEAD_PX,
      0,
      Math.max(0, element.scrollWidth - element.clientWidth),
    );
  }, [todayVisible, todayPosition]);

  const fitTimeline = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const availableWidth = Math.max(1, element.clientWidth - LABEL_WIDTH);
    const idealWidth = availableWidth / totalDays;
    const nextLevel: ZoomLevel =
      idealWidth >= ZOOM_LEVELS.comfortable.dayWidth
        ? "comfortable"
        : idealWidth >= ZOOM_LEVELS.compact.dayWidth
          ? "compact"
          : "overview";

    setZoom(nextLevel);
    element.scrollLeft = 0;
  }, [totalDays]);

  useEffect(() => {
    if (!hasPhases || !scrollRef.current || didAutoScroll.current) return;
    didAutoScroll.current = true;
    requestAnimationFrame(scrollToToday);
  }, [hasPhases, scrollToToday]);

  // Keep the approximate date under the viewport stable when zooming.
  useEffect(() => {
    if (previousZoom.current === zoom) return;
    const element = scrollRef.current;
    if (element) {
      const oldWidth = ZOOM_LEVELS[previousZoom.current].dayWidth;
      const newWidth = ZOOM_LEVELS[zoom].dayWidth;
      const timelineViewportX = Math.max(0, element.scrollLeft);
      const dayAtViewport = timelineViewportX / oldWidth;
      element.scrollLeft = dayAtViewport * newWidth;
    }
    previousZoom.current = zoom;
  }, [zoom]);

  const togglePhase = useCallback((phaseId: string) => {
    setCollapsedPhases((previous) => ({
      ...previous,
      [phaseId]: !previous[phaseId],
    }));
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedPhases(
      Object.fromEntries(phaseGroups.map((phase) => [phase.id, true])),
    );
  }, [phaseGroups]);

  const expandAll = useCallback(() => setCollapsedPhases({}), []);

  if (!hasPhases) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">
          Ainda não existem fases para apresentar.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Adicione fases ao projecto para visualizar o cronograma.
        </p>
      </div>
    );
  }

  const totalWidth = LABEL_WIDTH + timelineWidth;
  const hasNotices = unscheduledCount > 0 || orphanCount > 0;
  const allCollapsed = phaseGroups.every((phase) => collapsedPhases[phase.id]);

  return (
    <div className="w-full space-y-3 py-4 text-gray-700">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="h-3 w-[2px] bg-red-500" aria-hidden="true" />
          Hoje
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-md border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={allCollapsed ? expandAll : collapseAll}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
              title={allCollapsed ? "Expandir todas as fases" : "Recolher todas as fases"}
            >
              {allCollapsed ? (
                <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronsDownUp className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {allCollapsed ? "Expandir tudo" : "Recolher tudo"}
            </button>
            <button
              type="button"
              onClick={fitTimeline}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
              title="Ajustar o cronograma à largura disponível"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              Ajustar
            </button>
            <button
              type="button"
              onClick={scrollToToday}
              className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              Hoje
            </button>
          </div>

          <div
            role="group"
            aria-label="Zoom do cronograma"
            className="flex items-center gap-0.5 rounded-md border border-slate-200 p-0.5"
          >
            {(Object.keys(ZOOM_LEVELS) as ZoomLevel[]).map((level) => {
              const Icon = level === "comfortable" ? ZoomIn : ZoomOut;
              const active = zoom === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setZoom(level)}
                  aria-pressed={active}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
                    active
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {ZOOM_LEVELS[level].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div ref={scrollRef} className="relative max-h-[560px] overflow-auto">
          <div style={{ width: totalWidth }}>
            {/* Sticky header */}
            <div
              className="sticky top-0 z-30 flex border-b border-slate-200 bg-white"
              style={{ height: fullHeaderHeight, width: totalWidth }}
            >
              <div
                className="sticky left-0 z-40 flex shrink-0 items-center border-r border-slate-200 bg-white px-3 shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
                style={{ width: LABEL_WIDTH }}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Fases, passos e entregáveis
                </span>
              </div>

              <div className="shrink-0" style={{ width: timelineWidth }}>
                <div className="flex border-b border-slate-200" style={{ height: MONTH_ROW_HEIGHT }}>
                  {monthSegments.map((segment) => (
                    <div
                      key={segment.key}
                      className="flex items-center justify-center overflow-hidden whitespace-nowrap border-r border-slate-100 text-xs text-slate-600"
                      style={{ width: segment.days * dayWidth }}
                    >
                      {segment.label}
                    </div>
                  ))}
                </div>

                <div className="flex border-b border-slate-200" style={{ height: DAY_ROW_HEIGHT }}>
                  {dayCells.map((cell) => (
                    <div
                      key={cell.key}
                      className={`flex shrink-0 items-center justify-center text-[10px] ${
                        cell.isToday
                          ? "bg-red-500 font-semibold text-white"
                          : "text-slate-500"
                      }`}
                      style={{ width: dayWidth }}
                      aria-current={cell.isToday ? "date" : undefined}
                    >
                      {cell.day}
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Body */}
            <div className="relative" style={{ width: totalWidth }}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 top-0 z-0"
                style={{ left: LABEL_WIDTH, width: timelineWidth, ...gridStyle }}
              >
                {todayVisible && (
                  <div
                    className="absolute bottom-0 top-0 w-[2px] bg-red-500"
                    style={{ left: todayPosition - 1 }}
                  />
                )}
              </div>

              {phaseGroups.map((group) => {
                const collapsed = !!collapsedPhases[group.id];
                return (
                  <div key={group.id} className="relative z-10">
                    {/* Phase row */}
                    <div className="flex" style={{ height: ROW_HEIGHT, width: totalWidth }}>
                      <button
                        type="button"
                        onClick={() => togglePhase(group.id)}
                        aria-expanded={!collapsed}
                        className="sticky left-0 z-20 flex shrink-0 items-center gap-1.5 border-b border-r border-slate-200 bg-slate-50 px-3 text-left shadow-[2px_0_4px_rgba(0,0,0,0.06)] hover:bg-slate-100"
                        style={{ width: LABEL_WIDTH }}
                      >
                        {collapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                        )}
                        <span className={`h-2 w-2 shrink-0 rounded-sm ${group.color.dot}`} />
                        <span className="truncate text-sm font-semibold text-slate-700">{group.name}</span>
                        <span className="ml-auto shrink-0 text-xs tabular-nums text-slate-500">{group.avgProgress}%</span>
                      </button>

                      <div className="relative shrink-0 border-b border-slate-200" style={{ width: timelineWidth }}>
                        {(() => {
                          const phaseStart = parseDate(group.startDate);
                          const phaseEnd = parseDate(group.endDate);
                          if (!phaseStart || !phaseEnd) return null;

                          const start = startOfDay(
                            phaseStart.getTime() > phaseEnd.getTime() ? phaseEnd : phaseStart,
                          );
                          const end = startOfDay(
                            phaseStart.getTime() > phaseEnd.getTime() ? phaseStart : phaseEnd,
                          );
                          const startDay = differenceInDays(timelineStart, start);
                          const endDay = differenceInDays(timelineStart, end);
                          if (endDay < 0 || startDay >= totalDays) return null;

                          const visibleStart = clampNumber(startDay, 0, totalDays - 1);
                          const visibleEnd = clampNumber(endDay, 0, totalDays - 1);
                          const left = visibleStart * dayWidth;
                          const width = Math.max(dayWidth, (visibleEnd - visibleStart + 1) * dayWidth);
                          const reversed = phaseStart.getTime() > phaseEnd.getTime();

                          return (
                            <div
                              title={`${group.name}: ${formatDate(start)} – ${formatDate(end)}${reversed ? " (datas invertidas)" : ""}`}
                              className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-sm border ${group.color.track} ${
                                reversed ? "border-dashed border-red-500" : group.color.border
                              }`}
                              style={{ left, width }}
                            />
                          );
                        })()}
                      </div>
                    </div>

                    {/* Step and deliverable rows */}
                    {!collapsed &&
                      group.items.map((item) => {
                        const progress = clampProgress(item.progress);
                        const isScheduled = Boolean(item.start && item.end);
                        const startDay = isScheduled
                          ? differenceInDays(timelineStart, item.start!)
                          : 0;
                        const endDay = isScheduled
                          ? differenceInDays(timelineStart, item.end!)
                          : 0;
                        if (isScheduled && (endDay < 0 || startDay >= totalDays)) return null;

                        const visibleStart = clampNumber(startDay, 0, totalDays - 1);
                        const visibleEnd = clampNumber(endDay, 0, totalDays - 1);
                        const barLeft = visibleStart * dayWidth;
                        const barWidth = Math.max(dayWidth, (visibleEnd - visibleStart + 1) * dayWidth);
                        const range = isScheduled
                          ? `${formatDate(item.start!)} – ${formatDate(item.end!)}`
                          : "Sem datas definidas";
                        const isDeliverable = item.kind === "deliverable";
                        const overdue = Boolean(
                          item.end && item.end.getTime() < today.getTime() && progress < 100
                        );

                        return (
                          <div key={`${item.kind}-${item.id}`} className="group flex" style={{ height: ROW_HEIGHT, width: totalWidth }}>
                            <div
                              className="sticky left-0 z-20 flex shrink-0 items-center gap-2 border-b border-r border-slate-200 bg-white pl-7 pr-3 shadow-[2px_0_4px_rgba(0,0,0,0.06)] group-hover:bg-blue-50"
                              style={{ width: LABEL_WIDTH }}
                              title={item.name}
                            >
                              <span
                                className={`h-2 w-2 shrink-0 rounded-sm ${
                                  isDeliverable ? "bg-amber-400" : "bg-slate-400"
                                }`}
                                aria-hidden="true"
                              />
                              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{item.name}</span>
                              {overdue && (
                                <span className="shrink-0 rounded bg-red-50 px-1 py-0.5 text-[9px] font-medium text-red-600">
                                  Atrasado
                                </span>
                              )}
                              <span className="shrink-0 text-[10px] text-slate-400">
                                {isDeliverable ? "Entrega" : "Passo"}
                              </span>
                            </div>

                            <div className="relative shrink-0 border-b border-slate-100 group-hover:bg-blue-50/50" style={{ width: timelineWidth }}>
                              {isScheduled ? <div
                                role="img"
                                aria-label={`${item.name}, ${isDeliverable ? "entregável" : "passo"}, ${progress}% concluído, ${range}${overdue ? ", atrasado" : ""}`}
                                title={`${item.name}\n${isDeliverable ? "Entregável" : "Passo"}\n${range}\n${progress}% concluído${item.reversed ? "\nAtenção: as datas de início e fim estavam invertidas." : ""}${overdue ? "\nAtrasado" : ""}`}
                                className={`absolute top-1/2 h-5 -translate-y-1/2 overflow-hidden rounded border ${
                                  isDeliverable ? "border-amber-600 bg-amber-100" : `${group.color.border} ${group.color.track}`
                                } ${item.reversed ? "border-dashed border-red-500" : ""}`}
                                style={{ left: barLeft, width: barWidth }}
                              >
                                <div
                                  className={`h-full ${isDeliverable ? "bg-amber-500" : group.color.bar}`}
                                  style={{ width: `${progress}%` }}
                                />
                                {barWidth > BAR_LABEL_MIN_WIDTH && (
                                  <span className="absolute inset-0 flex items-center justify-end pr-1.5 text-[10px] font-medium text-slate-900">
                                    {progress}%
                                  </span>
                                )}
                              </div> : (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                                  Sem datas definidas
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Data-quality notices */}
      {hasNotices && (
        <div className="space-y-1 px-1 text-xs text-slate-500">
          {unscheduledCount > 0 && (
            <p>
              {unscheduledCount === 1
                ? "1 passo ou entregável não aparece"
                : `${unscheduledCount} passos ou entregáveis não aparecem`}{" "}
              no cronograma porque não têm datas de início e fim válidas.
            </p>
          )}
          {orphanCount > 0 && (
            <p>
              {orphanCount === 1
                ? "1 passo ou entregável não aparece"
                : `${orphanCount} passos ou entregáveis não aparecem`}{" "}
              no cronograma porque não pertencem a nenhuma fase existente.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
