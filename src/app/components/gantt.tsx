"use client";

import React from "react";

type Task = {
  id: string;
  name: string;
  phase: string;
  start: number;
  duration: number;
  progress: number;
};

type Milestone = {
  name: string;
  day: number;
  type: "review" | "submission" | "deadline";
};

const tasks: Task[] = [
  { id: "1", name: "Site Survey", phase: "Concept Design", start: 1, duration: 5, progress: 100 },
  { id: "2", name: "Sketch Plans", phase: "Concept Design", start: 4, duration: 8, progress: 60 },
  { id: "3", name: "Client Approval", phase: "Concept Design", start: 10, duration: 2, progress: 20 },
  { id: "4", name: "Floor Plans", phase: "Schematic Design", start: 12, duration: 10, progress: 40 },
  { id: "5", name: "Elevations", phase: "Schematic Design", start: 14, duration: 8, progress: 30 },
  { id: "6", name: "Structural Design", phase: "Design Development", start: 22, duration: 12, progress: 10 },
  { id: "7", name: "MEP Coordination", phase: "Design Development", start: 24, duration: 10, progress: 5 },
];

const milestones: Milestone[] = [
  { name: "Client Review", day: 45, type: "review" },
  { name: "Authority Submission", day: 120, type: "submission" },
  { name: "Tender Deadline", day: 210, type: "deadline" },
];

const DAY_WIDTH = 28;
const LABEL_WIDTH = 200;
const ROW_HEIGHT = 44; // px, matches h-11 on task rows

const BASE_DATE = new Date(2026, 0, 1);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

// Timeline range is derived from the data (latest task end / milestone day)
// plus a little padding, instead of a hardcoded 365 days that could clip
// real content or waste space on a mostly-empty year.
const TOTAL_DAYS = Math.max(
  Math.max(
    0,
    ...tasks.map((t) => t.start + t.duration),
    ...milestones.map((m) => m.day)
  ) + 30,
  90
);

// ---- Centralized color config — single source feeding both the legend
// and the chart itself, instead of three separately hardcoded copies. ----
const PHASE_COLORS: Record<string, { bar: string; border: string }> = {
  "Concept Design": { bar: "bg-blue-500", border: "border-blue-600" },
  "Schematic Design": { bar: "bg-green-500", border: "border-green-600" },
  "Design Development": { bar: "bg-purple-500", border: "border-purple-600" },
};
const DEFAULT_PHASE_COLOR = { bar: "bg-gray-500", border: "border-gray-600" };

function getPhaseColor(phase: string) {
  return PHASE_COLORS[phase] ?? DEFAULT_PHASE_COLOR;
}

