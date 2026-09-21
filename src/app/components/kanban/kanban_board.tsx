"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  GripVertical,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
  Search,
  Plus,
  AlertCircle,
} from "lucide-react";

import type {
  Task,
  TaskColumn,
  TaskBoard,
  TaskPriority,
} from "@/services/project_tasks";

import {
  createTask,
  createTaskColumn,
  updateTask,
  deleteTask,
  deleteTaskColumn,
  moveTask,
  renameTaskColumn,
  reorderTaskColumns,
  reorderTasks,
} from "@/services/project_tasks";

const UNASSIGNED_COLUMN_ID = "__unassigned__";

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-pink-500",
];

const PRIORITIES: TaskPriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const PRIORITY_CLASSES: Record<
  TaskPriority,
  string
> = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-gray-100 text-gray-700",
  High: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

const ICON_BTN =
  "rounded-lg p-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1";

type KanbanBoardProps = {
  projectId?: string | null;
  initialBoard: TaskBoard;
};

function avatarColor(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash =
      value.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return AVATAR_COLORS[
    Math.abs(hash) % AVATAR_COLORS.length
  ];
}

function initials(value: string) {
  const result = value
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return result || "?";
}

function isOverdue(dueDate?: string | null) {
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(
    `${dueDate}T00:00:00`,
  );

  return date < today;
}

function formatDueDate(dueDate: string) {
  return new Date(
    `${dueDate}T00:00:00`,
  ).toLocaleDateString("pt-AO", {
    month: "short",
    day: "numeric",
  });
}

function isUnassignedColumn(
  columnId: string | null,
) {
  return columnId === UNASSIGNED_COLUMN_ID;
}

