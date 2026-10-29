"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
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

type PhaseColor = {
  bar: string;
  track: string;
  border: string;
  dot: string;
};

/* -------------------------------------------------------------------------- */
/* Pro-Sota design tokens                                                     */
/* -------------------------------------------------------------------------- */

const COLORS = {
  navy: "#002950",
  navyLight: "#16466F",
  navySoft: "#E8EFF5",
  gold: "#BD9655",
  goldLight: "#E9D8B8",
  goldSoft: "#F7F1E7",
  background: "#F7F7F5",
  border: "#E5E7EB",
  muted: "#6B7280",
  text: "#374151",
  white: "#FFFFFF",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
} as const;

/* -------------------------------------------------------------------------- */
/* Layout constants                                                           */
/* -------------------------------------------------------------------------- */

const ROW_HEIGHT = 52;
const ROW_HEIGHT_NARROW = 44;
const MONTH_ROW_HEIGHT = 24;
const DAY_ROW_HEIGHT = 20;
const HEADER_HEIGHT = MONTH_ROW_HEIGHT + DAY_ROW_HEIGHT;

const LABEL_WIDTH = 280;
const LABEL_WIDTH_NARROW = 124;
/** Container width (px) under which the compact mobile layout is used. */
const NARROW_BREAKPOINT = 640;

const MIN_TIMELINE_DAYS = 60;
const START_BUFFER_DAYS = 3;
const END_BUFFER_DAYS = 15;
const TODAY_RANGE_PADDING_DAYS = 45;
const BAR_LABEL_MIN_WIDTH = 60;
const AUTO_SCROLL_LEAD_PX = 120;
const AUTO_SCROLL_LEAD_NARROW_PX = 40;
/** Below this day width, only Mondays get a day number in the header. */
const EVERY_DAY_LABEL_MIN_WIDTH = 14;

const ZOOM_LEVELS = {
  overview: { dayWidth: 8, label: "Visão geral", short: "Geral" },
  compact: { dayWidth: 16, label: "Compacto", short: "Médio" },
  comfortable: { dayWidth: 26, label: "Confortável", short: "Amplo" },
} as const;

type ZoomLevel = keyof typeof ZOOM_LEVELS;
type ZoomMode = ZoomLevel | "fit";

const CLAMP_2_LINES = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
} as const;

/*
 * Phase colours remain within the Pro-Sota navy/gold identity.
 * Alternating shades distinguish phases without introducing unrelated hues.
 */
const PHASE_PALETTE: PhaseColor[] = [
  {
    bar: COLORS.navy,
    track: "#E8EFF5",
    border: COLORS.navy,
    dot: COLORS.navy,
  },
  {
    bar: COLORS.gold,
    track: "#F7F1E7",
    border: "#A88040",
    dot: COLORS.gold,
  },
  {
    bar: COLORS.navyLight,
    track: "#EDF2F7",
    border: COLORS.navyLight,
    dot: COLORS.navyLight,
  },
  {
    bar: "#A88040",
    track: "#F5EBDD",
    border: "#927037",
    dot: "#A88040",
  },
  {
    bar: "#426583",
    track: "#EAF0F5",
    border: "#426583",
    dot: "#426583",
  },
  {
    bar: "#C9A66D",
    track: "#FAF5EC",
    border: "#A88040",
    dot: "#C9A66D",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

// useLayoutEffect warns during SSR in some React versions.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
    console.warn(`[GanttChart] IDs duplicados em ${label}:`, [
      ...duplicates,
    ]);
  }
}

