
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import type {
  KanbanBoardData,
  Task,
  TaskScope,
  UpdateTaskInput,
} from "../types";

import { taskMatchesSearch } from "../utils/search";
import { useTaskModal } from "./use_task_modal";

import {
  createTaskAction,
  deleteTaskAction,
  reorderTasksAction,
  updateTaskAction,
  submitTaskWorkAction,
  reviewTaskWorkAction,
} from "../actions/tasks";

import {
  createTaskColumnAction,
  deleteTaskColumnAction,
  reorderTaskColumnsAction,
  updateTaskColumnAction,
} from "../actions/task_columns";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Project deliverables must always have a valid Kanban column.
 *
 * If a deliverable has no column, or its column is not part
 * of the current project board, display it under "Por Fazer".
 *
 * This is a client-side fallback. The database should also
 * have the correct column_id assigned by saveDeliverable.
 */
function normalizeBoardTasks(
  tasks: Task[],
  columns: KanbanBoardData["columns"],
  scope: TaskScope,
): Task[] {
  if (scope.type !== "project") {
    return tasks;
  }

  const todoColumn = columns.find(
    (column) =>
      column.name.trim().toLowerCase() === "por fazer",
  );

  if (!todoColumn) {
    return tasks;
  }

  const validColumnIds = new Set(
    columns.map((column) => column.columnId),
  );

  return tasks.map((task) => {
    const isDeliverable = Boolean(task.phaseId);

    const hasInvalidColumn =
      !task.columnId ||
      !validColumnIds.has(task.columnId);

    if (isDeliverable && hasInvalidColumn) {
      return {
        ...task,
        columnId: todoColumn.columnId,
      };
    }

    return task;
  });
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useKanbanState({
  scope,
  initialBoard,
}: {
  scope: TaskScope;
  initialBoard: KanbanBoardData;
}) {
  const [columns, setColumns] = useState(
    () => initialBoard.columns,
  );

  const [tasks, setTasks] = useState(
    () =>
      normalizeBoardTasks(
        initialBoard.tasks,
        initialBoard.columns,
        scope,
      ),
  );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [deletedTask, setDeletedTask] =
    useState<{
      task: Task;
      index: number;
    } | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const modal = useTaskModal(tasks);

  /* ---------------------------------------------------------------------- */
  /* Async transition helper                                                */
  /* ---------------------------------------------------------------------- */

  /**
   * Keeps the returned Promise pending until the server action
   * finishes. This allows the parent component to catch errors
   * and display accurate success/error notifications.
   */
  function runInTransition<T>(
    action: () => Promise<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      startTransition(async () => {
        try {
          const result = await action();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Sync board when the server provides updated data                      */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setColumns(initialBoard.columns);

    setTasks(
      normalizeBoardTasks(
        initialBoard.tasks,
        initialBoard.columns,
        scope,
      ),
    );
  }, [
    initialBoard.columns,
    initialBoard.tasks,
    scope.type,
    scope.projectId,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Delete undo timeout                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!deletedTask) return;

    const timeout = window.setTimeout(() => {
      setDeletedTask(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [deletedTask]);

  /* ---------------------------------------------------------------------- */
  /* Search                                                                 */
  /* ---------------------------------------------------------------------- */

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) =>
        taskMatchesSearch(task, searchQuery),
      ),
    [tasks, searchQuery],
  );

  /* ---------------------------------------------------------------------- */
  /* Tasks by column                                                        */
  /* ---------------------------------------------------------------------- */

  const tasksByColumn = useMemo(() => {
    const result: Record<string, Task[]> = {};

    for (const column of columns) {
      result[column.columnId] = [];
    }

    for (const task of visibleTasks) {
      if (
        task.columnId &&
        result[task.columnId]
      ) {
        result[task.columnId].push(task);
      }
    }

    return result;
  }, [columns, visibleTasks]);

  /* ---------------------------------------------------------------------- */
  /* Add task                                                               */
  /* ---------------------------------------------------------------------- */

  async function addTask(
    columnId: string,
    title: string,
  ) {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) return;

    return runInTransition(async () => {
      const task = await createTaskAction(
        scope,
        {
          title: normalizedTitle,
          columnId,
        },
      );

      if (task) {
        setTasks((current) => [
          ...current,
          task,
        ]);
      }

      return task;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Update task                                                            */
  /* ---------------------------------------------------------------------- */

  async function updateTask(
    taskId: string,
    input: UpdateTaskInput,
  ) {
    return runInTransition(async () => {
      const updated = await updateTaskAction(
        taskId,
        input,
      );

      if (!updated) return;

      setTasks((current) =>
        current.map((task) =>
          task.taskId === taskId
            ? updated
            : task,
        ),
      );

      return updated;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Delete task                                                            */
  /* ---------------------------------------------------------------------- */

  async function deleteTask(taskId: string) {
    const index = tasks.findIndex(
      (task) => task.taskId === taskId,
    );

    if (index === -1) return;

    const task = tasks[index];

    setDeletedTask({
      task,
      index,
    });

    setTasks((current) =>
      current.filter(
        (item) => item.taskId !== taskId,
      ),
    );

    if (modal.selectedTaskId === taskId) {
      modal.closeTask();
    }

    return runInTransition(async () => {
      try {
        await deleteTaskAction(taskId);
      } catch (error) {
        setTasks((current) => {
          const next = [...current];

          next.splice(
            Math.min(index, next.length),
            0,
            task,
          );

          return next;
        });

        setDeletedTask(null);

        throw error;
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Move task                                                              */
  /* ---------------------------------------------------------------------- */

  async function moveTask(
    taskId: string,
    columnId: string,
    orderedTaskIds: string[],
  ) {
    const previous = tasks;

    setTasks((current) => {
      const moved = current.find(
        (task) => task.taskId === taskId,
      );

      if (!moved) return current;

      const updated = current.map((task) =>
        task.taskId === taskId
          ? {
              ...task,
              columnId,
            }
          : task,
      );

      return updated.sort((a, b) => {
        if (
          a.columnId !== columnId &&
          b.columnId !== columnId
        ) {
          return a.position - b.position;
        }

        const aIndex = orderedTaskIds.indexOf(
          a.taskId,
        );

        const bIndex = orderedTaskIds.indexOf(
          b.taskId,
        );

        return (
          (aIndex === -1 ? 999999 : aIndex) -
          (bIndex === -1 ? 999999 : bIndex)
        );
      });
    });

    return runInTransition(async () => {
      try {
        await reorderTasksAction({
          scope,
          columnId,
          orderedTaskIds,
        });
      } catch (error) {
        setTasks(previous);
        throw error;
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Add column                                                             */
  /* ---------------------------------------------------------------------- */

  async function addColumn(
    name: string,
    isCompleted = false,
  ) {
    const normalizedName = name.trim();

    if (!normalizedName) return;

    return runInTransition(async () => {
      const column = await createTaskColumnAction(
        scope,
        {
          name: normalizedName,
          isCompleted,
        },
      );

      if (column) {
        setColumns((current) => [
          ...current,
          column,
        ]);
      }

      return column;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Rename column                                                          */
  /* ---------------------------------------------------------------------- */

  async function renameColumn(
    columnId: string,
    name: string,
  ) {
    const normalizedName = name.trim();

    if (!normalizedName) return;

    return runInTransition(async () => {
      const updated = await updateTaskColumnAction(
        columnId,
        {
          name: normalizedName,
        },
      );

      if (!updated) return;

      setColumns((current) =>
        current.map((column) =>
          column.columnId === columnId
            ? updated
            : column,
        ),
      );

      return updated;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Delete column                                                          */
  /* ---------------------------------------------------------------------- */

  async function deleteColumn(columnId: string) {
    const previousColumns = columns;
    const previousTasks = tasks;

    setColumns((current) =>
      current.filter(
        (column) => column.columnId !== columnId,
      ),
    );

    setTasks((current) =>
      current.filter(
        (task) => task.columnId !== columnId,
      ),
    );

    return runInTransition(async () => {
      try {
        await deleteTaskColumnAction(columnId);
      } catch (error) {
        setColumns(previousColumns);
        setTasks(previousTasks);

        throw error;
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Reorder columns                                                        */
  /* ---------------------------------------------------------------------- */

  async function reorderColumns(
    orderedColumnIds: string[],
  ) {
    const previous = columns;

    const order = new Map(
      orderedColumnIds.map((id, index) => [
        id,
        index,
      ]),
    );

    setColumns((current) =>
      [...current].sort(
        (a, b) =>
          (order.get(a.columnId) ?? 999999) -
          (order.get(b.columnId) ?? 999999),
      ),
    );

    return runInTransition(async () => {
      try {
        await reorderTaskColumnsAction(
          scope,
          orderedColumnIds,
        );
      } catch (error) {
        setColumns(previous);
        throw error;
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Undo delete                                                            */
  /* ---------------------------------------------------------------------- */

  function undoDelete() {
    if (!deletedTask) return;

    setTasks((current) => {
      const next = [...current];

      next.splice(
        Math.min(
          deletedTask.index,
          next.length,
        ),
        0,
        deletedTask.task,
      );

      return next;
    });

    setDeletedTask(null);
  }


  async function submitTask(
  taskId: string,
  notes: string,
) {
  return runInTransition(async () => {
    const updated = await submitTaskWorkAction(taskId, notes);

    setTasks((current) =>
      current.map((task) =>
        task.taskId === taskId ? updated : task,
      ),
    );

    return updated;
  });
}

async function reviewTask(
  submissionId: string,
  decision: "approved" | "changes_requested",
  notes: string,
) {
  return runInTransition(async () => {
    const updated = await reviewTaskWorkAction(
      submissionId,
      decision,
      notes,
    );

    setTasks((current) =>
      current.map((task) =>
        task.taskId === updated.taskId ? updated : task,
      ),
    );

    return updated;
  });
}

  /* ---------------------------------------------------------------------- */
  /* Return                                                                 */
  /* ---------------------------------------------------------------------- */

  return {
    scope,

    columns,
    tasks,
    visibleTasks,
    tasksByColumn,

    searchQuery,
    setSearchQuery,

    isPending,

    deletedTask,
    undoDelete,

    ...modal,

    addTask,
    updateTask,
    deleteTask,
    moveTask,

    reviewTask,
    submitTask,

    addColumn,
    renameColumn,
    deleteColumn,
    reorderColumns,
  };
}
