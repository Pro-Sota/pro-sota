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

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

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
  column_id: string;
  is_completed: boolean;
  id: string;
  title: string;
  projectId: string | null;
  projectName: string | null;
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
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeProjectId(
  projectId: string | null | undefined,
): string | null {
  const value = projectId?.trim();

  return value ? value : null;
}

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

function mapColumn(
  row: TaskColumnRow,
  projectName: string | null = null,
): TaskColumn {
  return {
  id: row.column_id,
  title: row.name,
  projectId: row.project_id ?? null,
  projectName,
  position: row.position,
  column_id: "",
  is_completed: false,
};
}

/* -------------------------------------------------------------------------- */
/* Project names                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Loads project names for a set of project IDs.
 *
 * This is used by the general tasks board because that board displays
 * columns belonging to multiple projects.
 */
async function getProjectNames(
  projectIds: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();

  const uniqueProjectIds = [
    ...new Set(
      projectIds.filter(Boolean),
    ),
  ];

  if (uniqueProjectIds.length === 0) {
    return result;
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("projects")
    .select("*")
    .in("project_id", uniqueProjectIds);

  if (error) {
    console.error(
      "getProjectNames error:",
      error,
    );

    throw new Error(error.message);
  }

  for (const project of data ?? []) {
    const projectId =
      project.project_id;

    if (!projectId) {
      continue;
    }

    /*
     * Support the possible project-name fields used by the project
     * schema. The first non-empty value is used for display.
     */
    const projectName =
      typeof project.title === "string" &&
      project.title.trim()
        ? project.title.trim()
        : typeof project.name === "string" &&
          project.name.trim()
        ? project.name.trim()
        : typeof project.project_name === "string" &&
          project.project_name.trim()
        ? project.project_name.trim()
        : typeof project.project_code === "string" &&
          project.project_code.trim()
        ? project.project_code.trim()
        : null;

    if (projectName) {
      result.set(
        projectId,
        projectName,
      );
    }
  }

  return result;
}
/* -------------------------------------------------------------------------- */
/* Columns                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Get Kanban columns.
 *
 * When projectId is provided:
 *   returns only columns belonging to that project.
 *
 * When projectId is null:
 *   returns ALL columns:
 *   - general columns
 *   - project-specific columns
 *
 * This is important for the general tasks board, where project columns
 * must also be visible.
 */
export async function getTaskColumns(
  projectId: string | null,
): Promise<TaskColumn[]> {
  const supabase = createClient();

  const normalizedProjectId =
    normalizeProjectId(projectId);

  let query = supabase
    .from("task_columns")
    .select("*")
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  /*
   * Project board:
   * only that project's columns.
   *
   * General board:
   * ALL columns, including project columns.
   */
  if (normalizedProjectId) {
    query = query.eq(
      "project_id",
      normalizedProjectId,
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "getTaskColumns error:",
      error,
    );

    throw new Error(error.message);
  }

  const rows =
    (data ?? []) as TaskColumnRow[];

  const projectIds = rows
    .map((row) => row.project_id)
    .filter(
      (id): id is string =>
        Boolean(id),
    );

  const projectNames =
    await getProjectNames(
      projectIds,
    );

  return rows.map((row) =>
    mapColumn(
      row,
      row.project_id
        ? projectNames.get(
            row.project_id,
          ) ?? null
        : null,
    ),
  );
}

/**
 * Get a single Kanban column.
 */
export async function getTaskColumn(
  columnId: string,
): Promise<TaskColumn> {
  if (!columnId) {
    throw new Error(
      "columnId is required.",
    );
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("task_columns")
    .select("*")
    .eq("column_id", columnId)
    .single();

  if (error) {
    console.error(
      "getTaskColumn error:",
      error,
    );

    throw new Error(error.message);
  }

  const row =
    data as TaskColumnRow;

  if (!row.project_id) {
    return mapColumn(row);
  }

  const projectNames =
    await getProjectNames([
      row.project_id,
    ]);

  return mapColumn(
    row,
    projectNames.get(
      row.project_id,
    ) ?? null,
  );
}

/**
 * Create a Kanban column.
 *
 * projectId = UUID:
 *   creates a project-specific column.
 *
 * projectId = null / "":
 *   creates a general column.
 */
export async function createTaskColumn(
  projectId: string | null,
  title: string,
  position?: number,
): Promise<TaskColumn> {
  const trimmedTitle =
    title?.trim();

  if (!trimmedTitle) {
    throw new Error(
      "Column title is required.",
    );
  }

  const supabase = createClient();

  const normalizedProjectId =
    normalizeProjectId(projectId);

  let columnPosition = position;

  if (columnPosition === undefined) {
    let query = supabase
      .from("task_columns")
      .select("position")
      .order("position", {
        ascending: false,
      })
      .limit(1);

    if (normalizedProjectId) {
      query = query.eq(
        "project_id",
        normalizedProjectId,
      );
    } else {
      query = query.is(
        "project_id",
        null,
      );
    }

    const {
      data: lastColumn,
      error: lastColumnError,
    } = await query.maybeSingle();

    if (lastColumnError) {
      console.error(
        "createTaskColumn position lookup error:",
        lastColumnError,
      );

      throw new Error(
        lastColumnError.message,
      );
    }

    columnPosition = lastColumn
      ? Number(
          lastColumn.position,
        ) + 1
      : 0;
  }

  const {
    data,
    error,
  } = await supabase
    .from("task_columns")
    .insert({
      project_id:
        normalizedProjectId,
      name: trimmedTitle,
      position: columnPosition,
    })
    .select("*")
    .single();

  if (error) {
    console.error(
      "createTaskColumn error:",
      error,
    );

    throw new Error(error.message);
  }

  const row =
    data as TaskColumnRow;

  let projectName: string | null =
    null;

  if (row.project_id) {
    const projectNames =
      await getProjectNames([
        row.project_id,
      ]);

    projectName =
      projectNames.get(
        row.project_id,
      ) ?? null;
  }

  return mapColumn(
    row,
    projectName,
  );
}

/**
 * Rename a Kanban column.
 */
export async function renameTaskColumn(
  columnId: string,
  newTitle: string,
): Promise<TaskColumn> {
  if (!columnId) {
    throw new Error(
      "columnId is required.",
    );
  }

  const trimmedTitle =
    newTitle?.trim();

  if (!trimmedTitle) {
    throw new Error(
      "newTitle is required.",
    );
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("task_columns")
    .update({
      name: trimmedTitle,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "column_id",
      columnId,
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "renameTaskColumn error:",
      error,
    );

    throw new Error(error.message);
  }

  const row =
    data as TaskColumnRow;

  if (!row.project_id) {
    return mapColumn(row);
  }

  const projectNames =
    await getProjectNames([
      row.project_id,
    ]);

  return mapColumn(
    row,
    projectNames.get(
      row.project_id,
    ) ?? null,
  );
}

/**
 * Update the position of a Kanban column.
 */
export async function updateTaskColumnPosition(
  columnId: string,
  position: number,
): Promise<TaskColumn> {
  if (!columnId) {
    throw new Error(
      "columnId is required.",
    );
  }

  if (position < 0) {
    throw new Error(
      "position must be greater than or equal to 0.",
    );
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("task_columns")
    .update({
      position,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "column_id",
      columnId,
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "updateTaskColumnPosition error:",
      error,
    );

    throw new Error(error.message);
  }

  const row =
    data as TaskColumnRow;

  if (!row.project_id) {
    return mapColumn(row);
  }

  const projectNames =
    await getProjectNames([
      row.project_id,
    ]);

  return mapColumn(
    row,
    projectNames.get(
      row.project_id,
    ) ?? null,
  );
}

/**
 * Delete a Kanban column.
 *
 * tasks.column_id uses ON DELETE SET NULL.
 */
export async function deleteTaskColumn(
  columnId: string,
): Promise<void> {
  if (!columnId) {
    throw new Error(
      "columnId is required.",
    );
  }

  const supabase = createClient();

  const {
    error,
  } = await supabase
    .from("task_columns")
    .delete()
    .eq(
      "column_id",
      columnId,
    );

  if (error) {
    console.error(
      "deleteTaskColumn error:",
      error,
    );

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
  if (!projectId?.trim()) {
    throw new Error(
      "projectId is required.",
    );
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .select("*")
    .eq(
      "project_id",
      projectId,
    )
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "getProjectTasks error:",
      error,
    );

    throw new Error(error.message);
  }

  return (
    (data ?? []) as TaskRow[]
  ).map(mapTask);
}

/**
 * Get all general tasks.
 *
 * These are tasks with project_id = null.
 */
export async function getGeneralTasks(): Promise<
  Task[]
> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .select("*")
    .is("project_id", null)
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "getGeneralTasks error:",
      error,
    );

    throw new Error(error.message);
  }

  return (
    (data ?? []) as TaskRow[]
  ).map(mapTask);
}

/**
 * Get ALL tasks.
 *
 * This is intended for the general/company Kanban board when the board
 * should show both general tasks and project tasks.
 */
export async function getAllTasks(): Promise<
  Task[]
> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .select("*")
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error(
      "getAllTasks error:",
      error,
    );

    throw new Error(error.message);
  }

  return (
    (data ?? []) as TaskRow[]
  ).map(mapTask);
}

