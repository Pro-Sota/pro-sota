import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function getProjects() {
  try {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.from("projects").select("*");
    if (error) throw new Error(error.message);

    console.log("data: " + data)
    return data;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

// src/services/project_tasks_server.ts


import type {
  Task,
  TaskBoard,
  TaskColumn,
  TaskRow,
  TaskColumnRow,
} from "@/services/project_tasks";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function mapTask(row: TaskRow): Task {
  return {
  id: row.task_id,
  projectId: row.project_id,
  title: row.title,
  description: row.description ?? "",
  columnId: row.column_id,
  assignedTo: row.assigned_to,
  priority: row.priority,
  startDate: row.start_date,
  dueDate: row.due_date,
  estimatedHours: row.estimated_hours,
  actualHours: row.actual_hours,
  position: row.position,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  labels: [],
  members: [],
};
}

function mapColumn(row: TaskColumnRow): TaskColumn {
  return {
    id: row.column_id,
    title: row.name,
    projectId: row.project_id,
    position: row.position,
  };
}

/* -------------------------------------------------------------------------- */
/* Server task board                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Get the Kanban board on the server.
 *
 * projectId provided:
 *   - Returns only tasks belonging to that project.
 *   - Returns only columns belonging to that project.
 *
 * projectId omitted/null:
 *   - Returns ALL tasks.
 *   - Returns all project columns.
 *   - Tasks without a column are represented by the virtual "Sem lista" column.
 *
 * This function is intended to be called from Server Components.
 */
export async function getTaskBoard(
  projectId?: string | null,
): Promise<TaskBoard> {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  /* ------------------------------------------------------------------------ */
  /* Tasks                                                                    */
  /* ------------------------------------------------------------------------ */

  let tasksQuery = supabase
    .from("tasks")
    .select("*")
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (projectId) {
    tasksQuery = tasksQuery.eq(
      "project_id",
      projectId,
    );
  }

  const {
    data: taskData,
    error: taskError,
  } = await tasksQuery;

  if (taskError) {
    console.error(
      "getTaskBoard tasks error:",
      taskError,
    );

    throw new Error(
      taskError.message,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Columns                                                                  */
  /* ------------------------------------------------------------------------ */

  let columnsQuery = supabase
    .from("task_columns")
    .select("*")
    .order("position", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (projectId) {
    columnsQuery = columnsQuery.eq(
      "project_id",
      projectId,
    );
  }

  const {
    data: columnData,
    error: columnError,
  } = await columnsQuery;

  if (columnError) {
    console.error(
      "getTaskBoard columns error:",
      columnError,
    );

    throw new Error(
      columnError.message,
    );
  }

  const tasks = (
    (taskData ?? []) as TaskRow[]
  ).map(mapTask);

  const columns = (
    (columnData ?? []) as TaskColumnRow[]
  ).map(mapColumn);

  /* ------------------------------------------------------------------------ */
  /* Virtual "Sem lista" column                                               */
  /* ------------------------------------------------------------------------ */

  const hasUnassignedTasks =
    tasks.some(
      (task) =>
        task.columnId === null,
    );

  if (hasUnassignedTasks) {
    const unassignedColumn: TaskColumn = {
      id: "__unassigned__",
      title: "Sem lista",
      projectId: null,
      position: -1,
    };

    columns.unshift(
      unassignedColumn,
    );
  }

  return {
    tasks,
    columns,
  };
}

/* -------------------------------------------------------------------------- */
/* Server-only helpers                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Get all tasks.
 *
 * This is equivalent to getTaskBoard() but is useful when a page
 * only needs the task collection.
 */
export async function getAllTasks(): Promise<Task[]> {
  const board = await getTaskBoard();

  return board.tasks;
}

/**
 * Get tasks belonging to one project.
 */
export async function getProjectTaskBoard(
  projectId: string,
): Promise<TaskBoard> {
  if (!projectId) {
    throw new Error(
      "projectId is required.",
    );
  }

  return getTaskBoard(projectId);
}