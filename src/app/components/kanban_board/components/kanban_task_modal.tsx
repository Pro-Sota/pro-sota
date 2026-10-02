"use client";

import { Trash2, X, Check, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

import { PRIORITY_CONFIG, TASK_PRIORITIES } from "../constants";
import type {
  KanbanColumn,
  Task,
  TaskPriority,
  UpdateTaskInput,
} from "../types";

import TaskDescription from "./kanban_task_description";
import TaskMembers from "./kanban_task_members";

type TaskModalProps = {
  task: Task;
  columns: KanbanColumn[];
  onClose: () => void;
  onUpdate: (
    taskId: string,
    input: UpdateTaskInput,
  ) => void;
  onDelete: (taskId: string) => void;
};

export default function TaskModal({
  task,
  columns,
  onClose,
  onUpdate,
  onDelete,
}: TaskModalProps) {
  const [title, setTitle] = useState(task.title);

  useEffect(() => {
    setTitle(task.title);
  }, [task.taskId, task.title]);

  const currentColumn =
    columns.find(
      (column) => column.columnId === task.columnId,
    )?.name ?? "Sem estado";

  const isCompleted = Boolean(task.completed);

  function commitTitle() {
    const value = title.trim();

    if (value && value !== task.title) {
      onUpdate(task.taskId, {
        title: value,
      });

      return;
    }

    setTitle(task.title);
  }

  function toggleCompleted() {
    onUpdate(task.taskId, {
      completed: !isCompleted,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start gap-4">
            {/* Completion */}
            <button
              type="button"
              onClick={toggleCompleted}
              aria-label={
                isCompleted
                  ? "Marcar tarefa como incompleta"
                  : "Marcar tarefa como concluída"
              }
              className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                isCompleted
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-300 bg-white text-transparent hover:border-emerald-400"
              }`}
            >
              <Check className="h-4 w-4" />
            </button>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                onBlur={commitTitle}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }

                  if (event.key === "Escape") {
                    setTitle(task.title);
                    event.currentTarget.blur();
                  }
                }}
                className={`w-full bg-transparent text-xl font-semibold tracking-tight outline-none ${
                  isCompleted
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
                }`}
              />

              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {currentColumn}
                </span>

                <span className="text-gray-300">
                  •
                </span>

                <span className="text-xs text-gray-400">
                  {isCompleted
                    ? "Concluída"
                    : "Em aberto"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onDelete(task.taskId)}
                aria-label="Eliminar tarefa"
                title="Eliminar tarefa"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                title="Fechar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-7 p-6">
            {/* Status */}
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-xs font-medium text-gray-400">
                  Estado
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {isCompleted
                    ? "Concluída"
                    : currentColumn}
                </p>
              </div>

              <button
                type="button"
                onClick={toggleCompleted}
                aria-label={
                  isCompleted
                    ? "Marcar como incompleta"
                    : "Marcar como concluída"
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  isCompleted
                    ? "bg-emerald-500"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    isCompleted
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Priority */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-900">
                  Prioridade
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Defina a urgência desta tarefa.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TASK_PRIORITIES.map(({ value: priority }) => {
                  const selected =
                    task.priority === priority;

                  const priorityConfig =
                    PRIORITY_CONFIG[priority];

                  return (
                    <button
                      key={priority}
                      type="button"
                      onClick={() =>
                        onUpdate(task.taskId, {
                          priority,
                        })
                      }
                      className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left transition ${
                        selected
                          ? priorityConfig.active
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${priorityConfig.dot}`}
                      />

                      <span
                        className={`text-xs font-medium ${
                          selected
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {priorityConfig.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Planning */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-900">
                  Planeamento
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Defina quando a tarefa começa e termina.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Start date */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Data de início
                  </label>

                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="date"
                      value={task.startDate ?? ""}
                      onChange={(event) =>
                        onUpdate(task.taskId, {
                          startDate:
                            event.target.value || null,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                    />
                  </div>
                </div>

                {/* Due date */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Data de conclusão
                  </label>

                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="date"
                      value={task.dueDate ?? ""}
                      min={task.startDate ?? undefined}
                      onChange={(event) =>
                        onUpdate(task.taskId, {
                          dueDate:
                            event.target.value || null,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <TaskMembers
              members={task.members}
              onAdd={() => {}}
              onRemove={() => {}}
            />

            {/* Description */}
            <TaskDescription
              task={task}
              onChange={(description) =>
                onUpdate(task.taskId, {
                  description,
                })
              }
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-4">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              isCompleted
                ? "text-emerald-600"
                : "text-gray-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCompleted
                  ? "bg-emerald-500"
                  : "bg-gray-300"
              }`}
            />

            {isCompleted
              ? "Tarefa concluída"
              : "Tarefa em aberto"}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}