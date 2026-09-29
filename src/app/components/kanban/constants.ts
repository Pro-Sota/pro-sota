import type { TaskPriority } from "@/services/project_tasks";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-pink-500",
];

export const PRIORITIES: TaskPriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-gray-100 text-gray-700",
  High: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

export const ICON_BTN =
  "rounded-lg p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1";

export const PRIORITY_CONFIG = {
  Low: {
    label: "Baixa",
    dot: "bg-emerald-500",
    active: "border-emerald-300 bg-emerald-50",
  },
  Medium: {
    label: "Média",
    dot: "bg-gray-400",
    active: "border-gray-300 bg-gray-50",
  },
  High: {
    label: "Alta",
    dot: "bg-amber-500",
    active: "border-amber-300 bg-amber-50",
  },
  Critical: {
    label: "Crítica",
    dot: "bg-red-500",
    active: "border-red-300 bg-red-50",
  },
};

export const TOAST_CONFIG = {
  success: {
    icon: "CheckCircle2",
    iconClass: "text-emerald-600",
    border: "border-emerald-200",
  },
  error: {
    icon: "AlertCircle",
    iconClass: "text-red-600",
    border: "border-red-200",
  },
  info: {
    icon: "Info",
    iconClass: "text-gray-600",
    border: "border-gray-200",
  },
};