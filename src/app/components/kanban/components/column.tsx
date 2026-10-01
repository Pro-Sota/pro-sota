"use client";

import React from "react";

import type { KanbanColumn, KanbanTask } from "../types";
import ColumnHeader from "./column_header";
import TaskCard from "./task_card";
import AddTaskForm from "./add_task_form";

type Props = {
  column: KanbanColumn;
  tasks: KanbanTask[];

  isEditing: boolean;
  editTitle: string;
  canManage: boolean;
  isDragOver: boolean;
  taskInput: string;

  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;

  onEditingStart: () => void;
  onEditTitleChange: (value: string) => void;
  onEditCommit: () => void;
  onDelete: () => void;
  onColumnDragStart: (event: React.DragEvent) => void;

  onTaskInputChange: (value: string) => void;
  onAddTask: () => void;

  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;

  onTaskDragStart: (
    event: React.DragEvent,
    taskId: string,
  ) => void;

  onTaskDrop: (
    event: React.DragEvent,
    taskId: string,
    columnId: string,
  ) => void;
};

export default function KanbanColumn({
  column,
  tasks,
  isEditing,
  editTitle,
  canManage,
  isDragOver,
  taskInput,
  onDragOver,
  onDragLeave,
  onDrop,
  onEditingStart,
  onEditTitleChange,
  onEditCommit,
  onDelete,
  onColumnDragStart,
  onTaskInputChange,
  onAddTask,
  onSelectTask,
  onDeleteTask,
  onTaskDragStart,
  onTaskDrop,
}: Props) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex min-h-[600px] w-80 shrink-0 flex-col rounded-lg border bg-white shadow-sm transition ${
        isDragOver
          ? "border-gray-400 ring-2 ring-gray-200"
          : "border-gray-200"
      }`}
    >
      <ColumnHeader
        column={column}
        taskCount={tasks.length}
        isEditing={isEditing}
        editTitle={editTitle}
        canManage={canManage}
        onEditingStart={onEditingStart}
        onEditTitleChange={onEditTitleChange}
        onEditCommit={onEditCommit}
        onDelete={onDelete}
        onDragStart={onColumnDragStart}
      />

      <div className="flex-1 space-y-3 overflow-y-auto overflow-x-visible px-4 py-4 sm:px-5">
        {tasks.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
            Sem tarefas
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={() => onSelectTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              draggable
              onDragStart={(event) =>
                onTaskDragStart(event, task.id)
              }
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDrop={(event) =>
                onTaskDrop(
                  event,
                  task.id,
                  column.id,
                )
              }
            />
          ))
        )}
      </div>

      <AddTaskForm
        value={taskInput}
        onChange={onTaskInputChange}
        onSubmit={onAddTask}
      />
    </div>
  );
}