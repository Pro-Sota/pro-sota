"use client";

import { useMemo, useState } from "react";

import type {
  KanbanBoardProps,
  KanbanColumn,
} from "./types";

import SearchBox from "./search_box";
import TaskModal from "./task_modal";
import ToastContainer from "./toast_container";
import KanbanColumnComponent from "./column";

import AddColumnForm from "./add_column_form";

import { useKanbanState } from "./hooks/use_kanban_state";
import { useKanbanColumns } from "./hooks/use_kanban_columns";
import { useKanbanTasks } from "./hooks/use_kanban_tasks";
import { useKanbanDrag } from "./hooks/use_kanban_drag";

export default function KanbanBoard({
  projectId = null,
  initialBoard,
  projectMembers = [],
  currentUserProfileId = null,
}: KanbanBoardProps) {
  const {
    tasks,
    setTasks,
    columns,
    setColumns,
    selectedTask,
    selectedTaskId,
    setSelectedTaskId,
    searchQuery,
    setSearchQuery,
    taskInputs,
    setTaskInputs,
    editingColumnId,
    setEditingColumnId,
    columnTitleInput,
    setColumnTitleInput,
    listInput,
    setListInput,
    isAddingList,
    setIsAddingList,
    memberPickerOpen,
    setMemberPickerOpen,
    titleDraft,
    setTitleDraft,
    toasts,
    showToast,
    dismissToast,
  } = useKanbanState({
    projectId,
    initialBoard,
  });

  const {
    addColumn,
    deleteColumn,
    renameColumn,
    reorderColumns,
    canManageColumn,
  } = useKanbanColumns({
    projectId,
    columns,
    setColumns,
    tasks,
    listInput,
    setListInput,
    setIsAddingList,
    editingColumnId,
    setEditingColumnId,
    columnTitleInput,
    setColumnTitleInput,
    showToast,
  });

  const {
    addTask,
    deleteTask,
    updateTitle,
    updateCompletion,
    updatePriority,
    updateStartDate,
    updateDueDate,
    updateDescription,
    toggleMember,
  } = useKanbanTasks({
    projectId,
    currentUserProfileId,
    projectMembers,
    tasks,
    setTasks,
    selectedTask,
    taskInputs,
    setTaskInputs,
    setSelectedTaskId,
    setMemberPickerOpen,
    showToast,
  });

  const {
    draggedTaskId,
    draggedColumnId,
    dragOverColumnId,
    handleTaskDragStart,
    handleTaskDrop,
    handleColumnDragStart,
    handleColumnDrop,
  } = useKanbanDrag({
    projectId,
    tasks,
    setTasks,
    columns,
    setColumns,
    showToast,
  });

  const filteredTasks = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) return tasks;

    return tasks.filter((task) => {
      const members =
        task.assignedMembers
          ?.map((member) => member.name)
          .join(" ") ?? "";

      return [
        task.title,
        task.description ?? "",
        task.priority,
        task.assignedTo ?? "",
        members,
      ].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [tasks, searchQuery]);

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
                .filter(
                  (task) =>
                    task.columnId === column.id,
                )
                .sort(
                  (a, b) =>
                    a.position - b.position,
                );

              return (
                <KanbanColumnComponent
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  isEditing={
                    editingColumnId === column.id
                  }
                  editTitle={columnTitleInput}
                  canManage={canManageColumn(
                    column,
                  )}
                  isDragOver={
                    dragOverColumnId === column.id
                  }
                  taskInput={
                    taskInputs[column.id] ?? ""
                  }
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDragLeave={() => {}}
                  onDrop={(event) =>
                    handleColumnDrop(
                      event,
                      column.id,
                    )
                  }
                  onEditingStart={() => {
                    setEditingColumnId(
                      column.id,
                    );
                    setColumnTitleInput(
                      column.title,
                    );
                  }}
                  onEditTitleChange={
                    setColumnTitleInput
                  }
                  onEditCommit={renameColumn}
                  onDelete={() =>
                    deleteColumn(column.id)
                  }
                  onColumnDragStart={(event) =>
                    handleColumnDragStart(
                      event,
                      column.id,
                    )
                  }
                  onTaskInputChange={(value) =>
                    setTaskInputs((previous) => ({
                      ...previous,
                      [column.id]: value,
                    }))
                  }
                  onAddTask={() =>
                    addTask(column.id)
                  }
                  onSelectTask={setSelectedTaskId}
                  onDeleteTask={deleteTask}
                  onTaskDragStart={
                    handleTaskDragStart
                  }
                  onTaskDrop={handleTaskDrop}
                />
              );
            })}

            <div className="w-80 shrink-0">
              <AddColumnForm
                isAdding={isAddingList}
                listInput={listInput}
                onInputChange={setListInput}
                onAddClick={addColumn}
                onCancelClick={() => {
                  setIsAddingList(false);
                  setListInput("");
                }}
                onToggleForm={() =>
                  setIsAddingList(
                    (previous) => !previous,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void addColumn();
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
        isProjectTasks={Boolean(projectId)}
        projectMembers={projectMembers}
        memberPickerOpen={memberPickerOpen}
        titleDraft={titleDraft}
        onClose={() => {
          setSelectedTaskId(null);
          setMemberPickerOpen(false);
        }}
        onDelete={() => {
          if (selectedTask) {
            void deleteTask(selectedTask.id);
          }
        }}
        onTitleChange={setTitleDraft}
        onTitleCommit={updateTitle}
        onCompletionChange={updateCompletion}
        onPriorityChange={updatePriority}
        onStartDateChange={updateStartDate}
        onDueDateChange={updateDueDate}
        onDescriptionChange={(description) => {
          if (!selectedTask) return;

          setTasks((previous) =>
            previous.map((task) =>
              task.id === selectedTask.id
                ? { ...task, description }
                : task,
            ),
          );
        }}
        onDescriptionBlur={updateDescription}
        onMemberToggle={toggleMember}
        onMemberPickerToggle={
          setMemberPickerOpen
        }
        getColumnTitle={(columnId) =>
          columns.find(
            (column) => column.id === columnId,
          )?.title ?? "Lista indisponível"
        }
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
      />
    </>
  );
}