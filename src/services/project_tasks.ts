// src/services/project_tasks.ts

import { createClient } from "@/app/lib/supabase/client";

const supabase = createClient();

/* -------------------------------------------------------------------------- */
/* Database types                                                             */
/* -------------------------------------------------------------------------- */

export type TaskColumnRow = {
  column_id: string;
  project_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TaskRow = {
  task_id: string;
  project_id: string | null;
  column_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  position: number;
  created_at: string;
  updated_at: string;
};

/* -------------------------------------------------------------------------- */
/* UI types                                                                   */
/* -------------------------------------------------------------------------- */

export type Task = {
  id: string;
  title: string;
  description: string;
  columnId: string;
  dueDate?: string;
  startDate?: string;
  members?: string[];
  labels?: string[];
  priority?: string;
  position?: number;
  assignedTo?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
};

export type TaskColumn = {
  id: string;
  title: string;
  position?: number;
};

export type TaskBoard = {
  tasks: Task[];
  columns: TaskColumn[];
};

/* -------------------------------------------------------------------------- */
/* Inputs                                                                     */
/* -------------------------------------------------------------------------- */

export type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  columnId?: string | null;
  assignedTo?: string | null;
  priority?: string;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedHours?: number | null;
  position?: number;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  columnId?: string | null;
  assignedTo?: string | null;
  priority?: string;
  dueDate?: string | null;
  startDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  position?: number;
};

/* -------------------------------------------------------------------------- */
/* Mapping helpers                                                            */
/* -------------------------------------------------------------------------- */

function mapTask(row: TaskRow): Task {
  return {
    id: row.task_id,
    title: row.title,
    description: row.description ?? "",
    columnId: row.column_id ?? "",
    assignedTo: row.assigned_to ?? null,
    priority: row.priority,
    position: row.position,
    estimatedHours: row.estimated_hours ?? null,
    actualHours: row.actual_hours ?? null,

    ...(row.start_date
      ? {
          startDate: row.start_date,
        }
      : {}),

    ...(row.due_date
      ? {
          dueDate: row.due_date,
        }
      : {}),

    labels: row.priority ? [row.priority] : [],
    members: row.assigned_to ? [row.assigned_to] : [],
  };
}

function mapColumn(row: TaskColumnRow): TaskColumn {
  return {
    id: row.column_id,
    title: row.name,
    position: row.position,
  };
}

/* -------------------------------------------------------------------------- */
/* Columns                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Get all Kanban columns belonging to a project.
 */
export async function getTaskColumns(
  projectId: string,
): Promise<TaskColumn[]> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  const { data, error } = await supabase
    .from("task_columns")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getTaskColumns error:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as TaskColumnRow[]).map(mapColumn);
}

/**
 * Get a single Kanban column.
 */
export async function getTaskColumn(
  columnId: string,
): Promise<TaskColumn> {
  if (!columnId) {
    throw new Error("columnId is required.");
  }

  const { data, error } = await supabase
    .from("task_columns")
    .select("*")
    .eq("column_id", columnId)
    .single();

  if (error) {
    console.error("getTaskColumn error:", error);
    throw new Error(error.message);
  }

  return mapColumn(data as TaskColumnRow);
}

/**
 * Create a Kanban column.
 */
export async function createTaskColumn(
  projectId: string,
  title: string,
  position?: number,
): Promise<TaskColumn> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  if (!title?.trim()) {
    throw new Error("Column title is required.");
  }

  let columnPosition = position;

  if (columnPosition === undefined) {
    const { data: lastColumn, error: lastColumnError } = await supabase
      .from("task_columns")
      .select("position")
      .eq("project_id", projectId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastColumnError) {
      console.error(
        "createTaskColumn position lookup error:",
        lastColumnError,
      );

      throw new Error(lastColumnError.message);
    }

    columnPosition = lastColumn
      ? Number(lastColumn.position) + 1
      : 0;
  }

  const { data, error } = await supabase
    .from("task_columns")
    .insert({
      project_id: projectId,
      name: title.trim(),
      position: columnPosition,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createTaskColumn error:", error);
    throw new Error(error.message);
  }

  return mapColumn(data as TaskColumnRow);
}

/**
 * Rename a Kanban column.
 */
