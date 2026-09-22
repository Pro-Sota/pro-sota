import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";


export async function getProjects() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    /* ---------------------------------------------------------------------- */
    /* Current authenticated user                                             */
    /* ---------------------------------------------------------------------- */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!user) {
      return [];
    }

    /* ---------------------------------------------------------------------- */
    /* User profile                                                            */
    /* ---------------------------------------------------------------------- */

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("profile_id")
      .eq("profile_id", user.id)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile) {
      return [];
    }

    /* ---------------------------------------------------------------------- */
    /* Projects                                                                */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from("projects")
      .select(`
        *,
        project_members!inner (
          profile_id
        )
      `)
      .eq(
        "project_members.profile_id",
        profile.profile_id,
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "getProjects error:",
        error,
      );

      throw new Error(error.message);
    }

    /* ---------------------------------------------------------------------- */
    /* Remove project_members from returned project objects                    */
    /* ---------------------------------------------------------------------- */

    return (data ?? []).map(
      ({ project_members, ...project }) =>
        project,
    );
  } catch (error) {
    console.error(
      "getProjects error:",
      error,
    );

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
    name: undefined,
    column_id: "",
    is_completed: false,
    projectName: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Current authenticated user                                                 */
/* -------------------------------------------------------------------------- */

async function getCurrentProfileId(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "getCurrentProfileId auth error:",
      error,
    );

    throw new Error(error.message);
  }

  if (!user) {
    return null;
  }

  return user.id;
}

/* -------------------------------------------------------------------------- */
/* Task board                                                                 */
/* -------------------------------------------------------------------------- */

export async function getTaskBoard(
  projectId?: string | null,
): Promise<TaskBoard> {
  const profileId =
    await getCurrentProfileId();

  if (!profileId) {
    return {
      tasks: [],
      columns: [],
    };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(
    cookieStore,
  );

  /* ------------------------------------------------------------------------ */
  /* Verify project membership                                                */
  /* ------------------------------------------------------------------------ */

  if (projectId) {
  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("project_members")
    .select("profile_id")
    .eq("project_id", projectId)
    .eq("profile_id", profileId)
    .limit(1);

  if (membershipError) {
    console.error(
      "getTaskBoard membership error:",
      membershipError.message,
      membershipError.details,
      membershipError.hint,
      membershipError.code,
    );

    throw new Error(
      membershipError.message,
    );
  }

  if (!membership || membership.length === 0) {
    return {
      tasks: [],
      columns: [],
    };
  }
}
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
  } else {
    /*
     * No projectId:
     * only return tasks belonging to projects
     * where the current user is a member.
     */
    const {
      data: memberships,
      error: membershipsError,
    } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("profile_id", profileId);

    if (membershipsError) {
      console.error(
        "getTaskBoard memberships error:",
        membershipsError.message,
        membershipsError.details,
        membershipsError.hint,
        membershipsError.code,
      );

      throw new Error(
        membershipsError.message,
      );
    }

    const projectIds = (
      memberships ?? []
    ).map(
      (membership) =>
        membership.project_id,
    );

    if (projectIds.length === 0) {
      return {
        tasks: [],
        columns: [],
      };
    }

    tasksQuery = tasksQuery.in(
      "project_id",
      projectIds,
    );
  }

  const {
    data: taskData,
    error: taskError,
  } = await tasksQuery;

  if (taskError) {
    console.error(
      "getTaskBoard tasks error:",
      taskError.message,
      taskError.details,
      taskError.hint,
      taskError.code,
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
  } else {
    const {
      data: memberships,
      error: membershipsError,
    } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("profile_id", profileId);

    if (membershipsError) {
      console.error(
        "getTaskBoard column memberships error:",
        membershipsError.message,
        membershipsError.details,
        membershipsError.hint,
        membershipsError.code,
      );

      throw new Error(
        membershipsError.message,
      );
    }

    const projectIds = (
      memberships ?? []
    ).map(
      (membership) =>
        membership.project_id,
    );

    if (projectIds.length === 0) {
      return {
        tasks: (taskData ?? []).map(
          mapTask,
        ),
        columns: [],
      };
    }

    columnsQuery = columnsQuery.in(
      "project_id",
      projectIds,
    );
  }

  const {
    data: columnData,
    error: columnError,
  } = await columnsQuery;

  if (columnError) {
    console.error(
      "getTaskBoard columns error:",
      columnError.message,
      columnError.details,
      columnError.hint,
      columnError.code,
    );

    throw new Error(
      columnError.message,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Map rows                                                                 */
  /* ------------------------------------------------------------------------ */

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
    columns.unshift({
      id: "__unassigned__",
      title: "Sem lista",
      projectId: projectId ?? null,
      position: -1,
      name: undefined,
      column_id: "",
      is_completed: false,
      projectName: null,
    });
  }

  return {
    tasks,
    columns,
  };
}

/* -------------------------------------------------------------------------- */
/* All accessible tasks                                                       */
/* -------------------------------------------------------------------------- */

export async function getAllTasks(): Promise<Task[]> {
  const board =
    await getTaskBoard();

  return board.tasks;
}

/* -------------------------------------------------------------------------- */
/* Project task board                                                         */
/* -------------------------------------------------------------------------- */

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