export default function KanbanBoard({
  projectId = null,
  initialBoard,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(
    initialBoard.tasks,
  );

  const [columns, setColumns] = useState<TaskColumn[]>(
    initialBoard.columns.filter(
      (column) =>
        column.id !== UNASSIGNED_COLUMN_ID,
    ),
  );

  const [error, setError] =
    useState<string | null>(null);

  const [selectedTaskId, setSelectedTaskId] =
    useState<string | null>(null);

  const [taskInputs, setTaskInputs] =
    useState<Record<string, string>>({});

  const [titleDraft, setTitleDraft] =
    useState("");

  const [listInput, setListInput] =
    useState("");

  const [isAddingList, setIsAddingList] =
    useState(false);

  const [editingColumnId, setEditingColumnId] =
    useState<string | null>(null);

  const [columnTitleInput, setColumnTitleInput] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [draggedTaskId, setDraggedTaskId] =
    useState<string | null>(null);

  const [draggedColumnId, setDraggedColumnId] =
    useState<string | null>(null);

  const [dragOverColumnId, setDragOverColumnId] =
    useState<string | null>(null);

  const selectedTask =
    tasks.find(
      (task) =>
        task.id === selectedTaskId,
    ) ?? null;

  /*
   * Synchronise with the server-provided board.
   */
  useEffect(() => {
    setTasks(initialBoard.tasks);

    setColumns(
      initialBoard.columns.filter(
        (column) =>
          column.id !==
          UNASSIGNED_COLUMN_ID,
      ),
    );
  }, [initialBoard]);

  /*
   * Keyboard
   */
  useEffect(() => {
    if (!selectedTaskId) return;

    const handler = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setSelectedTaskId(null);
      }
    };

    window.addEventListener(
      "keydown",
      handler,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handler,
      );
    };
  }, [selectedTaskId]);

  /*
   * Selected task title
   */
  useEffect(() => {
    setTitleDraft(
      selectedTask?.title ?? "",
    );
  }, [
    selectedTaskId,
    selectedTask?.title,
  ]);

  /*
   * Helpers
   */
  const updateTaskLocal = (
    taskId: string,
    updates: Partial<Task>,
  ) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
            }
          : task,
      ),
    );
  };

  const getColumn = (
    columnId: string | null | undefined,
  ) => {
    if (!columnId) return null;

    return (
      columns.find(
        (column) =>
          column.id === columnId,
      ) ?? null
    );
  };

  const getRealColumnId = (
    columnId: string,
  ): string | null => {
    return isUnassignedColumn(columnId)
      ? null
      : columnId;
  };

  const getDisplayColumnId = (
    columnId: string | null,
  ): string => {
    return columnId ?? UNASSIGNED_COLUMN_ID;
  };

  /*
   * Check if user can manage columns
   * - Project owners can manage project columns
   * - Any user can manage general columns (projectId = null)
   */
  const canManageColumns = (
    column: TaskColumn | null,
  ): boolean => {
    if (!column) return false;

    if (projectId) {
      return column.projectId === projectId;
    }
    // In general board, can only manage general columns
    return column.projectId === null;
  };

  /*
   * Search
   */
  const matchesSearch = (
    task: Task,
  ) => {
    if (!searchQuery.trim()) {
      return true;
    }

    const query =
      searchQuery
        .toLowerCase()
        .trim();

    return (
      task.title
        .toLowerCase()
        .includes(query) ||
      task.description
        .toLowerCase()
        .includes(query) ||
      task.priority
        .toLowerCase()
        .includes(query)
    );
  };

  const filteredTasks = useMemo(
    () =>
      tasks.filter(matchesSearch),
    [tasks, searchQuery],
  );

  const totalMatches =
    filteredTasks.length;

  const isSearching =
    searchQuery.trim().length > 0;

  const unassignedTasks =
    filteredTasks.filter(
      (task) =>
        task.columnId === null,
    );

  /*
   * Columns
   */
  const handleAddColumn = async () => {
    const title =
      listInput.trim();

    if (!title) return;

    try {
      setError(null);

      const newColumn =
        await createTaskColumn(
          projectId ?? "",
          title,
          columns.length,
        );

      setColumns((previous) => [
        ...previous,
        newColumn,
      ]);

      setListInput("");
      setIsAddingList(false);
    } catch (err) {
      console.error(
        "Failed to create column:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a lista.",
      );
    }
  };

  const handleDeleteColumn = async (
    columnId: string,
  ) => {
    const column =
      getColumn(columnId);

    if (!column) return;

    // Check if user can delete this column
    if (!canManageColumns(column)) {
      setError(
        "Não tem permissão para eliminar esta lista.",
      );
      return;
    }

    const hasTasks = tasks.some(
      (task) =>
        task.columnId === columnId,
    );

    if (hasTasks) {
      const confirmed =
        window.confirm(
          "Esta lista contém tarefas. A lista será eliminada, mas as tarefas não serão eliminadas. As tarefas ficarão sem lista. Continuar?",
        );

      if (!confirmed) return;
    }

    try {
      setError(null);

      await deleteTaskColumn(
        columnId,
      );

      setColumns((previous) =>
        previous.filter(
          (item) =>
            item.id !== columnId,
        ),
      );

      setTasks((previous) =>
        previous.map((task) =>
          task.columnId === columnId
            ? {
                ...task,
                columnId: null,
              }
            : task,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete column:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível eliminar a lista.",
      );
    }
  };

  const startEditingColumn = (
    column: TaskColumn,
  ) => {
    if (!canManageColumns(column)) return;

    setEditingColumnId(column.id);
    setColumnTitleInput(
      column.title,
    );
  };

  const commitColumnTitle = async () => {
    if (!editingColumnId) return;

    const title =
      columnTitleInput.trim();

    if (!title) {
      setEditingColumnId(null);
      return;
    }

    const oldColumn =
      columns.find(
        (column) =>
          column.id ===
          editingColumnId,
      );

    if (
      !oldColumn ||
      oldColumn.title === title
    ) {
      setEditingColumnId(null);
      return;
    }

    if (!canManageColumns(oldColumn)) {
      setEditingColumnId(null);
      setError(
        "Não tem permissão para renomear esta lista.",
      );
      return;
    }

    try {
      setError(null);

      const updatedColumn =
        await renameTaskColumn(
          editingColumnId,
          title,
        );

      setColumns((previous) =>
        previous.map((column) =>
          column.id ===
          editingColumnId
            ? updatedColumn
            : column,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to rename column:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível renomear a lista.",
      );
    } finally {
      setEditingColumnId(null);
    }
  };

  const handleColumnDragStart = (
    event: React.DragEvent,
    columnId: string,
  ) => {
    const column = getColumn(columnId);
    if (!canManageColumns(column)) return;

    setDraggedColumnId(
      columnId,
    );

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      `col:${columnId}`,
    );
  };

  const handleColumnDropArea = async (
    event: React.DragEvent,
    targetColumnId: string,
  ) => {
    event.preventDefault();

    setDragOverColumnId(null);

    const raw =
      event.dataTransfer.getData(
        "text/plain",
      );

    /*
     * Column reorder
     */
    if (raw.startsWith("col:")) {
      const sourceColumnId =
        raw.slice(4);

      if (
        sourceColumnId ===
        targetColumnId
      ) {
        return;
      }

      const sourceColumn =
        getColumn(sourceColumnId);

      const targetColumn =
        getColumn(targetColumnId);

      if (
        !sourceColumn ||
        !targetColumn
      ) {
        return;
      }

      // Check if both columns can be reordered by this user
      if (!canManageColumns(sourceColumn) || !canManageColumns(targetColumn)) {
        return;
      }

      const next = [...columns];

      const from =
        next.findIndex(
          (column) =>
            column.id ===
            sourceColumnId,
        );

      const to =
        next.findIndex(
          (column) =>
            column.id ===
            targetColumnId,
        );

      if (
        from === -1 ||
        to === -1
      ) {
        return;
      }

      const [moved] =
        next.splice(from, 1);

      if (!moved) return;

      next.splice(to, 0, moved);

      const reordered =
        next.map(
          (column, index) => ({
            ...column,
            position: index,
          }),
        );

      setColumns(reordered);

      try {
        await reorderTaskColumns(
          projectId ?? "",
          reordered.map(
            (column) =>
              column.id,
          ),
        );
      } catch (err) {
        console.error(
          "Failed to reorder columns:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível reordenar as listas.",
        );
      }

      setDraggedColumnId(null);
      return;
    }

    /*
     * Task dropped on empty column area.
     */
    const taskId =
      raw.startsWith("task:")
        ? raw.slice(5)
        : draggedTaskId;

    if (!taskId) return;

    const task =
      tasks.find(
        (item) =>
          item.id === taskId,
      );

    if (!task) return;

    await handleTaskMove(
      task,
      targetColumnId,
    );

    setDraggedTaskId(null);
  };

  /*
   * Tasks
   */
  const handleTaskDragStart = (
    event: React.DragEvent,
    taskId: string,
  ) => {
    setDraggedTaskId(taskId);

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      `task:${taskId}`,
    );
  };

  const handleTaskDrop = async (
    event: React.DragEvent,
    targetTaskId: string,
    targetColumnId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const taskId =
      draggedTaskId;

    if (
      !taskId ||
      taskId === targetTaskId
    ) {
      return;
    }

    const sourceTask =
      tasks.find(
        (task) =>
          task.id === taskId,
      );

    if (!sourceTask) return;

    await handleTaskMove(
      sourceTask,
      targetColumnId,
      targetTaskId,
    );

    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleTaskMove = async (
    task: Task,
    targetColumnId: string,
    targetTaskId?: string,
  ) => {
    const targetIsUnassigned =
      isUnassignedColumn(
        targetColumnId,
      );

    const targetColumn =
      targetIsUnassigned
        ? null
        : getColumn(
            targetColumnId,
          );

    /*
     * General task (no projectId):
     * can be moved to general columns only
     */
    if (!task.projectId) {
      if (!targetIsUnassigned && targetColumn?.projectId) {
        setError(
          "Uma tarefa geral não pode ser colocada numa lista de projecto.",
        );

        return;
      }
    }

    /*
     * Project task:
     * - if in project board: can move within project columns only
     * - if in general board: cannot move to general columns
     */
    if (task.projectId) {
      if (projectId) {
        // In project board: must stay in project
        if (!targetColumn || targetColumn.projectId !== projectId) {
          setError(
            "Uma tarefa de projecto não pode ser movida para fora do projecto.",
          );
          return;
        }
      } else {
        // In general board: cannot move project tasks
        setError(
          "Uma tarefa de projecto não pode ser colocada em Sem lista.",
        );
        return;
      }
    }

    const sourceColumnId =
      task.columnId;

    const targetRealColumnId =
      getRealColumnId(
        targetColumnId,
      );

    /*
     * Do nothing if there is no actual change.
     */
    if (
      sourceColumnId ===
        targetRealColumnId &&
      !targetTaskId
    ) {
      return;
    }

    const previousTasks =
      tasks;

    const sourceTasks =
      tasks
        .filter(
          (item) =>
            item.columnId ===
            sourceColumnId,
        )
        .sort(
          (a, b) =>
            a.position -
            b.position,
        );

    const targetTasks =
      tasks
        .filter(
          (item) =>
            item.columnId ===
            targetRealColumnId,
        )
        .sort(
          (a, b) =>
            a.position -
            b.position,
        );

    const sourceWithoutTask =
      sourceTasks.filter(
        (item) =>
          item.id !== task.id,
      );

    let nextTargetTasks =
      sourceColumnId ===
      targetRealColumnId
        ? sourceWithoutTask
        : [...targetTasks];

    const movedTask: Task = {
      ...task,
      columnId:
        targetRealColumnId,
    };

    let insertionIndex =
      nextTargetTasks.length;

    if (targetTaskId) {
      const targetIndex =
        nextTargetTasks.findIndex(
          (item) =>
            item.id ===
            targetTaskId,
        );

      if (targetIndex >= 0) {
        insertionIndex =
          targetIndex;
      }
    }

    nextTargetTasks.splice(
      insertionIndex,
      0,
      movedTask,
    );

    const affectedColumnIds =
      new Set<string | null>([
        sourceColumnId,
        targetRealColumnId,
      ]);

    let nextTasks =
      tasks.filter(
        (item) =>
          !affectedColumnIds.has(
            item.columnId,
          ),
      );

    const sourceReordered =
      sourceWithoutTask.map(
        (item, index) => ({
          ...item,
          position: index,
        }),
      );

    const targetReordered =
      nextTargetTasks.map(
        (item, index) => ({
          ...item,
          position: index,
        }),
      );

    if (
      sourceColumnId ===
      targetRealColumnId
    ) {
      nextTasks.push(
        ...targetReordered,
      );
    } else {
      nextTasks.push(
        ...sourceReordered,
      );
      nextTasks.push(
        ...targetReordered,
      );
    }

    /*
     * Keep global ordering predictable.
     */
    nextTasks.sort(
      (a, b) =>
        a.createdAt.localeCompare(
          b.createdAt,
        ),
    );

    setTasks(nextTasks);

    try {
      setError(null);

      /*
       * First move the task to the target column
       */
      await moveTask(
        task.id,
        targetRealColumnId,
        movedTask.position,
      );

      /*
       * Persist source column order.
       */
      if (
        sourceColumnId !==
        targetRealColumnId
      ) {
        await reorderTasks(
          task.projectId,
          sourceColumnId,
          sourceReordered.map(
            (item) =>
              item.id,
          ),
        );
      }

      /*
       * Persist target column order.
       */
      await reorderTasks(
        task.projectId,
        targetRealColumnId,
        targetReordered.map(
          (item) =>
            item.id,
          ),
        );
    } catch (err) {
      console.error(
        "Failed to move task:",
        err,
      );

      setTasks(previousTasks);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível mover a tarefa.",
      );
    }
  };

  /*
   * Add task
   */
  const handleAddTask = async (
    columnId: string,
  ) => {
    const value = (
      taskInputs[columnId] ?? ""
    ).trim();

    if (!value) return;

    const isGeneral =
      isUnassignedColumn(
        columnId,
      );

    const column =
      isGeneral
        ? null
        : getColumn(columnId);

    /*
     * General task (no projectId).
     */
    if (isGeneral) {
      try {
        setError(null);

        const newTask =
          await createTask({
            projectId: null,
            columnId: null,
            title: value,
            priority: "Medium",
          });

        setTasks((previous) => [
          ...previous,
          newTask,
        ]);

        setTaskInputs((previous) => ({
          ...previous,
          [columnId]: "",
        }));
      } catch (err) {
        console.error(
          "Failed to create general task:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível criar a tarefa.",
        );
      }

      return;
    }

    /*
     * Column task (general or project).
     */
    if (!column) return;

    try {
      setError(null);

      const columnTasks =
        tasks.filter(
          (task) =>
            task.columnId ===
            columnId,
        );

      const newTask =
        await createTask({
          projectId: column.projectId,
          title: value,
          columnId,
          priority: "Medium",
          position:
            columnTasks.length,
        });

      setTasks((previous) => [
        ...previous,
        newTask,
      ]);

      setTaskInputs((previous) => ({
        ...previous,
        [columnId]: "",
      }));
    } catch (err) {
      console.error(
        "Failed to create task:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a tarefa.",
      );
    }
  };

  /*
   * Delete task
   */
  const handleDeleteTask = async (
    taskId: string,
  ) => {
    const task =
      tasks.find(
        (item) =>
          item.id === taskId,
      );

    if (!task) return;

    const confirmed =
      window.confirm(
        "Tem a certeza de que pretende eliminar esta tarefa?",
      );

    if (!confirmed) return;

    const previousTasks =
      tasks;

    setTasks((previous) =>
      previous.filter(
        (item) =>
          item.id !== taskId,
      ),
    );

    if (
      selectedTaskId === taskId
    ) {
      setSelectedTaskId(null);
    }

    try {
      setError(null);

      await deleteTask(taskId);
    } catch (err) {
      console.error(
        "Failed to delete task:",
        err,
      );

      setTasks(previousTasks);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível eliminar a tarefa.",
      );
    }
  };

  /*
   * Task modal
   */
  const commitTitle = async () => {
    if (!selectedTask) return;

    const title =
      titleDraft.trim();

    if (
      !title ||
      title === selectedTask.title
    ) {
      setTitleDraft(
        selectedTask.title,
      );

      return;
    }

    try {
      setError(null);

      const updated =
        await updateTask(
          selectedTask.id,
          {
            title,
          },
        );

      updateTaskLocal(
        selectedTask.id,
        updated,
      );
    } catch (err) {
      console.error(
        "Failed to update task title:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar a tarefa.",
      );

      setTitleDraft(
        selectedTask.title,
      );
    }
  };

  const updatePriority = async (
    priority: TaskPriority,
  ) => {
    if (!selectedTask) return;

    const previous =
      selectedTask.priority;

    updateTaskLocal(
      selectedTask.id,
      {
        priority,
      },
    );

    try {
      setError(null);

      const updated =
        await updateTask(
          selectedTask.id,
          {
            priority,
          },
        );

      updateTaskLocal(
        selectedTask.id,
        updated,
      );
    } catch (err) {
      updateTaskLocal(
        selectedTask.id,
        {
          priority: previous,
        },
      );

      console.error(
        "Failed to update priority:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar a prioridade.",
      );
    }
  };

  const updateDueDate = async (
    dueDate: string,
  ) => {
    if (!selectedTask) return;

    const value =
      dueDate || null;

    const previous =
      selectedTask.dueDate;

    updateTaskLocal(
      selectedTask.id,
      {
        dueDate: value,
      },
    );

    try {
      setError(null);

      const updated =
        await updateTask(
          selectedTask.id,
          {
            dueDate: value,
          },
        );

      updateTaskLocal(
        selectedTask.id,
        updated,
      );
    } catch (err) {
      updateTaskLocal(
        selectedTask.id,
        {
          dueDate: previous,
        },
      );

      console.error(
        "Failed to update due date:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar a data de entrega.",
      );
    }
  };

  const updateDescription = async () => {
    if (!selectedTask) return;

    try {
      setError(null);

      const updated =
        await updateTask(
          selectedTask.id,
          {
            description:
              selectedTask.description,
          },
        );

      updateTaskLocal(
        selectedTask.id,
        updated,
      );
    } catch (err) {
      console.error(
        "Failed to update description:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível guardar a descrição.",
      );
    }
  };

  /*
   * Empty search result
   */
  if (
    isSearching &&
    totalMatches === 0
  ) {
    return (
      <>
        <div className="min-h-screen">
          <div className="mx-auto max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {error && (
              <ErrorBanner
                error={error}
                onClose={() =>
                  setError(null)
                }
              />
            )}

            <div className="mb-8 border-b border-gray-200 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                    Tarefas
                  </h1>

                  <p className="mt-1 text-sm text-gray-600">
                    {projectId
                      ? "Organize as tarefas deste projecto."
                      : "Consulte todas as tarefas, incluindo tarefas de projecto e tarefas gerais."}
                  </p>
                </div>

                <SearchBox
                  value={searchQuery}
                  onChange={
                    setSearchQuery
                  }
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-16 text-center">
              <Search className="mb-4 h-10 w-10 text-gray-300" />

              <p className="text-sm font-medium text-gray-900">
                Nenhuma tarefa encontrada
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Nenhuma tarefa corresponde a "
                {searchQuery}"
              </p>

              <button
                type="button"
                onClick={() =>
                  setSearchQuery("")
                }
                className="mt-4 text-sm font-medium text-gray-600 underline transition hover:text-gray-900"
              >
                Limpar pesquisa
              </button>
            </div>
          </div>
        </div>

        {selectedTask && null}
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="mx-auto max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {error && (
            <ErrorBanner
              error={error}
              onClose={() =>
                setError(null)
              }
            />
          )}

          <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  Tarefas
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  {projectId
                    ? "Organize as tarefas deste projecto."
                    : "Consulte todas as tarefas, incluindo tarefas de projecto e tarefas gerais."}
                </p>
              </div>

              <SearchBox
                value={searchQuery}
                onChange={
                  setSearchQuery
                }
              />
            </div>
          </div>

          <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0">
            {/* ---------------------------------------------------------------- */}
            {/* GENERAL/UNASSIGNED COLUMN                                        */}
            {/* ---------------------------------------------------------------- */}

            {!projectId && (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverColumnId(
                    UNASSIGNED_COLUMN_ID,
                  );
                }}
                onDragLeave={() =>
                  setDragOverColumnId(
                    (previous) =>
                      previous ===
                      UNASSIGNED_COLUMN_ID
                        ? null
                        : previous,
                  )
                }
                onDrop={(event) =>
                  handleColumnDropArea(
                    event,
                    UNASSIGNED_COLUMN_ID,
                  )
                }
                className={`flex min-h-[600px] w-80 shrink-0 flex-col rounded-lg border bg-white shadow-sm transition ${
                  dragOverColumnId ===
                  UNASSIGNED_COLUMN_ID
                    ? "border-gray-400 ring-2 ring-gray-200"
                    : "border-gray-200"
                }`}
              >
                <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-gray-900">
                        Sem lista
                      </h2>
                    </div>

                    <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      {unassignedTasks.length}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-gray-400">
                    Tarefas gerais da equipa
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto overflow-x-visible px-4 py-4 sm:px-5">
                  {unassignedTasks.length ===
                  0 ? (
                    <p className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                      Sem tarefas gerais
                    </p>
                  ) : (
                    unassignedTasks.map(
                      (task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onSelect={() =>
                            setSelectedTaskId(
                              task.id,
                            )
                          }
                          onDelete={() =>
                            handleDeleteTask(
                              task.id,
                            )
                          }
                          draggable
                          onDragStart={(
                            event,
                          ) =>
                            handleTaskDragStart(
                              event,
                              task.id,
                            )
                          }
                          onDragOver={(
                            event,
                          ) =>
                            event.preventDefault()
                          }
                          onDrop={(event) =>
                            handleTaskDrop(
                              event,
                              task.id,
                              UNASSIGNED_COLUMN_ID,
                            )
                          }
                        />
                      ),
                    )
                  )}
                </div>

                <div className="space-y-3 border-t border-gray-200 px-4 py-4 sm:px-5">
                  <input
                    type="text"
                    value={
                      taskInputs[
                        UNASSIGNED_COLUMN_ID
                      ] ?? ""
                    }
                    onChange={(
                      event,
                    ) =>
                      setTaskInputs(
                        (previous) => ({
                          ...previous,
                          [UNASSIGNED_COLUMN_ID]:
                            event.target
                              .value,
                        }),
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleAddTask(
                          UNASSIGNED_COLUMN_ID,
                        );
                      }
                    }}
                    placeholder="Nova tarefa geral..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleAddTask(
                        UNASSIGNED_COLUMN_ID,
                      )
                    }
                    className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                  >
                    Adicionar tarefa
                  </button>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* COLUMNS (General or Project)                                     */}
            {/* ---------------------------------------------------------------- */}

            {columns.map((column) => {
              const columnTasks =
                filteredTasks
                  .filter(
                    (task) =>
                      task.columnId ===
                      column.id,
                  )
                  .sort(
                    (a, b) =>
                      a.position -
                      b.position,
                  );

              return (
                <div
                  key={column.id}
                  onDragOver={(event) => {
                    event.preventDefault();

                    setDragOverColumnId(
                      column.id,
                    );
                  }}
                  onDragLeave={() =>
                    setDragOverColumnId(
                      (previous) =>
                        previous ===
                        column.id
                          ? null
                          : previous,
                    )
                  }
                  onDrop={(event) =>
                    handleColumnDropArea(
                      event,
                      column.id,
                    )
                  }
                  className={`flex min-h-[600px] w-80 shrink-0 flex-col rounded-lg border bg-white shadow-sm transition ${
                    dragOverColumnId ===
                    column.id
                      ? "border-gray-400 ring-2 ring-gray-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span
                          draggable={
                            canManageColumns(column)
                          }
                          onDragStart={(
                            event,
                          ) =>
                            handleColumnDragStart(
                              event,
                              column.id,
                            )
                          }
                          className={`select-none text-gray-300 transition ${
                            canManageColumns(column)
                              ? "cursor-grab hover:text-gray-500 active:cursor-grabbing"
                              : "cursor-default"
                          }`}
                          title={
                            canManageColumns(column)
                              ? "Arraste para reordenar"
                              : undefined
                          }
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>

                        {editingColumnId ===
                        column.id ? (
                          <input
                            autoFocus
                            value={
                              columnTitleInput
                            }
                            onChange={(
                              event,
                            ) =>
                              setColumnTitleInput(
                                event
                                  .target
                                  .value,
                              )
                            }
                            onBlur={
                              commitColumnTitle
                            }
                            onKeyDown={(
                              event,
                            ) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                event.currentTarget.blur();
                              }

                              if (
                                event.key ===
                                "Escape"
                              ) {
                                setEditingColumnId(
                                  null,
                                );
                              }
                            }}
                            className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                          />
                        ) : (
                          <h2
                            onClick={() =>
                              canManageColumns(column) &&
                              startEditingColumn(
                                column,
                              )
                            }
                            className={`truncate text-sm font-semibold text-gray-900 transition ${
                              canManageColumns(column)
                                ? "cursor-text hover:text-gray-600"
                                : "cursor-default"
                            }`}
                            title={
                              canManageColumns(column)
                                ? "Clique para renomear"
                                : undefined
                            }
                          >
                            {column.title}
                          </h2>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                          {
                            columnTasks.length
                          }
                        </span>

                        {canManageColumns(column) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteColumn(
                                column.id,
                              )
                            }
                            aria-label="Eliminar lista"
                            title="Eliminar lista"
                            className={`${ICON_BTN} text-gray-400 hover:bg-red-50 hover:text-red-500`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {projectId && !column.projectId && (
                      <p className="mt-2 truncate text-[11px] text-gray-400">
                        Lista geral
                      </p>
                    )}

                    {!projectId && column.projectId && (
                      <p className="mt-2 truncate text-[11px] text-gray-400">
                        Lista de projecto
                      </p>
                    )}
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto overflow-x-visible px-4 py-4 sm:px-5">
                    {columnTasks.length ===
                      0 && (
                      <p className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                        Sem tarefas
                      </p>
                    )}

                    {columnTasks.map(
                      (task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onSelect={() =>
                            setSelectedTaskId(
                              task.id,
                            )
                          }
                          onDelete={() =>
                            handleDeleteTask(
                              task.id,
                            )
                          }
                          draggable
                          onDragStart={(
                            event,
                          ) =>
                            handleTaskDragStart(
                              event,
                              task.id,
                            )
                          }
                          onDragOver={(
                            event,
                          ) =>
                            event.preventDefault()
                          }
                          onDrop={(event) =>
                            handleTaskDrop(
                              event,
                              task.id,
                              column.id,
                            )
                          }
                        />
                      ),
                    )}
                  </div>

                  {canManageColumns(column) && (
                    <div className="space-y-3 border-t border-gray-200 px-4 py-4 sm:px-5">
                      <input
                        type="text"
                        value={
                          taskInputs[
                            column.id
                          ] ?? ""
                        }
                        onChange={(
                          event,
                        ) =>
                          setTaskInputs(
                            (
                              previous,
                            ) => ({
                              ...previous,
                              [column.id]:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        onKeyDown={(
                          event,
                        ) => {
                          if (
                            event.key ===
                            "Enter"
                          ) {
                            handleAddTask(
                              column.id,
                            );
                          }
                        }}
                        placeholder="Nova tarefa..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleAddTask(
                            column.id,
                          )
                        }
                        className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                      >
                        Adicionar tarefa
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ---------------------------------------------------------------- */}
            {/* NEW COLUMN BUTTON                                               */}
            {/* ---------------------------------------------------------------- */}

            <div className="w-80 shrink-0">
              {isAddingList ? (
                <div className="flex h-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <input
                    autoFocus
                    type="text"
                    value={listInput}
                    onChange={(event) =>
                      setListInput(
                        event.target
                          .value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        handleAddColumn();
                      }

                      if (
                        event.key ===
                        "Escape"
                      ) {
                        setIsAddingList(
                          false,
                        );
                        setListInput("");
                      }
                    }}
                    placeholder="Nome da lista..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={
                        handleAddColumn
                      }
                      className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      Adicionar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingList(
                          false,
                        );
                        setListInput("");
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
                    setIsAddingList(
                      true,
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm font-semibold text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Plus className="h-5 w-5" />
                  Nova lista
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* TASK MODAL                                                            */}
      {/* -------------------------------------------------------------------- */}

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
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-6">
              <input
                value={titleDraft}
                onChange={(event) =>
                  setTitleDraft(
                    event.target.value,
                  )
                }
                onBlur={commitTitle}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    event.currentTarget.blur();
                  }
                }}
                className="flex-1 rounded-lg border border-transparent px-1 text-xl font-bold text-gray-900 outline-none transition hover:border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              />

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteTask(
                      selectedTask.id,
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
                    setSelectedTaskId(
                      null,
                    )
                  }
                  aria-label="Fechar"
                  className={`${ICON_BTN} text-gray-400 hover:bg-gray-100 hover:text-gray-600`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Estado
                  </p>

                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    {selectedTask.columnId
                      ? getColumn(
                          selectedTask.columnId,
                        )?.title ??
                        "Sem lista"
                      : "Sem lista"}
                  </span>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Data de entrega
                  </p>

                  <input
                    type="date"
                    value={
                      selectedTask.dueDate ??
                      ""
                    }
                    onChange={(event) =>
                      updateDueDate(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Prioridade
                </p>

                <select
                  value={
                    selectedTask.priority
                  }
                  onChange={(event) =>
                    updatePriority(
                      event.target
                        .value as TaskPriority,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                >
                  {PRIORITIES.map(
                    (priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </option>
                    ),
                  )}
                </select>

                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    PRIORITY_CLASSES[
                      selectedTask.priority
                    ]
                  }`}
                >
                  {
                    selectedTask.priority
                  }
                </span>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Descrição
                </p>

                <textarea
                  value={
                    selectedTask.description
                  }
                  onChange={(event) => {
                    updateTaskLocal(
                      selectedTask.id,
                      {
                        description:
                          event.target
                            .value,
                      },
                    );
                  }}
                  onBlur={
                    updateDescription
                  }
                  rows={4}
                  placeholder="Adicione uma descrição..."
                  className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Responsável
                </p>

                {selectedTask.assignedTo ? (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(
                        selectedTask.assignedTo,
                      )}`}
                    >
                      {initials(
                        selectedTask.assignedTo,
                      )}
                    </span>

                    <span className="truncate text-sm text-gray-700">
                      {
                        selectedTask.assignedTo
                      }
                    </span>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-gray-200 px-3 py-3 text-sm text-gray-400">
                    Sem responsável atribuído.
                  </p>
                )}

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  A tarefa suporta actualmente um único responsável através de{" "}
                  <code className="mx-1 rounded bg-gray-100 px-1">
                    assigned_to
                  </code>
                  .
                </p>
              </div>

              <div className="flex justify-end border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTaskId(
                      null,
                    )
                  }
                  className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
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

/* -------------------------------------------------------------------------- */
/* Search box                                                                 */
/* -------------------------------------------------------------------------- */

type SearchBoxProps = {
  value: string;
  onChange: (
    value: string,
  ) => void;
};

function SearchBox({
  value,
  onChange,
}: SearchBoxProps) {
  const isSearching =
    value.trim().length > 0;

  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        placeholder="Pesquisar tarefas..."
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
      />

      {isSearching && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar pesquisa"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Error banner                                                               */
/* -------------------------------------------------------------------------- */

type ErrorBannerProps = {
  error: string;
  onClose: () => void;
};

function ErrorBanner({
  error,
  onClose,
}: ErrorBannerProps) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />

      <div className="flex-1">
        <p className="text-sm font-medium text-red-900">
          {error}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-red-400 hover:text-red-600"
        aria-label="Fechar erro"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Task card                                                                  */
/* -------------------------------------------------------------------------- */

type TaskCardProps = {
  task: Task;
  onSelect: () => void;
  onDelete: () => void;
  draggable?: boolean;
  onDragStart?: (
    event: React.DragEvent,
  ) => void;
  onDragOver?: (
    event: React.DragEvent,
  ) => void;
  onDrop?: (
    event: React.DragEvent,
  ) => void;
};

function TaskCard({
  task,
  onSelect,
  onDelete,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}: TaskCardProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
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
            onDelete();
          }}
          aria-label="Eliminar tarefa"
          title="Eliminar tarefa"
          className={`${ICON_BTN} shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
          {task.description}
        </p>
      )}

      <div className="mt-2.5">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
            PRIORITY_CLASSES[
              task.priority
            ]
          }`}
        >
          {task.priority}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {task.dueDate ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              isOverdue(
                task.dueDate,
              )
                ? "text-red-600"
                : "text-gray-400"
            }`}
          >
            {isOverdue(
              task.dueDate,
            ) ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Calendar className="h-3 w-3" />
            )}

            {formatDueDate(
              task.dueDate,
            )}
          </span>
        ) : (
          <span />
        )}

        {task.assignedTo && (
          <span
            title={`Responsável: ${task.assignedTo}`}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${avatarColor(
              task.assignedTo,
            )}`}
          >
            {initials(
              task.assignedTo,
            )}
          </span>
        )}
      </div>
    </div>
  );
}