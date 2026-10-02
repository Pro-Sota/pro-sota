'use client';

import type { Task } from '../types';

export default function DeleteUndoToast({ deletedTask, onUndo }: { deletedTask: { task: Task; index: number } | null; onUndo: () => void }) {
  if (!deletedTask) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-4 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white shadow-2xl">
      <span>Tarefa "{deletedTask.task.title}" eliminada.</span>
      <button type="button" onClick={onUndo} className="font-semibold underline hover:text-slate-200">Desfazer</button>
    </div>
  );
}
