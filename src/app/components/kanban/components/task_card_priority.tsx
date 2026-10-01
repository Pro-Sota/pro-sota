import type { TaskPriority } from "@/services/project_tasks";

type Props = {
  priority: TaskPriority;
};

const styles: Record<
  TaskPriority,
  string
> = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-gray-100 text-gray-700",
  High: "bg-amber-50 text-amber-700",
  Critical: "bg-red-50 text-red-700",
};

const labels: Record<
  TaskPriority,
  string
> = {
  Low: "Baixa",
  Medium: "Média",
  High: "Alta",
  Critical: "Crítica",
};

export default function TaskCardPriority({
  priority,
}: Props) {
  return (
    <span
      className={`mt-3 inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  );
}