"use client";

import { MoreVertical, Trash2 } from "lucide-react";

import type { KanbanTask } from "../types";

type Props = {
  task: KanbanTask;
  onDelete: () => void;
};

export default function TaskCardHeader({
  task,
  onDelete,
}: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h3 className="min-w-0 flex-1 text-sm font-semibold text-gray-900">
        {task.title}
      </h3>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="rounded-md p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
        aria-label="Eliminar tarefa"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}