/**
 * Get all tasks for a specific column.
 *
 * This does not require a project ID because a column may be a general
 * column or a project column.
 */
export async function getTaskColumnTasks(
  projectId: string | null,
  columnId: string,
): Promise<Task[]> {
  if (!columnId) {
    throw new Error(
      "columnId is required.",
    );
  }

  const supabase = createClient();

  let query = supabase
    .from("tasks")
    .select("*")
    .eq(
      "column_id",
      columnId,
    )
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  const normalizedProjectId =
    normalizeProjectId(projectId);

  /*
   * When a project is explicitly supplied, preserve the existing
   * project-specific behaviour.
   */
  if (normalizedProjectId) {
    query = query.eq(
      "project_id",
      normalizedProjectId,
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "getTaskColumnTasks error:",
      error,
    );

    throw new Error(error.message);
  }

  return (
    (data ?? []) as TaskRow[]
  ).map(mapTask);
}

/**
 * Create a task.
 */
export async function createTask(
  input: CreateTaskInput,
): Promise<Task> {
  if (!input.title?.trim()) {
    throw new Error(
      "Task title is required.",
    );
  }

  const supabase = createClient();

  const projectId =
    normalizeProjectId(
      input.projectId,
    );

  const columnId =
    input.columnId?.trim() || null;

  const priority =
    input.priority?.trim() ||
    "Medium";

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

  const payload: Record<
    string,
    unknown
  > = {
    project_id: projectId,
    column_id: columnId,
    assigned_to:
      input.assignedTo ?? null,
    title: input.title.trim(),
    description:
      input.description?.trim() ||
      null,
    priority,
    due_date:
      input.dueDate || null,
    start_date:
      input.startDate || null,
    estimated_hours:
      input.estimatedHours ?? null,
    actual_hours:
      input.actualHours ?? null,
    position:
      input.position ?? 0,
  };

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error(
      "createTask error:",
      error,
    );

    throw new Error(error.message);
  }

  return mapTask(
    data as TaskRow,
  );
}

