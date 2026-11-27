"use server";

import {
  createTask,
  deleteTask,
  reorderTasks,
  updateTask,
} from "../services/tasks";

import {
  submitTaskWork,
  reviewTaskWork,
} from "../services/task_submissions";

import type {
  CreateTaskInput,
  TaskScope,
  UpdateTaskInput,
} from "../types";

export async function createTaskAction(
  scope: TaskScope,
  input: CreateTaskInput,
) {
  return createTask(scope, input);
}

export async function updateTaskAction(
  taskId: string,
  input: UpdateTaskInput,
) {
  return updateTask(taskId, input);
}

export async function deleteTaskAction(taskId: string) {
  return deleteTask(taskId);
}

export async function reorderTasksAction({
  scope,
  columnId,
  orderedTaskIds,
}: {
  scope: TaskScope;
  columnId: string;
  orderedTaskIds: string[];
}) {
  return reorderTasks(scope, columnId, orderedTaskIds);
}

export async function submitTaskWorkAction(
  taskId: string,
  notes: string,
) {
  return submitTaskWork(taskId, notes);
}

export async function reviewTaskWorkAction(
  submissionId: string,
  decision: "approved" | "changes_requested",
  notes: string,
) {
  return reviewTaskWork(submissionId, decision, notes);
}