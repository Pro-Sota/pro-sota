
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
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

export type GanttMilestoneType = "review" | "submission" | "deadline";

export type GanttMilestone = {
  id: string;
  name: string;
  date: string;
  type: GanttMilestoneType;
  phaseId?: string | null;
};

type GanttChartProps = {
  phases?: GanttPhase[] | null;
  steps?: GanttStep[] | null;
  deliverables?: GanttDeliverable[] | null;
  milestones?: GanttMilestone[] | null;
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
  start: Date;
  end: Date;
  reversed: boolean;
};

/* -------------------------------------------------------------------------- */
/* Layout constants                                                            */
/* -------------------------------------------------------------------------- */

const ROW_HEIGHT = 56;
const MONTH_ROW_HEIGHT = 24;
const DAY_ROW_HEIGHT = 20;
const HEADER_HEIGHT = MONTH_ROW_HEIGHT + DAY_ROW_HEIGHT;
const LABEL_WIDTH = 260;
const MILESTONE_LABEL_ROW_HEIGHT = 18;
const MILESTONE_LABEL_MAX_WIDTH = 140;
const MILESTONE_LABEL_CHAR_WIDTH = 6;
const MILESTONE_LABEL_PADDING = 16;
const MIN_TIMELINE_DAYS = 60;
const START_BUFFER_DAYS = 3;
const END_BUFFER_DAYS = 15;
const TODAY_RANGE_PADDING_DAYS = 45;
const BAR_LABEL_MIN_WIDTH = 60;
const AUTO_SCROLL_LEAD_PX = 120;

const ZOOM_LEVELS = {
  compact: { dayWidth: 16, label: "Compacto" },
  comfortable: { dayWidth: 26, label: "Confortável" },
} as const;

type ZoomLevel = keyof typeof ZOOM_LEVELS;

const PHASE_PALETTE = [
  {
    bar: "bg-blue-500",
    track: "bg-blue-200",
    border: "border-blue-600",
    dot: "bg-blue-500",
  },
  {
    bar: "bg-emerald-500",
    track: "bg-emerald-200",
    border: "border-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    bar: "bg-purple-500",
    track: "bg-purple-200",
    border: "border-purple-600",
    dot: "bg-purple-500",
  },
  {
    bar: "bg-amber-500",
    track: "bg-amber-200",
    border: "border-amber-600",
    dot: "bg-amber-500",
  },
  {
    bar: "bg-cyan-500",
    track: "bg-cyan-200",
    border: "border-cyan-600",
    dot: "bg-cyan-500",
  },
  {
    bar: "bg-rose-500",
    track: "bg-rose-200",
    border: "border-rose-600",
    dot: "bg-rose-500",
  },
] as const;

const MILESTONE_COLORS: Record<
  GanttMilestoneType,
  { line: string; swatch: string; label: string }
> = {
  review: {
    line: "bg-blue-400",
    swatch: "bg-blue-400",
    label: "Revisão",
  },
  submission: {
    line: "bg-purple-400",
    swatch: "bg-purple-400",
    label: "Submissão",
  },
  deadline: {
    line: "bg-red-400",
    swatch: "bg-red-400",
    label: "Prazo",
  },
};

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

