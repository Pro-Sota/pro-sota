
"use client";

import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";

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

export type GanttDeliverable = GanttStep;

type Props = {
  phases?: GanttPhase[] | null;
  steps?: GanttStep[] | null;
  deliverables?: GanttDeliverable[] | null;
  startDate?: string | null;
};

type Activity = GanttStep & {
  kind: "Etapa" | "Entregável";
};

type PreparedActivity = Activity & {
  start: number | null;
  end: number | null;
  progressValue: number;
  bar: BarPosition | null;
  hasInvalidDate: boolean;
};

type PhaseGroup = {
  phase: GanttPhase;
  children: PreparedActivity[];
  progress: number;
  start: number | null;
  end: number | null;
  summary: BarPosition | null;
  hasInvalidDate: boolean;
};

type MonthSegment = {
  start: number;
  days: number;
  label: string;
};

type CalendarDay = {
  value: number;
  weekday: string;
  dayOfMonth: number;
  title: string;
  isWeekend: boolean;
};

type BarPosition = {
  left: number;
  width: number;
};

type Timeline = {
  first: number;
  days: CalendarDay[];
  months: MonthSegment[];
  width: number;
};

const DAY = 86_400_000;
const DAY_WIDTH = 24;
const LABEL_WIDTH = 240;
const ROW_HEIGHT = 42;

/**
 * Prevent accidental historical/future dates from generating
 * enormous timelines and freezing the browser.
 */
const MIN_PROJECT_YEAR = 2000;
const MAX_PROJECT_YEAR = 2100;

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

function dateDay(value?: string | null): number | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < MIN_PROJECT_YEAR || year > MAX_PROJECT_YEAR) {
    return null;
  }

  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return timestamp / DAY;
}

function hasInvalidDate(value?: string | null): boolean {
  if (!value) return false;
  return dateDay(value) === null;
}

function todayDay(): number {
  const now = new Date();

  return (
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ) / DAY
  );
}

function monday(day: number): number {
  const weekday = new Date(day * DAY).getUTCDay();

  return day - ((weekday + 6) % 7);
}

function percent(value?: number | null): number {
  return Math.min(100, Math.max(0, Math.round(value ?? 0)));
}

function sortOrder<T extends { sortOrder?: number | null }>(
  values: T[],
): T[] {
  return [...values].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
}

function position(
  start: number | null,
  end: number | null,
  first: number,
): BarPosition | null {
  if (start === null || end === null || end < start) {
    return null;
  }

  return {
    left: (start - first) * DAY_WIDTH,
    width: (end - start + 1) * DAY_WIDTH,
  };
}

/* -------------------------------------------------------------------------- */
/* Calendar                                                                   */
/* -------------------------------------------------------------------------- */


function createTimeline(
  groups: PhaseGroup[],
  _startDate: string | null | undefined,
  today: number,
): Timeline {
  // Always start from the current week.
  const first = monday(today);

  let latest = today;

  const includeDate = (value: number | null) => {
    if (value === null || value < first) return;

    latest = Math.max(latest, value);
  };

  for (const group of groups) {
    includeDate(group.start);
    includeDate(group.end);

    for (const item of group.children) {
      includeDate(item.start);
      includeDate(item.end);
    }
  }

  // Display complete calendar years through the last relevant date.
  const lastYear = new Date(latest * DAY).getUTCFullYear();
  const yearEnd = Date.UTC(lastYear, 11, 31) / DAY;
  const last = monday(yearEnd) + 6;

  const totalDays = last - first + 1;

  const days: CalendarDay[] = [];
  const months: MonthSegment[] = [];

  const monthFormatter = new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const weekdayFormatter = new Intl.DateTimeFormat("pt-PT", {
    weekday: "short",
    timeZone: "UTC",
  });

  const fullDateFormatter = new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "full",
    timeZone: "UTC",
  });

  for (let index = 0; index < totalDays; index++) {
    const value = first + index;
    const date = new Date(value * DAY);

    const monthKey =
      date.getUTCFullYear() * 12 + date.getUTCMonth();

    const previous = months[months.length - 1];

    if (previous) {
      const previousDate = new Date(previous.start * DAY);
      const previousKey =
        previousDate.getUTCFullYear() * 12 +
        previousDate.getUTCMonth();

      if (monthKey === previousKey) {
        previous.days++;
      } else {
        months.push({
          start: value,
          days: 1,
          label: monthFormatter.format(date),
        });
      }
    } else {
      months.push({
        start: value,
        days: 1,
        label: monthFormatter.format(date),
      });
    }

    const weekday = date.getUTCDay();

    days.push({
      value,
      weekday: weekdayFormatter.format(date),
      dayOfMonth: date.getUTCDate(),
      title: fullDateFormatter.format(date),
      isWeekend: weekday === 0 || weekday === 6,
    });
  }

  return {
    first,
    days,
    months,
    width: totalDays * DAY_WIDTH,
  };
}


