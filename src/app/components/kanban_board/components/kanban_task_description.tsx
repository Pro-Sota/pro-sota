'use client';

import type { Task } from '../types';

export default function TaskDescription({ task, onChange }: { task: Task; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Descrição</span>
      <textarea value={task.description ?? ''} onChange={(event) => onChange(event.target.value)} rows={5} placeholder="Adicionar descrição..." 
      className="w-full resize-none rounded-xl border border-slate-300 p-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
    </label>
  );
}
