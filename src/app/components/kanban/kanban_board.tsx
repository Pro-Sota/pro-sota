"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

import type { TaskPriority, UpdateTaskInput } from "@/services/project_tasks";

import {
  createTaskAction as createTask,
  createTaskColumnAction as createTaskColumn,
  updateTaskAction as updateTask,
  updateTaskMembersAction as updateTaskMembers,
  deleteTaskAction as deleteTask,
  deleteTaskColumnAction as deleteTaskColumn,
  moveTaskAction as moveTask,
  renameTaskColumnAction as renameTaskColumn,
  reorderTaskColumnsAction as reorderTaskColumns,
  reorderTasksAction as reorderTasks,
} from "@/actions/project_tasks";

import type {
  KanbanColumn,
  KanbanTask,
  KanbanBoardProps,
} from "./types";

import {
  SearchBox,
  TaskCard,
  TaskModal,
  ColumnHeader,
  AddColumnForm,
} from "./";

import { getTaskMembers, validateDateRange } from "./utils";
import { useToast } from "../toast/use_toast";

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export default function KanbanBoard({
  projectId = null,
  initialBoard,
  projectMembers = [],
  currentUserProfileId = null,
}: KanbanBoardProps) {
  const isProjectTasks = Boolean(projectId);

  const inScope = (item: { projectId?: string | null }) =>
    item.projectId === (projectId ?? null);

  const scopeBoard = () => ({
    columns: initialBoard.columns as unknown as KanbanColumn[],
    tasks: (initialBoard.tasks as KanbanTask[]).filter(inScope),
  });

  /* -------- State -------- */

  const [tasks, setTasks] = useState<KanbanTask[]>(
    () => scopeBoard().tasks,
  );

  const [columns, setColumns] = useState<KanbanColumn[]>(
    () => scopeBoard().columns,
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);

  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [listInput, setListInput] = useState("");
  const [isAddingList, setIsAddingList] = useState(false);

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [columnTitleInput, setColumnTitleInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(
    null,
  );

  const toast = useToast();
  const toastIdRef = useRef(0);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? null;

  /* -------- Toast -------- */

  const showError = (err: unknown, fallback: string) => {
    console.error(fallback, err);
    toast.error(errorMessage(err, fallback));
  };

  /* -------- Effects -------- */

  useEffect(() => {
    const scoped = scopeBoard();

    setTasks(scoped.tasks);
    setColumns(scoped.columns);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBoard, projectId]);

  useEffect(() => {
    if (!selectedTaskId) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
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

  /* -------- Helpers -------- */

  const closeModal = () => {
    setSelectedTaskId(null);
    setMemberPickerOpen(false);
  };

  /**
   * Local UI state always uses KanbanTask.
   *
   * UpdateTaskInput must never be passed directly here.
   */
  const updateTaskLocal = (
    taskId: string,
    updates: Partial<KanbanTask>,
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

  const getColumn = (columnId: string | null | undefined) =>
    columns.find((column) => column.id === columnId) ?? null;

  const canManageColumn = (column: KanbanColumn | null) =>
    Boolean(column && inScope(column));

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredTasks = useMemo(() => {
    if (!query) return tasks;

    return tasks.filter((task) => {
      const members = getTaskMembers(task)
        .map((member) => member.name)
        .join(" ");

      return [
        task.title,
        task.description ?? "",
        task.priority,
        task.assignedTo ?? "",
        members,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [tasks, query]);

  /* -------- Columns -------- */

  const handleAddColumn = async () => {
    const name = listInput.trim();

    if (!name) {
      toast.info("Introduza o nome da lista.");
      return;
    }

    try {
      const created = (await createTaskColumn({
        project_id: projectId ?? null,
        name,
        position: columns.length,
        is_completed: false,
      })) as unknown as KanbanColumn;

      if (!inScope(created)) {
        throw new Error(
          "A lista criada pertence a um contexto diferente.",
        );
      }

      setColumns((previous) => [...previous, created]);
      setListInput("");
      setIsAddingList(false);

      toast.success("Lista criada com sucesso.");
    } catch (err) {
      showError(err, "Não foi possível criar a lista.");
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = getColumn(columnId);

    if (!column) return;

    if (!canManageColumn(column)) {
      toast.error("Não tem permissão para eliminar esta lista.");
      return;
    }

    if (tasks.some((task) => task.columnId === columnId)) {
      toast.error(
        "Esta lista contém tarefas. Mova as tarefas para outra lista antes de a eliminar.",
      );
      return;
    }

    try {
      await deleteTaskColumn(columnId);

      setColumns((previous) =>
        previous.filter((item) => item.id !== columnId),
      );

      toast.success("Lista eliminada com sucesso.");
    } catch (err) {
      showError(err, "Não foi possível eliminar a lista.");
    }
  };

  const startEditingColumn = (column: KanbanColumn) => {
    if (!canManageColumn(column)) return;

    setEditingColumnId(column.id);
    setColumnTitleInput(column.title);
  };

  const commitColumnTitle = async () => {
    if (!editingColumnId) return;

    const title = columnTitleInput.trim();
    const column = getColumn(editingColumnId);

    if (!title || !column || column.title === title) {
      setEditingColumnId(null);
      return;
    }

    if (!canManageColumn(column)) {
      setEditingColumnId(null);
      toast.error("Não tem permissão para renomear esta lista.");
      return;
    }

    try {
      const updated = (await renameTaskColumn(
        editingColumnId,
        title,
      )) as unknown as KanbanColumn;

      setColumns((previous) =>
        previous.map((item) =>
          item.id === editingColumnId
            ? {
                ...updated,
                projectName: item.projectName,
              }
            : item,
        ),
      );

      toast.success("Lista actualizada.");
    } catch (err) {
      showError(err, "Não foi possível renomear a lista.");
    } finally {
      setEditingColumnId(null);
    }
  };

  const reorderColumns = async (
    sourceId: string,
    targetId: string,
  ) => {
    if (
      sourceId === targetId ||
      !canManageColumn(getColumn(sourceId)) ||
      !canManageColumn(getColumn(targetId))
    ) {
      return;
    }

    const next = [...columns];

    const from = next.findIndex((column) => column.id === sourceId);
    const to = next.findIndex((column) => column.id === targetId);

    if (from === -1 || to === -1) return;

    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    const reordered = next.map((column, index) => ({
      ...column,
      position: index,
    }));

    const previous = columns;

    setColumns(reordered);

    try {
      await reorderTaskColumns(
        projectId ?? "",
        reordered.map((column) => column.id),
      );

      toast.success("Listas reordenadas.");
    } catch (err) {
      setColumns(previous);
      showError(err, "Não foi possível reordenar as listas.");
    }
  };

  const handleColumnDragStart = (
    event: React.DragEvent,
    columnId: string,
  ) => {
    if (!canManageColumn(getColumn(columnId))) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `col:${columnId}`);
  };

  const handleColumnDrop = async (
    event: React.DragEvent,
    targetColumnId: string,
  ) => {
    event.preventDefault();

    setDragOverColumnId(null);

    const raw = event.dataTransfer.getData("text/plain");

    if (raw.startsWith("col:")) {
      await reorderColumns(raw.slice(4), targetColumnId);
      return;
    }

    const taskId = raw.startsWith("task:")
      ? raw.slice(5)
      : draggedTaskId;

    const task = tasks.find((item) => item.id === taskId);

    if (task) {
      await handleTaskMove(task, targetColumnId);
    }

    setDraggedTaskId(null);
  };

  /* -------- Task drag & move -------- */

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

    const source = tasks.find(
      (task) => task.id === draggedTaskId,
    );

    if (!source || source.id === targetTaskId) return;

    await handleTaskMove(
      source,
      targetColumnId,
      targetTaskId,
    );

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
      toast.error("A lista seleccionada não existe.");
      return;
    }

    if (!inScope(task) || !inScope(targetColumn)) {
      toast.error(
        "Não é possível mover tarefas entre contextos diferentes.",
      );
      return;
    }

    const sourceColumnId = task.columnId;
    const sameColumn = sourceColumnId === targetColumnId;
    const previousTasks = tasks;

    const inColumn = (columnId: string) =>
      tasks
        .filter((item) => item.columnId === columnId)
        .sort((a, b) => a.position - b.position);

    const sourceWithoutTask = inColumn(
      sourceColumnId ?? "",
    ).filter((item) => item.id !== task.id);

    const nextTarget = sameColumn
      ? [...sourceWithoutTask]
      : inColumn(targetColumnId);

    const targetIndex = targetTaskId
      ? nextTarget.findIndex(
          (item) => item.id === targetTaskId,
        )
      : -1;

    const insertionIndex =
      targetIndex >= 0
        ? targetIndex
        : nextTarget.length;

    nextTarget.splice(insertionIndex, 0, {
      ...task,
      columnId: targetColumnId,
    });

    const withPositions = (list: KanbanTask[]) =>
      list.map((item, index) => ({
        ...item,
        position: index,
      }));

    const sourceReordered =
      withPositions(sourceWithoutTask);

    const targetReordered =
      withPositions(nextTarget);

    const untouched = tasks.filter(
      (item) =>
        item.columnId !== sourceColumnId &&
        item.columnId !== targetColumnId,
    );

    setTasks(
      [
        ...untouched,
        ...(sameColumn ? [] : sourceReordered),
        ...targetReordered,
      ].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      ),
    );

    try {
      await moveTask(
        task.id,
        targetColumnId,
        insertionIndex,
      );

      if (!sameColumn) {
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
      setTasks(previousTasks);
      showError(
        err,
        "Não foi possível mover a tarefa.",
      );
    }
  };

  /* -------- Add / delete task -------- */

  const handleAddTask = async (columnId: string) => {
    const title = (
      taskInputs[columnId] ?? ""
    ).trim();

    if (!title) {
      toast.info("Introduza o nome da tarefa.");
      return;
    }

    const column = getColumn(columnId);

    if (!column) {
      toast.error("A lista seleccionada não existe.");
      return;
    }

    if (!inScope(column)) {
      toast.error(
        "Não é possível criar uma tarefa nesta lista.",
      );
      return;
    }

    if (
      !isProjectTasks &&
      !currentUserProfileId
    ) {
      toast.error(
        "Não foi possível identificar o utilizador actual.",
      );
      return;
    }

    const personalOwner =
      isProjectTasks
        ? null
        : currentUserProfileId;

    try {
      const newTask = await createTask({
        projectId: projectId ?? null,
        title,
        columnId,
        priority: "Medium",
        position: tasks.filter(
          (task) => task.columnId === columnId,
        ).length,
        assignedTo: personalOwner,
        assignedMembers: personalOwner
          ? [personalOwner]
          : [],
      });

      setTasks((previous) => [
        ...previous,
        newTask as KanbanTask,
      ]);

      setTaskInputs((previous) => ({
        ...previous,
        [columnId]: "",
      }));

      setSelectedTaskId(newTask.id);

      toast.success(
        isProjectTasks
          ? "Tarefa criada. Pode adicionar os responsáveis."
          : "Tarefa pessoal criada.",
      );
    } catch (err) {
      showError(
        err,
        "Não foi possível criar a tarefa.",
      );
    }
  };

  const handleDeleteTask = async (
    taskId: string,
  ) => {
    const previousTasks = tasks;

    setTasks((previous) =>
      previous.filter(
        (task) => task.id !== taskId,
      ),
    );

    if (selectedTaskId === taskId) {
      closeModal();
    }

    try {
      await deleteTask(taskId);

      toast.success(
        "Tarefa eliminada com sucesso.",
      );
    } catch (err) {
      setTasks(previousTasks);

      showError(
        err,
        "Não foi possível eliminar a tarefa.",
      );
    }
  };

  /* -------- Selected task updates -------- */

  /**
   * Persists fields accepted by UpdateTaskInput.
   *
   * The returned task is converted into KanbanTask only
   * at the action boundary.
   */
  const patchSelectedTask = async (
    updates: Partial<UpdateTaskInput>,
    successMessage: string,
    errorFallback: string,
  ) => {
    if (!selectedTask) return;

    const taskId = selectedTask.id;
    const previousTask = selectedTask;

    /*
     * Only update the local UI with fields that actually
     * exist in KanbanTask.
     *
     * UpdateTaskInput and KanbanTask are intentionally
     * separate types.
     */
    const localUpdates: Partial<KanbanTask> = {};

    if ("title" in updates && updates.title !== undefined) {
      localUpdates.title = updates.title;
    }

    if (
      "description" in updates &&
      updates.description !== undefined
    ) {
      localUpdates.description =
        updates.description;
    }

    if (
      "priority" in updates &&
      updates.priority !== undefined
    ) {
      localUpdates.priority = updates.priority;
    }

    if (
      "completed" in updates &&
      updates.completed !== undefined
    ) {
      localUpdates.completed = updates.completed;
    }

    if (
      "startDate" in updates &&
      updates.startDate !== undefined
    ) {
      localUpdates.startDate = updates.startDate;
    }

    if (
      "dueDate" in updates &&
      updates.dueDate !== undefined
    ) {
      localUpdates.dueDate = updates.dueDate;
    }

    if (
      "assignedTo" in updates &&
      updates.assignedTo !== undefined
    ) {
      localUpdates.assignedTo = updates.assignedTo;
    }

    if (
      "columnId" in updates &&
      updates.columnId !== undefined
    ) {
      localUpdates.columnId = updates.columnId;
    }

    updateTaskLocal(taskId, localUpdates);

    try {
      const updated = await updateTask(
        taskId,
        updates,
      );

      /*
       * updateTask is responsible for returning the
       * normalized KanbanTask shape.
       */
      updateTaskLocal(
        taskId,
        updated as KanbanTask,
      );

      toast.success(successMessage);
    } catch (err) {
      /*
       * Roll back using the complete UI task.
       */
      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId
            ? previousTask
            : task,
        ),
      );

      showError(err, errorFallback);
    }
  };

  const commitTitle = async () => {
    if (!selectedTask) return;

    const title = titleDraft.trim();

    if (
      !title ||
      title === selectedTask.title
    ) {
      setTitleDraft(selectedTask.title);
      return;
    }

    await patchSelectedTask(
      { title },
      "Tarefa actualizada.",
      "Não foi possível actualizar a tarefa.",
    );
  };

  const updateTaskCompletion = (
    completed: boolean,
  ) =>
    patchSelectedTask(
      { completed },
      completed
        ? "Tarefa marcada como concluída."
        : "Tarefa marcada como em aberto.",
      "Não foi possível actualizar o estado da tarefa.",
    );

  const updatePriority = (
    priority: TaskPriority,
  ) =>
    patchSelectedTask(
      { priority },
      "Prioridade actualizada.",
      "Não foi possível actualizar a prioridade.",
    );

  const updateDate = async (
    field: "startDate" | "dueDate",
    raw: string,
    successMessage: string,
    errorFallback: string,
  ) => {
    if (!selectedTask) return;

    const value = raw || null;

    const validation =
      field === "startDate"
        ? validateDateRange(
            value,
            selectedTask.dueDate,
          )
        : validateDateRange(
            selectedTask.startDate,
            value,
          );

    if (!validation.valid) {
      toast.error(
        validation.message ||
          "Data inválida.",
      );
      return;
    }

    await patchSelectedTask(
      { [field]: value },
      successMessage,
      errorFallback,
    );
  };

  const updateStartDate = (
    value: string,
  ) =>
    updateDate(
      "startDate",
      value,
      "Data de início actualizada.",
      "Não foi possível actualizar a data de início.",
    );

  const updateDueDate = (
    value: string,
  ) =>
    updateDate(
      "dueDate",
      value,
      "Data de conclusão actualizada.",
      "Não foi possível actualizar a data de conclusão.",
    );

  const updateDescription = (
    description: string,
  ) =>
    patchSelectedTask(
      { description },
      "Descrição guardada.",
      "Não foi possível guardar a descrição.",
    );

  const toggleTaskMember = async (
    profileId: string,
  ) => {
    if (
      !selectedTask ||
      !isProjectTasks
    ) {
      return;
    }

    const current =
      selectedTask.assignedMembers ?? [];

    const exists = current.some(
      (member) =>
        member.profileId === profileId,
    );

    const projectMember =
      projectMembers.find(
        (member) =>
          member.profileId === profileId,
      );

    if (!projectMember) {
      toast.error(
        "Este membro não pertence ao projecto.",
      );
      return;
    }

    const next = exists
      ? current.filter(
          (member) =>
            member.profileId !== profileId,
        )
      : [
          ...current,
          {
            profileId:
              projectMember.profileId,
            name: projectMember.name,
            picture:
              projectMember.picture ?? null,
            jobTitle:
              projectMember.jobTitle ?? null,
          },
        ];

    updateTaskLocal(
      selectedTask.id,
      {
        assignedMembers: next,
      },
    );

    try {
      const saved =
        await updateTaskMembers(
          selectedTask.id,
          next.map(
            (member) =>
              member.profileId,
          ),
        );

      const normalized =
        saved?.map((member: any) => ({
          profileId:
            member.profileId ??
            member.profile_id,

          name:
            member.name ??
            `${member.firstName ?? ""} ${
              member.lastName ?? ""
            }`.trim(),

          picture:
            member.picture ?? null,

          jobTitle:
            member.jobTitle ??
            member.job_title ??
            null,
        })) ?? next;

      updateTaskLocal(
        selectedTask.id,
        {
          assignedMembers: normalized,
        },
      );

      toast.success(
        exists
          ? "Membro removido da tarefa."
          : "Membro adicionado à tarefa.",
      );
    } catch (err) {
      updateTaskLocal(
        selectedTask.id,
        {
          assignedMembers: current,
        },
      );

      showError(
        err,
        "Não foi possível actualizar os responsáveis.",
      );
    }
  };

  /* -------- Render -------- */

  const noSearchResults =
    isSearching &&
    filteredTasks.length === 0;

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

          {noSearchResults ? (
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
          ) : (
            <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-6 sm:mx-0 sm:px-0">
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
                      handleColumnDrop(
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
                    <ColumnHeader
                      column={column}
                      taskCount={
                        columnTasks.length
                      }
                      isEditing={
                        editingColumnId ===
                        column.id
                      }
                      editTitle={
                        columnTitleInput
                      }
                      canManage={canManageColumn(
                        column,
                      )}
                      onEditingStart={() =>
                        startEditingColumn(
                          column,
                        )
                      }
                      onEditTitleChange={
                        setColumnTitleInput
                      }
                      onEditCommit={
                        commitColumnTitle
                      }
                      onDelete={() =>
                        handleDeleteColumn(
                          column.id,
                        )
                      }
                      onDragStart={(event) =>
                        handleColumnDragStart(
                          event,
                          column.id,
                        )
                      }
                    />

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
                        ),
                      )}
                    </div>

                    <div className="space-y-3 border-t border-gray-200 px-4 py-4 sm:px-5">
                      <input
                        type="text"
                        value={
                          taskInputs[
                            column.id
                          ] ?? ""
                        }
                        onChange={(event) =>
                          setTaskInputs(
                            (previous) => ({
                              ...previous,
                              [column.id]:
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
                            void handleAddTask(
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
                          void handleAddTask(
                            column.id,
                          )
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
                  onInputChange={
                    setListInput
                  }
                  onAddClick={
                    handleAddColumn
                  }
                  onCancelClick={() => {
                    setIsAddingList(false);
                    setListInput("");
                  }}
                  onToggleForm={() =>
                    setIsAddingList(
                      (open) => !open,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      void handleAddColumn();
                    }

                    if (
                      event.key === "Escape"
                    ) {
                      setIsAddingList(false);
                      setListInput("");
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <TaskModal
        selectedTask={selectedTask}
        isProjectTasks={isProjectTasks}
        projectMembers={projectMembers}
        memberPickerOpen={memberPickerOpen}
        titleDraft={titleDraft}
        onClose={closeModal}
        onDelete={() =>
          selectedTaskId &&
          handleDeleteTask(
            selectedTaskId,
          )
        }
        onTitleChange={setTitleDraft}
        onTitleCommit={commitTitle}
        onCompletionChange={
          updateTaskCompletion
        }
        onPriorityChange={updatePriority}
        onStartDateChange={
          updateStartDate
        }
        onDueDateChange={updateDueDate}
        onDescriptionChange={(
          description,
        ) =>
          selectedTask &&
          updateTaskLocal(
            selectedTask.id,
            { description },
          )
        }
        onDescriptionBlur={
          updateDescription
        }
        onMemberToggle={
          toggleTaskMember
        }
        onMemberPickerToggle={
          setMemberPickerOpen
        }
        getColumnTitle={(columnId) =>
          getColumn(columnId)?.title ??
          "Lista indisponível"
        }
      />
    </>
  );
}