export async function renameTaskColumn(
columnId: string, newTitle: string, title: string,
): Promise<TaskColumn> {
  if (!columnId) {
    throw new Error("columnId is required.");
  }

  if (!newTitle?.trim()) {
    throw new Error("newTitle is required.");
  }

  const { data, error } = await supabase
    .from("task_columns")
    .update({
      name: newTitle.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("column_id", columnId)
    .select("*")
    .single();

  if (error) {
    console.error("renameTaskColumn error:", error);
    throw new Error(error.message);
  }

  return mapColumn(data as TaskColumnRow);
}

/**
 * Update the position of a Kanban column.
 */
export async function updateTaskColumnPosition(
  columnId: string,
  position: number,
): Promise<TaskColumn> {
  if (!columnId) {
    throw new Error("columnId is required.");
  }

  if (position < 0) {
    throw new Error("position must be greater than or equal to 0.");
  }

  const { data, error } = await supabase
    .from("task_columns")
    .update({
      position,
      updated_at: new Date().toISOString(),
    })
    .eq("column_id", columnId)
    .select("*")
    .single();

  if (error) {
    console.error("updateTaskColumnPosition error:", error);
    throw new Error(error.message);
  }

  return mapColumn(data as TaskColumnRow);
}

/**
 * Delete a Kanban column.
 *
 * Because tasks.column_id has ON DELETE SET NULL,
 * deleting a column will not delete its tasks.
 */
export async function deleteTaskColumn(
  columnId: string,
): Promise<void> {
  if (!columnId) {
    throw new Error("columnId is required.");
  }

  const { error } = await supabase
    .from("task_columns")
    .delete()
    .eq("column_id", columnId);

  if (error) {
    console.error("deleteTaskColumn error:", error);
    throw new Error(error.message);
  }
}

/**
 * Move a task to another Kanban column.
 */
export async function moveTask(
  taskId: string,
  columnId: string,
  position?: number,
): Promise<Task> {
  if (!taskId) {
    throw new Error("taskId is required.");
  }

  if (!columnId) {
    throw new Error("columnId is required.");
  }

  const payload: Record<string, unknown> = {
    column_id: columnId,
    updated_at: new Date().toISOString(),
  };

  if (position !== undefined) {
    if (position < 0) {
      throw new Error("position must be greater than or equal to 0.");
    }

    payload.position = position;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("task_id", taskId)
    .select("*")
    .single();

  if (error) {
    console.error("moveTask error:", error);
    throw new Error(error.message);
  }

  return mapTask(data as TaskRow);
}

/* -------------------------------------------------------------------------- */
/* Tasks                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Get all tasks belonging to a project.
 *
 * Tasks are ordered by their Kanban column position first,
 * then by their position inside the column.
 */
export async function getProjectTasks(
  projectId: string,
): Promise<Task[]> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getProjectTasks error:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as TaskRow[]).map(mapTask);
}

/**
 * Get all tasks in a specific Kanban column.
 */
export async function getTaskColumnTasks(
  projectId: string,
  columnId: string,
): Promise<Task[]> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  if (!columnId) {
    throw new Error("columnId is required.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("column_id", columnId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getTaskColumnTasks error:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as TaskRow[]).map(mapTask);
}

/**
 * Get the complete Kanban board for a project.
 */
export async function getTaskBoard(
  projectId: string,
): Promise<TaskBoard> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  const [columnsResult, tasksResult] = await Promise.all([
    supabase
      .from("task_columns")
      .select("*")
      .eq("project_id", projectId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),

    supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (columnsResult.error) {
    console.error(
      "getTaskBoard columns error:",
      columnsResult.error,
    );

    throw new Error(columnsResult.error.message);
  }

  if (tasksResult.error) {
    console.error(
      "getTaskBoard tasks error:",
      tasksResult.error,
    );

    throw new Error(tasksResult.error.message);
  }

  const columns = (
    (columnsResult.data ?? []) as TaskColumnRow[]
  ).map(mapColumn);

  const tasks = (
    (tasksResult.data ?? []) as TaskRow[]
  ).map(mapTask);

  return {
    columns,
    tasks,
  };
}

/**
 * Create a task.
 *
 * `assigned_to` is nullable in the database, so an assignee
 * is not required when creating a task.
 */
export async function createTask(
  input: CreateTaskInput,
): Promise<Task> {
  if (!input.projectId) {
    throw new Error("projectId is required.");
  }

  if (!input.title?.trim()) {
    throw new Error("Task title is required.");
  }

  const payload: Record<string, unknown> = {
    project_id: input.projectId,
    column_id: input.columnId ?? null,
    assigned_to: input.assignedTo ?? null,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    priority: input.priority?.trim() || "Medium",
    due_date: input.dueDate || null,
    start_date: input.startDate || null,
    estimated_hours: input.estimatedHours ?? null,
    position: input.position ?? 0,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(payload)
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
    const title = input.title.trim();

    if (!title) {
      throw new Error("Task title cannot be empty.");
    }

    payload.title = title;
  }

  if (input.description !== undefined) {
    payload.description =
      input.description.trim() || null;
  }

  if (input.columnId !== undefined) {
    payload.column_id = input.columnId;
  }

  if (input.assignedTo !== undefined) {
    payload.assigned_to = input.assignedTo;
  }

  if (input.priority !== undefined) {
    payload.priority = input.priority.trim() || "Medium";
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

  if (input.position !== undefined) {
    if (input.position < 0) {
      throw new Error(
        "position must be greater than or equal to 0.",
      );
    }

    payload.position = input.position;
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
 * Update a task's position inside a Kanban column.
 */
export async function updateTaskPosition(
  taskId: string,
  position: number,
): Promise<Task> {
  if (!taskId) {
    throw new Error("taskId is required.");
  }

  if (position < 0) {
    throw new Error(
      "position must be greater than or equal to 0.",
    );
  }

  return updateTask(taskId, {
    position,
  });
}

/**
 * Assign a task to a profile.
 *
 * Passing null removes the assignee.
 */
export async function assignTask(
  taskId: string,
  assignedTo: string | null,
): Promise<Task> {
  if (!taskId) {
    throw new Error("taskId is required.");
  }

  return updateTask(taskId, {
    assignedTo,
  });
}

/**
 * Delete a task.
 */
export async function deleteTask(
  taskId: string,
): Promise<void> {
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

/* -------------------------------------------------------------------------- */
/* Reordering                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Reorder tasks inside a Kanban column.
 *
 * `taskIds` must be supplied in the desired order.
 *
 * Example:
 *
 * await reorderTasks("project-id", "column-id", [
 *   "task-3",
 *   "task-1",
 *   "task-2",
 * ]);
 */
export async function reorderTasks(
  projectId: string,
  columnId: string,
  taskIds: string[],
): Promise<void> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  if (!columnId) {
    throw new Error("columnId is required.");
  }

  if (!Array.isArray(taskIds)) {
    throw new Error("taskIds must be an array.");
  }

  if (taskIds.length === 0) {
    return;
  }

  const updates = taskIds.map((taskId, index) => ({
    task_id: taskId,
    project_id: projectId,
    column_id: columnId,
    position: index,
    updated_at: new Date().toISOString(),
  }));

  const results = await Promise.all(
    updates.map((update) =>
      supabase
        .from("tasks")
        .update({
          column_id: update.column_id,
          position: update.position,
          updated_at: update.updated_at,
        })
        .eq("task_id", update.task_id)
        .eq("project_id", projectId),
    ),
  );

  const failed = results.find((result) => result.error);

  if (failed?.error) {
    console.error(
      "reorderTasks error:",
      failed.error,
    );

    throw new Error(failed.error.message);
  }
}

/**
 * Reorder Kanban columns.
 *
 * `columnIds` must be supplied in the desired order.
 */
export async function reorderTaskColumns(
  projectId: string,
  columnIds: string[],
): Promise<void> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  if (!Array.isArray(columnIds)) {
    throw new Error("columnIds must be an array.");
  }

  if (columnIds.length === 0) {
    return;
  }

  const results = await Promise.all(
    columnIds.map((columnId, index) =>
      supabase
        .from("task_columns")
        .update({
          position: index,
          updated_at: new Date().toISOString(),
        })
        .eq("column_id", columnId)
        .eq("project_id", projectId),
    ),
  );

  const failed = results.find((result) => result.error);

  if (failed?.error) {
    console.error(
      "reorderTaskColumns error:",
      failed.error,
    );

    throw new Error(failed.error.message);
  }
}