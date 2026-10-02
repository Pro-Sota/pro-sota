'use client';

import { GripVertical, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { KanbanColumn, Task } from '../types';
import KanbanTaskCard from './kanban_task_card';
import AddTask from './kanban_add_task';

export default function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onOpenTask,
  onDeleteTask,
  onMoveTask,
  onDeleteColumn,
  onRenameColumn,
  onColumnDragStart,
  onTaskDragStart,
  onColumnDrop,
  isDragOver,
}: {
  column: KanbanColumn;
  tasks: Task[];
  onAddTask: (columnId: string, title: string) => void;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, columnId: string, orderedTaskIds: string[]) => void;
  onTaskDragStart: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, name: string) => void;
  onColumnDragStart: () => void;
  onColumnDrop: () => void;
  isDragOver: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  function commitName() {
    const value = name.trim();
    if (value && value !== column.name) onRenameColumn(column.columnId, value);
    setEditing(false);
  }

  function moveTask(taskId: string) {
    const orderedTaskIds = [taskId, ...tasks.filter((task) => task.taskId !== taskId).map((task) => task.taskId)];
    onMoveTask(taskId, column.columnId, orderedTaskIds);
  }

  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => { event.preventDefault(); onColumnDrop(); }}
      className={`flex min-h-[500px] w-80 flex-shrink-0 flex-col rounded-2xl border bg-white p-4 shadow-sm transition ${isDragOver ? 'border-slate-400 ring-2 ring-slate-200' : 'border-slate-200'}`}
    >
      <header className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button type="button" draggable onDragStart={onColumnDragStart} aria-label="Reordenar lista" className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing">
            <GripVertical size={16} />
          </button>
          {editing ? (
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} onBlur={commitName} onKeyDown={(event) => { if (event.key === 'Enter') commitName(); if (event.key === 'Escape') { setName(column.name); setEditing(false); } }} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm font-semibold outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="min-w-0 truncate text-left text-sm font-semibold text-slate-800 hover:text-slate-600" title="Renomear lista">
              {column.name}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{tasks.length}</span>
          <button type="button" onClick={() => onDeleteColumn(column.columnId)} aria-label="Eliminar lista" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
            <Trash2 size={15} />
          </button>
          <MoreHorizontal size={16} className="hidden text-slate-300" />
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {tasks.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">Sem tarefas</p>}
        {tasks.map((task) => (
          <KanbanTaskCard
            key={task.taskId}
            task={task}
            onOpen={() => onOpenTask(task.taskId)}
            onDelete={() => onDeleteTask(task.taskId)}
            onDragStart={() => onTaskDragStart(task.taskId)}
            onDrop={() => moveTask(task.taskId)}
          />
        ))}
      </div>

      <AddTask onAdd={(title) => onAddTask(column.columnId, title)} />
    </section>
  );
}
