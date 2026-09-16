'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  GripVertical,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
  Search,
  Plus,
  AlertCircle,
} from 'lucide-react';

import { Task, Column, ColumnId } from './types';
import Loader from '../loader';
import {
  getTaskBoard,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  renameTaskColumn,
  getTaskColumnTasks,
} from '@/services/project_tasks';

const LABELS = [
  {
    name: 'Bug',
    classes: 'bg-red-100 text-red-700 ring-red-200',
  },
  {
    name: 'Feature',
    classes: 'bg-blue-100 text-blue-700 ring-blue-200',
  },
  {
    name: 'Urgent',
    classes: 'bg-amber-100 text-amber-700 ring-amber-200',
  },
  {
    name: 'Low priority',
    classes: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  },
];

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-pink-500',
];

function avatarColor(name: string) {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function isOverdue(dueDate?: string) {
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(dueDate) < today;
}

function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const ICON_BTN =
  'rounded-lg p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1';

export default function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? null;

  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [memberInput, setMemberInput] = useState('');
  const [titleDraft, setTitleDraft] = useState('');

  const [listInput, setListInput] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  const [editingColumnId, setEditingColumnId] =
    useState<ColumnId | null>(null);
  const [columnTitleInput, setColumnTitleInput] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] =
    useState<ColumnId | null>(null);

  const [lastDeleted, setLastDeleted] = useState<{
    task: Task;
    index: number;
  } | null>(null);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchBoard = async () => {
      if (!projectId) {
        setError('Project ID not found');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const board = await getTaskBoard(projectId);
        setTasks(board.tasks);
        setColumns(board.columns);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load tasks. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [projectId]);

  useEffect(() => {
    if (!selectedTaskId) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedTaskId(null);
      }
    };

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [selectedTaskId]);

  useEffect(() => {
    setTitleDraft(selectedTask?.title ?? '');
  }, [selectedTaskId, selectedTask?.title]);

  useEffect(() => {
    if (!lastDeleted) return;

    const timer = setTimeout(() => {
      setLastDeleted(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [lastDeleted]);

  const updateTaskLocal = (taskId: string, updates: Partial<Task>) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
            }
          : task
      )
    );
  };

  /*
   * Columns
   */

  const handleAddColumn = async () => {
    const title = listInput.trim();

    if (!title || !projectId) return;

    try {
      // Create a new column by adding it to the local state
      // In a real app, you might want to persist this to the database
      const newColumn: Column = {
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
      };

      setColumns((previous) => [...previous, newColumn]);
      setListInput('');
      setIsAddingList(false);
    } catch (err) {
      console.error('Failed to add column:', err);
      setError('Failed to add column. Please try again.');
    }
  };

  const handleDeleteColumn = async (columnId: ColumnId) => {
    const hasTasks = tasks.some((task) => task.columnId === columnId);

    if (
      hasTasks &&
      !window.confirm(
        'This list has tasks in it. Delete the list and all its tasks?'
      )
    ) {
      return;
    }

    try {
      // Delete tasks in this column
      if (hasTasks) {
        const columnTasks = tasks.filter(
          (task) => task.columnId === columnId
        );
        
        for (const task of columnTasks) {
          await deleteTask(task.id);
        }

        setTasks((previous) =>
          previous.filter((task) => task.columnId !== columnId)
        );
      }

      setColumns((previous) =>
        previous.filter((column) => column.id !== columnId)
      );
    } catch (err) {
      console.error('Failed to delete column:', err);
      setError('Failed to delete column. Please try again.');
    }
  };

  const startEditingColumn = (column: Column) => {
    setEditingColumnId(column.id);
    setColumnTitleInput(column.title);
  };

  const commitColumnTitle = async () => {
    if (!editingColumnId || !projectId) return;

    const title = columnTitleInput.trim();

    if (title) {
      try {
        // Update all tasks with the old status to have the new status
        const oldColumn = columns.find(
          (col) => col.id === editingColumnId
        );

        if (oldColumn && oldColumn.title !== title) {
          await renameTaskColumn(
            projectId,
            oldColumn.title,
            title
          );

          setColumns((previous) =>
            previous.map((column) =>
              column.id === editingColumnId
                ? {
                    ...column,
                    title,
                  }
                : column
            )
          );

          // Update local tasks
          setTasks((previous) =>
            previous.map((task) =>
              task.columnId === editingColumnId
                ? {
                    ...task,
                    columnId: title.toLowerCase().replace(/\s+/g, '-'),
                  }
                : task
            )
          );
        }
      } catch (err) {
        console.error('Failed to rename column:', err);
        setError('Failed to rename column. Please try again.');
      }
    }

    setEditingColumnId(null);
  };

  const handleColumnDragStart = (
    event: React.DragEvent,
    columnId: ColumnId
  ) => {
    event.dataTransfer.setData('text/plain', `col:${columnId}`);
  };

  const handleColumnDropArea = (
    event: React.DragEvent,
    columnId: ColumnId
  ) => {
    event.preventDefault();

    setDragOverColumnId(null);

    const raw = event.dataTransfer.getData('text/plain');

    if (raw.startsWith('col:')) {
      const sourceColumnId = raw.slice(4);

      if (sourceColumnId === columnId) return;

      setColumns((previous) => {
        const next = [...previous];

        const from = next.findIndex(
          (column) => column.id === sourceColumnId
        );

        const to = next.findIndex(
          (column) => column.id === columnId
        );

        if (from === -1 || to === -1) {
          return previous;
        }

        const [moved] = next.splice(from, 1);

        if (!moved) {
          return previous;
        }

        next.splice(to, 0, moved);

        return next;
      });

      return;
    }

    if (!draggedTaskId || !projectId) return;

    handleTaskMove(draggedTaskId, columnId);
  };

  /*
   * Tasks
   */

  const handleTaskDragStart = (
    event: React.DragEvent,
    taskId: string
  ) => {
    setDraggedTaskId(taskId);

    event.dataTransfer.setData('text/plain', `task:${taskId}`);
  };

  const handleTaskDrop = (
    event: React.DragEvent,
    targetTaskId: string,
    targetColumnId: ColumnId
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      return;
    }

    setTasks((previous) => {
      const next = [...previous];

      const fromIndex = next.findIndex(
        (task) => task.id === draggedTaskId
      );

      if (fromIndex === -1) return previous;

      const [moved] = next.splice(fromIndex, 1);

      if (!moved) return previous;

      moved.columnId = targetColumnId;

      const toIndex = next.findIndex(
        (task) => task.id === targetTaskId
      );

      if (toIndex === -1) {
        return [...next, moved];
      }

      next.splice(toIndex, 0, moved);

      return next;
    });

    setDraggedTaskId(null);
    setDragOverColumnId(null);

    // Sync with database
    if (draggedTaskId) {
      handleTaskMove(draggedTaskId, targetColumnId);
    }
  };

  const handleTaskMove = async (taskId: string, columnId: ColumnId) => {
    try {
      await moveTask(taskId, columnId);
    } catch (err) {
      console.error('Failed to move task:', err);
      setError('Failed to move task. Please try again.');
    }
  };

  const handleAddTask = async (columnId: ColumnId) => {
    const value = (taskInputs[columnId] ?? '').trim();

    if (!value || !projectId) return;

    try {
      const newTask = await createTask({
        projectId,
        title: value,
      });

      if (newTask.columnId !== columnId) {
        await moveTask(newTask.id, columnId);
        newTask.columnId = columnId;
      }

      setTasks((previous) => [...previous, newTask]);

      setTaskInputs((previous) => ({
        ...previous,
        [columnId]: '',
      }));
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const index = tasks.findIndex((task) => task.id === taskId);

    if (index === -1) return;

    setLastDeleted({
      task: tasks[index],
      index,
    });

    setTasks((previous) =>
      previous.filter((task) => task.id !== taskId)
    );

    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }

    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
      // Restore the task if deletion failed
      handleUndoDelete();
    }
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;

    setTasks((previous) => {
      const next = [...previous];

      next.splice(
        Math.min(lastDeleted.index, next.length),
        0,
        lastDeleted.task
      );

      return next;
    });

    setLastDeleted(null);
  };

  /*
   * Task modal
   */

  const commitTitle = async () => {
    if (!selectedTask) return;

    const title = titleDraft.trim();

    if (title && title !== selectedTask.title) {
      try {
        await updateTask(selectedTask.id, {
          title,
        });

        updateTaskLocal(selectedTask.id, {
          title,
        });
      } catch (err) {
        console.error('Failed to update task title:', err);
        setError('Failed to update task. Please try again.');
        setTitleDraft(selectedTask.title);
      }
    } else {
      setTitleDraft(selectedTask.title);
    }
  };

  const addMember = () => {
    if (!selectedTask || !memberInput.trim()) return;

    const name = memberInput.trim();

    if ((selectedTask.members ?? []).includes(name)) {
      setMemberInput('');
      return;
    }

    const newMembers = [
      ...(selectedTask.members ?? []),
      name,
    ];

    updateTaskLocal(selectedTask.id, {
      members: newMembers,
    });

    // Sync with database
    updateTaskInDatabase(selectedTask.id, selectedTask);

    setMemberInput('');
  };

  const removeMember = (member: string) => {
    if (!selectedTask) return;

    const newMembers = (selectedTask.members ?? []).filter(
      (item) => item !== member
    );

    updateTaskLocal(selectedTask.id, {
      members: newMembers,
    });

    // Sync with database
    updateTaskInDatabase(selectedTask.id, selectedTask);
  };

  const toggleLabel = (labelName: string) => {
    if (!selectedTask) return;

    const current = selectedTask.labels ?? [];

    const next = current.includes(labelName)
      ? current.filter((label) => label !== labelName)
      : [...current, labelName];

    updateTaskLocal(selectedTask.id, {
      labels: next,
    });

    // Sync with database (labels are stored as priority in the DB)
    if (next.length > 0) {
      updateTaskInDatabase(selectedTask.id, {
        ...selectedTask,
        labels: next,
      });
    }
  };

  const updateTaskInDatabase = async (
    taskId: string,
    task: Task
  ) => {
    try {
      await updateTask(taskId, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.labels?.[0], // Store first label as priority
      });
    } catch (err) {
      console.error('Failed to update task in database:', err);
      setError('Failed to save changes. Please try again.');
    }
  };

  /*
   * Search
   */

  const matchesSearch = (task: Task) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    return (
      task.title.toLowerCase().includes(query) ||
      (task.description ?? '').toLowerCase().includes(query) ||
      (task.members ?? []).some((member) =>
        member.toLowerCase().includes(query)
      ) ||
      (task.labels ?? []).some((label) =>
        label.toLowerCase().includes(query)
      )
    );
  };

  const totalMatches = useMemo(
    () => tasks.filter(matchesSearch).length,
    [tasks, searchQuery]
  );

  const isSearching = searchQuery.trim().length > 0;

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="mx-auto max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

          {/* Error Toast */}
          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  {error}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  Tarefas
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  Organize seu trabalho em colunas
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Pesquisar tarefas..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />

                {isSearching && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpar pesquisa"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Empty search state */}
          {isSearching && totalMatches === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-16 text-center">
              <Search className="mb-4 h-10 w-10 text-gray-300" />

              <p className="text-sm font-medium text-gray-900">
                Nenhuma tarefa encontrada
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Nenhuma tarefa corresponde a "{searchQuery}"
              </p>

              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 text-sm font-medium text-gray-600 underline transition hover:text-gray-900"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0">

              {columns.map((column) => {
                const columnTasks = tasks.filter(
                  (task) =>
                    task.columnId === column.id &&
                    matchesSearch(task)
                );

                return (
                  <div
                    key={column.id}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverColumnId(column.id);
                    }}
                    onDragLeave={() =>
                      setDragOverColumnId((previous) =>
                        previous === column.id
                          ? null
                          : previous
                      )
                    }
                    onDrop={(event) =>
                      handleColumnDropArea(
                        event,
                        column.id
                      )
                    }
                    className={`flex min-h-[600px] w-80 flex-shrink-0 flex-col rounded-lg border bg-white shadow-sm transition ${
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
                            onDragStart={(event) =>
                              handleColumnDragStart(
                                event,
                                column.id
                              )
                            }
                            className="cursor-grab select-none text-gray-300 transition hover:text-gray-500 active:cursor-grabbing"
                            title="Arraste para reordenar"
                          >
                            <GripVertical className="h-4 w-4" />
                          </span>

                          {editingColumnId === column.id ? (
                            <input
                              autoFocus
                              value={columnTitleInput}
                              onChange={(event) =>
                                setColumnTitleInput(
                                  event.target.value
                                )
                              }
                              onBlur={commitColumnTitle}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  commitColumnTitle();
                                }

                                if (event.key === 'Escape') {
                                  setEditingColumnId(null);
                                }
                              }}
                              className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                            />
                          ) : (
                            <h2
                              onClick={() =>
                                startEditingColumn(column)
                              }
                              className="cursor-text truncate text-sm font-semibold text-gray-900 transition hover:text-gray-600"
                              title="Clique para renomear"
                            >
                              {column.title}
                            </h2>
                          )}
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            {columnTasks.length}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteColumn(column.id)
                            }
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
                          onDragStart={(event) =>
                            handleTaskDragStart(
                              event,
                              task.id
                            )
                          }
                          onDragOver={(event) =>
                            event.preventDefault()
                          }
                          onDrop={(event) =>
                            handleTaskDrop(
                              event,
                              task.id,
                              column.id
                            )
                          }
                          onClick={() =>
                            setSelectedTaskId(task.id)
                          }
                          className="group relative z-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-3.5 transition-all duration-200 hover:z-10 hover:-translate-y-1 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:cursor-grabbing"
                        >

                          <div className="flex items-start justify-between gap-2">
                            <h3 className="flex-1 text-sm font-medium text-gray-900">
                              {task.title}
                            </h3>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
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
                                const label = LABELS.find(
                                  (item) =>
                                    item.name === labelName
                                );

                                return (
                                  <span
                                    key={labelName}
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                      label?.classes ??
                                      'bg-gray-100 text-gray-600'
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
                                {isOverdue(
                                  task.dueDate
                                ) ? (
                                  <AlertTriangle className="h-3 w-3" />
                                ) : (
                                  <Calendar className="h-3 w-3" />
                                )}

                                {formatDueDate(
                                  task.dueDate
                                )}
                              </span>
                            ) : (
                              <span />
                            )}

                            {(task.members ?? []).length > 0 && (
                              <div className="flex -space-x-1.5">
                                {task.members!
                                  .slice(0, 3)
                                  .map((member) => (
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

                    {/* Add Task */}
                    <div className="space-y-3 border-t border-gray-200 px-4 py-4 sm:px-5">
                      <input
                        type="text"
                        value={
                          taskInputs[column.id] ?? ''
                        }
                        onChange={(event) =>
                          setTaskInputs((previous) => ({
                            ...previous,
                            [column.id]:
                              event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            handleAddTask(column.id);
                          }
                        }}
                        placeholder="Nova tarefa..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleAddTask(column.id)
                        }
                        className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                      >
                        Adicionar tarefa
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Column */}
              <div className="w-80 flex-shrink-0">
                {isAddingList ? (
                  <div className="flex h-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">

                    <input
                      autoFocus
                      type="text"
                      value={listInput}
                      onChange={(event) =>
                        setListInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleAddColumn();
                        }

                        if (event.key === 'Escape') {
                          setIsAddingList(false);
                          setListInput('');
                        }
                      }}
                      placeholder="Nome da lista..."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddColumn}
                        className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                      >
                        Adicionar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingList(false);
                          setListInput('');
                        }}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setIsAddingList(true)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm font-semibold text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
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
        <div className="fixed bottom-6 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg sm:left-1/2 sm:right-auto sm:w-fit sm:-translate-x-1/2">
          <span>Tarefa eliminada</span>

          <button
            type="button"
            onClick={handleUndoDelete}
            className="font-semibold text-gray-300 underline transition hover:text-white"
          >
            Desfazer
          </button>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedTaskId(null)
          }
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-2xl"
          >

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-6">

              <input
                value={titleDraft}
                onChange={(event) =>
                  setTitleDraft(event.target.value)
                }
                onBlur={commitTitle}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.blur();
                  }
                }}
                className="flex-1 rounded-lg border border-transparent px-1 text-xl font-bold text-gray-900 outline-none transition hover:border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />

              <div className="flex flex-shrink-0 items-center gap-1">

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteTask(
                      selectedTask.id
                    )
                  }
                  aria-label="Eliminar tarefa"
                  title="Eliminar tarefa"
                  className={`${ICON_BTN} text-gray-400 hover:bg-red-50 hover:text-red-500`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTaskId(null)
                  }
                  aria-label="Fechar"
                  className={`${ICON_BTN} text-gray-400 hover:bg-gray-100 hover:text-gray-600`}
                >
                  <X className="h-4 w-4" />
                </button>

              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-6 p-6">

              {/* Status / Due Date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Estado
                  </p>

                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    {
                      columns.find(
                        (column) =>
                          column.id ===
                          selectedTask.columnId
                      )?.title
                    }
                  </span>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Data de entrega
                  </p>

                  <input
                    type="date"
                    value={
                      selectedTask.dueDate ?? ''
                    }
                    onChange={(event) => {
                      updateTaskLocal(
                        selectedTask.id,
                        {
                          dueDate:
                            event.target.value ||
                            undefined,
                        }
                      );

                      updateTaskInDatabase(
                        selectedTask.id,
                        {
                          ...selectedTask,
                          dueDate:
                            event.target.value ||
                            undefined,
                        }
                      );
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>

              </div>

              {/* Labels */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tags
                </p>

                <div className="flex flex-wrap gap-2">
                  {LABELS.map((label) => {
                    const active =
                      (
                        selectedTask.labels ??
                        []
                      ).includes(label.name);

                    return (
                      <button
                        type="button"
                        key={label.name}
                        onClick={() =>
                          toggleLabel(
                            label.name
                          )
                        }
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
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Descrição
                </p>

                <textarea
                  value={
                    selectedTask.description ??
                    ''
                  }
                  onChange={(event) => {
                    updateTaskLocal(
                      selectedTask.id,
                      {
                        description:
                          event.target.value,
                      }
                    );
                  }}
                  onBlur={() => {
                    updateTaskInDatabase(
                      selectedTask.id,
                      selectedTask
                    );
                  }}
                  rows={4}
                  placeholder="Adicione uma descrição..."
                  className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Members */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Membros
                </p>

                <div className="flex flex-wrap gap-2">
                  {(selectedTask.members ?? [])
                    .length === 0 ? (
                    <span className="text-sm text-gray-400">
                      Sem membros
                    </span>
                  ) : (
                    (
                      selectedTask.members ??
                      []
                    ).map((member) => (
                      <span
                        key={member}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white ${avatarColor(
                          member
                        )}`}
                      >
                        {member}

                        <button
                          type="button"
                          onClick={() =>
                            removeMember(
                              member
                            )
                          }
                          aria-label={`Remover ${member}`}
                          className="text-white/70 transition hover:text-white"
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
                    onChange={(event) =>
                      setMemberInput(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        addMember();
                      }
                    }}
                    placeholder="Nome do membro..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />

                  <button
                    type="button"
                    onClick={addMember}
                    className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTaskId(null)
                  }
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