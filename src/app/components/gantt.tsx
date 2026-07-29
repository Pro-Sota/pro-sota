"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

// ---------------------------------------------------------------------------
// Dummy data — small enough to see every improvement without scrolling far.
// Swap this block for your real `tasks` / `milestones` arrays.
// ---------------------------------------------------------------------------

type Phase = keyof typeof PHASE_COLORS;
type MilestoneType = keyof typeof MILESTONE_COLORS;

type Milestone = {
  name: string;
  day: number;
  type: MilestoneType;
};




type Task = {
  id: string;
  name: string;
  phase: Phase;
  start: number;
  duration: number;
  progress: number;
};

const tasks: Task[] = [
  { id: "1", name: "Levantamento do Terreno", phase: "Concept Design", start: 1, duration: 5, progress: 100 },
  { id: "2", name: "Esboços Preliminares", phase: "Concept Design", start: 4, duration: 8, progress: 60 },
  { id: "3", name: "Aprovação do Cliente", phase: "Concept Design", start: 10, duration: 2, progress: 20 },
  { id: "4", name: "Plantas Baixas", phase: "Schematic Design", start: 12, duration: 10, progress: 40 },
  { id: "5", name: "Elevações", phase: "Schematic Design", start: 14, duration: 8, progress: 30 },
  { id: "6", name: "Projeto Estrutural", phase: "Design Development", start: 22, duration: 12, progress: 10 },
  { id: "7", name: "Coordenação MEP", phase: "Design Development", start: 24, duration: 10, progress: 5 },
  { id: "8", name: "Especificações Técnicas", phase: "Design Development", start: 30, duration: 6, progress: 0 },
];

const milestones: Milestone[] = [
  { name: "Revisão do Cliente", day: 12, type: "review" },
  { name: "Revisão Interna", day: 14, type: "review" }, // close to the one above, on purpose
  { name: "Submissão à Câmara", day: 34, type: "submission" },
];

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const ROW_HEIGHT = 44;
const MONTH_ROW_HEIGHT = 24;
const DAY_ROW_HEIGHT = 20;
const HEADER_HEIGHT = MONTH_ROW_HEIGHT + DAY_ROW_HEIGHT;
const LABEL_WIDTH = 260;
const MILESTONE_LABEL_ROW_HEIGHT = 18;

const ZOOM_LEVELS = { compact: 16, comfortable: 26 } as const;

const BASE_DATE = new Date(2026, 0, 1);

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const MONTH_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const PHASE_COLORS = {
  "Concept Design": { bar: "bg-blue-500", border: "border-blue-600", dot: "bg-blue-500" },
  "Schematic Design": { bar: "bg-green-500", border: "border-green-600", dot: "bg-green-500" },
  "Design Development": { bar: "bg-purple-500", border: "border-purple-600", dot: "bg-purple-500" },
} as const;

const DEFAULT_PHASE_COLOR = { bar: "bg-gray-500", border: "border-gray-600", dot: "bg-gray-500" };


function getPhaseColor(phase: Phase) {
  return PHASE_COLORS[phase] ?? DEFAULT_PHASE_COLOR;
}

