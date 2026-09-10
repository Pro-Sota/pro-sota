import { SubmissionStatus } from "./types";

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntilDue(dueDate: string): number {
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string, status: SubmissionStatus): boolean {
  if (status === "approved" || status === "rejected") return false;
  return daysUntilDue(dueDate) < 0;
}

