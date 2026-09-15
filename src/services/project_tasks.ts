// src/services/tasks.ts

import { createClient } from "@/app/lib/supabase/client";

const supabase = createClient();

export type TaskRow = {
  task_id: string;
  assigned_to: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  start_date: string | null;
  project_id: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  dueDate?: string;
  members?: string[];
  labels?: string[];
};

export type TaskColumn = {
  id: string;
  title: string;
};

export type TaskBoard = {
  tasks: Task[];
  columns: TaskColumn[];
};

export type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedHours?: number | null;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
};

/**
 * Convert the database task into the shape expected by the Kanban UI.
 */
function mapTask(row: TaskRow): Task {
  return {
    id: row.task_id,
    title: row.title,
    description: row.description ?? "",
    columnId: row.status,
    ...(row.due_date
      ? {
          dueDate: row.due_date,
        }
      : {}),
    labels: row.priority ? [row.priority] : [],
  };
}

/**
 * Create Kanban columns from the statuses that actually exist in Supabase.
 *
 * There is currently no task_columns table in the database.
 * Therefore, status is the Kanban column.
 */
function buildColumns(rows: TaskRow[]): TaskColumn[] {
  const statuses = Array.from(
    new Set(
      rows
        .map((task) => task.status?.trim())
        .filter(Boolean),
    ),
  );

  return statuses.map((status) => ({
    id: status,
    title: formatStatus(status),
  }));
}

function formatStatus(status: string) {
  return status
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Get all tasks belonging to a project.
 */
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getProjectTasks error:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as TaskRow[]).map(mapTask);
}

/**
 * Get the complete Kanban board for a project.
 *
 * Columns are derived from the task.status values because the current
 * database does not have a separate task_columns table.
 */
export async function getTaskBoard(projectId: string): Promise<TaskBoard> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getTaskBoard error:", error);
    throw new Error(error.message);
  }

  const rows = (data ?? []) as TaskRow[];

  return {
    tasks: rows.map(mapTask),
    columns: buildColumns(rows),
  };
}

/**
 * Create a task.
 *
 * assigned_to is required by the database.
 * If no assignee is provided, the currently authenticated user is used.
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  if (!input.projectId) {
    throw new Error("projectId is required.");
  }

  if (!input.title?.trim()) {
    throw new Error("Task title is required.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be authenticated to create a task.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: input.projectId,
      assigned_to: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status?.trim() || "todo",
      priority: input.priority?.trim() || "Medium",
      due_date: input.dueDate || null,
      start_date: input.startDate || null,
      estimated_hours: input.estimatedHours ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createTask error:", error);
    throw new Error(error.message);
  }

  return mapTask(data as TaskRow);
}

/**
 * Update an existing task.
 */
export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  if (!taskId) {
    throw new Error("taskId is required.");
  }

  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) {
    payload.title = input.title.trim();
  }

  if (input.description !== undefined) {
    payload.description = input.description.trim() || null;
  }

  if (input.status !== undefined) {
    payload.status = input.status.trim();
  }

  if (input.priority !== undefined) {
    payload.priority = input.priority.trim();
  }

  if (input.dueDate !== undefined) {
    payload.due_date = input.dueDate;
  }

  if (input.startDate !== undefined) {
    payload.start_date = input.startDate;
  }

  if (input.estimatedHours !== undefined) {
    payload.estimated_hours = input.estimatedHours;
  }

  if (input.actualHours !== undefined) {
    payload.actual_hours = input.actualHours;
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("task_id", taskId)
    .select("*")
    .single();

  if (error) {
    console.error("updateTask error:", error);
    throw new Error(error.message);
  }

  return mapTask(data as TaskRow);
}

/**
 * Move a task to another Kanban column.
 *
 * Since the database uses `status` as the Kanban column,
 * moving a task simply updates its status.
 */
export async function moveTask(
  taskId: string,
  columnId: string,
): Promise<Task> {
  if (!taskId) {
    throw new Error("taskId is required.");
  }

  if (!columnId) {
    throw new Error("columnId is required.");
  }

  return updateTask(taskId, {
    status: columnId,
  });
}

/**
 * Delete a task.
 */
export async function deleteTask(taskId: string): Promise<void> {
  if (!taskId) {
    throw new Error("taskId is required.");
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("task_id", taskId);

  if (error) {
    console.error("deleteTask error:", error);
    throw new Error(error.message);
  }
}

/**
 * Rename a Kanban column.
 *
 * Because there is no separate task_columns table, a column is represented
 * by a task status. Renaming therefore updates every task using that status.
 */
export async function renameTaskColumn(
  projectId: string,
  currentStatus: string,
  newStatus: string,
): Promise<void> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  if (!currentStatus) {
    throw new Error("currentStatus is required.");
  }

  if (!newStatus?.trim()) {
    throw new Error("newStatus is required.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: newStatus.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("project_id", projectId)
    .eq("status", currentStatus);

  if (error) {
    console.error("renameTaskColumn error:", error);
    throw new Error(error.message);
  }
}

/**
 * Delete a Kanban column.
 *
 * Tasks cannot be deleted automatically because a task must still have
 * a valid status. The caller should first move the tasks to another status.
 */
export async function getTaskColumnTasks(
  projectId: string,
  status: string,
): Promise<Task[]> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  if (!status) {
    throw new Error("status is required.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", status)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getTaskColumnTasks error:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as TaskRow[]).map(mapTask);
}