"use server";

import {
  createTaskColumn,
  deleteTaskColumn,
  reorderTaskColumns,
  updateTaskColumn,
} from "../services/task_columns";

import type {
  CreateColumnInput,
  TaskScope,
} from "../types";

export async function createTaskColumnAction(
  scope: TaskScope,
  input: CreateColumnInput,
) {
  return createTaskColumn(scope, input);
}

export async function updateTaskColumnAction(
  columnId: string,
  input: {
    name?: string;
    isCompleted?: boolean;
  },
) {
  return updateTaskColumn(columnId, input);
}

export async function deleteTaskColumnAction(
  columnId: string,
) {
  return deleteTaskColumn(columnId);
}

export async function reorderTaskColumnsAction(
  scope: TaskScope,
  orderedColumnIds: string[],
) {
  return reorderTaskColumns(scope, orderedColumnIds);
}