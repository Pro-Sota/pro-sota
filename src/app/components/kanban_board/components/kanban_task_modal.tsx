
"use client";

import {
  Trash2,
  X,
  Calendar,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  PRIORITY_CONFIG,
  TASK_PRIORITIES,
} from "../constants";

import type {
  KanbanColumn,
  Task,
  TaskMember,
  UpdateTaskInput,
} from "../types";

import TaskDescription from "./kanban_task_description";
import TaskMembers from "./kanban_task_members";

type TaskModalProps = {
  task: Task;
  columns: KanbanColumn[];
  availableMembers: TaskMember[];
  canAssignMembers?: boolean;
  onClose: () => void;
  onUpdate: (
    taskId: string,
    input: UpdateTaskInput,
  ) => void | Promise<void>;
  onDelete: (taskId: string) => void;
};

export default function TaskModal({
  task,
  columns,
  availableMembers,
  canAssignMembers = false,
  onClose,
  onUpdate,
  onDelete,
}: TaskModalProps) {
  const isPersonalTask = task.projectId == null;

  const canManageMembers =
    !isPersonalTask && canAssignMembers;

  const isApproved =
    String(task.reviewStatus ?? "").toLowerCase() ===
    "approved";

  const [title, setTitle] = useState(task.title);

  const [members, setMembers] = useState<TaskMember[]>(
    task.members ?? [],
  );

  const [description, setDescription] = useState(
    task.description ?? "",
  );

  const [completed, setCompleted] = useState(
    Boolean(task.completed),
  );

  const [priority, setPriority] = useState(task.priority);

  const [startDate, setStartDate] = useState(
    task.startDate ?? "",
  );

  const [dueDate, setDueDate] = useState(
    task.dueDate ?? "",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setCompleted(Boolean(task.completed));
    setPriority(task.priority);
    setStartDate(task.startDate ?? "");
    setDueDate(task.dueDate ?? "");
    setMembers(task.members ?? []);
    setError(null);
  }, [
    task.taskId,
    task.title,
    task.description,
    task.completed,
    task.priority,
    task.startDate,
    task.dueDate,
    task.members,
  ]);

  const currentColumn =
    columns.find(
      (column) => column.columnId === task.columnId,
    )?.name ?? "Sem estado";

  const isConcluded = isPersonalTask
    ? completed
    : isApproved;

  function handleAddMember(member: TaskMember) {
    setMembers((current) => {
      const alreadyAdded = current.some(
        (item) => item.profileId === member.profileId,
      );

      if (alreadyAdded) return current;

      return [...current, member];
    });
  }

  function handleRemoveMember(profileId: string) {
    setMembers((current) =>
      current.filter(
        (member) => member.profileId !== profileId,
      ),
    );
  }

  async function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("O título da tarefa é obrigatório.");
      return;
    }

    if (startDate && dueDate && dueDate < startDate) {
      setError(
        "A data de conclusão não pode ser anterior à data de início.",
      );
      return;
    }

    const input: UpdateTaskInput = {
      title: trimmedTitle,
      description: trimmedDescription || null,
      completed: isPersonalTask
        ? completed
        : Boolean(task.completed),
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      ...(canManageMembers
        ? {
            memberIds: members.map(
              (member) => member.profileId,
            ),
          }
        : {}),
    };

    setIsSaving(true);
    setError(null);

    try {
      await onUpdate(task.taskId, input);
      onClose();
    } catch (err) {
      console.error("Erro ao actualizar tarefa:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível guardar as alterações.",
      );
    } finally {
      setIsSaving(false);
    }
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
            {isPersonalTask && (
              <button
                type="button"
                onClick={() =>
                  setCompleted((value) => !value)
                }
                aria-label={
                  completed
                    ? "Marcar tarefa como incompleta"
                    : "Marcar tarefa como concluída"
                }
                disabled={isSaving}
                className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-gray-300 bg-white text-transparent hover:border-emerald-400"
                }`}
              >
                <Check name="check" size="sm" />
              </button>
            )}

            <div className="min-w-0 flex-1">
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }

                  if (event.key === "Escape") {
                    setTitle(task.title);
                    event.currentTarget.blur();
                  }
                }}
                disabled={isSaving}
                className={`w-full bg-transparent text-xl font-semibold tracking-tight outline-none ${
                  isConcluded
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
                }`}
              />

              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {currentColumn}
                </span>

                {isPersonalTask && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400">
                      {completed ? "Concluída" : "Em aberto"}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onDelete(task.taskId)}
                aria-label="Eliminar tarefa"
                title="Eliminar tarefa"
                disabled={isSaving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                title="Fechar"
                disabled={isSaving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-7 p-6">
            {/* Completion status - personal tasks only */}
            {isPersonalTask && (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Estado
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {completed
                      ? "Concluída"
                      : currentColumn}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCompleted((value) => !value)
                  }
                  aria-label={
                    completed
                      ? "Marcar como incompleta"
                      : "Marcar como concluída"
                  }
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    completed
                      ? "bg-emerald-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      completed
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}

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
                {TASK_PRIORITIES.map(({ value }) => {
                  const selected = priority === value;
                  const priorityConfig =
                    PRIORITY_CONFIG[value];

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPriority(value)}
                      disabled={isSaving}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Data de início
                  </label>

                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="date"
                      value={startDate}
                      max={dueDate || undefined}
                      onChange={(event) =>
                        setStartDate(event.target.value)
                      }
                      disabled={isSaving}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Data de conclusão
                  </label>

                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="date"
                      value={dueDate}
                      min={startDate || undefined}
                      onChange={(event) =>
                        setDueDate(event.target.value)
                      }
                      disabled={isSaving}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Members - project tasks, Admin or Project Manager only */}
            {canManageMembers && (
              <TaskMembers
                members={members}
                availableMembers={availableMembers}
                onAdd={handleAddMember}
                onRemove={handleRemoveMember}
              />
            )}

            {/* Description */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-900">
                  Descrição
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Adicione informações ou instruções importantes para esta tarefa.
                </p>
              </div>

              <TaskDescription
                task={{
                  ...task,
                  description,
                }}
                onChange={setDescription}
              />

              <div className="mt-2 flex justify-end">
                <span className="text-[11px] text-gray-400">
                  {description.length} caracteres
                </span>
              </div>
            </div>

            {/* Save error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-4">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              isConcluded
                ? "text-emerald-600"
                : "text-gray-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConcluded
                  ? "bg-emerald-500"
                  : "bg-gray-300"
              }`}
            />

            {isPersonalTask
              ? completed
                ? "Tarefa concluída"
                : "Tarefa em aberto"
              : isApproved
                ? "Tarefa concluída"
                : "Tarefa em curso"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "A guardar..." : "Guardar alterações"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
