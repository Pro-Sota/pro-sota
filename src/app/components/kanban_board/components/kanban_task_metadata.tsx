'use client';

import { TASK_PRIORITIES } from '../constants';
import type { Task, UpdateTaskInput } from '../types';

export default function TaskMetadata({ task, onUpdate }: { task: Task; onUpdate: (input: UpdateTaskInput) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prioridade</span>
        <select value={task.priority} onChange={(event) => onUpdate({ priority: event.target.value as Task['priority'] })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200">
          {TASK_PRIORITIES.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Data de entrega</span>
        <input type="date" value={task.dueDate ?? ''} onChange={(event) => onUpdate({ dueDate: event.target.value || null })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
      </label>
    </div>
  );
}
