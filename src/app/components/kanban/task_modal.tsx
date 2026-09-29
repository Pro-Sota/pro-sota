import { Trash2, X, Check, Calendar } from "lucide-react";
import { PRIORITIES, PRIORITY_CONFIG } from "./constants";
import type { KanbanTask, ProjectMember } from "./types";
import { isOverdue } from "./utils";
import { MemberSelector } from "./member_selector";
import {TaskPriority} from "@/services/project_tasks"

/* -------------------------------------------------------------------------- */
/* Task Modal                                                                 */
/* -------------------------------------------------------------------------- */

type TaskModalProps = {
  selectedTask: KanbanTask | null;
  isProjectTasks: boolean;
  projectMembers: ProjectMember[];
  memberPickerOpen: boolean;
  titleDraft: string;
  onClose: () => void;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
  onTitleCommit: () => void;
  onCompletionChange: (completed: boolean) => void;
  onPriorityChange: (priority: TaskPriority) => void;
  onStartDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
  onDescriptionChange: (description: string) => void;
  onDescriptionBlur: (description: string) => void;
  onMemberToggle: (profileId: string) => void;
  onMemberPickerToggle: (open: boolean) => void;
  getColumnTitle: (columnId?: string | null) => string;
};

export function TaskModal({
  selectedTask,
  isProjectTasks,
  projectMembers,
  memberPickerOpen,
  titleDraft,
  onClose,
  onDelete,
  onTitleChange,
  onTitleCommit,
  onCompletionChange,
  onPriorityChange,
  onStartDateChange,
  onDueDateChange,
  onDescriptionChange,
  onDescriptionBlur,
  onMemberToggle,
  onMemberPickerToggle,
  getColumnTitle,
}: TaskModalProps) {
  if (!selectedTask) return null;

  const isOverdueTask = selectedTask.dueDate && !selectedTask.completed && isOverdue(selectedTask.dueDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() =>
                onCompletionChange(!selectedTask.completed)
              }
              aria-label={
                selectedTask.completed
                  ? "Marcar tarefa como incompleta"
                  : "Marcar tarefa como concluída"
              }
              className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                selectedTask.completed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-300 bg-white text-transparent hover:border-emerald-400"
              }`}
            >
              <Check className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
              <input
                value={titleDraft}
                onChange={(event) => onTitleChange(event.target.value)}
                onBlur={() => onTitleCommit()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }

                  if (event.key === "Escape") {
                    onTitleChange(selectedTask.title);
                    event.currentTarget.blur();
                  }
                }}
                className={`w-full bg-transparent text-xl font-semibold tracking-tight outline-none ${
                  selectedTask.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
                }`}
              />

              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {getColumnTitle(selectedTask.columnId) ??
                    "Lista indisponível"}
                </span>

                <span className="text-gray-300">•</span>

                <span className="text-xs text-gray-400">
                  {selectedTask.completed
                    ? "Concluída"
                    : "Em aberto"}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onDelete()}
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
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-7 p-6">
            {/* Completion Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-xs font-medium text-gray-400">Estado</p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {selectedTask.completed
                    ? "Concluída"
                    : getColumnTitle(selectedTask.columnId) ??
                      "Em aberto"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onCompletionChange(!selectedTask.completed)
                }
                aria-label={
                  selectedTask.completed
                    ? "Marcar como incompleta"
                    : "Marcar como concluída"
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  selectedTask.completed
                    ? "bg-emerald-500"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    selectedTask.completed
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
                {PRIORITIES.map((priority) => {
                  const selected =
                    selectedTask.priority === priority;

                  const priorityConfig =
                    PRIORITY_CONFIG[priority];

                  return (
                    <button
                      key={priority}
                      type="button"
                      onClick={() =>
                        onPriorityChange(priority)
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

                      <span className="text-xs font-medium text-gray-700">
                        {priorityConfig.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Planning - Start and Due Dates */}
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
                      value={selectedTask.startDate ?? ""}
                      onChange={(event) =>
                        onStartDateChange(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
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
                      value={selectedTask.dueDate ?? ""}
                      min={selectedTask.startDate ?? undefined}
                      onChange={(event) =>
                        onDueDateChange(event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <MemberSelector
              selectedTask={selectedTask}
              isProjectTasks={isProjectTasks}
              projectMembers={projectMembers}
              memberPickerOpen={memberPickerOpen}
              onTogglePicker={onMemberPickerToggle}
              onToggleMember={onMemberToggle}
            />

            {/* Description */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-semibold text-gray-900">
                  Descrição
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Adicione contexto ou instruções para a
                  tarefa.
                </p>
              </div>

              <textarea
                value={selectedTask.description ?? ""}
                onChange={(event) =>
                  onDescriptionChange(event.target.value)
                }
                onBlur={(event) =>
                  onDescriptionBlur(event.target.value)
                }
                rows={5}
                placeholder="Descreva o que precisa de ser feito..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-4">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              selectedTask.completed
                ? "text-emerald-600"
                : "text-gray-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                selectedTask.completed
                  ? "bg-emerald-500"
                  : "bg-gray-300"
              }`}
            />

            {selectedTask.completed
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
        </div>
      </div>
    </div>
  );
}