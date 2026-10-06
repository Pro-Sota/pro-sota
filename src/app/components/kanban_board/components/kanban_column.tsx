"use client";

import {
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import type {
  KanbanColumn,
  Task,
} from "../types";

type KanbanColumnProps = {
  column: KanbanColumn;
  tasks: Task[];

  onAddTask?: (
    columnId: string,
    title: string,
  ) => void | Promise<void>;

  onOpenTask: (
    taskId: string,
  ) => void;

  onDeleteTask?: (
    taskId: string,
  ) => void;

  onMoveTask?: (
    taskId: string,
    targetColumnId: string,
    orderedTaskIds: string[],
  ) => void | Promise<void>;

  onTaskDragStart?: (
    taskId: string,
  ) => void;

  onDeleteColumn?: (
    columnId: string,
  ) => void | Promise<void>;

  onRenameColumn?: (
    columnId: string,
    name: string,
  ) => void | Promise<void>;

  onColumnDragStart?: () => void;

  onColumnDrop?: () => void;

  isDragOver: boolean;
};

export default function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onOpenTask,
  onDeleteTask,
  onMoveTask,
  onTaskDragStart,
  onDeleteColumn,
  onRenameColumn,
  onColumnDragStart,
  onColumnDrop,
  isDragOver,
}: KanbanColumnProps) {
  function handleAddTask() {
    if (!onAddTask) {
      return;
    }

    const title = window.prompt(
      "Título da tarefa",
    );

    if (!title?.trim()) {
      return;
    }

    void onAddTask(
      column.columnId,
      title.trim(),
    );
  }

  function handleDeleteTask(
    taskId: string,
  ) {
    if (!onDeleteTask) {
      return;
    }

    onDeleteTask(taskId);
  }

  function handleDeleteColumn() {
    if (!onDeleteColumn) {
      return;
    }

    onDeleteColumn(column.columnId);
  }

  async function handleRenameColumn() {
    if (!onRenameColumn) {
      return;
    }

    const name = window.prompt(
      "Nome da coluna",
      column.name,
    );

    if (!name?.trim()) {
      return;
    }

    await onRenameColumn(
      column.columnId,
      name.trim(),
    );
  }

  return (
    <div
      className={[
        "flex h-full w-[320px] flex-col rounded-2xl border bg-white",
        isDragOver
          ? "border-slate-400 ring-2 ring-slate-200"
          : "border-slate-200",
      ].join(" ")}
    >
      {/* Column header */}
      <div
        className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3"
        draggable={Boolean(onColumnDragStart)}
        onDragStart={(event) => {
          if (!onColumnDragStart) {
            return;
          }

          event.dataTransfer.effectAllowed =
            "move";

          onColumnDragStart();
        }}
        onDragEnd={() => {
          onColumnDrop?.();
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              column.isCompleted
                ? "bg-emerald-500"
                : "bg-slate-300"
            }`}
          />

          <h3 className="truncate text-sm font-semibold text-slate-800">
            {column.name}
          </h3>

          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            {tasks.length}
          </span>
        </div>

        {(onRenameColumn ||
          onDeleteColumn) && (
          <div className="flex shrink-0 items-center gap-1">
            {onRenameColumn && (
              <button
                type="button"
                onClick={handleRenameColumn}
                aria-label={`Renomear ${column.name}`}
                title="Renomear coluna"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            )}

            {onDeleteColumn && (
              <button
                type="button"
                onClick={handleDeleteColumn}
                aria-label={`Eliminar ${column.name}`}
                title="Eliminar coluna"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div
        className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3"
        onDragOver={(event) => {
          if (!onMoveTask) {
            return;
          }

          event.preventDefault();
          event.dataTransfer.dropEffect =
            "move";
        }}
        onDrop={(event) => {
          if (!onMoveTask) {
            return;
          }

          event.preventDefault();

          const taskId =
            event.dataTransfer.getData(
              "text/plain",
            );

          if (!taskId) {
            return;
          }

          const orderedTaskIds = [
            taskId,
            ...tasks
              .filter(
                (task) =>
                  task.taskId !== taskId,
              )
              .map(
                (task) =>
                  task.taskId,
              ),
          ];

          void onMoveTask(
            taskId,
            column.columnId,
            orderedTaskIds,
          );
        }}
      >
        {tasks.map((task) => (
          <div
            key={task.taskId}
            draggable={Boolean(
              onTaskDragStart,
            )}
            onDragStart={(event) => {
              if (!onTaskDragStart) {
                return;
              }

              event.dataTransfer.effectAllowed =
                "move";

              event.dataTransfer.setData(
                "text/plain",
                task.taskId,
              );

              onTaskDragStart(
                task.taskId,
              );
            }}
            onClick={() =>
              onOpenTask(task.taskId)
            }
            className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <p
                className={`min-w-0 flex-1 text-sm font-medium ${
                  task.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-800"
                }`}
              >
                {task.title}
              </p>

              {onDeleteTask && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteTask(
                      task.taskId,
                    );
                  }}
                  aria-label="Eliminar tarefa"
                  title="Eliminar tarefa"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {task.description && (
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                {task.description}
              </p>
            )}

            {task.members.length > 0 && (
              <div className="mt-3 flex -space-x-1.5">
                {task.members
                  .slice(0, 4)
                  .map((member) => (
                    <span
                      key={
                        member.profileId
                      }
                      title={`${member.firstName} ${member.lastName}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-[9px] font-semibold text-white"
                    >
                      {(
                        member.firstName?.[0] ??
                        ""
                      ).toUpperCase()}
                      {(
                        member.lastName?.[0] ??
                        ""
                      ).toUpperCase()}
                    </span>
                  ))}

                {task.members.length >
                  4 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-500">
                    +
                    {task.members.length -
                      4}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 text-center">
            <p className="text-xs text-slate-400">
              Nenhuma tarefa
            </p>
          </div>
        )}
      </div>

      {/* Add task */}
      {onAddTask && (
        <div className="shrink-0 border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleAddTask}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Nova tarefa
          </button>
        </div>
      )}
    </div>
  );
}