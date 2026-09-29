import { GripVertical, Trash2 } from "lucide-react";
import { ICON_BTN } from "./constants";
import type { KanbanColumn } from "./types";

/* -------------------------------------------------------------------------- */
/* Column Header                                                             */
/* -------------------------------------------------------------------------- */

type ColumnHeaderProps = {
  column: KanbanColumn;
  taskCount: number;
  isEditing: boolean;
  editTitle: string;
  canManage: boolean;
  onEditingStart: () => void;
  onEditTitleChange: (title: string) => void;
  onEditCommit: () => void;
  onDelete: () => void;
  onDragStart: (event: React.DragEvent) => void;
};

export function ColumnHeader({
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
}: ColumnHeaderProps) {
  return (
    <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            draggable={canManage}
            onDragStart={onDragStart}
            className={`select-none text-gray-300 transition ${
              canManage
                ? "cursor-grab hover:text-gray-500 active:cursor-grabbing"
                : "cursor-default"
            }`}
          >
            <GripVertical className="h-4 w-4" />
          </span>

          {isEditing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(event) =>
                onEditTitleChange(event.target.value)
              }
              onBlur={onEditCommit}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }

                if (event.key === "Escape") {
                  onEditCommit();
                }
              }}
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          ) : (
            <h2
              onClick={() => canManage && onEditingStart()}
              className={`truncate text-sm font-semibold text-gray-900 ${
                canManage
                  ? "cursor-text hover:text-gray-600"
                  : "cursor-default"
              }`}
            >
              {column.title}
            </h2>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {taskCount}
          </span>

          {canManage && (
            <button
              type="button"
              onClick={() => onDelete()}
              aria-label="Eliminar lista"
              title="Eliminar lista"
              className={`${ICON_BTN} text-gray-400 hover:bg-red-50 hover:text-red-500`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 truncate text-[11px] text-gray-400">
        Tarefas do projecto
      </p>
    </div>
  );
}