function getStablePhaseColor(phaseId: string): PhaseColor {
  let hash = 0;

  for (let i = 0; i < phaseId.length; i++) {
    hash = (hash * 31 + phaseId.charCodeAt(i)) | 0;
  }

  return PHASE_PALETTE[Math.abs(hash) % PHASE_PALETTE.length];
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function itemKey(item: { kind: TimelineItemType; id: string }) {
  return `${item.kind}-${item.id}`;
}

function isOverdue(item: ScheduledTimelineItem, today: Date) {
  return Boolean(
    item.end &&
      item.end.getTime() < today.getTime() &&
      clampProgress(item.progress) < 100,
  );
}

function getItemStatus(item: ScheduledTimelineItem, today: Date) {
  const progress = clampProgress(item.progress);

  if (progress >= 100) return "Concluído";
  if (!item.start || !item.end) return "Sem datas definidas";
  if (isOverdue(item, today)) return "Atrasado";
  if (item.start.getTime() > today.getTime()) return "Por iniciar";

  return "Em curso";
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

  const [zoom, setZoom] = useState<ZoomMode>("compact");
  const [collapsedPhases, setCollapsedPhases] = useState<
    Record<string, boolean>
  >({});
  const [today, setToday] = useState<Date>(() => startOfDay(new Date()));
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const didAutoScroll = useRef(false);
  const didInitZoom = useRef(false);
  const zoomAnchorDay = useRef<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    reportDuplicateIds("fases recebidas", phasesProp ?? []);
    reportDuplicateIds("passos recebidos", stepsProp ?? []);
    reportDuplicateIds("entregáveis recebidos", deliverablesProp ?? []);
  }, [phasesProp, stepsProp, deliverablesProp]);

  /* ------------------------------------------------------------------------ */
  /* Current date                                                             */
  /* ------------------------------------------------------------------------ */

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

    const refreshOnFocus = () => {
      setToday(startOfDay(new Date()));
    };

    window.addEventListener("focus", refreshOnFocus);

    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Timeline items                                                           */
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

  const hasPhases =
    phases.length > 0 || timelineItems.length > 0;

  /* ------------------------------------------------------------------------ */
  /* Container size                                                           */
  /* ------------------------------------------------------------------------ */

  // Measure before paint so phones never flash the desktop layout.
  useIsoLayoutEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    const update = () => setContainerWidth(element.clientWidth);

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, [hasPhases]);

  const isNarrow =
    containerWidth > 0 && containerWidth < NARROW_BREAKPOINT;
  const labelWidth = isNarrow ? LABEL_WIDTH_NARROW : LABEL_WIDTH;
  const rowHeight = isNarrow ? ROW_HEIGHT_NARROW : ROW_HEIGHT;

  /* ------------------------------------------------------------------------ */
  /* Phase groups                                                             */
  /* ------------------------------------------------------------------------ */

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

      const reversed =
        hasValidDates &&
        parsedStart!.getTime() > parsedEnd!.getTime();

      const scheduled: ScheduledTimelineItem = {
        ...item,
        start: hasValidDates
          ? reversed
            ? parsedEnd
            : parsedStart
          : null,
        end: hasValidDates
          ? reversed
            ? parsedStart
            : parsedEnd
          : null,
        reversed,
      };

      if (!hasValidDates) unscheduled++;

      const targetPhaseId = phaseIds.has(item.phaseId)
        ? item.phaseId
        : "__gantt_unassigned__";

      if (targetPhaseId === "__gantt_unassigned__") orphans++;

      const existing = byPhase.get(targetPhaseId);

      if (existing) {
        existing.push(scheduled);
      } else {
        byPhase.set(targetPhaseId, [scheduled]);
      }
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
        (
          item,
        ): item is ScheduledTimelineItem & {
          start: Date;
          end: Date;
        } => Boolean(item.start && item.end),
      );

      const weightedProgress = scheduledItems.reduce(
        (total, item) => {
          const weight = Math.max(
            1,
            differenceInDays(item.start, item.end) + 1,
          );

          return total + clampProgress(item.progress) * weight;
        },
        0,
      );

      const totalWeight = scheduledItems.reduce(
        (total, item) =>
          total +
          Math.max(1, differenceInDays(item.start, item.end) + 1),
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

    const orphanItems = (
      byPhase.get("__gantt_unassigned__") ?? []
    ).sort(
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

  /* ------------------------------------------------------------------------ */
  /* Timeline range                                                           */
  /* ------------------------------------------------------------------------ */

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

      if (
        todayTime >= min - padding &&
        todayTime <= max + padding
      ) {
        min = Math.min(min, todayTime);
        max = Math.max(max, todayTime);
      }
    }

    const earliest = addDays(
      startOfDay(new Date(min)),
      -START_BUFFER_DAYS,
    );

    const latest = startOfDay(new Date(max));
    const span = differenceInDays(earliest, latest);

    return {
      timelineStart: earliest,
      totalDays: Math.max(
        MIN_TIMELINE_DAYS,
        span + END_BUFFER_DAYS + 1,
      ),
    };
  }, [phaseGroups, startDate, today]);

  /* ------------------------------------------------------------------------ */
  /* Day width                                                                */
  /* ------------------------------------------------------------------------ */

  // "fit" stretches the whole timeline across the visible width (no scroll).
  const fitDayWidth =
    containerWidth > 0
      ? Math.max(2, (containerWidth - labelWidth) / totalDays)
      : ZOOM_LEVELS.compact.dayWidth;

  const dayWidth =
    zoom === "fit" ? fitDayWidth : ZOOM_LEVELS[zoom].dayWidth;

  const timelineWidth = totalDays * dayWidth;
  const totalWidth = labelWidth + timelineWidth;
  const todayOffset = differenceInDays(timelineStart, today);
  const todayVisible =
    todayOffset >= 0 && todayOffset < totalDays;
  const todayPosition = todayOffset * dayWidth + dayWidth / 2;

  /* ------------------------------------------------------------------------ */
  /* Timeline header                                                          */
  /* ------------------------------------------------------------------------ */

  const { monthSegments, dayCells } = useMemo(() => {
    const segments: {
      key: string;
      label: string;
      days: number;
    }[] = [];

    const cells: {
      key: string;
      day: number;
      isToday: boolean;
      isMonday: boolean;
    }[] = [];

    for (let index = 0; index < totalDays; index++) {
      const date = addDays(timelineStart, index);
      const label = formatMonthLabel(date);
      const last = segments[segments.length - 1];

      if (last && last.label === label) {
        last.days++;
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
        isMonday: date.getDay() === 1,
      });
    }

    return {
      monthSegments: segments,
      dayCells: cells,
    };
  }, [timelineStart, totalDays, todayOffset]);

  /* ------------------------------------------------------------------------ */
  /* Grid styling                                                             */
  /* ------------------------------------------------------------------------ */

  const gridStyle = useMemo(() => {
    const firstSaturday = (6 - timelineStart.getDay() + 7) % 7;
    const week = dayWidth * 7;
    const weekend = dayWidth * 2;

    return {
      backgroundImage: [
        `linear-gradient(to right, ${COLORS.background} 0, ${COLORS.background} ${weekend}px, transparent ${weekend}px)`,
        "linear-gradient(to right, rgba(0,41,80,0.09) 1px, transparent 1px)",
      ].join(", "),
      backgroundSize: `${week}px 100%, ${dayWidth}px 100%`,
      backgroundPosition: `${firstSaturday * dayWidth}px 0, 0 0`,
      backgroundRepeat: "repeat-x, repeat-x",
    };
  }, [timelineStart, dayWidth]);

  /* ------------------------------------------------------------------------ */
  /* Navigation                                                               */
  /* ------------------------------------------------------------------------ */

  /*
   * The label column is sticky, so it covers the first `labelWidth` pixels of
   * the viewport. A scrollLeft of N therefore puts timeline day N / dayWidth
   * right at the edge of the visible timeline area.
   */
  const scrollToToday = useCallback(() => {
    const element = scrollRef.current;

    if (!element || !todayVisible) return;

    const lead = isNarrow
      ? AUTO_SCROLL_LEAD_NARROW_PX
      : AUTO_SCROLL_LEAD_PX;

    element.scrollLeft = clampNumber(
      todayPosition - lead,
      0,
      Math.max(0, element.scrollWidth - element.clientWidth),
    );
  }, [todayVisible, todayPosition, isNarrow]);

  const changeZoom = useCallback(
    (next: ZoomMode) => {
      if (next === zoom) return;

      const element = scrollRef.current;

      // Remember which day is at the left edge so zooming keeps it in view.
      zoomAnchorDay.current =
        element && dayWidth > 0 ? element.scrollLeft / dayWidth : null;

      setZoom(next);
    },
    [zoom, dayWidth],
  );

  useIsoLayoutEffect(() => {
    const element = scrollRef.current;
    const anchor = zoomAnchorDay.current;

    if (!element || anchor === null) return;

    zoomAnchorDay.current = null;

    element.scrollLeft =
      zoom === "fit"
        ? 0
        : clampNumber(
            anchor * dayWidth,
            0,
            Math.max(0, element.scrollWidth - element.clientWidth),
          );
  }, [dayWidth, zoom]);

  /*
   * First render with a measured width: pick a sensible zoom for phones,
   * then scroll to today once the final day width is applied.
   */
  useEffect(() => {
    if (!hasPhases || containerWidth === 0 || didAutoScroll.current) {
      return;
    }

    if (!didInitZoom.current) {
      didInitZoom.current = true;

      if (containerWidth < NARROW_BREAKPOINT && zoom !== "overview") {
        setZoom("overview");
        return;
      }
    }

    didAutoScroll.current = true;
    requestAnimationFrame(scrollToToday);
  }, [hasPhases, containerWidth, zoom, scrollToToday]);

  /* ------------------------------------------------------------------------ */
  /* Phase controls                                                           */
  /* ------------------------------------------------------------------------ */

  const togglePhase = useCallback((phaseId: string) => {
    setCollapsedPhases((previous) => ({
      ...previous,
      [phaseId]: !previous[phaseId],
    }));
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedPhases(
      Object.fromEntries(
        phaseGroups.map((phase) => [phase.id, true]),
      ),
    );
  }, [phaseGroups]);

  const expandAll = useCallback(() => {
    setCollapsedPhases({});
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Selection (tap a row or bar to see its details)                          */
  /* ------------------------------------------------------------------------ */

  const toggleSelect = useCallback((key: string) => {
    setSelectedKey((previous) => (previous === key ? null : key));
  }, []);

  const selected = useMemo(() => {
    if (!selectedKey) return null;

    for (const group of phaseGroups) {
      for (const item of group.items) {
        if (itemKey(item) === selectedKey) {
          return { item, phase: group };
        }
      }
    }

    return null;
  }, [selectedKey, phaseGroups]);

  /* ------------------------------------------------------------------------ */
  /* Empty state                                                              */
  /* ------------------------------------------------------------------------ */

  if (!hasPhases) {
    return (
      <div
        className="rounded-xl border bg-white px-6 py-12 text-center"
        style={{ borderColor: COLORS.border }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: COLORS.navy }}
        >
          Ainda não existem fases para apresentar.
        </p>

        <p
          className="mt-1 text-sm"
          style={{ color: COLORS.muted }}
        >
          Adicione fases ao projecto para visualizar o cronograma.
        </p>
      </div>
    );
  }

  const hasNotices =
    unscheduledCount > 0 || orphanCount > 0;

  const allCollapsed = phaseGroups.every(
    (phase) => collapsedPhases[phase.id],
  );

  const showEveryDayLabel = dayWidth >= EVERY_DAY_LABEL_MIN_WIDTH;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="w-full min-w-0 space-y-3 py-3 sm:py-4"
      style={{ color: COLORS.text }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 sm:gap-3">
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: COLORS.muted }}
        >
          <span
            className="h-3 w-[2px] rounded-full"
            style={{ backgroundColor: COLORS.danger }}
            aria-hidden="true"
          />
          Hoje
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-0.5 rounded-md border p-0.5"
            style={{ borderColor: COLORS.border }}
          >
            <button
              type="button"
              onClick={allCollapsed ? expandAll : collapseAll}
              className="flex items-center gap-1 rounded px-2 py-1.5 text-xs transition-colors hover:bg-[#F7F7F5] sm:py-1"
              style={{ color: COLORS.navy }}
              aria-label={
                allCollapsed
                  ? "Expandir todas as fases"
                  : "Recolher todas as fases"
              }
              title={
                allCollapsed
                  ? "Expandir todas as fases"
                  : "Recolher todas as fases"
              }
            >
              {allCollapsed ? (
                <ChevronsUpDown
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              ) : (
                <ChevronsDownUp
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              )}

              <span className="hidden sm:inline">
                {allCollapsed ? "Expandir tudo" : "Recolher tudo"}
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                changeZoom(zoom === "fit" ? "compact" : "fit")
              }
              aria-pressed={zoom === "fit"}
              className="flex items-center gap-1 rounded px-2 py-1.5 text-xs transition-colors sm:py-1"
              style={
                zoom === "fit"
                  ? {
                      backgroundColor: COLORS.navy,
                      color: COLORS.white,
                      fontWeight: 500,
                    }
                  : { color: COLORS.navy }
              }
              title="Ajustar o cronograma à largura disponível"
            >
              <Maximize2
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              <span>Ajustar</span>
            </button>

            <button
              type="button"
              onClick={scrollToToday}
              disabled={!todayVisible || zoom === "fit"}
              className="rounded px-2 py-1.5 text-xs transition-colors hover:bg-[#F7F7F5] disabled:cursor-not-allowed disabled:opacity-40 sm:py-1"
              style={{ color: COLORS.navy }}
            >
              Hoje
            </button>
          </div>

          <div
            role="group"
            aria-label="Zoom do cronograma"
            className="flex items-center gap-0.5 rounded-md border p-0.5"
            style={{ borderColor: COLORS.border }}
          >
            {(Object.keys(ZOOM_LEVELS) as ZoomLevel[]).map(
              (level) => {
                const Icon =
                  level === "comfortable" ? ZoomIn : ZoomOut;

                const active = zoom === level;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => changeZoom(level)}
                    aria-pressed={active}
                    aria-label={ZOOM_LEVELS[level].label}
                    className="flex items-center gap-1 rounded px-2 py-1.5 text-xs transition-colors sm:py-1"
                    style={
                      active
                        ? {
                            backgroundColor: COLORS.navy,
                            color: COLORS.white,
                            fontWeight: 500,
                          }
                        : {
                            color: COLORS.muted,
                          }
                    }
                  >
                    <Icon
                      className="hidden h-3.5 w-3.5 sm:block"
                      aria-hidden="true"
                    />
                    <span className="sm:hidden">
                      {ZOOM_LEVELS[level].short}
                    </span>
                    <span className="hidden sm:inline">
                      {ZOOM_LEVELS[level].label}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="min-w-0 overflow-hidden rounded-xl border bg-white"
        style={{ borderColor: COLORS.border }}
      >
        {/*
          Horizontal scrolling stays inside the chart. On phones the label
          column is narrower, so more of the timeline is visible at once.
        */}
        <div
          ref={scrollRef}
          className="relative max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain"
        >
          <div style={{ width: totalWidth }}>
            {/* Timeline header */}
            <div
              className="sticky top-0 z-30 flex border-b bg-white"
              style={{
                height: HEADER_HEIGHT,
                width: totalWidth,
                borderColor: COLORS.border,
              }}
            >
              <div
                className="sticky left-0 z-40 flex shrink-0 items-center border-r bg-white px-2 shadow-[2px_0_4px_rgba(0,0,0,0.04)] sm:px-3"
                style={{
                  width: labelWidth,
                  borderColor: COLORS.border,
                }}
              >
                <span
                  className="truncate text-xs font-semibold uppercase tracking-wide"
                  style={{ color: COLORS.navy }}
                >
                  {isNarrow
                    ? "Cronograma"
                    : "Fases, passos e entregáveis"}
                </span>
              </div>

              <div
                className="shrink-0"
                style={{ width: timelineWidth }}
              >
                {/* Month row */}
                <div
                  className="flex border-b"
                  style={{
                    height: MONTH_ROW_HEIGHT,
                    borderColor: COLORS.border,
                  }}
                >
                  {monthSegments.map((segment) => (
                    <div
                      key={segment.key}
                      className="flex items-center justify-center overflow-hidden whitespace-nowrap border-r text-xs"
                      style={{
                        width: segment.days * dayWidth,
                        borderColor: "#EEF0F2",
                        color: COLORS.navy,
                        backgroundColor: COLORS.background,
                      }}
                    >
                      {segment.label}
                    </div>
                  ))}
                </div>

                {/* Day row: thin zoom levels only label Mondays */}
                <div
                  className="flex border-b"
                  style={{
                    height: DAY_ROW_HEIGHT,
                    borderColor: COLORS.border,
                  }}
                >
                  {dayCells.map((cell) => {
                    const showLabel = showEveryDayLabel
                      ? true
                      : cell.isMonday && !cell.isToday;

                    return (
                      <div
                        key={cell.key}
                        className="flex shrink-0 items-center justify-center whitespace-nowrap text-[10px]"
                        style={{
                          width: dayWidth,
                          overflow: "visible",
                          backgroundColor: cell.isToday
                            ? COLORS.navy
                            : undefined,
                          color: cell.isToday
                            ? COLORS.white
                            : COLORS.muted,
                          fontWeight: cell.isToday ? 600 : 400,
                        }}
                        aria-current={
                          cell.isToday ? "date" : undefined
                        }
                        title={cell.key}
                      >
                        {showLabel ? cell.day : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Timeline body */}
            <div
              className="relative"
              style={{ width: totalWidth }}
            >
              {/* Calendar grid and current-day marker */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 top-0 z-0"
                style={{
                  left: labelWidth,
                  width: timelineWidth,
                  ...gridStyle,
                }}
              >
                {todayVisible && (
                  <div
                    className="absolute bottom-0 top-0 w-[2px]"
                    style={{
                      left: todayPosition - 1,
                      backgroundColor: COLORS.danger,
                    }}
                  />
                )}
              </div>

              {phaseGroups.map((group) => {
                const collapsed = !!collapsedPhases[group.id];

                return (
                  <div key={group.id} className="relative z-10">
                    {/* Phase row */}
                    <div
                      className="flex"
                      style={{
                        height: rowHeight,
                        width: totalWidth,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => togglePhase(group.id)}
                        aria-expanded={!collapsed}
                        className="sticky left-0 z-20 flex shrink-0 items-center gap-1.5 border-b border-r bg-[#F7F7F5] px-2 text-left shadow-[2px_0_4px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#EFEFEA] sm:px-3"
                        style={{
                          width: labelWidth,
                          borderColor: COLORS.border,
                        }}
                        title={group.name}
                      >
                        {collapsed ? (
                          <ChevronRight
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: COLORS.muted }}
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: COLORS.muted }}
                            aria-hidden="true"
                          />
                        )}

                        <span
                          className="h-2 w-2 shrink-0 rounded-sm"
                          style={{
                            backgroundColor: group.color.dot,
                          }}
                          aria-hidden="true"
                        />

                        <span
                          className={`min-w-0 flex-1 text-sm font-semibold ${
                            isNarrow ? "leading-tight" : "truncate"
                          }`}
                          style={{
                            color: COLORS.navy,
                            ...(isNarrow ? CLAMP_2_LINES : {}),
                          }}
                        >
                          {group.name}
                        </span>

                        <span
                          className="shrink-0 text-[11px] tabular-nums sm:text-xs"
                          style={{ color: COLORS.muted }}
                        >
                          {group.avgProgress}%
                        </span>
                      </button>

                      <div
                        className="relative shrink-0 border-b"
                        style={{
                          width: timelineWidth,
                          borderColor: COLORS.border,
                        }}
                      >
                        {(() => {
                          const phaseStart = parseDate(group.startDate);
                          const phaseEnd = parseDate(group.endDate);

                          if (!phaseStart || !phaseEnd) return null;

                          const reversed =
                            phaseStart.getTime() >
                            phaseEnd.getTime();

                          const start = startOfDay(
                            reversed ? phaseEnd : phaseStart,
                          );

                          const end = startOfDay(
                            reversed ? phaseStart : phaseEnd,
                          );

                          const startDay = differenceInDays(
                            timelineStart,
                            start,
                          );

                          const endDay = differenceInDays(
                            timelineStart,
                            end,
                          );

                          if (
                            endDay < 0 ||
                            startDay >= totalDays
                          ) {
                            return null;
                          }

                          const visibleStart = clampNumber(
                            startDay,
                            0,
                            totalDays - 1,
                          );

                          const visibleEnd = clampNumber(
                            endDay,
                            0,
                            totalDays - 1,
                          );

                          const left = visibleStart * dayWidth;

                          const width = Math.max(
                            dayWidth,
                            (visibleEnd - visibleStart + 1) *
                              dayWidth,
                          );

                          return (
                            <div
                              title={`${group.name}: ${formatDate(start)} – ${formatDate(end)}${reversed ? " (datas invertidas)" : ""}`}
                              className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-sm border ${reversed ? "border-dashed" : ""}`}
                              style={{
                                left,
                                width,
                                backgroundColor: group.color.track,
                                borderColor: reversed
                                  ? COLORS.danger
                                  : group.color.border,
                              }}
                            >
                              <div
                                className="h-full rounded-sm"
                                style={{
                                  width: `${group.avgProgress}%`,
                                  backgroundColor: group.color.bar,
                                  opacity: 0.3,
                                }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Steps and deliverables */}
                    {!collapsed &&
                      group.items.map((item) => {
                        const key = itemKey(item);
                        const isSelected = selectedKey === key;
                        const progress = clampProgress(item.progress);
                        const isScheduled = Boolean(
                          item.start && item.end,
                        );

                        const startDay = isScheduled
                          ? differenceInDays(
                              timelineStart,
                              item.start!,
                            )
                          : 0;

                        const endDay = isScheduled
                          ? differenceInDays(
                              timelineStart,
                              item.end!,
                            )
                          : 0;

                        if (
                          isScheduled &&
                          (endDay < 0 || startDay >= totalDays)
                        ) {
                          return null;
                        }

                        const visibleStart = clampNumber(
                          startDay,
                          0,
                          totalDays - 1,
                        );

                        const visibleEnd = clampNumber(
                          endDay,
                          0,
                          totalDays - 1,
                        );

                        const barLeft = visibleStart * dayWidth;

                        const barWidth = Math.max(
                          dayWidth,
                          (visibleEnd - visibleStart + 1) *
                            dayWidth,
                        );

                        const range = isScheduled
                          ? `${formatDate(item.start!)} – ${formatDate(item.end!)}`
                          : "Sem datas definidas";

                        const isDeliverable =
                          item.kind === "deliverable";

                        const overdue = isOverdue(item, today);

                        const barColor = isDeliverable
                          ? COLORS.gold
                          : group.color.bar;

                        const barTrack = isDeliverable
                          ? COLORS.goldSoft
                          : group.color.track;

                        const barBorder = isDeliverable
                          ? "#A88040"
                          : group.color.border;

                        return (
                          <div
                            key={key}
                            className="group flex"
                            style={{
                              height: rowHeight,
                              width: totalWidth,
                            }}
                          >
                            {/* Item label */}
                            <button
                              type="button"
                              onClick={() => toggleSelect(key)}
                              aria-pressed={isSelected}
                              className={`sticky left-0 z-20 flex shrink-0 items-center gap-2 border-b border-r pr-2 text-left shadow-[2px_0_4px_rgba(0,0,0,0.04)] transition-colors sm:pr-3 ${
                                isNarrow ? "pl-5" : "pl-7"
                              } ${
                                isSelected
                                  ? "bg-[#F7F1E7]"
                                  : "bg-white group-hover:bg-[#F7F7F5]"
                              }`}
                              style={{
                                width: labelWidth,
                                borderColor: COLORS.border,
                              }}
                              title={item.name}
                            >
                              {/* Square = passo, diamond = entregável */}
                              <span
                                className={`h-2 w-2 shrink-0 ${
                                  isDeliverable
                                    ? "rotate-45"
                                    : "rounded-sm"
                                }`}
                                style={{
                                  backgroundColor: barColor,
                                }}
                                aria-hidden="true"
                              />

                              <span
                                className={`min-w-0 flex-1 text-sm ${
                                  isNarrow ? "leading-tight" : "truncate"
                                }`}
                                style={{
                                  color: COLORS.text,
                                  ...(isNarrow ? CLAMP_2_LINES : {}),
                                }}
                              >
                                {item.name}
                              </span>

                              {overdue &&
                                (isNarrow ? (
                                  <span
                                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                                    style={{
                                      backgroundColor: COLORS.danger,
                                    }}
                                    role="img"
                                    aria-label="Atrasado"
                                  />
                                ) : (
                                  <span
                                    className="shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold"
                                    style={{
                                      color: COLORS.danger,
                                      backgroundColor:
                                        COLORS.dangerSoft,
                                    }}
                                  >
                                    Atrasado
                                  </span>
                                ))}

                              {!isNarrow && (
                                <span
                                  className="shrink-0 text-[10px]"
                                  style={{
                                    color: isDeliverable
                                      ? "#927037"
                                      : COLORS.muted,
                                  }}
                                >
                                  {isDeliverable ? "Entrega" : "Passo"}
                                </span>
                              )}
                            </button>

                            {/* Item timeline */}
                            <div
                              className="relative shrink-0 border-b transition-colors group-hover:bg-[#F7F7F5]/70"
                              style={{
                                width: timelineWidth,
                                borderColor: "#EEF0F2",
                              }}
                            >
                              {isScheduled ? (
                                <button
                                  type="button"
                                  onClick={() => toggleSelect(key)}
                                  aria-pressed={isSelected}
                                  aria-label={`${item.name}, ${isDeliverable ? "entregável" : "passo"}, ${progress}% concluído, ${range}${overdue ? ", atrasado" : ""}`}
                                  title={`${item.name}\n${isDeliverable ? "Entregável" : "Passo"}\n${range}\n${progress}% concluído${item.reversed ? "\nAtenção: as datas de início e fim estavam invertidas." : ""}${overdue ? "\nAtrasado" : ""}`}
                                  className={`absolute top-1/2 -translate-y-1/2 overflow-hidden rounded border p-0 text-left ${
                                    isNarrow ? "h-6" : "h-5"
                                  } ${item.reversed ? "border-dashed" : ""} ${
                                    isSelected
                                      ? "ring-2 ring-[#BD9655]/70"
                                      : ""
                                  }`}
                                  style={{
                                    left: barLeft,
                                    width: barWidth,
                                    backgroundColor: barTrack,
                                    borderColor: item.reversed
                                      ? COLORS.danger
                                      : overdue
                                        ? COLORS.danger
                                        : barBorder,
                                  }}
                                >
                                  <span
                                    className="block h-full transition-[width] duration-300"
                                    style={{
                                      width: `${progress}%`,
                                      backgroundColor: overdue
                                        ? COLORS.danger
                                        : barColor,
                                    }}
                                  />

                                  {barWidth > BAR_LABEL_MIN_WIDTH && (
                                    <span
                                      className="absolute inset-0 flex items-center justify-end pr-1.5 text-[10px] font-semibold"
                                      style={{
                                        color:
                                          progress >= 55
                                            ? COLORS.white
                                            : COLORS.navy,
                                        textShadow:
                                          progress >= 55
                                            ? "0 1px 2px rgba(0,0,0,0.15)"
                                            : "none",
                                      }}
                                    >
                                      {progress}%
                                    </span>
                                  )}
                                </button>
                              ) : (
                                <div
                                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[10px]"
                                  style={{
                                    color: COLORS.muted,
                                    backgroundColor: COLORS.background,
                                  }}
                                >
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

      {/* Details of the tapped item (names are truncated on small screens) */}
      {selected && (
        <div
          className="rounded-xl border bg-white p-3 sm:p-4"
          style={{ borderColor: COLORS.border }}
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="break-words text-sm font-semibold"
                style={{ color: COLORS.navy }}
              >
                {selected.item.name}
              </p>

              <p
                className="mt-0.5 text-xs"
                style={{ color: COLORS.muted }}
              >
                {selected.item.kind === "deliverable"
                  ? "Entregável"
                  : "Passo"}{" "}
                em {selected.phase.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="-mr-1 -mt-1 shrink-0 rounded p-1.5 transition-colors hover:bg-[#F7F7F5]"
              style={{ color: COLORS.muted }}
              aria-label="Fechar detalhes"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
            <div>
              <dt style={{ color: COLORS.muted }}>Período</dt>
              <dd className="font-medium">
                {selected.item.start && selected.item.end
                  ? `${formatDate(selected.item.start)} – ${formatDate(selected.item.end)}`
                  : "Sem datas definidas"}
              </dd>
            </div>

            <div>
              <dt style={{ color: COLORS.muted }}>Estado</dt>
              <dd
                className="font-medium"
                style={{
                  color: isOverdue(selected.item, today)
                    ? COLORS.danger
                    : undefined,
                }}
              >
                {getItemStatus(selected.item, today)}
              </dd>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <dt style={{ color: COLORS.muted }}>Progresso</dt>
              <dd className="mt-1 flex items-center gap-2">
                <span
                  className="h-1.5 flex-1 overflow-hidden rounded-full"
                  style={{ backgroundColor: COLORS.navySoft }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${clampProgress(selected.item.progress)}%`,
                      backgroundColor: COLORS.navy,
                    }}
                  />
                </span>
                <span className="font-medium tabular-nums">
                  {clampProgress(selected.item.progress)}%
                </span>
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Data-quality notices */}
      {hasNotices && (
        <div
          className="space-y-1 px-1 text-xs"
          style={{ color: COLORS.muted }}
        >
          {unscheduledCount > 0 && (
            <p>
              {unscheduledCount === 1
                ? "1 passo ou entregável não aparece"
                : `${unscheduledCount} passos ou entregáveis não aparecem`}{" "}
              no cronograma porque não têm datas de início e fim
              válidas.
            </p>
          )}

          {orphanCount > 0 && (
            <p>
              {orphanCount === 1
                ? "1 passo ou entregável não aparece"
                : `${orphanCount} passos ou entregáveis não aparecem`}{" "}
              no cronograma porque não pertencem a nenhuma fase
              existente.
            </p>
          )}
        </div>
      )}
    </div>
  );
}