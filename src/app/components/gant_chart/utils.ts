/* -------------------------------------------------------------------------- */
/* Date helpers for the Gantt chart                                           */
/* -------------------------------------------------------------------------- */

export const MS_PER_DAY = 86_400_000;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Parses "YYYY-MM-DD" (or an ISO string starting with it) as a LOCAL date.
 * Returns null for anything missing or invalid (including "2026-02-31").
 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const match = ISO_DATE.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // Reject overflowing dates such as month 13 or day 31 in a 30-day month.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Whole calendar days between two dates (DST-safe). */
export function differenceInDays(start: Date, end: Date): number {
  const startUtc = Date.UTC(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  return Math.round((endUtc - startUtc) / MS_PER_DAY);
}

export function clampProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/* -------------------------------------------------------------------------- */
/* Formatting (Intl instead of hand-written month arrays)                     */
/* -------------------------------------------------------------------------- */

const LOCALE = "pt-PT";

const monthLongFormatter = new Intl.DateTimeFormat(LOCALE, { month: "long" });
const monthShortFormatter = new Intl.DateTimeFormat(LOCALE, { month: "short" });

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "Outubro 2026" */
export function formatMonthLabel(date: Date): string {
  return `${capitalize(monthLongFormatter.format(date))} ${date.getFullYear()}`;
}

/** "12 out. 2026" */
export function formatDate(date: Date): string {
  return `${date.getDate()} ${monthShortFormatter.format(date)} ${date.getFullYear()}`;
}