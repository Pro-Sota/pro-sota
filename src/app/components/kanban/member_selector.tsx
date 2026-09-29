import { Plus, Check, X } from "lucide-react";
import type { KanbanTask, ProjectMember, TaskMember } from "./types";
import { MemberAvatar } from "./member_avatar";

/* -------------------------------------------------------------------------- */
/* Member selector                                                           */
/* -------------------------------------------------------------------------- */

type MemberSelectorProps = {
  selectedTask: KanbanTask;
  isProjectTasks: boolean;
  projectMembers: ProjectMember[];
  memberPickerOpen: boolean;
  onTogglePicker: (open: boolean) => void;
  onToggleMember: (profileId: string) => void;
};

export function MemberSelector({
  selectedTask,
  isProjectTasks,
  projectMembers,
  memberPickerOpen,
  onTogglePicker,
  onToggleMember,
}: MemberSelectorProps) {
  const assignedMembers = selectedTask.assignedMembers ?? [];

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Responsáveis</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {isProjectTasks
              ? "Adicione um ou mais membros do projecto."
              : "Esta tarefa pertence ao utilizador actual."}
          </p>
        </div>

        {isProjectTasks && projectMembers.length > 0 && (
          <button
            type="button"
            onClick={() => onTogglePicker(!memberPickerOpen)}
            aria-label="Adicionar responsável"
            title="Adicionar responsável"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
              memberPickerOpen
                ? "border-[#002950] bg-[#002950] text-white"
                : "border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isProjectTasks ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          {assignedMembers && assignedMembers.length > 0 ? (
            assignedMembers.map((member) => (
              <div key={member.profileId} className="flex items-center gap-3">
                <MemberAvatar member={member} size="medium" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {member.name}
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Utilizador actual
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">
                  Responsável
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-300">
                <Check className="h-4 w-4" />
              </div>

              <p className="text-sm text-gray-400">
                A tarefa será atribuída ao utilizador actual.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {memberPickerOpen && (
            <div className="mb-3 rounded-xl border border-gray-200 bg-white p-2">
              {projectMembers.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-400">
                  Não existem membros disponíveis neste projecto.
                </p>
              ) : (
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {projectMembers.map((member) => {
                    const selected = assignedMembers.some(
                      (item) => item.profileId === member.profileId,
                    );

                    return (
                      <button
                        key={member.profileId}
                        type="button"
                        onClick={() => onToggleMember(member.profileId)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                          selected ? "bg-gray-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <MemberAvatar member={member} size="medium" />

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-800">
                            {member.name}
                          </span>

                          {member.jobTitle && (
                            <span className="block truncate text-[11px] text-gray-400">
                              {member.jobTitle}
                            </span>
                          )}
                        </span>

                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            selected
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-300 bg-white text-transparent"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Assigned members display - NEW UI with initials pills */}
          {assignedMembers && assignedMembers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedMembers.map((member) => (
                <span
                  key={member.profileId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-1 pr-2 text-xs font-medium text-gray-700"
                >
                  <MemberAvatar member={member} size="small" />

                  <span className="max-w-40 truncate">{member.name}</span>

                  <button
                    type="button"
                    onClick={() => onToggleMember(member.profileId)}
                    aria-label={`Remover ${member.name}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 px-4 py-5 text-center">
              <p className="text-sm text-gray-400">
                Nenhum responsável atribuído.
              </p>

              <button
                type="button"
                onClick={() => onTogglePicker(true)}
                className="mt-2 text-xs font-semibold text-gray-700 underline underline-offset-2 hover:text-gray-900"
              >
                Adicionar membro
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}