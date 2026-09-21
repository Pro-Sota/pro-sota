// src/services/project_tasks.ts

import { createClient } from "@/app/lib/supabase/client";

/* -------------------------------------------------------------------------- */
/* Database types                                                             */
/* -------------------------------------------------------------------------- */

export type TaskColumnRow = {
  column_id: string;
  project_id: string | null;
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
  priority: TaskPriority;
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

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Task = {
  id: string;
  projectId: string | null;
  title: string;
  description: string;
  columnId: string | null;
  priority: TaskPriority;
  assignedTo: string | null;
  startDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  position: number;
  labels: string[];
  members: string[];
  createdAt: string;
  updatedAt: string;
};

export type TaskColumn = {
  id: string;
  title: string;
  projectId: string | null;
  position: number;
};

export type TaskBoard = {
  tasks: Task[];
  columns: TaskColumn[];
};

/* -------------------------------------------------------------------------- */
/* Inputs                                                                     */
/* -------------------------------------------------------------------------- */

export type CreateTaskInput = {
  projectId?: string | null;
  title: string;
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
    projectId: row.project_id ?? null,
    title: row.title,
    description: row.description ?? "",
    columnId: row.column_id ?? null,
    assignedTo: row.assigned_to ?? null,
    priority: row.priority,
    position: row.position,
    estimatedHours: row.estimated_hours ?? null,
    actualHours: row.actual_hours ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startDate: row.start_date ?? null,
    dueDate: row.due_date ?? null,
    labels: [],
    members: [],
  };
}