const MILESTONE_COLORS = {
  review: { line: "bg-blue-400", label: "Revisão" },
  submission: { line: "bg-purple-400", label: "Submissão" },
  deadline: { line: "bg-red-400", label: "Prazo" },
} as const;

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatDate(date: Date) {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

// ---------------------------------------------------------------------------

export default function GanttChartDemo({tasks}:{tasks: Task[]}) {
  const [zoom, setZoom] = useState<keyof typeof ZOOM_LEVELS>("comfortable");
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const DAY_WIDTH = ZOOM_LEVELS[zoom];

  const TOTAL_DAYS = Math.max(
    Math.max(0, ...tasks.map((t) => t.start + t.duration), ...milestones.map((m) => m.day)) + 15,
    60
  );
  const TIMELINE_WIDTH = TOTAL_DAYS * DAY_WIDTH;

  const days = useMemo(
    () => Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(BASE_DATE, i)),
    [TOTAL_DAYS]
  );

  const monthSegments = useMemo(
    () =>
      days.reduce((segments, date) => {
        const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
        const last = segments[segments.length - 1];
        if (last && last.label === label) last.days += 1;
        else segments.push({ label, days: 1 });
        return segments;
      }, [] as { label: string; days: number }[]),
    [days]
  );

  // Group tasks by phase, preserving first-seen order.
  const phaseGroups = useMemo(() => {
    const order: Phase[] = [];
    const map: Partial<Record<Phase, Task[]>> = {};
    for (const t of tasks) {
      if (!map[t.phase]) {
        map[t.phase] = [];
        order.push(t.phase);
      }
      map[t.phase]!.push(t);
    }
    return order.map((phase) => {
      const items = map[phase] ?? [];
      const avgProgress = items.length > 0
        ? Math.round(items.reduce((s, t) => s + t.progress, 0) / items.length)
        : 0;
      return { phase, items, avgProgress };
    });
  }, []);

  // Stack milestone labels that land within one label-width of each other,
  // so nearby milestones don't overlap illegibly.
  const milestoneRows = useMemo(() => {
    const sorted = [...milestones].sort((a, b) => a.day - b.day);
    const rowEnds: number[] = []; // rightmost pixel occupied so far, per row
    return sorted.map((m) => {
      const left = m.day * DAY_WIDTH;
      const approxWidth = m.name.length * 6 + 16;
      let row = 0;
      while (rowEnds[row] !== undefined && left < rowEnds[row]) row++;
      rowEnds[row] = left + approxWidth + 8;
      return { ...m, row, left };
    });
  }, [DAY_WIDTH]);

  const milestoneRowCount = milestoneRows.length > 0
    ? Math.max(...milestoneRows.map((m) => m.row + 1))
    : 1;

  const todayPosition = useMemo(() => {
    const diff = Math.floor((new Date().getTime() - BASE_DATE.getTime()) / 86400000);
    return diff * DAY_WIDTH;
  }, [DAY_WIDTH]);
  const todayVisible = todayPosition >= 0 && todayPosition <= TIMELINE_WIDTH;

  const visibleRowCount = phaseGroups.reduce(
    (sum, g) => sum + 1 + (collapsedPhases[g.phase] ? 0 : g.items.length),
    0
  );

  function togglePhase(phase: Phase) {
    setCollapsedPhases((prev) => ({ ...prev, [phase]: !prev[phase] }));
  }

  // Precompute the vertical offset of every row (task rows + phase header rows)
  // so the label column and timeline column line up exactly.
  const rowOffsets: Record<string, number> = {};
  {
    let y = 0;
    for (const g of phaseGroups) {
      rowOffsets[`phase:${g.phase}`] = y;
      y += ROW_HEIGHT;
      if (!collapsedPhases[g.phase]) {
        for (const t of g.items) {
          rowOffsets[`task:${t.id}`] = y;
          y += ROW_HEIGHT;
        }
      }
    }
  }

  return (
    <div className="w-full py-4 space-y-3 text-gray-700">
      {/* Toolbar: zoom + legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(PHASE_COLORS).map(([phase, c]) => (
            <div key={phase} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${c.dot}`} />
              <span className="text-slate-600">{phase}</span>
            </div>
          ))}
          <span className="w-px h-3 bg-slate-200" />
          {Object.entries(MILESTONE_COLORS).map(([type, c]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${c.line}`} />
              <span className="text-slate-600">{c.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <button
            onClick={() => setZoom("compact")}
            className={`p-1 rounded ${zoom === "compact" ? "bg-slate-100" : ""}`}
            title="Zoom compacto"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom("comfortable")}
            className={`p-1 rounded ${zoom === "comfortable" ? "bg-slate-100" : ""}`}
            title="Zoom confortável"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden bg-white border border-slate-200">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto relative">
          <div className="flex" style={{ width: LABEL_WIDTH + TIMELINE_WIDTH }}>
            {/* Sticky label column */}
            <div
              className="shrink-0 sticky left-0 z-40 bg-white border-r border-slate-200 shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
              style={{ width: LABEL_WIDTH }}
            >
              <div
                className="flex items-center px-3 border-b sticky top-0 z-10 bg-white"
                style={{ height: HEADER_HEIGHT + milestoneRowCount * MILESTONE_LABEL_ROW_HEIGHT }}
              >
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Tarefas
                </span>
              </div>

              {phaseGroups.map((g) => (
                <React.Fragment key={g.phase}>
                  <button
                    onClick={() => togglePhase(g.phase)}
                    className="w-full flex items-center gap-1.5 px-3 border-b border-slate-100 bg-slate-50 hover:bg-slate-100 text-left"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {collapsedPhases[g.phase] ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className={`w-2 h-2 rounded-sm shrink-0 ${getPhaseColor(g.phase).dot}`} />
                    <span className="text-sm font-medium text-slate-700 truncate">{g.phase}</span>
                    <span className="text-xs text-slate-400 ml-auto shrink-0">{g.avgProgress}%</span>
                  </button>

                  {!collapsedPhases[g.phase] &&
                    g.items.map((task, i) => (
                      <div
                        key={task.id}
                        className={`flex items-center pl-7 pr-3 border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/40" : ""
                          } ${hoveredTask === task.id ? "bg-blue-50/60" : ""}`}
                        style={{ height: ROW_HEIGHT }}
                        onMouseEnter={() => setHoveredTask(task.id)}
                        onMouseLeave={() => setHoveredTask(null)}
                      >
                        <span className="text-sm text-slate-700 truncate">{task.name}</span>
                      </div>
                    ))}
                </React.Fragment>
              ))}
            </div>

            {/* Timeline column */}
            <div className="relative" style={{ width: TIMELINE_WIDTH }}>
              {/* Weekend shading */}
              <div className="absolute inset-0 pointer-events-none z-0">
                {days.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  if (!isWeekend) return null;
                  return (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 bg-slate-50"
                      style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
                    />
                  );
                })}
              </div>

              {/* Milestone lines */}
              <div className="absolute inset-0 pointer-events-none z-0">
                {milestones.map((m) => (
                  <div
                    key={m.name}
                    className={`absolute top-0 bottom-0 w-[2px] ${MILESTONE_COLORS[m.type].line}`}
                    style={{ left: m.day * DAY_WIDTH }}
                  />
                ))}
              </div>

              {todayVisible && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-10 pointer-events-none"
                  style={{ left: todayPosition }}
                >
                  <span className="absolute -left-3 top-0 text-[10px] font-medium text-red-500 bg-white px-1 rounded whitespace-nowrap">
                    Hoje
                  </span>
                </div>
              )}

              {/* Sticky header: month row + day row + milestone label rows */}
              <div className="sticky top-0 z-20 bg-white border-b">
                <div className="flex border-b" style={{ height: MONTH_ROW_HEIGHT }}>
                  {monthSegments.map((seg, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-xs border-r"
                      style={{ width: seg.days * DAY_WIDTH }}
                    >
                      {seg.label}
                    </div>
                  ))}
                </div>
                <div className="flex border-b" style={{ height: DAY_ROW_HEIGHT }}>
                  {days.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-[10px]"
                      style={{ width: DAY_WIDTH }}
                    >
                      {DAY_WIDTH >= 16 ? d.getDate() : ""}
                    </div>
                  ))}
                </div>
                <div
                  className="relative"
                  style={{ height: milestoneRowCount * MILESTONE_LABEL_ROW_HEIGHT }}
                >
                  {milestoneRows.map((m) => (
                    <span
                      key={m.name}
                      className="absolute whitespace-nowrap text-[10px] bg-white border rounded px-1"
                      style={{ left: m.left + 2, top: m.row * MILESTONE_LABEL_ROW_HEIGHT }}
                      title={`${m.name} — ${formatDate(addDays(BASE_DATE, m.day))}`}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="relative z-10" style={{ height: visibleRowCount * ROW_HEIGHT }}>
                {phaseGroups.map((g) => (
                  <React.Fragment key={g.phase}>
                    <div
                      className="absolute left-0 right-0 border-b border-slate-100 bg-slate-50/70"
                      style={{ top: rowOffsets[`phase:${g.phase}`], height: ROW_HEIGHT }}
                    />
                    {!collapsedPhases[g.phase] &&
                      g.items.map((task) => {
                        const barLeft = task.start * DAY_WIDTH;
                        const barWidth = task.duration * DAY_WIDTH;
                        const progressWidth = (task.progress / 100) * barWidth;
                        const phaseColor = getPhaseColor(task.phase);
                        const startDate = addDays(BASE_DATE, task.start);
                        const endDate = addDays(BASE_DATE, task.start + task.duration);
                        const top = rowOffsets[`task:${task.id}`];
                        const isHovered = hoveredTask === task.id;

                        return (
                          <div
                            key={task.id}
                            className="absolute left-0 right-0 border-b border-slate-100"
                            style={{ top, height: ROW_HEIGHT }}
                            onMouseEnter={() => setHoveredTask(task.id)}
                            onMouseLeave={() => setHoveredTask(null)}
                          >
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage:
                                  "linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px)",
                                backgroundSize: `${DAY_WIDTH}px 100%`,
                              }}
                            />
                            {isHovered && <div className="absolute inset-0 bg-blue-50/50" />}

                            <div
                              tabIndex={0}
                              role="button"
                              aria-label={`${task.name}, ${task.progress}% concluído, ${formatDate(startDate)} a ${formatDate(endDate)}`}
                              className={`absolute top-1/2 -translate-y-1/2 h-5 rounded border ${phaseColor.bar} ${phaseColor.border} bg-opacity-30 overflow-hidden cursor-pointer focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-blue-400`}
                              style={{ left: barLeft, width: Math.max(barWidth, 4) }}
                            >
                              <div className={`h-full ${phaseColor.bar}`} style={{ width: progressWidth }} />
                              {barWidth > 60 && (
                                <span className="absolute inset-0 flex items-center justify-end pr-1.5 text-[10px] font-medium text-white/90">
                                  {task.progress}%
                                </span>
                              )}
                            </div>

                            {isHovered && (
                              <div
                                className="absolute z-30 top-full mt-1 bg-slate-900 text-white text-xs rounded-md px-2.5 py-2 shadow-lg pointer-events-none whitespace-nowrap"
                                style={{ left: barLeft }}
                              >
                                <div className="font-medium">{task.name}</div>
                                <div className="text-slate-300 mt-0.5">
                                  {formatDate(startDate)} – {formatDate(endDate)} · {task.progress}%
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}