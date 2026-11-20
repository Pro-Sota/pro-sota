import type { OverviewData } from "@/services/project_overview";

import { CLOSED_STATUSES, LABELS, PROJECT_TIME_ZONE } from "../constants";
import { clampPercent } from "./format";

/* Date keys are "YYYY-MM-DD" in the project's time zone, so "today" and
   deadlines are compared by calendar day, never by timestamp. */

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: PROJECT_TIME_ZONE,
});

export function toDateKey(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : keyFormatter.format(date);
}

export function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function todayDayNumber(): number {
  return dayNumber(keyFormatter.format(new Date()));
}

export function isClosedStatus(status: string | null | undefined): boolean {
  const value = (status ?? "").toLowerCase();
  return CLOSED_STATUSES.some((closed: string) => value.includes(closed));
}

export type DeadlineKind = "task" | "deliverable" | "rfi" | "submission";

export interface DeadlineItem {
  id: string;
  kind: DeadlineKind;
  title: string;
  dateKey: string;
  /** Days from today: negative = overdue, 0 = today. */
  days: number;
}

export const KIND_LABEL: Record<DeadlineKind, string> = {
  task: LABELS.kindTask,
  deliverable: LABELS.kindDeliverable,
  rfi: LABELS.kindRfi,
  submission: LABELS.kindSubmission,
};

/** Every open item that has a readable deadline. */
export function buildDeadlines(data: OverviewData): DeadlineItem[] {
  const today = todayDayNumber();
  const items: DeadlineItem[] = [];

  const push = (
    kind: DeadlineKind,
    id: string,
    title: string,
    rawDate: string | null | undefined,
  ) => {
    const dateKey = toDateKey(rawDate);
    if (!dateKey) return;
    items.push({
      id: `${kind}-${id}`,
      kind,
      title,
      dateKey,
      days: dayNumber(dateKey) - today,
    });
  };

  for (const task of data.tasks) {
    if (clampPercent(task.progress) < 100) {
      push("task", task.id, task.name, task.endDate);
    }
  }
  for (const d of data.deliverables) {
    if (clampPercent(d.progress) < 100) {
      push("deliverable", d.id, d.title, d.due_date);
    }
  }
  for (const rfi of data.rfis) {
    if (!isClosedStatus(rfi.status)) push("rfi", rfi.id, rfi.subject, rfi.due);
  }
  for (const s of data.submittals) {
    if (!isClosedStatus(s.status)) {
      push("submission", s.submission_id, s.title, s.due_date);
    }
  }

  return items;
}

export function relativeDays(days: number): string {
  if (days === 0) return LABELS.today;
  if (days === 1) return LABELS.tomorrow;
  if (days > 1) return `${LABELS.inDays} ${days} ${LABELS.days}`;
  if (days === -1) return `${LABELS.lateBy} ${LABELS.oneDay}`;
  return `${LABELS.lateBy} ${Math.abs(days)} ${LABELS.days}`;
}