'use client';

import React, { useEffect, useState } from 'react';
import { GripVertical, Trash2, X, AlertTriangle, Calendar, Search, Plus } from 'lucide-react';
import { Task, Column, ColumnId } from './types';
import Loader from '../loader';

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Setup repository', description: 'Initialize Next.js app', columnId: 'todo' },
  { id: '2', title: 'Design Database', description: 'Create Prisma schema', columnId: 'in-progress' },
];

const LABELS = [
  { name: 'Bug', classes: 'bg-red-100 text-red-700 ring-red-200' },
  { name: 'Feature', classes: 'bg-blue-100 text-blue-700 ring-blue-200' },
  { name: 'Urgent', classes: 'bg-amber-100 text-amber-700 ring-amber-200' },
  { name: 'Low priority', classes: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
];

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-sky-500', 'bg-indigo-500', 'bg-violet-500', 'bg-pink-500',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const ICON_BTN = 'rounded-lg p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [columns, setColumns] = useState<Column[]>(COLUMNS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [memberInput, setMemberInput] = useState('');
  const [titleDraft, setTitleDraft] = useState('');

  const [listInput, setListInput] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  const [editingColumnId, setEditingColumnId] = useState<ColumnId | null>(null);
  const [columnTitleInput, setColumnTitleInput] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<ColumnId | null>(null);

  const [lastDeleted, setLastDeleted] = useState<{ task: Task; index: number } | null>(null);

  // ---- Persistence ----
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('kanban-tasks');
      const savedColumns = localStorage.getItem('kanban-columns');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedColumns) setColumns(JSON.parse(savedColumns));
    } catch (e) {
      console.error('Failed to load saved board', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('kanban-columns', JSON.stringify(columns));
  }, [columns, isLoaded]);

  // ---- Modal helpers ----
  useEffect(() => {
    setTitleDraft(selectedTask?.title ?? '');
  }, []);

  useEffect(() => {
    if (!selectedTaskId) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedTaskId(null);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ---- Undo toast ----
  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => setLastDeleted(null), 5000);
    return () => clearTimeout(timer);
  }, [lastDeleted]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // ---- Columns ----
  const handleAddColumn = () => {
    if (!listInput.trim()) return;
    setColumns((prev) => [...prev, { id: crypto.randomUUID(), title: listInput.trim() }]);
    setListInput('');
    setIsAddingList(false);
  };

  const handleDeleteColumn = (columnId: ColumnId) => {
    const hasTasks = tasks.some((t) => t.columnId === columnId);
    if (hasTasks && !window.confirm('This list has tasks in it. Delete the list and all its tasks?')) return;
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    setTasks((prev) => prev.filter((t) => t.columnId !== columnId));
  };

  const startEditingColumn = (column: Column) => {
    setEditingColumnId(column.id);
    setColumnTitleInput(column.title);
  };

  const commitColumnTitle = () => {
    if (!editingColumnId) return;
    const title = columnTitleInput.trim();
    if (title) setColumns((prev) => prev.map((c) => (c.id === editingColumnId ? { ...c, title } : c)));
    setEditingColumnId(null);
  };

  const handleColumnDragStart = (e: React.DragEvent, columnId: ColumnId) => {
    e.dataTransfer.setData('text/plain', `col:${columnId}`);
  };

  const handleColumnDropArea = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    setDragOverColumnId(null);
    const raw = e.dataTransfer.getData('text/plain');

    if (raw.startsWith('col:')) {
      const sourceColumnId = raw.slice(4);
      if (sourceColumnId === columnId) return;
      setColumns((prev) => {
        const next = [...prev];
        const from = next.findIndex((c) => c.id === sourceColumnId);
        const to = next.findIndex((c) => c.id === columnId);
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
      return;
    }

    if (!draggedTaskId) return;
    setTasks((prev) => {
      const moved = prev.find((t) => t.id === draggedTaskId);
      if (!moved) return prev;
      return [...prev.filter((t) => t.id !== draggedTaskId), { ...moved, columnId }];
    });
    setDraggedTaskId(null);
  };

  // ---- Tasks ----
  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', `task:${taskId}`);
  };

  const handleTaskDrop = (e: React.DragEvent, targetTaskId: string, targetColumnId: ColumnId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    setTasks((prev) => {
      const next = [...prev];
      const fromIndex = next.findIndex((t) => t.id === draggedTaskId);
      if (fromIndex === -1) return prev;
      const [moved] = next.splice(fromIndex, 1);
      moved.columnId = targetColumnId;
      const toIndex = next.findIndex((t) => t.id === targetTaskId);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleAddTask = (columnId: ColumnId) => {
    const value = (taskInputs[columnId] ?? '').trim();
    if (!value) return;
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title: value, description: '', columnId }]);
    setTaskInputs((prev) => ({ ...prev, [columnId]: '' }));
  };

  const handleDeleteTask = (taskId: string) => {
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return;
    setLastDeleted({ task: tasks[index], index });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;
    setTasks((prev) => {
      const next = [...prev];
      next.splice(Math.min(lastDeleted.index, next.length), 0, lastDeleted.task);
      return next;
    });
    setLastDeleted(null);
  };

  const commitTitle = () => {
    if (!selectedTask) return;
    const title = titleDraft.trim();
    if (title) updateTask(selectedTask.id, { title });
    else setTitleDraft(selectedTask.title);
  };

  const addMember = () => {
    if (!selectedTask || !memberInput.trim()) return;
    const name = memberInput.trim();
    if ((selectedTask.members ?? []).includes(name)) { 
      setMemberInput(''); 
      return; 
    }
    updateTask(selectedTask.id, { members: [...(selectedTask.members ?? []), name] });
    setMemberInput('');
  };

  const removeMember = (member: string) => {
    if (!selectedTask) return;
    updateTask(selectedTask.id, { members: (selectedTask.members ?? []).filter((m) => m !== member) });
  };

  const toggleLabel = (labelName: string) => {
    if (!selectedTask) return;
    const current = selectedTask.labels ?? [];
    const next = current.includes(labelName) ? current.filter((l) => l !== labelName) : [...current, labelName];
    updateTask(selectedTask.id, { labels: next });
  };

  const matchesSearch = (task: Task) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description ?? '').toLowerCase().includes(q) ||
      (task.members ?? []).some((m) => m.toLowerCase().includes(q)) ||
      (task.labels ?? []).some((l) => l.toLowerCase().includes(q))
    );
  };

  const totalMatches = tasks.filter(matchesSearch).length;
  const isSearching = searchQuery.trim().length > 0;

  if (loading) return <Loader />;

  return (
    <>
      <div className="min-h-screen">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                  Tarefas
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Organize seu trabalho em colunas
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar tarefas..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
                {isSearching && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpar pesquisa"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Empty State */}
          {isSearching && totalMatches === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-16 px-4 text-center">
              <Search className="h-10 w-10 text-gray-300 mb-4" />
              <p className="text-sm font-medium text-gray-900">Nenhuma tarefa encontrada</p>
              <p className="mt-1 text-sm text-gray-500">Nenhuma tarefa corresponde a "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-sm font-medium text-gray-600 underline hover:text-gray-900 transition"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
              {columns.map((column) => {
                const columnTasks = tasks.filter((t) => t.columnId === column.id && matchesSearch(t));
                return (
                  <div
                    key={column.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverColumnId(column.id);
                    }}
                    onDragLeave={() => setDragOverColumnId((prev) => (prev === column.id ? null : prev))}
                    onDrop={(e) => handleColumnDropArea(e, column.id)}
                    className={`w-80 flex-shrink-0 rounded-lg border bg-white shadow-sm min-h-[600px] flex flex-col transition ${
                      dragOverColumnId === column.id
                        ? 'border-gray-400 ring-2 ring-gray-200'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span
                            draggable
                            onDragStart={(e) => handleColumnDragStart(e, column.id)}
                            className="cursor-grab select-none text-gray-300 hover:text-gray-500 active:cursor-grabbing transition"
                            title="Arraste para reordenar"
                          >
                            <GripVertical className="h-4 w-4" />
                          </span>

                          {editingColumnId === column.id ? (
                            <input
                              autoFocus
                              value={columnTitleInput}
                              onChange={(e) => setColumnTitleInput(e.target.value)}
                              onBlur={commitColumnTitle}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitColumnTitle();
                                if (e.key === 'Escape') setEditingColumnId(null);
                              }}
                              className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                            />
                          ) : (
                            <h2
                              onClick={() => startEditingColumn(column)}
                              className="cursor-text truncate font-semibold text-gray-900 hover:text-gray-600 transition text-sm"
                              title="Clique para renomear"
                            >
                              {column.title}
                            </h2>
                          )}
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 min-w-[28px]">
                            {columnTasks.length}
                          </span>
                          <button
                            onClick={() => handleDeleteColumn(column.id)}
                            aria-label="Eliminar lista"
                            title="Eliminar lista"
                            className={`${ICON_BTN} text-gray-400 hover:bg-red-50 hover:text-red-500`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 space-y-3 overflow-y-auto overflow-x-visible px-4 py-4 sm:px-5">
                      {columnTasks.length === 0 && (
                        <p className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                          Sem tarefas
                        </p>
                      )}

                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleTaskDragStart(e, task.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleTaskDrop(e, task.id, column.id)}
                          onClick={() => setSelectedTaskId(task.id)}
                          className="group relative z-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-3.5 transition-all duration-200 hover:-translate-y-1 hover:z-10 hover:border-gray-300 hover:shadow-md active:cursor-grabbing hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium text-gray-900 flex-1">{task.title}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              aria-label="Eliminar tarefa"
                              title="Eliminar tarefa"
                              className={`${ICON_BTN} flex-shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          {task.description && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
                              {task.description}
                            </p>
                          )}

                          {(task.labels ?? []).length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {task.labels!.map((labelName) => {
                                const label = LABELS.find((l) => l.name === labelName);
                                return (
                                  <span
                                    key={labelName}
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                      label?.classes ?? 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {labelName}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between gap-2">
                            {task.dueDate ? (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                  isOverdue(task.dueDate)
                                    ? 'text-red-600'
                                    : 'text-gray-400'
                                }`}
                              >
                                {isOverdue(task.dueDate) ? (
                                  <AlertTriangle className="h-3 w-3" />
                                ) : (
                                  <Calendar className="h-3 w-3" />
                                )}
                                {formatDueDate(task.dueDate)}
                              </span>
                            ) : (
                              <span />
                            )}

                            {(task.members ?? []).length > 0 && (
                              <div className="flex -space-x-1.5">
                                {task.members!.slice(0, 3).map((member) => (
                                  <span
                                    key={member}
                                    title={member}
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${avatarColor(
                                      member
                                    )}`}
                                  >
                                    {initials(member)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Task Input */}
                    <div className="border-t border-gray-200 px-4 py-4 sm:px-5 space-y-3">
                      <input
                        type="text"
                        value={taskInputs[column.id] ?? ''}
                        onChange={(e) => setTaskInputs((prev) => ({ ...prev, [column.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                        placeholder="Nova tarefa..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      />
                      <button
                        onClick={() => handleAddTask(column.id)}
                        className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                      >
                        Adicionar tarefa
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Column Button */}
              <div className="w-80 flex-shrink-0">
                {isAddingList ? (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-full flex flex-col gap-3">
                    <input
                      autoFocus
                      type="text"
                      value={listInput}
                      onChange={(e) => setListInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                      placeholder="Nome da lista..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddColumn}
                        className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition"
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingList(false);
                          setListInput('');
                        }}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm font-semibold text-gray-600 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50 transition"
                  >
                    <Plus className="h-5 w-5" />
                    Nova lista
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Undo Toast */}
      {lastDeleted && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto z-50 sm:w-fit sm:-translate-x-1/2 flex items-center justify-between gap-4 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg">
          <span>Tarefa eliminada</span>
          <button
            onClick={handleUndoDelete}
            className="font-semibold text-gray-300 hover:text-white underline transition"
          >
            Desfazer
          </button>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedTaskId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-lg bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-6">
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                className="flex-1 rounded-lg border border-transparent px-1 text-xl font-bold text-gray-900 outline-none transition hover:border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />
              <div className="flex flex-shrink-0 items-center gap-1">
                <button
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  aria-label="Eliminar tarefa"
                  title="Eliminar tarefa"
                  className={`${ICON_BTN} text-gray-400 hover:bg-red-50 hover:text-red-500`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedTaskId(null)}
                  aria-label="Fechar"
                  className={`${ICON_BTN} text-gray-400 hover:bg-gray-100 hover:text-gray-600`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-6 p-6">
              {/* Status and Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</p>
                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    {columns.find((c) => c.id === selectedTask.columnId)?.title}
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Data de entrega</p>
                  <input
                    type="date"
                    value={selectedTask.dueDate ?? ''}
                    onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value || undefined })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              {/* Labels */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {LABELS.map((label) => {
                    const active = (selectedTask.labels ?? []).includes(label.name);
                    return (
                      <button
                        key={label.name}
                        onClick={() => toggleLabel(label.name)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${
                          active
                            ? `${label.classes} ring-1`
                            : 'bg-gray-100 text-gray-600 hover:text-gray-700'
                        }`}
                      >
                        {label.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Descrição</p>
                <textarea
                  value={selectedTask.description ?? ''}
                  onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
                  rows={4}
                  placeholder="Adicione uma descrição..."
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Members */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Membros</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedTask.members ?? []).length === 0 ? (
                    <span className="text-sm text-gray-400">Sem membros</span>
                  ) : (
                    (selectedTask.members ?? []).map((member) => (
                      <span
                        key={member}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white ${avatarColor(
                          member
                        )}`}
                      >
                        {member}
                        <button
                          onClick={() => removeMember(member)}
                          aria-label={`Remover ${member}`}
                          className="text-white/70 hover:text-white transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMember()}
                    placeholder="Nome do membro..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                  <button
                    onClick={addMember}
                    className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTaskId(null)}
                  className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}