import { ProjectFormState, DurationInfo, REQUIRED_FOR_PROGRESS, DESCRIPTION_MAX } from "./types";

/**
 * Calculate form progress percentage
 */
export function calculateProgress(form: ProjectFormState): number {
  const filled = REQUIRED_FOR_PROGRESS.filter((key) => {
    const value = form[key as keyof ProjectFormState];
    if (typeof value === "string") return value.trim() !== "";
    return value !== null && value !== undefined;
  });
  return Math.round((filled.length / REQUIRED_FOR_PROGRESS.length) * 100);
}

/**
 * Calculate project duration from start and end dates
 */
export function calculateDuration(
  startDate: string | null,
  endDate: string | null
): DurationInfo {
  if (!startDate || !endDate) {
    return { invalid: false };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return { invalid: true };
  }

  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  let label = `${totalDays} dia${totalDays !== 1 ? "s" : ""}`;
  if (months > 0) {
    label = `${months} ${months === 1 ? "mês" : "meses"}${
      days > 0 ? ` e ${days} dia${days !== 1 ? "s" : ""}` : ""
    }`;
  }

  return { invalid: false, totalDays, label };
}

/**
 * Validate form is complete (100% filled + valid dates)
 */
export function isFormComplete(
  progress: number,
  duration: DurationInfo | null
): boolean {
  return progress === 100 && !(duration && duration.invalid);
}

/**
 * Prepare project payload for backend submission
 */
export function prepareProjectPayload(form: ProjectFormState) {
  const cleanUuid = (value?: string) =>
    value && value.trim() !== "" ? value : null;

  return {
    title: form.title.trim(),
    type: form.type,
    description: form.description?.trim() || null,
    client_id: cleanUuid(form.client_id || ""),
    country: form.country?.trim() || null,
    state_province: form.state_province?.trim() || null,
    municipality: form.municipality.trim(),
    address_line_1: form.address_line_1?.trim() || null,
    address_line_2: form.address_line_2?.trim() || null,
    city: form.city?.trim() || null,
    latitude: form.latitude,
    longitude: form.longitude,
    start_date: form.start_date,
    end_date: form.end_date,
    budget: form.budget,
    estimated_cost: form.estimated_cost ?? form.budget,
    status: form.status || "planning",
    urgency: form.urgency ?? null,
    location: form.location ?? null,
    created_by: form.created_by ?? null,
    project_code: "",
  };
}

/**
 * Handle currency input (remove non-digits, convert to number)
 */
export function parseCurrencyInput(rawInput: string): number | null {
  const digitsOnly = rawInput.replace(/\D/g, "");
  return digitsOnly === "" ? null : Number(digitsOnly);
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "0";
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Validate description length
 */
export function isDescriptionValid(description: string): boolean {
  return description.length <= DESCRIPTION_MAX;
}

/**
 * Get description remaining characters
 */
export function getDescriptionRemaining(description: string): number {
  return Math.max(0, DESCRIPTION_MAX - description.length);
}