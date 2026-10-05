'use client';

import { AlertTriangle, Calendar, Trash2, X } from 'lucide-react';
import type { Task } from '../types';
import { getAvatarColor, getInitials } from '../utils/avatar';
import { formatDueDate, isOverdue } from '../utils/dates';

const PRIORITY_CLASSES: Record<Task['priority'], string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-amber-50 text-amber-700',
  critical: 'bg-red-50 text-red-700',
};

export default function KanbanTaskCard({
  task,
  onOpen,
  onDelete,
  onDragStart,
  onDrop,
}: {
  task: Task;
  onOpen: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => { event.preventDefault(); event.stopPropagation(); onDrop(); }}
      onClick={onOpen}
      className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 text-sm font-semibold text-slate-800">{task.title}</h3>
        <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }} aria-label="Eliminar tarefa" className="rounded-lg p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
          <X size={14} />
        </button>
      </div>

      {task.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{task.description}</p>}

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_CLASSES[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${overdue ? 'text-red-500' : 'text-slate-400'}`}>
            {overdue ? <AlertTriangle size={11} /> : <Calendar size={11} />}
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400">{task.members.length ? `${task.members.length} membro${task.members.length > 1 ? 's' : ''}` : 'Sem membros'}</span>
        {task.members.length > 0 && (
          <div className="flex -space-x-2">
            {task.members.slice(0, 3).map((member) => {
              const name = `${member.firstName} ${member.lastName}`.trim();
              return (
                <span key={member.profileId} title={name} className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold text-white ring-2 ring-slate-50 ${getAvatarColor()}`}>
                  {getInitials(member.firstName, member.lastName)}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