function reportDuplicateIds(
  label: string,
  items: { id: string }[],
) {
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
    console.warn(
      `[GanttChart] IDs duplicados em ${label}:`,
      [...duplicates],
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function GanttChart({
  phases: phasesProp,
  steps: stepsProp,
  deliverables: deliverablesProp,
  milestones: milestonesProp,
  startDate,
}: GanttChartProps) {
  const phases = useMemo(
    () => uniqueById(phasesProp ?? []),
    [phasesProp],
  );

  const steps = useMemo(
    () => uniqueById(stepsProp ?? []),
    [stepsProp],
  );

  const deliverables = useMemo(
    () => uniqueById(deliverablesProp ?? []),
    [deliverablesProp],
  );

  const milestones = useMemo(
    () => uniqueById(milestonesProp ?? []),
    [milestonesProp],
  );

  const [zoom, setZoom] = useState<ZoomLevel>("comfortable");
  const [collapsedPhases, setCollapsedPhases] = useState<
    Record<string, boolean>
  >({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);

  const dayWidth = ZOOM_LEVELS[zoom].dayWidth;
  const today = useMemo(() => startOfDay(new Date()), []);

  /* ------------------------------------------------------------------------ */
  /* Diagnostics                                                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    reportDuplicateIds("fases recebidas", phasesProp ?? []);
    reportDuplicateIds("passos recebidos", stepsProp ?? []);
    reportDuplicateIds("entregáveis recebidos", deliverablesProp ?? []);
    reportDuplicateIds("marcos recebidos", milestonesProp ?? []);
  }, [phasesProp, stepsProp, deliverablesProp, milestonesProp]);

  /* ------------------------------------------------------------------------ */
  /* Normalize timeline items                                                 */
  /* ------------------------------------------------------------------------ */

  const timelineItems = useMemo<TimelineItem[]>(
    () => [
      ...steps.map((step) => ({
        ...step,
        kind: "step" as const,
      })),
      ...deliverables.map((deliverable) => ({
        ...deliverable,
        kind: "deliverable" as const,
      })),
    ],
    [steps, deliverables],
  );

  /* ------------------------------------------------------------------------ */
  /* Phases, scheduled items, and data-quality counters                       */
  /* ------------------------------------------------------------------------ */

  const { phaseGroups, unscheduledCount, orphanCount } = useMemo(() => {
    const sortedPhases = [...phases].sort(
      (a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        a.name.localeCompare(b.name, "pt"),
    );

    const phaseIds = new Set(sortedPhases.map((phase) => phase.id));
    const byPhase = new Map<string, ScheduledTimelineItem[]>();

    let unscheduled = 0;
    let orphans = 0;

    for (const item of timelineItems) {
      if (!phaseIds.has(item.phaseId)) {
        orphans += 1;
        continue;
      }

      const parsedStart = parseDate(item.startDate);
      const parsedEnd = parseDate(item.endDate);

      if (!parsedStart || !parsedEnd) {
        unscheduled += 1;
        continue;
      }

      const reversed = parsedStart.getTime() > parsedEnd.getTime();

      const scheduled: ScheduledTimelineItem = {
        ...item,
        start: reversed ? parsedEnd : parsedStart,
        end: reversed ? parsedStart : parsedEnd,
        reversed,
      };

      const existing = byPhase.get(item.phaseId);

      if (existing) {
        existing.push(scheduled);
      } else {
        byPhase.set(item.phaseId, [scheduled]);
      }
    }

    const groups = sortedPhases.map((phase, index) => {
      const items = (byPhase.get(phase.id) ?? []).sort(
        (a, b) =>
          a.start.getTime() - b.start.getTime() ||
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          a.name.localeCompare(b.name, "pt") ||
          a.id.localeCompare(b.id),
      );

      let weightedProgress = 0;
      let totalWeight = 0;

      for (const item of items) {
        const weight = Math.max(
          1,
          differenceInDays(item.start, item.end) + 1,
        );

        weightedProgress += clampProgress(item.progress) * weight;
        totalWeight += weight;
      }

      const calculatedProgress =
        totalWeight > 0
          ? Math.round(weightedProgress / totalWeight)
          : clampProgress(phase.progress ?? 0);

      return {
        ...phase,
        items,
        avgProgress: calculatedProgress,
        color: PHASE_PALETTE[index % PHASE_PALETTE.length],
      };
    });

    return {
      phaseGroups: groups,
      unscheduledCount: unscheduled,
      orphanCount: orphans,
    };
  }, [phases, timelineItems]);

  /* ------------------------------------------------------------------------ */
  /* Milestones                                                               */
  /* ------------------------------------------------------------------------ */

  const validMilestones = useMemo(
    () =>
      milestones
        .flatMap((milestone) => {
          const date = parseDate(milestone.date);

          if (!date) return [];

          return [{ ...milestone, dateObj: date }];
        })
        .sort(
          (a, b) =>
            a.dateObj.getTime() - b.dateObj.getTime() ||
            a.id.localeCompare(b.id),
        ),
    [milestones],
  );

  /* ------------------------------------------------------------------------ */
  /* Timeline range                                                           */
  /* ------------------------------------------------------------------------ */

  const { timelineStart, totalDays } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    const include = (date: Date | null) => {
      if (!date) return;

      const time = date.getTime();

      min = Math.min(min, time);
      max = Math.max(max, time);
    };

    // Include phase dates even when the phase has no scheduled items.
    for (const phase of phaseGroups) {
      include(parseDate(phase.startDate));
      include(parseDate(phase.endDate));

      for (const item of phase.items) {
        include(item.start);
        include(item.end);
      }
    }

    for (const milestone of validMilestones) {
      include(milestone.dateObj);
    }

    include(parseDate(startDate));

    const todayTime = today.getTime();

    if (min === Infinity) {
      min = todayTime;
      max = todayTime;
    } else {
      const padding = TODAY_RANGE_PADDING_DAYS * MS_PER_DAY;

      if (
        todayTime >= min - padding &&
        todayTime <= max + padding
      ) {
        min = Math.min(min, todayTime);
        max = Math.max(max, todayTime);
      }
    }

    const earliest = addDays(new Date(min), -START_BUFFER_DAYS);
    const span = differenceInDays(earliest, new Date(max));

    return {
      timelineStart: earliest,
      totalDays: Math.max(
        MIN_TIMELINE_DAYS,
        span + END_BUFFER_DAYS + 1,
      ),
    };
  }, [phaseGroups, validMilestones, startDate, today]);

  const timelineWidth = totalDays * dayWidth;
  const todayOffset = differenceInDays(timelineStart, today);
  const todayVisible = todayOffset >= 0 && todayOffset < totalDays;
  const todayPosition = todayOffset * dayWidth + dayWidth / 2;

  /* ------------------------------------------------------------------------ */
  /* Header: months, days, milestone labels                                   */
  /* ------------------------------------------------------------------------ */

  const { monthSegments, dayCells } = useMemo(() => {
    const segments: { key: string; label: string; days: number }[] = [];
    const cells: { key: string; day: number; isToday: boolean }[] = [];

    for (let index = 0; index < totalDays; index++) {
      const date = addDays(timelineStart, index);
      const label = formatMonthLabel(date);
      const last = segments[segments.length - 1];

      if (last && last.label === label) {
        last.days += 1;
      } else {
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

  const milestoneRows = useMemo(() => {
    const rowEnds: number[] = [];

    return validMilestones.map((milestone) => {
      const day = differenceInDays(timelineStart, milestone.dateObj);
      const left = day * dayWidth;

      const width = Math.min(
        MILESTONE_LABEL_MAX_WIDTH,
        milestone.name.length * MILESTONE_LABEL_CHAR_WIDTH +
          MILESTONE_LABEL_PADDING,
      );

      let row = 0;

      while (rowEnds[row] !== undefined && left < rowEnds[row]) {
        row++;
      }

      rowEnds[row] = left + width + 8;

      return { ...milestone, row, left };
    });
  }, [validMilestones, timelineStart, dayWidth]);

  const milestoneRowCount = milestoneRows.length
    ? Math.max(...milestoneRows.map((milestone) => milestone.row)) + 1
    : 1;

  const fullHeaderHeight =
    HEADER_HEIGHT + milestoneRowCount * MILESTONE_LABEL_ROW_HEIGHT;

  /* ------------------------------------------------------------------------ */
  /* Background grid                                                          */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Auto-scroll to today                                                     */
  /* ------------------------------------------------------------------------ */

  const hasPhases = phases.length > 0;

  useEffect(() => {
    if (
      didAutoScroll.current ||
      !hasPhases ||
      !scrollRef.current
    ) {
      return;
    }

    didAutoScroll.current = true;

    if (todayVisible) {
      scrollRef.current.scrollLeft = Math.max(
        0,
        todayPosition - AUTO_SCROLL_LEAD_PX,
      );
    }
  }, [hasPhases, todayVisible, todayPosition]);

  function togglePhase(phaseId: string) {
    setCollapsedPhases((previous) => ({
      ...previous,
      [phaseId]: !previous[phaseId],
    }));
  }

  /* ------------------------------------------------------------------------ */
  /* Empty state                                                              */
  /* ------------------------------------------------------------------------ */

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

  return (
    <div className="w-full space-y-3 py-4 text-gray-700">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          {(Object.keys(MILESTONE_COLORS) as GanttMilestoneType[]).map(
            (type) => (
              <li key={type} className="flex items-center gap-1.5">
                <span
                  className={`h-3 w-[2px] ${MILESTONE_COLORS[type].swatch}`}
                />
                {MILESTONE_COLORS[type].label}
              </li>
            ),
          )}

          <li className="flex items-center gap-1.5">
            <span className="h-3 w-[2px] bg-red-500" />
            Hoje
          </li>
        </ul>

        <div
          role="group"
          aria-label="Zoom do cronograma"
          className="flex items-center gap-0.5 rounded-md border border-slate-200 p-0.5"
        >
          {(Object.keys(ZOOM_LEVELS) as ZoomLevel[]).map((level) => {
            const Icon = level === "compact" ? ZoomOut : ZoomIn;
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

      {/* Chart */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div
          ref={scrollRef}
          className="relative max-h-[520px] overflow-auto"
        >
          <div style={{ width: totalWidth }}>
            {/* Sticky header */}
            <div
              className="sticky top-0 z-30 flex border-b border-slate-200 bg-white"
              style={{
                height: fullHeaderHeight,
                width: totalWidth,
              }}
            >
              <div
                className="sticky left-0 z-40 flex shrink-0 items-center border-r border-slate-200 bg-white px-3 shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
                style={{ width: LABEL_WIDTH }}
              >
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Fases, passos e entregáveis
                </span>
              </div>

              <div className="shrink-0" style={{ width: timelineWidth }}>
                {/* Months */}
                <div
                  className="flex border-b border-slate-200"
                  style={{ height: MONTH_ROW_HEIGHT }}
                >
                  {monthSegments.map((segment) => (
                    <div
                      key={segment.key}
                      className="flex items-center justify-center overflow-hidden whitespace-nowrap border-r border-slate-100 text-xs"
                      style={{ width: segment.days * dayWidth }}
                    >
                      {segment.label}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div
                  className="flex border-b border-slate-200"
                  style={{ height: DAY_ROW_HEIGHT }}
                >
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

                {/* Milestone labels */}
                <div
                  className="relative"
                  style={{
                    height:
                      milestoneRowCount * MILESTONE_LABEL_ROW_HEIGHT,
                  }}
                >
                  {milestoneRows.map((milestone) => (
                    <span
                      key={milestone.id}
                      className="absolute block truncate rounded border border-slate-200 bg-white px-1 text-[10px] leading-4 text-slate-600"
                      style={{
                        left: milestone.left + 2,
                        top: milestone.row * MILESTONE_LABEL_ROW_HEIGHT,
                        maxWidth: MILESTONE_LABEL_MAX_WIDTH,
                      }}
                      title={`${milestone.name} — ${formatDate(
                        milestone.dateObj,
                      )} (${MILESTONE_COLORS[milestone.type].label})`}
                    >
                      {milestone.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="relative" style={{ width: totalWidth }}>
              {/* Timeline background */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 top-0 z-0"
                style={{
                  left: LABEL_WIDTH,
                  width: timelineWidth,
                  ...gridStyle,
                }}
              >
                {milestoneRows.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`absolute bottom-0 top-0 w-[2px] ${
                      MILESTONE_COLORS[milestone.type].line
                    }`}
                    style={{ left: milestone.left }}
                  />
                ))}

                {todayVisible && (
                  <div
                    className="absolute bottom-0 top-0 w-[2px] bg-red-500"
                    style={{ left: todayPosition - 1 }}
                  />
                )}
              </div>

              {/* Phase groups */}
              {phaseGroups.map((group) => {
                const collapsed = !!collapsedPhases[group.id];

                return (
                  <div key={group.id} className="relative z-10">
                    {/* Phase row */}
                    <div
                      className="flex"
                      style={{ height: ROW_HEIGHT, width: totalWidth }}
                    >
                      <button
                        type="button"
                        onClick={() => togglePhase(group.id)}
                        aria-expanded={!collapsed}
                        className="sticky left-0 z-20 flex shrink-0 items-center gap-1.5 border-b border-r border-slate-200 bg-slate-50 px-3 text-left shadow-[2px_0_4px_rgba(0,0,0,0.06)] hover:bg-slate-100"
                        style={{ width: LABEL_WIDTH }}
                      >
                        {collapsed ? (
                          <ChevronRight
                            className="h-3.5 w-3.5 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown
                            className="h-3.5 w-3.5 shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                        )}

                        <span
                          className={`h-2 w-2 shrink-0 rounded-sm ${group.color.dot}`}
                        />

                        <span className="truncate text-sm font-medium text-slate-700">
                          {group.name}
                        </span>

                        <span className="ml-auto shrink-0 text-xs text-slate-400">
                          {group.avgProgress}%
                        </span>
                      </button>

                      {/* Phase date range, when supplied */}
                      <div
                        className="relative shrink-0 border-b border-slate-200"
                        style={{ width: timelineWidth }}
                      >
                        {(() => {
                          const phaseStart = parseDate(group.startDate);
                          const phaseEnd = parseDate(group.endDate);

                          if (!phaseStart || !phaseEnd) return null;

                          const reversed =
                            phaseStart.getTime() > phaseEnd.getTime();

                          const start = reversed ? phaseEnd : phaseStart;
                          const end = reversed ? phaseStart : phaseEnd;
                          const duration = Math.max(
                            1,
                            differenceInDays(start, end) + 1,
                          );
                          const left =
                            differenceInDays(timelineStart, start) *
                            dayWidth;

                          return (
                            <div
                              title={`${group.name}: ${formatDate(start)} – ${formatDate(end)}`}
                              className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-sm border ${
                                group.color.track
                              } ${
                                reversed
                                  ? "border-dashed border-red-500"
                                  : group.color.border
                              }`}
                              style={{
                                left,
                                width: Math.max(duration * dayWidth, 4),
                              }}
                            />
                          );
                        })()}
                      </div>
                    </div>

                    {/* Step and deliverable rows */}
                    {!collapsed &&
                      group.items.map((item) => {
                        const progress = clampProgress(item.progress);

                        const duration = Math.max(
                          1,
                          differenceInDays(item.start, item.end) + 1,
                        );

                        const barLeft =
                          differenceInDays(timelineStart, item.start) *
                          dayWidth;

                        const barWidth = duration * dayWidth;

                        const range = `${formatDate(item.start)} – ${formatDate(item.end)}`;

                        const note = item.reversed
                          ? "\nAtenção: as datas de início e fim estavam invertidas."
                          : "";

                        const isDeliverable = item.kind === "deliverable";

                        return (
                          <div
                            key={`${item.kind}-${item.id}`}
                            className="group flex"
                            style={{ height: ROW_HEIGHT, width: totalWidth }}
                          >
                            <div
                              className="sticky left-0 z-20 flex shrink-0 items-center gap-2 border-b border-r border-slate-200 bg-white pl-7 pr-3 shadow-[2px_0_4px_rgba(0,0,0,0.06)] group-hover:bg-blue-50"
                              style={{ width: LABEL_WIDTH }}
                              title={item.name}
                            >
                              <span
                                className={`h-2 w-2 shrink-0 rounded-sm ${
                                  isDeliverable
                                    ? "bg-amber-400"
                                    : "bg-slate-400"
                                }`}
                                aria-hidden="true"
                              />

                              <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                                {item.name}
                              </span>

                              <span className="shrink-0 text-[10px] text-slate-400">
                                {isDeliverable ? "Entrega" : "Passo"}
                              </span>
                            </div>

                            <div
                              className="relative shrink-0 border-b border-slate-100 group-hover:bg-blue-50/50"
                              style={{ width: timelineWidth }}
                            >
                              <div
                                role="img"
                                aria-label={`${item.name}, ${isDeliverable ? "entregável" : "passo"}, ${progress}% concluído, ${range}`}
                                title={`${item.name}\n${isDeliverable ? "Entregável" : "Passo"}\n${range}\n${progress}% concluído${note}`}
                                className={`absolute top-1/2 h-5 -translate-y-1/2 overflow-hidden rounded border ${
                                  group.color.track
                                } ${
                                  item.reversed
                                    ? "border-dashed border-red-500"
                                    : group.color.border
                                }`}
                                style={{
                                  left: barLeft,
                                  width: Math.max(barWidth, 4),
                                }}
                              >
                                <div
                                  className={`h-full ${
                                    isDeliverable
                                      ? "bg-amber-500"
                                      : group.color.bar
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />

                                {barWidth > BAR_LABEL_MIN_WIDTH && (
                                  <span className="absolute inset-0 flex items-center justify-end pr-1.5 text-[10px] font-medium text-slate-900">
                                    {progress}%
                                  </span>
                                )}
                              </div>
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

      {/* Screen-reader milestone summary */}
      {validMilestones.length > 0 && (
        <div className="sr-only">
          <p>Marcos do projecto</p>

          <ul>
            {validMilestones.map((milestone) => (
              <li key={milestone.id}>
                {milestone.name},{" "}
                {MILESTONE_COLORS[milestone.type].label},{" "}
                {formatDate(milestone.dateObj)}
              </li>
            ))}
          </ul>
        </div>
      )}

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
