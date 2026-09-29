import {
  Trash2,
  AlertTriangle,
  Calendar,
  Check,
} from "lucide-react";
import { PRIORITY_CLASSES } from "./constants";
import type { TaskCardProps } from "./types";
import {
  isOverdue,
  formatDueDate,
  getTaskMembers,
  avatarColor,
  initials,
} from "./utils";
import { MemberAvatar } from "./member_avatar";

/* -------------------------------------------------------------------------- */
/* Task card                                                                  */
/* -------------------------------------------------------------------------- */

export function TaskCard({
  task,
  onSelect,
  onDelete,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}: TaskCardProps) {
  const overdue =
    task.dueDate && !task.completed ? isOverdue(task.dueDate) : false;

  const members = getTaskMembers(task);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${
        task.completed
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-gray-200/80 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            {task.completed && (
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}

            <h3
              className={`line-clamp-2 text-[13px] font-semibold leading-5 ${
                task.completed
                  ? "text-gray-400 line-through"
                  : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label="Eliminar tarefa"
          title="Eliminar tarefa"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-300 opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-gray-500">
          {task.description}
        </p>
      )}

      <div className="mt-3">
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold ${
            PRIORITY_CLASSES[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <div className="min-w-0">
          {task.dueDate ? (
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${
                overdue ? "text-red-600" : "text-gray-400"
              }`}
            >
              {overdue ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Calendar className="h-3.5 w-3.5 shrink-0" />
              )}

              <span className="truncate">
                {formatDueDate(task.dueDate)}
              </span>
            </span>
          ) : (
            <span className="text-[10px] text-gray-300">Sem prazo</span>
          )}
        </div>

        {members.length > 0 ? (
          <div className="flex items-center">
            {members.slice(0, 3).map((member, index) => (
              <span
                key={member.profileId}
                title={member.name}
                className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white text-[9px] font-bold text-white shadow-sm ${
                  index > 0 ? "-ml-2" : ""
                } ${
                  member.picture
                    ? "bg-gray-100"
                    : avatarColor(member.name)
                }`}
              >
                {member.picture ? (
                  <img
                    src={member.picture}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(member.name)
                )}
              </span>
            ))}

            {members.length > 3 && (
              <span className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[9px] font-semibold text-gray-500">
                +{members.length - 3}
              </span>
            )}
          </div>
        ) : task.assignedTo ? (
          <div
            title={`Responsável: ${task.assignedTo}`}
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white shadow-sm ${avatarColor(
              task.assignedTo,
            )}`}
          >
            {initials(task.assignedTo)}
          </div>
        ) : (
          <div
            title="Sem responsável"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-200 text-[11px] text-gray-300"
          >
            —
          </div>
        )}
      </div>
    </div>
  );
}