"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Search } from "lucide-react";

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
  updateTaskMembers,
  deleteTask,
  deleteTaskColumn,
  moveTask,
  renameTaskColumn,
  reorderTaskColumns,
  reorderTasks,
} from "@/services/project_tasks";

import type {
  KanbanColumn,
  ProjectMember,
  KanbanTask,
  KanbanBoardProps,
  ToastItem,
} from "./types";

import {
  SearchBox,
  ToastContainer,
  TaskCard,
  TaskModal,
  ColumnHeader,
  AddColumnForm,
} from "./";

import {
  getTaskMembers,
  validateDateRange,
} from "./utils";

/* -------------------------------------------------------------------------- */
/* Kanban board                                                               */
/* -------------------------------------------------------------------------- */

export default function KanbanBoard({
  projectId = null,
  initialBoard,
  projectMembers = [],
  currentUserProfileId = null,
}: KanbanBoardProps) {
  const isProjectTasks = Boolean(projectId);

  const initialColumns = (
    initialBoard.columns as unknown as KanbanColumn[]
  ).filter((column) =>
    projectId
      ? column.projectId === projectId
      : column.projectId === null,
  );

  const initialTasks = (
    initialBoard.tasks as KanbanTask[]
  ).filter((task) =>
    projectId
      ? task.projectId === projectId
      : task.projectId === null,
  );

  /* -------- State -------- */
  const [tasks, setTasks] =
    useState<KanbanTask[]>(initialTasks);

  const [columns, setColumns] =
    useState<KanbanColumn[]>(initialColumns);

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

  const [memberPickerOpen, setMemberPickerOpen] =
    useState(false);

  const [toasts, setToasts] =
    useState<ToastItem[]>([]);

  const selectedTask =
    tasks.find(
      (task) => task.id === selectedTaskId,
    ) ?? null;

  /* -------- Toast -------- */
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const id = Date.now() + Math.random();

    setToasts((previous) => [
      ...previous,
      { id, message, type },
    ]);

    window.setTimeout(() => {
      setToasts((previous) =>
        previous.filter((toast) => toast.id !== id),
      );
    }, 3500);
  };

  const dismissToast = (id: number) => {
    setToasts((previous) =>
      previous.filter((toast) => toast.id !== id),
    );
  };

  /* -------- Synchronisation -------- */
  useEffect(() => {
    const scopedColumns = (
      initialBoard.columns as unknown as KanbanColumn[]
    ).filter((column) =>
      projectId
        ? column.projectId === projectId
        : column.projectId === null,
    );

    const scopedTasks = (
      initialBoard.tasks as KanbanTask[]
    ).filter((task) =>
      projectId
        ? task.projectId === projectId
        : task.projectId === null,
    );

    setTasks(scopedTasks);
    setColumns(scopedColumns);
  }, [initialBoard, projectId]);

  useEffect(() => {
    if (!selectedTaskId) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedTaskId(null);
        setMemberPickerOpen(false);
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [selectedTaskId]);

  useEffect(() => {
    setTitleDraft(selectedTask?.title ?? "");
    setMemberPickerOpen(false);
  }, [selectedTaskId, selectedTask?.title]);

  /* -------- Local helpers -------- */
  const updateTaskLocal = (
    taskId: string,
    updates: Partial<KanbanTask>,
  ) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    );
  };

  const getColumn = (
    columnId: string | null | undefined,
  ): KanbanColumn | null => {
    if (!columnId) return null;
    return columns.find((column) => column.id === columnId) ?? null;
  };

  const canManageColumns = (
    column: KanbanColumn | null,
  ) => {
    if (!column) return false;
    return projectId
      ? column.projectId === projectId
      : column.projectId === null;
  };

  const matchesSearch = (task: KanbanTask) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const members = getTaskMembers(task)
      .map((member) => member.name)
      .join(" ");

    return [
      task.title,
      task.description ?? "",
      task.priority,
      task.assignedTo ?? "",
      members,
    ].some((value) =>
      value.toLowerCase().includes(query),
    );
  };

  const filteredTasks = useMemo(
    () => tasks.filter(matchesSearch),
    [tasks, searchQuery],
  );

  const totalMatches = filteredTasks.length;
  const isSearching = searchQuery.trim().length > 0;

  /* -------- Columns -------- */
