import type { TaskPriority } from './types';

export const TASK_PRIORITIES: Array<{
  value: TaskPriority;
  label: string;
}> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

export const DEFAULT_GENERAL_COLUMNS = [
  { name: 'Por fazer', isCompleted: false },
  { name: 'Em curso', isCompleted: false },
  { name: 'Concluído', isCompleted: true },
];


export const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    label: string;
    dot: string;
    active: string;
  }
> = {
  low: {
    label: "Baixa",
    dot: "bg-slate-400",
    active:
      "border-slate-300 bg-slate-50 ring-1 ring-slate-200",
  },

  medium: {
    label: "Média",
    dot: "bg-blue-500",
    active:
      "border-blue-200 bg-blue-50 ring-1 ring-blue-100",
  },

  high: {
    label: "Alta",
    dot: "bg-orange-500",
    active:
      "border-orange-200 bg-orange-50 ring-1 ring-orange-100",
  },

  critical: {
    label: "Crítica",
    dot: "bg-red-500",
    active:
      "border-red-200 bg-red-50 ring-1 ring-red-100",
  },
};
