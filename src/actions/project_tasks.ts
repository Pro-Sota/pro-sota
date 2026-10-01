"use server";

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
  CreateTaskInput,
  CreateTaskColumnInput,
  UpdateTaskInput,
  Task,
  TaskColumn,
  TaskMember,
} from "@/services/project_tasks";

/* -------------------------------------------------------------------------- */
/* Columns                                                                    */
/* -------------------------------------------------------------------------- */

export async function createTaskColumnAction(
  input: CreateTaskColumnInput,
): Promise<TaskColumn> {
  return createTaskColumn(input);
}

export async function renameTaskColumnAction(
  columnId: string,
  newTitle: string,
): Promise<TaskColumn> {
  return renameTaskColumn(columnId, newTitle);
}

export async function deleteTaskColumnAction(
  columnId: string,
): Promise<void> {
  return deleteTaskColumn(columnId);
}

export async function reorderTaskColumnsAction(
  projectId: string | null,
  columnIds: string[],
): Promise<void> {
  return reorderTaskColumns(projectId, columnIds);
}

/* -------------------------------------------------------------------------- */
/* Tasks                                                                      */
/* -------------------------------------------------------------------------- */

export async function createTaskAction(
  input: CreateTaskInput,
): Promise<Task> {
  return createTask(input);
}

export async function updateTaskAction(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  return updateTask(taskId, input);
}

export async function deleteTaskAction(
  taskId: string,
): Promise<void> {
  return deleteTask(taskId);
}

export async function moveTaskAction(
  taskId: string,
  columnId: string | null,
  position?: number,
): Promise<Task> {
  return moveTask(taskId, columnId, position);
}

export async function reorderTasksAction(
  projectId: string | null,
  columnId: string | null,
  taskIds: string[],
): Promise<void> {
  return reorderTasks(projectId, columnId, taskIds);
}

/* -------------------------------------------------------------------------- */
/* Members                                                                    */
/* -------------------------------------------------------------------------- */

export async function updateTaskMembersAction(
  taskId: string,
  profileIds: string[],
): Promise<TaskMember[]> {
  return updateTaskMembers(taskId, profileIds);
}