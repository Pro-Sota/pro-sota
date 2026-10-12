/**
 * Shared types for the Gantt feature.
 *
 * Dates are plain "YYYY-MM-DD" strings in the LOCAL calendar. The service
 * layer is responsible for converting database values (including timestamptz)
 * into this shape, so the chart never has to think about time zones.
 */

export type WorkStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "cancelled";

export type GanttPhase = {
  id: string;
  name: string;
  status: WorkStatus;
  /** 0-100. When null, the chart derives it from the phase's steps and deliverables. */
  progress: number | null;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  sortOrder: number | null;
};

export type GanttStep = {
  id: string;
  phaseId: string;
  name: string;
  status: WorkStatus;
  progress: number | null;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  sortOrder: number | null;
};

export type GanttDeliverable = {
  id: string;
  phaseId: string;
  name: string;
  status: WorkStatus;
  progress: number;
  /** Optional. With only a due date, the chart draws a single-day marker. */
  startDate: string | null;
  dueDate: string | null;
  sortOrder: number | null;
};

export type GanttData = {
  phases: GanttPhase[];
  steps: GanttStep[];
  deliverables: GanttDeliverable[];
};