const handleAddColumn = async () => {
  const name = listInput.trim();

  if (!name) {
    showToast(
      "Introduza o nome da lista.",
      "info",
    );
    return;
  }

  try {
    const newColumn = await createTaskColumn({
      project_id: projectId ?? null,
      name,
      position: columns.length,
      is_completed: false,
    });

    const normalizedColumn =
      newColumn as unknown as KanbanColumn;

    if (
      projectId
        ? normalizedColumn.projectId !== projectId
        : normalizedColumn.projectId !== null
    ) {
      throw new Error(
        "A lista criada pertence a um contexto diferente.",
      );
    }

    setColumns((previous) => [
      ...previous,
      normalizedColumn,
    ]);

    setListInput("");
    setIsAddingList(false);

    showToast(
      "Lista criada com sucesso.",
      "success",
    );
  } catch (err) {
    console.error("Failed to create column:", err);

    showToast(
      err instanceof Error
        ? err.message
        : "Não foi possível criar a lista.",
      "error",
    );
  }
};

  const handleDeleteColumn = async (
    columnId: string,
  ) => {
    const column = getColumn(columnId);

    if (!column) return;

    if (!canManageColumns(column)) {
      showToast(
        "Não tem permissão para eliminar esta lista.",
        "error",
      );
      return;
    }

    const hasTasks = tasks.some(
      (task) => task.columnId === columnId,
    );

    if (hasTasks) {
      showToast(
        "Esta lista contém tarefas. Mova as tarefas para outra lista antes de a eliminar.",
        "error",
      );
      return;
    }

    try {
      await deleteTaskColumn(columnId, columnId);

      setColumns((previous) =>
        previous.filter((item) => item.id !== columnId),
      );

      showToast(
        "Lista eliminada com sucesso.",
        "success",
      );
    } catch (err) {
      console.error("Failed to delete column:", err);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível eliminar a lista.",
        "error",
      );
    }
  };

  const startEditingColumn = (column: KanbanColumn) => {
    if (!canManageColumns(column)) return;

    setEditingColumnId(column.id);
    setColumnTitleInput(column.title);
  };

  const commitColumnTitle = async () => {
    if (!editingColumnId) return;

    const title = columnTitleInput.trim();

    if (!title) {
      setEditingColumnId(null);
      return;
    }

    const oldColumn =
      columns.find((column) => column.id === editingColumnId) ??
      null;

    if (!oldColumn || oldColumn.title === title) {
      setEditingColumnId(null);
      return;
    }

    if (!canManageColumns(oldColumn)) {
      setEditingColumnId(null);

      showToast(
        "Não tem permissão para renomear esta lista.",
        "error",
      );

      return;
    }

    try {
      const updatedColumn = await renameTaskColumn(
        editingColumnId,
        title,
      );

      setColumns((previous) =>
        previous.map((column) =>
          column.id === editingColumnId
            ? {
              ...(updatedColumn as unknown as KanbanColumn),
              projectName: column.projectName,
            }
            : column,
        ),
      );

      showToast("Lista actualizada.", "success");
    } catch (err) {
      console.error("Failed to rename column:", err);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível renomear a lista.",
        "error",
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

    setDraggedColumnId(columnId);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData("text/plain", `col:${columnId}`);
  };

  const handleColumnDropArea = async (
    event: React.DragEvent,
    targetColumnId: string,
  ) => {
    event.preventDefault();

    setDragOverColumnId(null);

    const raw = event.dataTransfer.getData("text/plain");

    if (raw.startsWith("col:")) {
      const sourceColumnId = raw.slice(4);

      if (sourceColumnId === targetColumnId) {
        return;
      }

      const sourceColumn = getColumn(sourceColumnId);
      const targetColumn = getColumn(targetColumnId);

      if (!sourceColumn || !targetColumn) {
        return;
      }

      if (
        !canManageColumns(sourceColumn) ||
        !canManageColumns(targetColumn)
      ) {
        return;
      }

      const next = [...columns];

      const from = next.findIndex(
        (column) => column.id === sourceColumnId,
      );

      const to = next.findIndex(
        (column) => column.id === targetColumnId,
      );

      if (from === -1 || to === -1) {
        return;
      }

      const [moved] = next.splice(from, 1);

      if (!moved) return;

      next.splice(to, 0, moved);

      const reordered = next.map((column, index) => ({
        ...column,
        position: index,
      }));

      const previousColumns = columns;

      setColumns(reordered);

      try {
        await reorderTaskColumns(
          projectId ?? "",
          reordered.map((column) => column.id),
        );

        showToast("Listas reordenadas.", "success");
      } catch (err) {
        console.error("Failed to reorder columns:", err);

        setColumns(previousColumns);

        showToast(
          err instanceof Error
            ? err.message
            : "Não foi possível reordenar as listas.",
          "error",
        );
      }

      setDraggedColumnId(null);
      return;
    }

    const taskId = raw.startsWith("task:")
      ? raw.slice(5)
      : draggedTaskId;

    if (!taskId) return;

    const task = tasks.find((item) => item.id === taskId) ?? null;

    if (!task) return;

    await handleTaskMove(task, targetColumnId);

    setDraggedTaskId(null);
  };

  /* -------- Tasks -------- */
  const handleTaskDragStart = (
    event: React.DragEvent,
    taskId: string,
  ) => {
    setDraggedTaskId(taskId);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData("text/plain", `task:${taskId}`);
  };

  const handleTaskDrop = async (
    event: React.DragEvent,
    targetTaskId: string,
    targetColumnId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const taskId = draggedTaskId;

    if (!taskId || taskId === targetTaskId) {
      return;
    }

    const sourceTask =
      tasks.find((task) => task.id === taskId) ?? null;

    if (!sourceTask) return;

    await handleTaskMove(sourceTask, targetColumnId, targetTaskId);

    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleTaskMove = async (
    task: KanbanTask,
    targetColumnId: string,
    targetTaskId?: string,
  ) => {
    const targetColumn = getColumn(targetColumnId);

    if (!targetColumn) {
      showToast(
        "A lista seleccionada não existe.",
        "error",
      );
      return;
    }

    const taskBelongsToCurrentBoard = projectId
      ? task.projectId === projectId
      : task.projectId === null;

    const columnBelongsToCurrentBoard = projectId
      ? targetColumn.projectId === projectId
      : targetColumn.projectId === null;

    if (
      !taskBelongsToCurrentBoard ||
      !columnBelongsToCurrentBoard
    ) {
      showToast(
        "Não é possível mover tarefas entre contextos diferentes.",
        "error",
      );
      return;
    }

    const sourceColumnId = task.columnId;

    const previousTasks = tasks;

    const sourceTasks = tasks
      .filter((item) => item.columnId === sourceColumnId)
      .sort((a, b) => a.position - b.position);

    const targetTasks = tasks
      .filter((item) => item.columnId === targetColumnId)
      .sort((a, b) => a.position - b.position);

    const sourceWithoutTask = sourceTasks.filter(
      (item) => item.id !== task.id,
    );

    let nextTargetTasks =
      sourceColumnId === targetColumnId
        ? [...sourceWithoutTask]
        : [...targetTasks];

    const movedTask: KanbanTask = {
      ...task,
      columnId: targetColumnId,
    };

    let insertionIndex = nextTargetTasks.length;

    if (targetTaskId) {
      const targetIndex = nextTargetTasks.findIndex(
        (item) => item.id === targetTaskId,
      );

      if (targetIndex >= 0) {
        insertionIndex = targetIndex;
      }
    }

    nextTargetTasks.splice(insertionIndex, 0, movedTask);

    const sourceReordered = sourceWithoutTask.map(
      (item, index) => ({
        ...item,
        position: index,
      }),
    );

    const targetReordered = nextTargetTasks.map(
      (item, index) => ({
        ...item,
        position: index,
      }),
    );

    const affectedColumnIds = new Set([
      sourceColumnId,
      targetColumnId,
    ]);

    let nextTasks = tasks.filter(
      (item) => !affectedColumnIds.has(item.columnId),
    );

    if (sourceColumnId === targetColumnId) {
      nextTasks.push(...targetReordered);
    } else {
      nextTasks.push(...sourceReordered);
      nextTasks.push(...targetReordered);
    }

    nextTasks.sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );

    setTasks(nextTasks);

    try {
      await moveTask(
        task.id,
        targetColumnId,
        movedTask.position,
      );

      if (sourceColumnId !== targetColumnId) {
        await reorderTasks(
          task.projectId,
          sourceColumnId,
          sourceReordered.map((item) => item.id),
        );
      }

      await reorderTasks(
        targetColumn.projectId,
        targetColumnId,
        targetReordered.map((item) => item.id),
      );
    } catch (err) {
      console.error("Failed to move task:", err);

      setTasks(previousTasks);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível mover a tarefa.",
        "error",
      );
    }
  };

  /* -------- Add task -------- */
  const handleAddTask = async (columnId: string) => {
    const value = (taskInputs[columnId] ?? "").trim();

    if (!value) {
      showToast("Introduza o nome da tarefa.", "info");
      return;
    }

    const column = getColumn(columnId);

    if (!column) {
      showToast(
        "A lista seleccionada não existe.",
        "error",
      );
      return;
    }

    const columnBelongsToCurrentBoard = projectId
      ? column.projectId === projectId
      : column.projectId === null;

    if (!columnBelongsToCurrentBoard) {
      showToast(
        "Não é possível criar uma tarefa nesta lista.",
        "error",
      );
      return;
    }

    if (!isProjectTasks && !currentUserProfileId) {
      showToast(
        "Não foi possível identificar o utilizador actual.",
        "error",
      );
      return;
    }

    try {
      const newTask = await createTask({
        projectId: projectId ?? null,
        title: value,
        columnId,
        priority: "Medium",
        position: tasks.filter(
          (task) => task.columnId === columnId,
        ).length,

        assignedTo: isProjectTasks
          ? null
          : currentUserProfileId,

        assignedMembers: isProjectTasks
          ? []
          : currentUserProfileId
            ? [currentUserProfileId]
            : [],
      });

      setTasks((previous) => [...previous, newTask as KanbanTask]);

      setTaskInputs((previous) => ({
        ...previous,
        [columnId]: "",
      }));

      setSelectedTaskId(newTask.id);

      showToast(
        isProjectTasks
          ? "Tarefa criada. Pode adicionar os responsáveis."
          : "Tarefa pessoal criada.",
        "success",
      );
    } catch (err) {
      console.error("Failed to create task:", err);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a tarefa.",
        "error",
      );
    }
  };

  /* -------- Delete task -------- */
  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId) ?? null;

    if (!task) return;

    const previousTasks = tasks;

    setTasks((previous) =>
      previous.filter((item) => item.id !== taskId),
    );

    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      setMemberPickerOpen(false);
    }

    try {
      await deleteTask(taskId);

      showToast(
        "Tarefa eliminada com sucesso.",
        "success",
      );
    } catch (err) {
      console.error("Failed to delete task:", err);

      setTasks(previousTasks);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível eliminar a tarefa.",
        "error",
      );
    }
  };

  /* -------- Task title -------- */
  const commitTitle = async () => {
    if (!selectedTask) return;

    const title = titleDraft.trim();

    if (!title || title === selectedTask.title) {
      setTitleDraft(selectedTask.title);
      return;
    }

    try {
      const updated = await updateTask(selectedTask.id, {
        title,
      });

      updateTaskLocal(selectedTask.id, updated as KanbanTask);

      showToast("Tarefa actualizada.", "success");
    } catch (err) {
      console.error("Failed to update task title:", err);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar a tarefa.",
        "error",
      );

      setTitleDraft(selectedTask.title);
    }
  };

  /* -------- Completion -------- */
  const updateTaskCompletion = async (
    completed: boolean,
  ) => {
    if (!selectedTask) return;

    const previous = selectedTask.completed ?? false;

    updateTaskLocal(selectedTask.id, { completed });

    try {
      const updated = await updateTask(selectedTask.id, {
        completed,
      });

      updateTaskLocal(selectedTask.id, updated as KanbanTask);

      showToast(
        completed
          ? "Tarefa marcada como concluída."
          : "Tarefa marcada como em aberto.",
        "success",
      );
    } catch (err) {
      updateTaskLocal(selectedTask.id, {
        completed: previous,
      });

      console.error(
        "Failed to update task completion:",
        err,
      );

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar o estado da tarefa.",
        "error",
      );
    }
  };

  /* -------- Priority -------- */
  const updatePriority = async (
    priority: TaskPriority,
  ) => {
    if (!selectedTask) return;

    const previous = selectedTask.priority;

    updateTaskLocal(selectedTask.id, { priority });

    try {
      const updated = await updateTask(selectedTask.id, {
        priority,
      });

      updateTaskLocal(selectedTask.id, updated as KanbanTask);

      showToast("Prioridade actualizada.", "success");
    } catch (err) {
      updateTaskLocal(selectedTask.id, {
        priority: previous,
      });

      console.error("Failed to update priority:", err);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar a prioridade.",
        "error",
      );
    }
  };

  /* -------- Start date -------- */
  const updateStartDate = async (startDate: string) => {
    if (!selectedTask) return;

    const value = startDate || null;

    const previous = selectedTask.startDate ?? null;

    const validation = validateDateRange(value, selectedTask.dueDate);

    if (!validation.valid) {
      showToast(validation.message || "Data inválida.", "error");
      return;
    }

    updateTaskLocal(selectedTask.id, { startDate: value });

    try {
      const updated = await updateTask(selectedTask.id, {
        startDate: value,
      });

      updateTaskLocal(selectedTask.id, updated as KanbanTask);

      showToast("Data de início actualizada.", "success");
    } catch (err) {
      updateTaskLocal(selectedTask.id, {
        startDate: previous,
      });

      console.error("Failed to update start date:", err);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar a data de início.",
        "error",
      );
    }
  };

  /* -------- Due date -------- */
  const updateDueDate = async (dueDate: string) => {
    if (!selectedTask) return;

    const value = dueDate || null;

    const validation = validateDateRange(
      selectedTask.startDate,
      value,
    );

    if (!validation.valid) {
      showToast(validation.message || "Data inválida.", "error");
      return;
    }

    const previous = selectedTask.dueDate;

    updateTaskLocal(selectedTask.id, { dueDate: value });

    try {
      const updated = await updateTask(selectedTask.id, {
        dueDate: value,
      });

      updateTaskLocal(selectedTask.id, updated as KanbanTask);

      showToast("Data de conclusão actualizada.", "success");
    } catch (err) {
      updateTaskLocal(selectedTask.id, {
        dueDate: previous,
      });

      console.error("Failed to update due date:", err);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar a data de conclusão.",
        "error",
      );
    }
  };

  /* -------- Description -------- */
  const updateDescription = async (
    description: string,
  ) => {
    if (!selectedTask) return;

    const previous = selectedTask.description;

    try {
      const updated = await updateTask(selectedTask.id, {
        description,
      });

      updateTaskLocal(selectedTask.id, updated as KanbanTask);

      if (previous !== description) {
        showToast("Descrição guardada.", "success");
      }
    } catch (err) {
      updateTaskLocal(selectedTask.id, {
        description: previous,
      });

      console.error("Failed to update description:", err);

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível guardar a descrição.",
        "error",
      );
    }
  };

  /* -------- Members -------- */
  const toggleTaskMember = async (profileId: string) => {
    if (!selectedTask || !isProjectTasks) {
      return;
    }

    const currentMembers = selectedTask.assignedMembers ?? [];

    const exists = currentMembers.some(
      (member) => member.profileId === profileId,
    );

    const projectMember = projectMembers.find(
      (member) => member.profileId === profileId,
    );

    if (!projectMember) {
      showToast(
        "Este membro não pertence ao projecto.",
        "error",
      );
      return;
    }

    const nextMembers = exists
      ? currentMembers.filter(
          (member) => member.profileId !== profileId,
        )
      : [
          ...currentMembers,
          {
            profileId: projectMember.profileId,
            name: projectMember.name,
            picture: projectMember.picture ?? null,
            jobTitle: projectMember.jobTitle ?? null,
          },
        ];

    updateTaskLocal(selectedTask.id, {
      assignedMembers: nextMembers,
    });

    try {
      const updatedMembers = await updateTaskMembers(
        selectedTask.id,
        nextMembers.map((member) => member.profileId),
      );

      const normalizedMembers =
        updatedMembers?.map((member: any) => ({
          profileId: member.profileId ?? member.profile_id,
          name:
            member.name ??
            `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim(),
          picture: member.picture ?? null,
          jobTitle:
            member.jobTitle ?? member.job_title ?? null,
        })) ?? nextMembers;

      updateTaskLocal(selectedTask.id, {
        assignedMembers: normalizedMembers,
      });

      showToast(
        exists
          ? "Membro removido da tarefa."
          : "Membro adicionado à tarefa.",
        "success",
      );
    } catch (err) {
      updateTaskLocal(selectedTask.id, {
        assignedMembers: currentMembers,
      });

      console.error(
        "Failed to update task members:",
        err,
      );

      showToast(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar os responsáveis.",
        "error",
      );
    }
  };

  /* -------- Empty search result -------- */
  if (isSearching && totalMatches === 0) {
    return (
      <>
        <div className="min-h-screen">
          <div className="mx-auto max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-8 border-b border-gray-200 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                    Tarefas
                  </h1>

                  <p className="mt-1 text-sm text-gray-600">
                    {projectId
                      ? "Organize as tarefas deste projecto."
                      : "Consulte as tarefas gerais da equipa."}
                  </p>
                </div>

                <SearchBox
                  value={searchQuery}
                  onChange={setSearchQuery}
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
                onClick={() => setSearchQuery("")}
                className="mt-4 text-sm font-medium text-gray-600 underline transition hover:text-gray-900"
              >
                Limpar pesquisa
              </button>
            </div>
          </div>
        </div>

        <ToastContainer
          toasts={toasts}
          onDismiss={dismissToast}
        />
      </>
    );
  }

  /* -------- Render -------- */
  return (
    <>
      <div className="min-h-screen">
        <div className="mx-auto max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  Tarefas
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  {projectId
                    ? "Organize as tarefas deste projecto."
                    : "Consulte as tarefas gerais da equipa."}
                </p>
              </div>

              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>

          <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0">
            {columns.map((column) => {
              const columnTasks = filteredTasks
                .filter((task) => task.columnId === column.id)
                .sort((a, b) => a.position - b.position);

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
                        : previous,
                    )
                  }
                  onDrop={(event) =>
                    handleColumnDropArea(event, column.id)
                  }
                  className={`flex min-h-[600px] w-80 shrink-0 flex-col rounded-lg border bg-white shadow-sm transition ${
                    dragOverColumnId === column.id
                      ? "border-gray-400 ring-2 ring-gray-200"
                      : "border-gray-200"
                  }`}
                >
                  <ColumnHeader
                    column={column}
                    taskCount={columnTasks.length}
                    isEditing={
                      editingColumnId === column.id
                    }
                    editTitle={columnTitleInput}
                    canManage={canManageColumns(column)}
                    onEditingStart={() =>
                      startEditingColumn(column)
                    }
                    onEditTitleChange={
                      setColumnTitleInput
                    }
                    onEditCommit={commitColumnTitle}
                    onDelete={() =>
                      handleDeleteColumn(column.id)
                    }
                    onDragStart={(event) =>
                      handleColumnDragStart(
                        event,
                        column.id,
                      )
                    }
                  />

                  <div className="flex-1 space-y-3 overflow-y-auto overflow-x-visible px-4 py-4 sm:px-5">
                    {columnTasks.length === 0 && (
                      <p className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                        Sem tarefas
                      </p>
                    )}

                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onSelect={() =>
                          setSelectedTaskId(task.id)
                        }
                        onDelete={() =>
                          handleDeleteTask(task.id)
                        }
                        draggable
                        onDragStart={(event) =>
                          handleTaskDragStart(
                            event,
                            task.id,
                          )
                        }
                        onDragOver={(event) =>
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
                    ))}
                  </div>

                  <div className="space-y-3 border-t border-gray-200 px-4 py-4 sm:px-5">
                    <input
                      type="text"
                      value={taskInputs[column.id] ?? ""}
                      onChange={(event) =>
                        setTaskInputs((previous) => ({
                          ...previous,
                          [column.id]:
                            event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void handleAddTask(column.id);
                        }
                      }}
                      placeholder="Nova tarefa..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        void handleAddTask(column.id)
                      }
                      className="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                    >
                      Adicionar tarefa
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="w-80 shrink-0">
              <AddColumnForm
                isAdding={isAddingList}
                listInput={listInput}
                onInputChange={setListInput}
                onAddClick={handleAddColumn}
                onCancelClick={() => {
                  setIsAddingList(false);
                  setListInput("");
                }}
                onToggleForm={() =>
                  setIsAddingList(!isAddingList)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleAddColumn();
                  }

                  if (event.key === "Escape") {
                    setIsAddingList(false);
                    setListInput("");
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        selectedTask={selectedTask}
        isProjectTasks={isProjectTasks}
        projectMembers={projectMembers}
        memberPickerOpen={memberPickerOpen}
        titleDraft={titleDraft}
        onClose={() => {
          setSelectedTaskId(null);
          setMemberPickerOpen(false);
        }}
        onDelete={() => handleDeleteTask(selectedTaskId!)}
        onTitleChange={setTitleDraft}
        onTitleCommit={commitTitle}
        onCompletionChange={updateTaskCompletion}
        onPriorityChange={updatePriority}
        onStartDateChange={updateStartDate}
        onDueDateChange={updateDueDate}
        onDescriptionChange={(desc) =>
          updateTaskLocal(selectedTask?.id!, {
            description: desc,
          })
        }
        onDescriptionBlur={updateDescription}
        onMemberToggle={toggleTaskMember}
        onMemberPickerToggle={setMemberPickerOpen}
        getColumnTitle={(columnId) =>
          getColumn(columnId)?.title ??
          "Lista indisponível"
        }
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </>
  );
}