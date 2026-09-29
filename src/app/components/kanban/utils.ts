import { AVATAR_COLORS } from "./constants";
import type { KanbanTask } from "./types";

/* -------------------------------------------------------------------------- */
/* Helper Functions                                                          */
/* -------------------------------------------------------------------------- */

export function avatarColor(value: string): string {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function initials(value: string): string {
  const result = value
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return result || "?";
}

export function isOverdue(dueDate?: string | null): boolean {
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(`${dueDate}T00:00:00`);

  return date < today;
}

export function formatDueDate(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("pt-AO", {
    month: "short",
    day: "numeric",
  });
}

export function getTaskMembers(task: KanbanTask) {
  return task.assignedMembers ?? [];
}

export function validateDateRange(
  startDate: string | null | undefined,
  dueDate: string | null | undefined,
): { valid: boolean; message?: string } {
  if (!startDate || !dueDate) {
    return { valid: true };
  }

  if (startDate > dueDate) {
    return {
      valid: false,
      message:
        "A data de início não pode ser posterior à data de conclusão.",
    };
  }

  return { valid: true };
}