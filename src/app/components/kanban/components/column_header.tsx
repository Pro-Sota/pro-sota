"use client";

import {
  MoreVertical,
  GripVertical,
} from "lucide-react";

import type { KanbanColumn } from "../types";

type Props = {
  column: KanbanColumn;
  taskCount: number;

  isEditing: boolean;
  editTitle: string;
  canManage: boolean;

  onEditingStart: () => void;
  onEditTitleChange: (
    value: string,
  ) => void;
  onEditCommit: () => void;
  onDelete: () => void;

  onDragStart: (
    event: React.DragEvent,
  ) => void;
};

export default function ColumnHeader({
  column,
  taskCount,
  isEditing,
  editTitle,
  canManage,
  onEditingStart,
  onEditTitleChange,
  onEditCommit,
  onDelete,
  onDragStart,
}: Props) {
  return (
    <header
      draggable={canManage}
      onDragStart={onDragStart}
      className="flex items-center gap-2 border-b border-gray-200 px-4 py-3"
    >
      {canManage && (
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300" />
      )}

      {isEditing ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(event) =>
            onEditTitleChange(
              event.target.value,
            )
          }
          onBlur={onEditCommit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onEditCommit();
            }

            if (event.key === "Escape") {
              onEditCommit();
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-500"
        />
      ) : (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-gray-900">
              {column.title}
            </h2>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {taskCount}
            </span>
          </div>
        </div>
      )}

      {canManage && !isEditing && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={onEditingStart}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Editar lista"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      )}

      {canManage && isEditing && (
        <button
          type="button"
          onClick={onDelete}
          className="text-xs font-medium text-red-600 hover:text-red-700"
        >
          Eliminar
        </button>
      )}
    </header>
  );
}