/* -------------------------------------------------------------------------- */
/* Calendar header                                                            */
/* -------------------------------------------------------------------------- */

const CalendarHeader = memo(function CalendarHeader({
  timeline,
  today,
}: {
  timeline: Timeline;
  today: number;
}) {
  return (
    <div className="sticky top-0 z-20 flex border-b border-slate-300 bg-white">
      <div
        className="sticky left-0 z-30 flex shrink-0 items-center border-r border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-[#002950]"
        style={{ width: LABEL_WIDTH }}
      >
        Fases e actividades
      </div>

      <div
        className="shrink-0"
        style={{ width: timeline.width }}
      >
        <div className="flex h-8 border-b border-slate-300 bg-slate-50">
          {timeline.months.map((month) => (
            <div
              key={month.start}
              className="flex shrink-0 items-center overflow-hidden border-r border-slate-300 px-2 text-xs font-semibold capitalize text-[#002950]"
              style={{ width: month.days * DAY_WIDTH }}
            >
              {month.label}
            </div>
          ))}
        </div>

        <div className="flex h-12">
          {timeline.days.map((day) => {
            const isToday = day.value === today;

            return (
              <div
                key={day.value}
                title={day.title}
                className={[
                  "flex shrink-0 flex-col items-center justify-center",
                  "border-r border-slate-200 text-[10px]",
                  isToday
                    ? "bg-[#002950] font-semibold text-white"
                    : day.isWeekend
                      ? "bg-slate-100 text-slate-500"
                      : "bg-white text-slate-700",
                ].join(" ")}
                style={{ width: DAY_WIDTH }}
              >
                <span className="leading-none">
                  {day.weekday.slice(0, 1).toUpperCase()}
                </span>

                <span className="mt-1 font-semibold leading-none">
                  {day.dayOfMonth}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Timeline grid                                                              */
/* -------------------------------------------------------------------------- */

const TimelineGrid = memo(function TimelineGrid({
  width,
  todayOffset,
  todayVisible,
}: {
  width: number;
  todayOffset: number;
  todayVisible: boolean;
}) {
  const style = useMemo(() => {
    const grid =
      "repeating-linear-gradient(to right, #e2e8f0 0, #e2e8f0 1px, transparent 1px, transparent 24px)";

    if (!todayVisible) {
      return {
        backgroundImage: grid,
        backgroundSize: "24px 100%",
        backgroundRepeat: "repeat" as const,
      };
    }

    const marker = [
      `linear-gradient(to right, transparent ${Math.max(0, todayOffset - 1)}px, #ef4444 ${Math.max(0, todayOffset - 1)}px, #ef4444 ${todayOffset + 1}px, transparent ${todayOffset + 1}px)`,
      grid,
    ].join(", ");

    return {
      backgroundImage: marker,
      backgroundSize: "100% 100%, 24px 100%",
      backgroundRepeat: "no-repeat, repeat" as const,
    };
  }, [todayOffset, todayVisible]);

  return (
    <div
      className="relative shrink-0"
      style={{
        ...style,
        width,
      }}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Activity row                                                               */
/* -------------------------------------------------------------------------- */

const ActivityRow = memo(function ActivityRow({
  item,
  timeline,
  todayOffset,
  todayVisible,
  onSelect,
}: {
  item: PreparedActivity;
  timeline: Timeline;
  todayOffset: number;
  todayVisible: boolean;
  onSelect: (item: Activity) => void;
}) {
  return (
    <div
      className="flex border-b border-slate-200"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: `${ROW_HEIGHT}px`,
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="sticky left-0 z-10 flex shrink-0 items-center truncate border-r border-slate-300 bg-white px-4 text-left text-sm text-slate-700 focus-visible:outline-2 focus-visible:outline-[#002950]"
        style={{
          width: LABEL_WIDTH,
          height: ROW_HEIGHT,
        }}
        title={item.name}
      >
        {item.name}
      </button>

      <div
        className="relative shrink-0"
        style={{
          width: timeline.width,
          height: ROW_HEIGHT,
        }}
      >
        <TimelineGrid
          width={timeline.width}
          todayOffset={todayOffset}
          todayVisible={todayVisible}
        />

        {item.bar ? (
          <button
            type="button"
            onClick={() => onSelect(item)}
            title={`${item.name} · ${item.progressValue}%`}
            className="absolute top-2.5 h-5 overflow-hidden rounded border border-[#A88040] bg-[#F7F1E7] focus-visible:outline-2 focus-visible:outline-[#002950]"
            style={item.bar}
          >
            <span
              className="block h-full bg-[#BD9655]"
              style={{ width: `${item.progressValue}%` }}
            />
          </button>
        ) : (
          <span className="absolute left-3 top-3 text-xs text-slate-500">
            Sem datas
          </span>
        )}
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Phase row                                                                  */
/* -------------------------------------------------------------------------- */

const PhaseRow = memo(function PhaseRow({
  group,
  timeline,
  collapsed,
  todayOffset,
  todayVisible,
  onToggle,
  onSelect,
}: {
  group: PhaseGroup;
  timeline: Timeline;
  collapsed: boolean;
  todayOffset: number;
  todayVisible: boolean;
  onToggle: (id: string) => void;
  onSelect: (item: Activity) => void;
}) {
  const { phase, children, progress, summary } = group;

  return (
    <div>
      <div
        className="flex border-b border-slate-300 bg-[#F7F7F5]"
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: `${ROW_HEIGHT}px`,
        }}
      >
        <button
          type="button"
          aria-expanded={!collapsed}
          onClick={() => onToggle(phase.id)}
          className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r border-slate-300 bg-[#F7F7F5] px-3 text-left text-sm font-semibold text-[#002950] focus-visible:outline-2 focus-visible:outline-[#002950]"
          style={{
            width: LABEL_WIDTH,
            height: ROW_HEIGHT,
          }}
        >
          {collapsed ? (
            <ChevronRight size={16} aria-hidden="true" />
          ) : (
            <ChevronDown size={16} aria-hidden="true" />
          )}

          <span className="truncate">{phase.name}</span>
        </button>

        <div
          className="relative shrink-0"
          style={{
            width: timeline.width,
            height: ROW_HEIGHT,
          }}
        >
          <TimelineGrid
            width={timeline.width}
            todayOffset={todayOffset}
            todayVisible={todayVisible}
          />

          {summary && (
            <div
              className="absolute top-3 h-4 overflow-hidden rounded-sm bg-[#002950]"
              style={summary}
              title={`${phase.name}: ${progress}%`}
            >
              <div
                className="h-full bg-[#BD9655]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {!collapsed &&
        children.map((item) => (
          <ActivityRow
            key={`${item.kind}-${item.id}`}
            item={item}
            timeline={timeline}
            todayOffset={todayOffset}
            todayVisible={todayVisible}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function GanttChart({
  phases,
  steps,
  deliverables,
  startDate,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(),
  );

  const [selected, setSelected] = useState<Activity | null>(null);

  const today = todayDay();

  const groups = useMemo<PhaseGroup[]>(() => {
    const activitiesByPhase = new Map<string, Activity[]>();

    const addActivities = (
      items: GanttStep[] | null | undefined,
      kind: Activity["kind"],
    ) => {
      for (const item of items ?? []) {
        const activity: Activity = {
          ...item,
          kind,
        };

        const existing = activitiesByPhase.get(item.phaseId);

        if (existing) {
          existing.push(activity);
        } else {
          activitiesByPhase.set(item.phaseId, [activity]);
        }
      }
    };

    addActivities(steps, "Etapa");
    addActivities(deliverables, "Entregável");

    return sortOrder(phases ?? []).map((phase) => {
      const children = sortOrder(
        activitiesByPhase.get(phase.id) ?? [],
      );

      let childStart: number | null = null;
      let childEnd: number | null = null;
      let progressTotal = 0;

      const preparedChildren = children.map((item) => {
        const start = dateDay(item.startDate);
        const end = dateDay(item.endDate);
        const progressValue = percent(item.progress);

        if (start !== null) {
          childStart =
            childStart === null
              ? start
              : Math.min(childStart, start);
        }

        if (end !== null) {
          childEnd =
            childEnd === null
              ? end
              : Math.max(childEnd, end);
        }

        progressTotal += progressValue;

        return {
          ...item,
          start,
          end,
          progressValue,
          bar: null,
          hasInvalidDate:
            hasInvalidDate(item.startDate) ||
            hasInvalidDate(item.endDate),
        };
      });

      const progress =
        phase.progress != null
          ? percent(phase.progress)
          : preparedChildren.length
            ? Math.round(
                progressTotal / preparedChildren.length,
              )
            : 0;

      const phaseInvalidDate =
        hasInvalidDate(phase.startDate) ||
        hasInvalidDate(phase.endDate);

      return {
        phase,
        children: preparedChildren,
        progress,
        start: dateDay(phase.startDate) ?? childStart,
        end: dateDay(phase.endDate) ?? childEnd,
        summary: null,
        hasInvalidDate: phaseInvalidDate,
      };
    });
  }, [phases, steps, deliverables]);

  const timeline = useMemo(
    () => createTimeline(groups, startDate, today),
    [groups, startDate, today],
  );

  const preparedGroups = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        summary: position(
          group.start,
          group.end,
          timeline.first,
        ),
        children: group.children.map((item) => ({
          ...item,
          bar: position(
            item.start,
            item.end,
            timeline.first,
          ),
        })),
      })),
    [groups, timeline.first],
  );

  const todayOffset = (today - timeline.first) * DAY_WIDTH;

  const todayVisible =
    todayOffset >= 0 && todayOffset < timeline.width;

  const invalidDateCount = useMemo(
    () =>
      groups.reduce(
        (total, group) =>
          total +
          Number(group.hasInvalidDate) +
          group.children.filter((item) => item.hasInvalidDate).length,
        0,
      ) +
      Number(hasInvalidDate(startDate)),
    [groups, startDate],
  );

  const handleToggle = useCallback((id: string) => {
    setCollapsed((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }, []);

  const handleSelect = useCallback((item: Activity) => {
    setSelected(item);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const goToToday = useCallback(() => {
    if (!todayVisible) return;

    scrollRef.current?.scrollTo({
      left: Math.max(0, todayOffset - 120),
      behavior: "smooth",
    });
  }, [todayOffset, todayVisible]);

  if (!preparedGroups.length) {
    return (
      <div className="rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-600">
        Nenhuma fase disponível.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="font-semibold text-[#002950]">
            Cronograma
          </h3>

          <p className="text-sm text-slate-600">
            Planeamento e execução
          </p>
        </div>

        <button
          type="button"
          onClick={goToToday}
          disabled={!todayVisible}
          className="inline-flex items-center gap-2 rounded-lg bg-[#002950] px-3 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002950] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarDays size={16} aria-hidden="true" />
          Hoje
        </button>
      </header>

      {invalidDateCount > 0 && (
        <div
          role="status"
          className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />

          <p>
            Foram encontrados {invalidDateCount} registos com datas
            inválidas ou fora do intervalo de {MIN_PROJECT_YEAR} a{" "}
            {MAX_PROJECT_YEAR}. Essas datas foram ignoradas no
            cronograma. Corrija os registos para os apresentar.
          </p>
        </div>
      )}

      <div
        ref={scrollRef}
        className="max-h-[650px] overflow-auto overscroll-contain"
      >
        <div
          style={{
            width: LABEL_WIDTH + timeline.width,
          }}
        >
          <CalendarHeader
            timeline={timeline}
            today={today}
          />

          {preparedGroups.map((group) => (
            <PhaseRow
              key={group.phase.id}
              group={group}
              timeline={timeline}
              collapsed={collapsed.has(group.phase.id)}
              todayOffset={todayOffset}
              todayVisible={todayVisible}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {selected && (
        <footer className="flex items-start justify-between gap-4 border-t border-slate-200 bg-slate-50 p-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#002950]">
              {selected.name}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {selected.kind} · {percent(selected.progress)}%
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {selected.startDate ?? "Sem início"}
              {" — "}
              {selected.endDate ?? "Sem fim"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar detalhes"
            className="shrink-0 rounded-lg p-2 text-slate-600 focus-visible:outline-2 focus-visible:outline-[#002950]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </footer>
      )}
    </section>
  );
}