/**
 * Update an existing task.
 */
export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  if (!taskId) {
    throw new Error(
      "taskId is required.",
    );
  }

  const supabase = createClient();

  const payload: Record<
    string,
    unknown
  > = {};

  if (input.title !== undefined) {
    const title =
      input.title.trim();

    if (!title) {
      throw new Error(
        "Task title cannot be empty.",
      );
    }

    payload.title = title;
  }

  if (
    input.description !==
    undefined
  ) {
    payload.description =
      input.description.trim() ||
      null;
  }

  if (
    input.columnId !==
    undefined
  ) {
    payload.column_id =
      input.columnId;
  }

  if (
    input.assignedTo !==
    undefined
  ) {
    payload.assigned_to =
      input.assignedTo;
  }

  if (
    input.priority !==
    undefined
  ) {
    const priority =
      input.priority.trim();

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

    payload.priority =
      priority;
  }

  if (
    input.dueDate !==
    undefined
  ) {
    payload.due_date =
      input.dueDate;
  }

  if (
    input.startDate !==
    undefined
  ) {
    payload.start_date =
      input.startDate;
  }

  if (
    input.estimatedHours !==
    undefined
  ) {
    if (
      input.estimatedHours !==
        null &&
      input.estimatedHours < 0
    ) {
      throw new Error(
        "estimatedHours must be greater than or equal to 0.",
      );
    }

    payload.estimated_hours =
      input.estimatedHours;
  }

  if (
    input.actualHours !==
    undefined
  ) {
    if (
      input.actualHours !==
        null &&
      input.actualHours < 0
    ) {
      throw new Error(
        "actualHours must be greater than or equal to 0.",
      );
    }

    payload.actual_hours =
      input.actualHours;
  }

  if (
    input.position !==
    undefined
  ) {
    if (input.position < 0) {
      throw new Error(
        "position must be greater than or equal to 0.",
      );
    }

    payload.position =
      input.position;
  }

  if (
    Object.keys(payload)
      .length === 0
  ) {
    return getTask(taskId);
  }

  payload.updated_at =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .update(payload)
    .eq(
      "task_id",
      taskId,
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "updateTask error:",
      error,
    );

    throw new Error(error.message);
  }

  return mapTask(
    data as TaskRow,
  );
}