const MILESTONE_COLORS: Record<Milestone["type"], { line: string; label: string }> = {
  review: { line: "bg-blue-400", label: "Revisão" },
  submission: { line: "bg-purple-400", label: "Submissão" },
  deadline: { line: "bg-red-400", label: "Prazo" },
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date) {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

function getTodayOffset() {
  const today = new Date();
  const difference = Math.floor(
    (today.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  return difference * DAY_WIDTH;
}

const days = Array.from({ length: TOTAL_DAYS }, (_, i) => addDays(BASE_DATE, i));

const monthSegments = days.reduce<{ label: string; days: number }[]>((segments, date) => {
  const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  const last = segments[segments.length - 1];
  if (last && last.label === label) {
    last.days += 1;
  } else {
    segments.push({ label, days: 1 });
  }
  return segments;
}, []);

const TIMELINE_WIDTH = TOTAL_DAYS * DAY_WIDTH;
const CHART_HEIGHT = tasks.length * ROW_HEIGHT;

export default function Page() {
  const todayPosition = getTodayOffset();

  return (
    <div className="w-full py-6 space-y-6 text-gray-700">
      <h1 className="text-2xl font-bold">Cronograma</h1>

      {/* Legend — generated from the same color config the chart uses,
          so it can never drift out of sync with what's actually drawn. */}
      <div className="flex flex-wrap gap-5 text-xs text-slate-500">
        {Object.entries(PHASE_COLORS).map(([phase, color]) => (
          <span key={phase} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded ${color.bar}`} />
            {phase}
          </span>
        ))}

        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-4 bg-red-500" />
          Hoje
        </span>

        {Object.entries(MILESTONE_COLORS).map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span className={`w-0.5 h-4 ${color.line}`} />
            {color.label}
          </span>
        ))}
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ width: LABEL_WIDTH + TIMELINE_WIDTH }}>

            {/* Header */}
            <div className="flex sticky top-0 z-30 bg-white border-b">
              <div
                className="shrink-0 sticky left-0 z-50 bg-white border-r border-slate-200 flex items-center px-3"
                style={{ width: LABEL_WIDTH }}
              >
                <span className="text-xs font-medium">Tarefa</span>
              </div>

              <div>
                <div className="flex border-b">
                  {monthSegments.map((seg, i) => (
                    <div
                      key={i}
                      className="text-xs text-center py-1 border-r"
                      style={{ width: seg.days * DAY_WIDTH }}
                    >
                      {seg.label}
                    </div>
                  ))}
                </div>

                <div className="flex">
                  {days.map((d, i) => (
                    <div
                      key={i}
                      className="text-[10px] text-center py-1"
                      style={{ width: DAY_WIDTH }}
                    >
                      {d.getDate()}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rows + overlays — milestones and weekend shading are drawn
                ONCE here, spanning the full chart height, instead of being
                redrawn (and re-labeled) inside every task row. */}
            <div className="relative">

              {/* Weekend shading, behind everything */}
              <div
                className="absolute top-0 pointer-events-none z-0"
                style={{ left: LABEL_WIDTH, width: TIMELINE_WIDTH, height: CHART_HEIGHT }}
              >
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

              {/* Milestone lines, spanning full height, drawn once */}
              <div
                className="absolute top-0 pointer-events-none z-10"
                style={{ left: LABEL_WIDTH, width: TIMELINE_WIDTH, height: CHART_HEIGHT }}
              >
                {milestones.map((m) => (
                  <div
                    key={m.name}
                    className={`absolute top-0 bottom-0 w-[2px] ${MILESTONE_COLORS[m.type].line}`}
                    style={{ left: m.day * DAY_WIDTH }}
                  />
                ))}
              </div>

              {/* Milestone labels, shown once at the top of the chart */}
              <div
                className="absolute -top-5 pointer-events-none z-20"
                style={{ left: LABEL_WIDTH, width: TIMELINE_WIDTH, height: 0 }}
              >
                {milestones.map((m) => (
                  <span
                    key={m.name}
                    className="absolute left-2 whitespace-nowrap text-[10px] bg-white border rounded px-1 shadow-sm"
                    style={{ left: m.day * DAY_WIDTH + 2 }}
                    title={`${m.name} — ${formatDate(addDays(BASE_DATE, m.day))}`}
                  >
                    {m.name}
                  </span>
                ))}
              </div>

              {/* Today line, spanning full height, drawn once */}
              {todayPosition >= 0 && todayPosition <= TIMELINE_WIDTH && (
                <div
                  className="absolute top-0 w-[2px] bg-red-500 z-10 pointer-events-none"
                  style={{ left: LABEL_WIDTH + todayPosition, height: CHART_HEIGHT }}
                />
              )}

              {/* Task rows */}
              <div className="relative divide-y bg-white z-20">
                {tasks.map((task) => {
                  const barLeft = task.start * DAY_WIDTH;
                  const barWidth = task.duration * DAY_WIDTH;
                  const progressWidth = (task.progress / 100) * barWidth;
                  const phaseColor = getPhaseColor(task.phase);
                  const startDate = addDays(BASE_DATE, task.start);
                  const endDate = addDays(BASE_DATE, task.start + task.duration);

                  return (
                    <div key={task.id} className="flex items-center h-11 relative">
                      <div
                        className="shrink-0 sticky left-0 z-30 bg-white border-r flex items-center px-3"
                        style={{ width: LABEL_WIDTH }}
                      >
                        <span className="text-sm font-medium">{task.name}</span>
                      </div>

                      <div className="relative h-full" style={{ width: TIMELINE_WIDTH }}>
                        {/* Grid lines */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px)",
                            backgroundSize: `${DAY_WIDTH}px 100%`,
                          }}
                        />

                        {/* Task bar — correctly positioned/sized at the task's
                            actual date range and colored by phase, with a
                            progress-fill overlay inside it. */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-5 rounded border ${phaseColor.bar} ${phaseColor.border} bg-opacity-30 overflow-hidden`}
                          style={{ left: barLeft, width: barWidth }}
                          title={`${task.name} · ${task.progress}% · ${formatDate(startDate)} – ${formatDate(endDate)}`}
                        >
                          <div
                            className={`h-full ${phaseColor.bar}`}
                            style={{ width: progressWidth }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}