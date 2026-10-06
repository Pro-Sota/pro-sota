"use client";

import {
  Check,
  MoreHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

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
  const [isAddingTask, setIsAddingTask] =
    useState(false);

  const [newTaskTitle, setNewTaskTitle] =
    useState("");

  const [isCreatingTask, setIsCreatingTask] =
    useState(false);

  const [isRenamingColumn, setIsRenamingColumn] =
    useState(false);

  const [columnName, setColumnName] =
    useState(column.name);

  const [isRenaming, setIsRenaming] =
    useState(false);

  async function handleAddTask() {
    if (!onAddTask || isCreatingTask) {
      return;
    }

    const title = newTaskTitle.trim();

    if (!title) {
      return;
    }

    setIsCreatingTask(true);

    try {
      await onAddTask(
        column.columnId,
        title,
      );

      setNewTaskTitle("");
      setIsAddingTask(false);
    } finally {
      setIsCreatingTask(false);
    }
  }

  function handleCancelAddTask() {
    if (isCreatingTask) {
      return;
    }

    setNewTaskTitle("");
    setIsAddingTask(false);
  }

  function handleStartRename() {
    if (!onRenameColumn || isRenaming) {
      return;
    }

    setColumnName(column.name);
    setIsRenamingColumn(true);
  }

  function handleCancelRename() {
    if (isRenaming) {
      return;
    }

    setColumnName(column.name);
    setIsRenamingColumn(false);
  }

  async function handleRenameColumn() {
    if (!onRenameColumn || isRenaming) {
      return;
    }

    const name = columnName.trim();

    if (!name) {
      return;
    }

    if (name === column.name) {
      setIsRenamingColumn(false);
      return;
    }

    setIsRenaming(true);

    try {
      await onRenameColumn(
        column.columnId,
        name,
      );

      setIsRenamingColumn(false);
    } finally {
      setIsRenaming(false);
    }
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
        draggable={
          !isRenamingColumn &&
          Boolean(onColumnDragStart)
        }
        onDragStart={(event) => {
          if (
            !onColumnDragStart ||
            isRenamingColumn
          ) {
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
        {isRenamingColumn ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                column.isCompleted
                  ? "bg-emerald-500"
                  : "bg-slate-300"
              }`}
            />

            <input
              autoFocus
              type="text"
              value={columnName}
              onChange={(event) =>
                setColumnName(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleRenameColumn();
                }

                if (event.key === "Escape") {
                  event.preventDefault();
                  handleCancelRename();
                }
              }}
              disabled={isRenaming}
              aria-label="Nome da coluna"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
            />

            <button
              type="button"
              onClick={() =>
                void handleRenameColumn()
              }
              disabled={
                isRenaming ||
                !columnName.trim()
              }
              aria-label="Guardar nome da coluna"
              title="Guardar"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#002950] text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCancelRename}
              disabled={isRenaming}
              aria-label="Cancelar renomeação"
              title="Cancelar"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
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
                    onClick={
                      handleStartRename
                    }
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
                    onClick={
                      handleDeleteColumn
                    }
                    aria-label={`Eliminar ${column.name}`}
                    title="Eliminar coluna"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </>
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
          {isAddingTask ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={newTaskTitle}
                onChange={(event) =>
                  setNewTaskTitle(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();

                    void handleAddTask();
                  }

                  if (event.key === "Escape") {
                    event.preventDefault();

                    handleCancelAddTask();
                  }
                }}
                disabled={isCreatingTask}
                placeholder="Título da tarefa..."
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <button
                type="button"
                onClick={() =>
                  void handleAddTask()
                }
                disabled={
                  isCreatingTask ||
                  !newTaskTitle.trim()
                }
                aria-label="Criar tarefa"
                title="Criar tarefa"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002950] text-white transition hover:bg-[#003b70] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={
                  handleCancelAddTask
                }
                disabled={isCreatingTask}
                aria-label="Cancelar"
                title="Cancelar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                setIsAddingTask(true)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova tarefa
            </button>
          )}
        </div>
      )}
    </div>
  );
}