/**
 * Get a single task.
 */
export async function getTask(
  taskId: string,
): Promise<Task> {
  if (!taskId) {
    throw new Error(
      "taskId is required.",
    );
  }

  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .select("*")
    .eq(
      "task_id",
      taskId,
    )
    .single();

  if (error) {
    console.error(
      "getTask error:",
      error,
    );

    throw new Error(error.message);
  }

  return mapTask(
    data as TaskRow,
  );
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
    throw new Error(
      "taskId is required.",
    );
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

  const payload: Record<
    string,
    unknown
  > = {
    column_id:
      columnId ?? null,
    updated_at:
      new Date().toISOString(),
  };

  if (position !== undefined) {
    payload.position =
      position;
  }

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .update(payload)
    .eq(
      "task_id",
      taskId,
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "moveTask error:",
      error,
    );

    throw new Error(error.message);
  }

  return mapTask(
    data as TaskRow,
  );
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

  return updateTask(
    taskId,
    {
      position,
    },
  );
}

/**
 * Assign a task to a profile.
 */
export async function assignTask(
  taskId: string,
  assignedTo: string | null,
): Promise<Task> {
  return updateTask(
    taskId,
    {
      assignedTo,
    },
  );
}

/**
 * Delete a task.
 */
export async function deleteTask(
  taskId: string,
): Promise<void> {
  if (!taskId) {
    throw new Error(
      "taskId is required.",
    );
  }

  const supabase = createClient();

  const {
    error,
  } = await supabase
    .from("tasks")
    .delete()
    .eq(
      "task_id",
      taskId,
    );

  if (error) {
    console.error(
      "deleteTask error:",
      error,
    );

    throw new Error(error.message);
  }
}

/* -------------------------------------------------------------------------- */
/* Reordering                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Reorder tasks inside a column.
 *
 * projectId is intentionally accepted for backwards compatibility with
 * the existing Kanban component. The task IDs determine which rows are
 * updated.
 */
export async function reorderTasks(
  projectId: string | null,
  columnId: string | null,
  taskIds: string[],
): Promise<void> {
  if (!columnId) {
    throw new Error(
      "columnId is required.",
    );
  }

  if (!Array.isArray(taskIds)) {
    throw new Error(
      "taskIds must be an array.",
    );
  }

  if (taskIds.length === 0) {
    return;
  }

  const supabase = createClient();
  const now =
    new Date().toISOString();

  const results =
    await Promise.all(
      taskIds.map(
        (taskId, index) =>
          supabase
            .from("tasks")
            .update({
              column_id:
                columnId,
              position: index,
              updated_at: now,
            })
            .eq(
              "task_id",
              taskId,
            )
            .then((result) => ({
              ...result,
              taskId,
            })),
      ),
    );

  const failed =
    results.find(
      (result) =>
        result.error,
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
 * Reorder Kanban columns.
 *
 * projectId is used only to determine which columns are expected to
 * be reordered by the caller. The actual updates are performed by ID.
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
  const now =
    new Date().toISOString();

  const results =
    await Promise.all(
      columnIds.map(
        (columnId, index) =>
          supabase
            .from("task_columns")
            .update({
              position: index,
              updated_at: now,
            })
            .eq(
              "column_id",
              columnId,
            ),
      ),
    );

  const failed =
    results.find(
      (result) =>
        result.error,
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