import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";


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
    assignedMembers: [],
    completed: false,
  };
}

function mapColumn(row: TaskColumnRow): TaskColumn {
  return {
    id: row.column_id,
    title: row.name,
    projectId: row.project_id,
    position: row.position,
    name: row.name,
    column_id: "",
    is_completed: false,
    projectName: row.name,
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
    .order("position", { ascending: true });

  if (projectId) {
    columnsQuery.eq("project_id", projectId);
  } else {
    columnsQuery.is("project_id", null);
  }

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
      name: "",
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
export async function getProjects(options?: { all?: boolean }) {
  const supabase = createClient(await cookies());

  /* ------------------------------------------------------------------------ */
  /* Current user                                                             */
  /* ------------------------------------------------------------------------ */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  /* ------------------------------------------------------------------------ */
  /* Get accessible project IDs                                               */
  /* ------------------------------------------------------------------------ */

  let projectIds: string[] | null = null;

  if (!options?.all) {
    const {
      data: memberships,
      error: membershipsError,
    } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("profile_id", user.id);

    if (membershipsError) {
      console.error(
        "Failed to fetch project memberships:",
        membershipsError.message,
        membershipsError.details,
        membershipsError.hint,
        membershipsError.code,
      );

      throw new Error(
        membershipsError.message,
      );
    }

    projectIds = [
      ...new Set(
        (memberships ?? [])
          .map(
            (membership) =>
              membership.project_id,
          )
          .filter(
            (id): id is string =>
              Boolean(id),
          ),
      ),
    ];

    if (projectIds.length === 0) {
      return [];
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Projects                                                                 */
  /* ------------------------------------------------------------------------ */

  let projectsQuery = supabase
    .from("projects")
    .select(`
      *,
      clients (
        name
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (projectIds) {
    projectsQuery = projectsQuery.in(
      "project_id",
      projectIds,
    );
  }

  const {
    data: projects,
    error: projectsError,
  } = await projectsQuery;

  if (projectsError) {
    console.error(
      "Failed to fetch projects:",
      projectsError.message,
      projectsError.details,
      projectsError.hint,
      projectsError.code,
    );

    throw new Error(
      projectsError.message,
    );
  }

  if (!projects || projects.length === 0) {
    return [];
  }

  /* ------------------------------------------------------------------------ */
  /* Project managers                                                         */
  /* ------------------------------------------------------------------------ */

  const allProjectIds = projects.map(
    (project) => project.project_id,
  );

  const {
    data: managers,
    error: managersError,
  } = await supabase
    .from("project_members")
    .select(`
      project_id,
      profile_id
    `)
    .in("project_id", allProjectIds)
    .eq("role_id", 3);

  if (managersError) {
    console.error(
      "Failed to fetch project managers:",
      managersError.message,
      managersError.details,
      managersError.hint,
      managersError.code,
    );

    throw new Error(
      managersError.message,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Manager profiles                                                         */
  /* ------------------------------------------------------------------------ */

  const managerProfileIds = [
    ...new Set(
      (managers ?? [])
        .map(
          (manager) =>
            manager.profile_id,
        )
        .filter(
          (id): id is string =>
            Boolean(id),
        ),
    ),
  ];

  let profiles: Array<{
    profile_id: string;
    first_name: string;
    last_name: string;
  }> = [];

  if (managerProfileIds.length > 0) {
    const {
      data: profileData,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select(`
        profile_id,
        first_name,
        last_name
      `)
      .in(
        "profile_id",
        managerProfileIds,
      );

    if (profilesError) {
      console.error(
        "Failed to fetch manager profiles:",
        profilesError.message,
        profilesError.details,
        profilesError.hint,
        profilesError.code,
      );

      throw new Error(
        profilesError.message,
      );
    }

    profiles = profileData ?? [];
  }

  /* ------------------------------------------------------------------------ */
  /* Profile lookup                                                           */
  /* ------------------------------------------------------------------------ */

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.profile_id,
      profile,
    ]),
  );

  /* ------------------------------------------------------------------------ */
  /* Return projects with project manager                                     */
  /* ------------------------------------------------------------------------ */

  return projects.map((project) => {
    const manager = managers?.find(
      (member) =>
        member.project_id ===
        project.project_id,
    );

    const managerProfile = manager?.profile_id
      ? profileMap.get(manager.profile_id)
      : null;

    const managerName = managerProfile
      ? `${managerProfile.first_name} ${managerProfile.last_name}`.trim()
      : null;

    return {
      ...project,

      project_manager: managerName
        ? {
            name: managerName,
          }
        : null,
    };
  });
}