function mapColumn(row: TaskColumnRow): TaskColumn {
  return {
    id: row.column_id,
    title: row.name,
    projectId: row.project_id ?? null,
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
  projectId: string | null,
): Promise<TaskColumn[]> {
  const supabase = createClient();

  let query = supabase
    .from("task_columns")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (projectId) {
    query = query.eq("project_id", projectId);
  } else {
    query = query.is("project_id", null);
  }

  const { data, error } = await query;

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

  const supabase = createClient();

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
 * Create a Kanban column for a project or general tasks.
 *
 * projectId provided: creates a project-specific column
 * projectId = null: creates a general column
 */
export async function createTaskColumn(
  projectId: string | null,
  title: string,
  position?: number,
): Promise<TaskColumn> {
  if (!title?.trim()) {
    throw new Error("Column title is required.");
  }

  const supabase = createClient();

  let columnPosition = position;

  if (columnPosition === undefined) {
    let query = supabase
      .from("task_columns")
      .select("position")
      .order("position", { ascending: false })
      .limit(1);

    if (projectId) {
      query = query.eq("project_id", projectId);
    } else {
      query = query.is("project_id", null);
    }

    const { data: lastColumn, error: lastColumnError } =
      await query.maybeSingle();

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
      project_id: projectId ?? null,
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
  columnId: string,
  newTitle: string,
): Promise<TaskColumn> {
  if (!columnId) {
    throw new Error("columnId is required.");
  }

  if (!newTitle?.trim()) {
    throw new Error("newTitle is required.");
  }

  const supabase = createClient();

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

  const supabase = createClient();

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
 * tasks.column_id uses ON DELETE SET NULL,
 * therefore deleting the column does not delete its tasks.
 */
export async function deleteTaskColumn(
  columnId: string,
): Promise<void> {
  if (!columnId) {
    throw new Error("columnId is required.");
  }

  const supabase = createClient();

  const { error } = await supabase
    .from("task_columns")
    .delete()
    .eq("column_id", columnId);

  if (error) {
    console.error("deleteTaskColumn error:", error);
    throw new Error(error.message);
  }
}

/* -------------------------------------------------------------------------- */
/* Tasks                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Get all tasks belonging to a project.
 */
export async function getProjectTasks(
  projectId: string,
): Promise<Task[]> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  const supabase = createClient();

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
 * Get all general tasks (projectId = null).
 */
export async function getGeneralTasks(): Promise<Task[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .is("project_id", null)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getGeneralTasks error:", error);
    throw new Error(error.message);
  }

  return ((data ?? []) as TaskRow[]).map(mapTask);
}

/**
 * Get all tasks in a specific Kanban column for a project.
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

  const supabase = createClient();

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
 * Create a task.
 *
 * projectId is optional:
 *
 * - projectId = UUID -> project task
 * - projectId = null/undefined -> general/company task
 */
export async function createTask(
  input: CreateTaskInput,
): Promise<Task> {
  if (!input.title?.trim()) {
    throw new Error("Task title is required.");
  }

  const supabase = createClient();

  const payload: Record<string, unknown> = {
    project_id: input.projectId ?? null,
    column_id: input.columnId ?? null,
    assigned_to: input.assignedTo ?? null,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    priority: input.priority?.trim() || "Medium",
    due_date: input.dueDate || null,
    start_date: input.startDate || null,
    estimated_hours: input.estimatedHours ?? null,
    actual_hours: input.actualHours ?? null,
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

  const supabase = createClient();

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
    const priority = input.priority.trim();

    if (
      ![
        "Low",
        "Medium",
        "High",
        "Critical",
      ].includes(priority)
    ) {
      throw new Error(
        "Invalid task priority.",
      );
    }

    payload.priority = priority;
  }

  if (input.dueDate !== undefined) {
    payload.due_date = input.dueDate;
  }

  if (input.startDate !== undefined) {
    payload.start_date = input.startDate;
  }

  if (input.estimatedHours !== undefined) {
    if (
      input.estimatedHours !== null &&
      input.estimatedHours < 0
    ) {
      throw new Error(
        "estimatedHours must be greater than or equal to 0.",
      );
    }

    payload.estimated_hours =
      input.estimatedHours;
  }

  if (input.actualHours !== undefined) {
    if (
      input.actualHours !== null &&
      input.actualHours < 0
    ) {
      throw new Error(
        "actualHours must be greater than or equal to 0.",
      );
    }

    payload.actual_hours =
      input.actualHours;
  }

  if (input.position !== undefined) {
    if (input.position < 0) {
      throw new Error(
        "position must be greater than or equal to 0.",
      );
    }

    payload.position = input.position;
  }

  if (Object.keys(payload).length === 0) {
    return getTask(taskId);
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
 * Get a single task.
 */
export async function getTask(
  taskId: string,
): Promise<Task> {
  if (!taskId) {
    throw new Error("taskId is required.");
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("task_id", taskId)
    .single();

  if (error) {
    console.error("getTask error:", error);
    throw new Error(error.message);
  }

  return mapTask(data as TaskRow);
}

/**
 * Move a task to another Kanban column.
 */
export async function moveTask(
  taskId: string,
  columnId: string | null,
  position?: number,
): Promise<Task> {
  if (!taskId) {
    throw new Error("taskId is required.");
  }

  if (
    position !== undefined &&
    position < 0
  ) {
    throw new Error(
      "position must be greater than or equal to 0.",
    );
  }

  const supabase = createClient();

  const payload: Record<string, unknown> = {
    column_id: columnId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (position !== undefined) {
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

/**
 * Update a task's position.
 */
export async function updateTaskPosition(
  taskId: string,
  position: number,
): Promise<Task> {
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
 */
export async function assignTask(
  taskId: string,
  assignedTo: string | null,
): Promise<Task> {
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

  const supabase = createClient();

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
 * Reorder tasks inside a column (project or general).
 */
export async function reorderTasks(
  projectId: string | null,
  columnId: string | null,
  taskIds: string[],
): Promise<void> {
  if (!columnId) {
    throw new Error("columnId is required.");
  }

  if (!Array.isArray(taskIds)) {
    throw new Error("taskIds must be an array.");
  }

  if (taskIds.length === 0) {
    return;
  }

  const supabase = createClient();
  const now = new Date().toISOString();

  const results = await Promise.all(
    taskIds.map((taskId, index) =>
      supabase
        .from("tasks")
        .update({
          column_id: columnId,
          position: index,
          updated_at: now,
        })
        .eq("task_id", taskId)
        .then(result => ({
          ...result,
          taskId,
        })),
    ),
  );

  const failed = results.find(
    (result) => result.error,
  );

  if (failed?.error) {
    console.error(
      "reorderTasks error:",
      failed.error,
    );

    throw new Error(
      failed.error.message,
    );
  }
}

/**
 * Reorder Kanban columns for a project or general columns.
 */
export async function reorderTaskColumns(
  projectId: string | null,
  columnIds: string[],
): Promise<void> {
  if (!Array.isArray(columnIds)) {
    throw new Error(
      "columnIds must be an array.",
    );
  }

  if (columnIds.length === 0) {
    return;
  }

  const supabase = createClient();
  const now = new Date().toISOString();

  const results = await Promise.all(
    columnIds.map((columnId, index) =>
      supabase
        .from("task_columns")
        .update({
          position: index,
          updated_at: now,
        })
        .eq("column_id", columnId),
    ),
  );

  const failed = results.find(
    (result) => result.error,
  );

  if (failed?.error) {
    console.error(
      "reorderTaskColumns error:",
      failed.error,
    );

    throw new Error(
      failed.error.message,
    );
  }
}