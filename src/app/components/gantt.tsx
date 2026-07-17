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
  { id: "8", name: "MEP Coordination", phase: "Design Development", start: 24, duration: 10, progress: 5 },
  { id: "9", name: "MEP Coordination", phase: "Design Development", start: 24, duration: 10, progress: 5 },
  { id: "10", name: "MEP Coordination", phase: "Design Development", start: 24, duration: 10, progress: 5 },
];

const milestones: Milestone[] = [
  { name: "Client Review", day: 45, type: "review" },
  { name: "Authority Submission", day: 120, type: "submission" },
  { name: "Tender Deadline", day: 210, type: "deadline" },
];

const DAY_WIDTH = 28;
const LABEL_WIDTH = 300;
const ROW_HEIGHT = 44; // px, matches h-11 on task rows

// Header is split into two stacked rows (month band + day numbers). Both the
// timeline column and the sticky label column reference these same
// constants, so their heights are guaranteed to line up pixel-for-pixel —
// no more relying on matching padding classes across two different trees.
const MONTH_ROW_HEIGHT = 24;
const DAY_ROW_HEIGHT = 20;
const HEADER_HEIGHT = MONTH_ROW_HEIGHT + DAY_ROW_HEIGHT;

const BASE_DATE = new Date(2026, 0, 1);

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
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
  const todayVisible = todayPosition >= 0 && todayPosition <= TIMELINE_WIDTH;

  return (
    <div className="w-full py-4 space-y-6 text-gray-700">
      {/* Legend — generated from the same color config the chart uses,
          so it can never drift out of sync with what's actually drawn. */}
    {/*  <div className="flex flex-wrap gap-5 text-xs text-slate-500">
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
      </div> */}

      <div className=" rounded-xl overflow-hidden bg-white ">
        <div className="overflow-x-auto">
          <div className="flex" style={{ width: LABEL_WIDTH + TIMELINE_WIDTH }}>

            {/* LEFT COLUMN — sticky task labels. This is now a fully
                separate column (not an absolutely-positioned overlay tied
                to a magic-number offset), so nothing from the timeline can
                ever render over it, regardless of z-index or math drift. */}
            <div
              className="shrink-0 sticky left-0 z-40 bg-white border-r border-slate-200 shadow-[2px_0_4px_rgba(0,0,0,0.06)]"
              style={{ width: LABEL_WIDTH }}
            >
              <div
                className="flex items-center px-3 border-b overflow-y-auto"
                style={{ height: HEADER_HEIGHT }}
              >
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Tarefas
                </span>
              </div>

              {tasks.map((task, i) => (
                <div
                  key={task.id}
                  className={`flex items-center px-3 border-b border-slate-100 ${
                    i % 2 === 1 ? "bg-slate-50/40" : ""
                  }`}
                  style={{ height: ROW_HEIGHT }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      {task.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN — the timeline. `overflow-hidden` physically
                clips every line, bar, and label drawn inside it to this
                column's own bounds, so none of it can bleed into the
                label column above, no matter what. */}
            <div className="relative overflow-hidden" style={{ width: TIMELINE_WIDTH }}>

              {/* Weekend shading, milestone lines and the today line span
                  the full column height (header + body) via inset-0, but
                  sit at z-0/z-10 — below the header and rows (z-20), which
                  are opaque, so they only show where they should: behind
                  the grid, not behind the header text. */}
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
                />
              )}

              {/* Header */}
              <div className="relative z-20 bg-white border-b">
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
                <div className="flex" style={{ height: DAY_ROW_HEIGHT }}>
                  {days.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-[10px]"
                      style={{ width: DAY_WIDTH }}
                    >
                      {d.getDate()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone labels — floats just under the header, above
                  the rows; still confined by the column's overflow-hidden. */}
              <div className="relative z-20 pointer-events-none" style={{ height: 0 }}>
                {milestones.map((m) => (
                  <span
                    key={m.name}
                    className="absolute top-1 whitespace-nowrap text-[10px] bg-white border rounded px-1 shadow-sm"
                    style={{ left: m.day * DAY_WIDTH + 2 }}
                    title={`${m.name} — ${formatDate(addDays(BASE_DATE, m.day))}`}
                  >
                    {m.name}
                  </span>
                ))}
              </div>

              {/* Rows — transparent background now, so weekend shading and
                  milestone lines actually show through instead of being
                  painted over (they were being hidden before). */}
              <div className="relative z-20">
                {tasks.map((task) => {
                  const barLeft = task.start * DAY_WIDTH;
                  const barWidth = task.duration * DAY_WIDTH;
                  const progressWidth = (task.progress / 100) * barWidth;
                  const phaseColor = getPhaseColor(task.phase);
                  const startDate = addDays(BASE_DATE, task.start);
                  const endDate = addDays(BASE_DATE, task.start + task.duration);

                  return (
                    <div
                      key={task.id}
                      className="relative border-b border-slate-100"
                      style={{ height: ROW_HEIGHT }}
                    >
                      {/* Grid lines */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px)",
                          backgroundSize: `${DAY_WIDTH}px 100%`,
                        }}
                      />

                      {/* Task bar, colored by phase, with a progress-fill
                          overlay inside it. */}
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