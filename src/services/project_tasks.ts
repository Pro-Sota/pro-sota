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
  is_completed: boolean;
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
  completed: boolean;
};

export type TaskMemberRow = {
  task_member_id: string;
  task_id: string;
  profile_id: string;
  created_at: string;
};

/* -------------------------------------------------------------------------- */
/* UI types                                                                   */
/* -------------------------------------------------------------------------- */

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

export type TaskMember = {
  profileId: string;
  name: string;
  picture: string | null;
  jobTitle: string | null;
};

export type Task = {
  id: string;
  projectId: string | null;
  title: string;
  description: string;
  columnId: string | null;
  priority: TaskPriority;
  assignedTo: string | null;
  assignedMembers: TaskMember[];
  completed: boolean;
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
  column_id: string;
  title: string;
  name: string;
  projectId: string | null;
  projectName: string | null;
  position: number;
  is_completed: boolean;
};

export type TaskBoard = {
  tasks: Task[];
  columns: TaskColumn[];
};

/* -------------------------------------------------------------------------- */
/* Inputs                                                                     */
/* -------------------------------------------------------------------------- */

export type CreateTaskColumnInput = {
  project_id: string | null;
  name: string;
  position?: number;
  is_completed?: boolean;
};

export type CreateTaskInput = {
  projectId?: string | null;
  title: string;
  description?: string;
  columnId?: string | null;
  assignedTo?: string | null;
  assignedMembers?: string[];
  priority?: TaskPriority;
  completed?: boolean;
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
  assignedMembers?: string[];
  priority?: TaskPriority;
  completed?: boolean;
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

function normalizeDate(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function mapTask(
  row: TaskRow,
  assignedMembers: TaskMember[] = [],
): Task {
  return {
    id: row.task_id,
    projectId: row.project_id ?? null,
    title: row.title,
    description: row.description ?? "",
    columnId: row.column_id ?? null,
    priority: row.priority,
    assignedTo: row.assigned_to ?? null,
    assignedMembers,
    completed: Boolean(row.completed),
    position: row.position,
    estimatedHours: row.estimated_hours ?? null,
    actualHours: row.actual_hours ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startDate: row.start_date ?? null,
    dueDate: row.due_date ?? null,
    labels: [],
    members: assignedMembers.map(
      (member) => member.profileId,
    ),
  };
}

function mapColumn(
  row: TaskColumnRow,
  projectName: string | null = null,
): TaskColumn {
  return {
    id: row.column_id,
    column_id: row.column_id,
    title: row.name,
    name: row.name,
    projectId: row.project_id ?? null,
    projectName,
    position: row.position,
    is_completed: Boolean(row.is_completed),
  };
}

/* -------------------------------------------------------------------------- */
/* Project names                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The provided project_tasks schema only guarantees the project_id relation.
 *
 * project_code is part of the existing Pro-Sota projects schema and is used
 * as the safe display fallback here instead of selecting non-existent columns
 * such as title, name or project_name.
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
    .select("project_id, project_code")
    .in(
      "project_id",
      uniqueProjectIds,
    );

  if (error) {
    console.error(
      "getProjectNames error:",
      error,
    );

    throw new Error(error.message);
  }

  for (const project of data ?? []) {
    if (
      !project.project_id ||
      typeof project.project_code !== "string"
    ) {
      continue;
    }

    const projectCode =
      project.project_code.trim();

    if (projectCode) {
      result.set(
        project.project_id,
        projectCode,
      );
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Task members                                                               */
/* -------------------------------------------------------------------------- */

async function getTaskMembers(
  taskIds: string[],
): Promise<Map<string, TaskMember[]>> {
  const result = new Map<
    string,
    TaskMember[]
  >();

  const uniqueTaskIds = [
    ...new Set(
      taskIds.filter(Boolean),
    ),
  ];

  if (uniqueTaskIds.length === 0) {
    return result;
  }

  const supabase = createClient();

  const {
    data: memberRows,
    error: memberError,
  } = await supabase
    .from("task_members")
    .select(
      "task_member_id, task_id, profile_id, created_at",
    )
    .in(
      "task_id",
      uniqueTaskIds,
    );

  if (memberError) {
    console.error(
      "getTaskMembers error:",
      memberError,
    );

    throw new Error(
      memberError.message,
    );
  }

  const rows =
    (memberRows ?? []) as TaskMemberRow[];

  if (rows.length === 0) {
    return result;
  }

  const profileIds = [
    ...new Set(
      rows.map(
        (row) => row.profile_id,
      ),
    ),
  ];

  if (profileIds.length === 0) {
    return result;
  }

  const {
    data: profiles,
    error: profilesError,
  } = await supabase
    .from("profiles")
    .select(
      "profile_id, first_name, last_name, job_title, picture",
    )
    .in(
      "profile_id",
      profileIds,
    );

  if (profilesError) {
    console.error(
      "getTaskMembers profiles error:",
      profilesError,
    );

    throw new Error(
      profilesError.message,
    );
  }

  const profileMap =
    new Map<
      string,
      {
        profile_id: string;
        first_name: string | null;
        last_name: string | null;
        job_title: string | null;
        picture: string | null;
      }
    >();

  for (const profile of profiles ?? []) {
    profileMap.set(
      profile.profile_id,
      profile,
    );
  }

  for (const row of rows) {
    const profile =
      profileMap.get(
        row.profile_id,
      );

    if (!profile) {
      continue;
    }

    const name =
      [
        profile.first_name,
        profile.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Utilizador";

    const member: TaskMember = {
      profileId:
        profile.profile_id,
      name,
      picture:
        profile.picture ?? null,
      jobTitle:
        profile.job_title ?? null,
    };

    const existing =
      result.get(row.task_id) ?? [];

    existing.push(member);

    result.set(
      row.task_id,
      existing,
    );
  }

  return result;
}

async function attachTaskMembers(
  rows: TaskRow[],
): Promise<Task[]> {
  if (rows.length === 0) {
    return [];
  }

  const membersByTask =
    await getTaskMembers(
      rows.map(
        (row) => row.task_id,
      ),
    );

  return rows.map((row) =>
    mapTask(
      row,
      membersByTask.get(
        row.task_id,
      ) ?? [],
    ),
  );
}

/* -------------------------------------------------------------------------- */
/* Task member mutations                                                      */
/* -------------------------------------------------------------------------- */

export async function updateTaskMembers(
  taskId: string,
  profileIds: string[],
): Promise<TaskMember[]> {
  if (!taskId) {
    throw new Error(
      "taskId is required.",
    );
  }

  const supabase = createClient();

  const uniqueProfileIds = [
    ...new Set(
      profileIds.filter(Boolean),
    ),
  ];

  const {
    error: deleteError,
  } = await supabase
    .from("task_members")
    .delete()
    .eq(
      "task_id",
      taskId,
    );

  if (deleteError) {
    console.error(
      "updateTaskMembers delete error:",
      deleteError,
    );

    throw new Error(
      deleteError.message,
    );
  }

  if (
    uniqueProfileIds.length === 0
  ) {
    return [];
  }

  const payload =
    uniqueProfileIds.map(
      (profileId) => ({
        task_id: taskId,
        profile_id: profileId,
      }),
    );

  const {
    error: insertError,
  } = await supabase
    .from("task_members")
    .insert(payload);

  if (insertError) {
    console.error(
      "updateTaskMembers insert error:",
      insertError,
    );

    throw new Error(
      insertError.message,
    );
  }

  const membersByTask =
    await getTaskMembers([
      taskId,
    ]);

  return (
    membersByTask.get(taskId) ?? []
  );
}

export async function getTaskAssignedMembers(
  taskId: string,
): Promise<TaskMember[]> {
  if (!taskId) {
    throw new Error(
      "taskId is required.",
    );
  }

  const membersByTask =
    await getTaskMembers([
      taskId,
    ]);

  return (
    membersByTask.get(taskId) ?? []
  );
}

/* -------------------------------------------------------------------------- */
/* Columns                                                                    */
/* -------------------------------------------------------------------------- */

export async function getTaskColumns(
  projectId: string | null,
): Promise<TaskColumn[]> {
  const supabase = createClient();

  const normalizedProjectId =
    normalizeProjectId(projectId);

  let query = supabase
    .from("task_columns")
    .select(
      "column_id, project_id, name, position, is_completed, created_at, updated_at",
    )
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

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
    .map(
      (row) => row.project_id,
    )
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
    .select(
      "column_id, project_id, name, position, is_completed, created_at, updated_at",
    )
    .eq(
      "column_id",
      columnId,
    )
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

export async function createTaskColumn(
  input: CreateTaskColumnInput,
): Promise<TaskColumn> {
  if (!input) {
    throw new Error(
      "Column input is required.",
    );
  }

  const name =
    input.name?.trim();

  if (!name) {
    throw new Error(
      "O nome da coluna é obrigatório.",
    );
  }

  const projectId =
    normalizeProjectId(
      input.project_id,
    );

  const position =
    input.position ?? 0;

  if (position < 0) {
    throw new Error(
      "position must be greater than or equal to 0.",
    );
  }

  const supabase = createClient();

  let duplicateQuery = supabase
    .from("task_columns")
    .select("column_id")
    .eq("name", name);

  if (projectId) {
    duplicateQuery =
      duplicateQuery.eq(
        "project_id",
        projectId,
      );
  } else {
    duplicateQuery =
      duplicateQuery.is(
        "project_id",
        null,
      );
  }

  const {
    data: existingColumn,
    error: existingColumnError,
  } = await duplicateQuery.maybeSingle();

  if (existingColumnError) {
    console.error(
      "createTaskColumn duplicate check error:",
      existingColumnError,
    );

    throw new Error(
      existingColumnError.message,
    );
  }

  if (existingColumn) {
    throw new Error(
      `A coluna "${name}" já existe neste projecto.`,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("task_columns")
    .insert({
      project_id: projectId,
      name,
      position,
      is_completed:
        input.is_completed ?? false,
    })
    .select(
      "column_id, project_id, name, position, is_completed, created_at, updated_at",
    )
    .single();

  if (error) {
    console.error(
      "createTaskColumn error:",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
    );

    if (error.code === "23505") {
      throw new Error(
        `A coluna "${name}" já existe neste projecto.`,
      );
    }

    throw new Error(
      error.message ||
        "Não foi possível criar a coluna.",
    );
  }

  return mapColumn(
    data as TaskColumnRow,
  );
}

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
    data: currentColumn,
    error: currentError,
  } = await supabase
    .from("task_columns")
    .select(
      "column_id, project_id, name, position, is_completed, created_at, updated_at",
    )
    .eq(
      "column_id",
      columnId,
    )
    .single();

  if (currentError) {
    throw new Error(
      currentError.message,
    );
  }

  const projectId =
    currentColumn.project_id ??
    null;

  let duplicateQuery = supabase
    .from("task_columns")
    .select("column_id")
    .eq("name", trimmedTitle)
    .neq(
      "column_id",
      columnId,
    );

  if (projectId) {
    duplicateQuery =
      duplicateQuery.eq(
        "project_id",
        projectId,
      );
  } else {
    duplicateQuery =
      duplicateQuery.is(
        "project_id",
        null,
      );
  }

  const {
    data: duplicate,
    error: duplicateError,
  } = await duplicateQuery.maybeSingle();

  if (duplicateError) {
    throw new Error(
      duplicateError.message,
    );
  }

  if (duplicate) {
    throw new Error(
      `A coluna "${trimmedTitle}" já existe neste projecto.`,
    );
  }

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
    .select(
      "column_id, project_id, name, position, is_completed, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapColumn(
    data as TaskColumnRow,
  );
}

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
    .select(
      "column_id, project_id, name, position, is_completed, created_at, updated_at",
    )
    .single();

  if (error) {
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

export async function updateTaskColumnCompletion(
  columnId: string,
  isCompleted: boolean,
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
    .update({
      is_completed: isCompleted,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "column_id",
      columnId,
    )
    .select(
      "column_id, project_id, name, position, is_completed, created_at, updated_at",
    )
    .single();

  if (error) {
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
 * The second argument is retained for backwards compatibility.
 */
export async function deleteTaskColumn(
  columnId: string,
  _columnId?: string,
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
    .select(
      "task_id, project_id, column_id, assigned_to, title, description, priority, start_date, due_date, estimated_hours, actual_hours, position, created_at, updated_at, completed",
    )
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
    throw new Error(error.message);
  }

  return attachTaskMembers(
    (data ?? []) as TaskRow[],
  );
}

export async function getGeneralTasks(): Promise<
  Task[]
> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .select(
      "task_id, project_id, column_id, assigned_to, title, description, priority, start_date, due_date, estimated_hours, actual_hours, position, created_at, updated_at, completed",
    )
    .is("project_id", null)
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return attachTaskMembers(
    (data ?? []) as TaskRow[],
  );
}

export async function getAllTasks(): Promise<
  Task[]
> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .select(
      "task_id, project_id, column_id, assigned_to, title, description, priority, start_date, due_date, estimated_hours, actual_hours, position, created_at, updated_at, completed",
    )
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return attachTaskMembers(
    (data ?? []) as TaskRow[],
  );
}

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
    .select(
      "task_id, project_id, column_id, assigned_to, title, description, priority, start_date, due_date, estimated_hours, actual_hours, position, created_at, updated_at, completed",
    )
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
    data,
    error,
  } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return attachTaskMembers(
    (data ?? []) as TaskRow[],
  );
}

/* -------------------------------------------------------------------------- */
/* Create task                                                                */
/* -------------------------------------------------------------------------- */

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
    input.priority ?? "Medium";

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

  const startDate =
    normalizeDate(
      input.startDate,
    );

  const dueDate =
    normalizeDate(
      input.dueDate,
    );

  if (
    startDate &&
    dueDate &&
    startDate > dueDate
  ) {
    throw new Error(
      "A data de início não pode ser posterior à data de conclusão.",
    );
  }

  const estimatedHours =
    input.estimatedHours ??
    null;

  const actualHours =
    input.actualHours ??
    null;

  if (
    estimatedHours !== null &&
    estimatedHours < 0
  ) {
    throw new Error(
      "estimatedHours must be greater than or equal to 0.",
    );
  }

  if (
    actualHours !== null &&
    actualHours < 0
  ) {
    throw new Error(
      "actualHours must be greater than or equal to 0.",
    );
  }

  const position =
    input.position ?? 0;

  if (position < 0) {
    throw new Error(
      "position must be greater than or equal to 0.",
    );
  }

  const assignedTo =
    input.assignedTo ?? null;

  const payload = {
    project_id: projectId,
    column_id: columnId,
    assigned_to: assignedTo,
    title: input.title.trim(),
    description:
      input.description?.trim() ||
      null,
    priority,
    completed:
      input.completed ?? false,
    due_date: dueDate,
    start_date: startDate,
    estimated_hours: estimatedHours,
    actual_hours: actualHours,
    position,
  };

  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .insert(payload)
    .select(
      "task_id, project_id, column_id, assigned_to, title, description, priority, start_date, due_date, estimated_hours, actual_hours, position, created_at, updated_at, completed",
    )
    .single();

  if (error) {
    console.error(
      "createTask error:",
      error,
    );

    throw new Error(error.message);
  }

  const task =
    data as TaskRow;

  const memberIds = [
    ...(input.assignedMembers ??
      []),
  ];

  const finalMemberIds =
    memberIds.length > 0
      ? memberIds
      : assignedTo
      ? [assignedTo]
      : [];

  if (finalMemberIds.length > 0) {
    await updateTaskMembers(
      task.task_id,
      finalMemberIds,
    );
  }

  return getTask(
    task.task_id,
  );
}

/* -------------------------------------------------------------------------- */
/* Update task                                                                */
/* -------------------------------------------------------------------------- */

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
      input.columnId || null;
  }

  if (
    input.assignedTo !==
    undefined
  ) {
    payload.assigned_to =
      input.assignedTo || null;
  }

  if (
    input.priority !==
    undefined
  ) {
    if (
      ![
        "Low",
        "Medium",
        "High",
        "Critical",
      ].includes(
        input.priority,
      )
    ) {
      throw new Error(
        "Invalid task priority.",
      );
    }

    payload.priority =
      input.priority;
  }

  if (
    input.completed !==
    undefined
  ) {
    payload.completed =
      input.completed;
  }

  if (
    input.dueDate !==
    undefined
  ) {
    payload.due_date =
      normalizeDate(
        input.dueDate,
      );
  }

  if (
    input.startDate !==
    undefined
  ) {
    payload.start_date =
      normalizeDate(
        input.startDate,
      );
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

  /* ------------------------------------------------------------------------ */
  /* Validate dates against the final values                                  */
  /* ------------------------------------------------------------------------ */

  if (
    input.startDate !==
      undefined ||
    input.dueDate !==
      undefined
  ) {
    const current =
      await getTask(taskId);

    const nextStart =
      input.startDate !==
      undefined
        ? normalizeDate(
            input.startDate,
          )
        : current.startDate;

    const nextDue =
      input.dueDate !==
      undefined
        ? normalizeDate(
            input.dueDate,
          )
        : current.dueDate;

    if (
      nextStart &&
      nextDue &&
      nextStart > nextDue
    ) {
      throw new Error(
        "A data de início não pode ser posterior à data de conclusão.",
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Update members separately                                                */
  /* ------------------------------------------------------------------------ */

  const shouldUpdateMembers =
    input.assignedMembers !==
    undefined;

  if (
    Object.keys(payload).length === 0 &&
    !shouldUpdateMembers
  ) {
    return getTask(taskId);
  }

  if (Object.keys(payload).length > 0) {
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
      .select(
        "task_id, project_id, column_id, assigned_to, title, description, priority, start_date, due_date, estimated_hours, actual_hours, position, created_at, updated_at, completed",
      )
      .single();

    if (error) {
      console.error(
        "updateTask error:",
        error,
      );

      throw new Error(
        error.message,
      );
    }

    if (
      !data?.task_id
    ) {
      throw new Error(
        "Task was not updated.",
      );
    }
  }

  if (shouldUpdateMembers) {
    await updateTaskMembers(
      taskId,
      input.assignedMembers ?? [],
    );
  }

  return getTask(taskId);
}

/* -------------------------------------------------------------------------- */
/* Get task                                                                   */
/* -------------------------------------------------------------------------- */

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
    .select(
      "task_id, project_id, column_id, assigned_to, title, description, priority, start_date, due_date, estimated_hours, actual_hours, position, created_at, updated_at, completed",
    )
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

  const row =
    data as TaskRow;

  const members =
    await getTaskAssignedMembers(
      row.task_id,
    );

  return mapTask(
    row,
    members,
  );
}

/* -------------------------------------------------------------------------- */
/* Move task                                                                  */
/* -------------------------------------------------------------------------- */

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
    .select(
      "task_id, project_id, column_id, assigned_to, title, description, priority, start_date, due_date, estimated_hours, actual_hours, position, created_at, updated_at, completed",
    )
    .single();

  if (error) {
    console.error(
      "moveTask error:",
      error,
    );

    throw new Error(error.message);
  }

  return getTask(
    (data as TaskRow).task_id,
  );
}

/* -------------------------------------------------------------------------- */
/* Task position                                                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Assignment                                                                 */
/* -------------------------------------------------------------------------- */

export async function assignTask(
  taskId: string,
  assignedTo: string | null,
): Promise<Task> {
  await updateTask(
    taskId,
    {
      assignedTo,
      assignedMembers:
        assignedTo
          ? [assignedTo]
          : [],
    },
  );

  return getTask(taskId);
}

/* -------------------------------------------------------------------------- */
/* Completion                                                                 */
/* -------------------------------------------------------------------------- */

export async function updateTaskCompletion(
  taskId: string,
  completed: boolean,
): Promise<Task> {
  return updateTask(
    taskId,
    {
      completed,
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Delete task                                                                */
/* -------------------------------------------------------------------------- */

export async function deleteTask(
  taskId: string,
): Promise<void> {
  if (!taskId) {
    throw new Error(
      "taskId is required.",
    );
  }

  const supabase = createClient();

  /*
   * task_members has ON DELETE CASCADE, but we explicitly remove the
   * memberships first so the service remains safe even if the FK changes.
   */

  const {
    error: membersError,
  } = await supabase
    .from("task_members")
    .delete()
    .eq(
      "task_id",
      taskId,
    );

  if (membersError) {
    console.error(
      "deleteTask task_members error:",
      membersError,
    );

    throw new Error(
      membersError.message,
    );
  }

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

  const normalizedProjectId =
    normalizeProjectId(
      projectId,
    );

  const results =
    await Promise.all(
      taskIds.map(
        (taskId, index) => {
          let query = supabase
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
            );

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

          return query.then(
            (result) => ({
              ...result,
              taskId,
            }),
          );
        },
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

  const normalizedProjectId =
    normalizeProjectId(
      projectId,
    );

  const results =
    await Promise.all(
      columnIds.map(
        (columnId, index) => {
          let query = supabase
            .from("task_columns")
            .update({
              position: index,
              updated_at: now,
            })
            .eq(
              "column_id",
              columnId,
            );

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

          return query;
        },
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