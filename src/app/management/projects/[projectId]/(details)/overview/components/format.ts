import {
  CURRENCY,
  LOCALE,
  NO_DEADLINE,
  PROJECT_TIME_ZONE,
  LABELS,
} from "../constants";

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  notation: "compact",
  maximumFractionDigits: 1,
});

const percentageFormatter = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: PROJECT_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: PROJECT_TIME_ZONE,
});

export function formatCurrency(value: number): string {
  return Number.isFinite(value) ? currencyFormatter.format(value) : "—";
}

export function formatPercentage(value: number): string {
  return Number.isFinite(value)
    ? `${percentageFormatter.format(value)}%`
    : "—";
}

export function formatMilestoneDate(value: string | null | undefined): string {
  if (!value) return NO_DEADLINE;

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(isDateOnly ? `${value}T12:00:00` : value);

  return Number.isNaN(date.getTime()) ? NO_DEADLINE : dateFormatter.format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return LABELS.unknownDate;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? LABELS.unknownDate
    : dateTimeFormatter.format(date);
}

/** plural(1, "registo", "registos") → "1 registo" */
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Clamp to 0–100; null, undefined and NaN become 0. */
export function clampPercent(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;
}

/** Finite, non-negative amount; anything else becomes 0. */
export function normalizeAmount(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}