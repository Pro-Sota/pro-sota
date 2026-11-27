
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

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

async function getSupabase() {
  return createClient();
}

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
    completed: row.completed ?? false,
  };
}

function mapColumn(row: TaskColumnRow): TaskColumn {
  return {
    id: row.column_id,
    title: row.name,
    projectId: row.project_id,
    position: row.position,
    name: row.name,
    column_id: row.column_id,
    is_completed: false,
    projectName: null,
  };
}

function getLuandaToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Luanda",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getErrorMessage(error: {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}): string {
  console.error("Supabase error:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  return error.message;
}

/* -------------------------------------------------------------------------- */
/* Task board                                                                 */
/* -------------------------------------------------------------------------- */

export async function getTaskBoard(
  projectId?: string | null,
): Promise<TaskBoard> {
  const supabase = await getSupabase();

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(
      getErrorMessage(authError),
    );
  }

  if (!user) {
    return {
      tasks: [],
      columns: [],
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Project membership                                                       */
  /* ------------------------------------------------------------------------ */

  let accessibleProjectIds: string[] = [];

  if (projectId) {
    const { data: membership, error } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("project_id", projectId)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    if (!membership) {
      return {
        tasks: [],
        columns: [],
      };
    }

    accessibleProjectIds = [projectId];
  } else {
    const { data: memberships, error } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("profile_id", user.id);

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    accessibleProjectIds = [
      ...new Set(
        (memberships ?? [])
          .map((membership) => membership.project_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (accessibleProjectIds.length === 0) {
      return {
        tasks: [],
        columns: [],
      };
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Tasks and columns                                                        */
  /* ------------------------------------------------------------------------ */

  let tasksQuery = supabase
    .from("tasks")
    .select("*")
    .in("project_id", accessibleProjectIds)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  let columnsQuery = supabase
    .from("task_columns")
    .select("*")
    .in("project_id", accessibleProjectIds)
    .order("position", { ascending: true });

  const [
    { data: taskData, error: taskError },
    { data: columnData, error: columnError },
  ] = await Promise.all([
    tasksQuery,
    columnsQuery,
  ]);

  if (taskError) {
    throw new Error(getErrorMessage(taskError));
  }

  if (columnError) {
    throw new Error(getErrorMessage(columnError));
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

  const hasUnassignedTasks = tasks.some(
    (task) => task.columnId === null,
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
  const board = await getTaskBoard();

  return board.tasks;
}

/* -------------------------------------------------------------------------- */
/* Project task board                                                         */
/* -------------------------------------------------------------------------- */

export async function getProjectTaskBoard(
  projectId: string,
): Promise<TaskBoard> {
  if (!projectId) {
    throw new Error("projectId is required.");
  }

  return getTaskBoard(projectId);
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export async function getProjects(
  options?: { all?: boolean },
) {
  const supabase = await getSupabase();

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(getErrorMessage(userError));
  }

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  /* ------------------------------------------------------------------------ */
  /* Accessible project IDs                                                   */
  /* ------------------------------------------------------------------------ */

  let projectIds: string[] | null = null;

  if (!options?.all) {
    const { data: memberships, error } = await supabase
      .from("project_members")
      .select("project_id")
      .eq("profile_id", user.id);

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    projectIds = [
      ...new Set(
        (memberships ?? [])
          .map((membership) => membership.project_id)
          .filter((id): id is string => Boolean(id)),
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

  const { data: projects, error: projectsError } =
    await projectsQuery;

  if (projectsError) {
    throw new Error(getErrorMessage(projectsError));
  }

  if (!projects?.length) {
    return [];
  }

  const allProjectIds = projects.map(
    (project) => project.project_id,
  );

  /* ------------------------------------------------------------------------ */
  /* Fetch project data concurrently                                          */
  /* ------------------------------------------------------------------------ */

  const [
    membersResult,
    tasksResult,
    phasesResult,
  ] = await Promise.all([
    supabase
      .from("project_members")
      .select(`
        project_id,
        profile_id,
        role_id
      `)
      .in("project_id", allProjectIds),

    supabase
      .from("tasks")
      .select(`
        task_id,
        project_id,
        completed,
        due_date,
        column_id
      `)
      .in("project_id", allProjectIds),

    supabase
      .from("project_phases")
      .select(`
        phase_id,
        project_id,
        name,
        sort_order
      `)
      .in("project_id", allProjectIds)
      .order("sort_order", {
        ascending: true,
      }),
  ]);

  if (membersResult.error) {
    throw new Error(getErrorMessage(membersResult.error));
  }

  if (tasksResult.error) {
    throw new Error(getErrorMessage(tasksResult.error));
  }

  if (phasesResult.error) {
    throw new Error(getErrorMessage(phasesResult.error));
  }

  const members = membersResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const phases = phasesResult.data ?? [];

  /* ------------------------------------------------------------------------ */
  /* Member profile IDs                                                       */
  /* ------------------------------------------------------------------------ */

  const memberProfileIds = [
    ...new Set(
      members
        .map((member) => member.profile_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  /* ------------------------------------------------------------------------ */
  /* Profiles                                                                 */
  /* ------------------------------------------------------------------------ */

  let profiles: Array<{
    profile_id: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
  }> = [];

  if (memberProfileIds.length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        profile_id,
        first_name,
        last_name,
        profile_picture
      `)
      .in("profile_id", memberProfileIds);

    if (error) {
      throw new Error(getErrorMessage(error));
    }

    profiles = data ?? [];
  }

  /* ------------------------------------------------------------------------ */
  /* Lookup maps                                                              */
  /* ------------------------------------------------------------------------ */

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.profile_id,
      profile,
    ]),
  );

  const membersByProject = new Map<
    string,
    typeof members
  >();

  const tasksByProject = new Map<
    string,
    typeof tasks
  >();

  const phasesByProject = new Map<
    string,
    typeof phases
  >();

  for (const member of members) {
    const existing =
      membersByProject.get(member.project_id) ?? [];

    existing.push(member);

    membersByProject.set(member.project_id, existing);
  }

  for (const task of tasks) {
    const existing =
      tasksByProject.get(task.project_id) ?? [];

    existing.push(task);

    tasksByProject.set(task.project_id, existing);
  }

  for (const phase of phases) {
    const existing =
      phasesByProject.get(phase.project_id) ?? [];

    existing.push(phase);

    phasesByProject.set(phase.project_id, existing);
  }

  /* ------------------------------------------------------------------------ */
  /* Deadline reference                                                       */
  /* ------------------------------------------------------------------------ */

  const today = getLuandaToday();

  /* ------------------------------------------------------------------------ */
  /* Enriched projects                                                        */
  /* ------------------------------------------------------------------------ */

  return projects.map((project) => {
    const projectId = project.project_id;

    /* Client */

    const client = Array.isArray(project.clients)
      ? project.clients[0]
      : project.clients;

    const clientName = client?.name ?? null;

    /* Members */

    const projectMembers =
      membersByProject.get(projectId) ?? [];

    const memberAvatars = projectMembers
      .map((member) => {
        if (!member.profile_id) {
          return null;
        }

        return (
          profileMap.get(member.profile_id)
            ?.profile_picture ?? null
        );
      })
      .filter(
        (avatar): avatar is string => Boolean(avatar),
      );

    /* Project manager */

    const manager = projectMembers.find(
      (member) => member.role_id === 3,
    );

    const managerProfile = manager?.profile_id
      ? profileMap.get(manager.profile_id)
      : null;

    const managerName = managerProfile
      ? `${managerProfile.first_name} ${managerProfile.last_name}`.trim()
      : null;

    /* Tasks */

    const projectTasks =
      tasksByProject.get(projectId) ?? [];

    const taskCount = projectTasks.length;

    const completedTaskCount = projectTasks.filter(
      (task) => task.completed === true,
    ).length;

    const progress =
      taskCount > 0
        ? Math.round(
            (completedTaskCount / taskCount) * 100,
          )
        : 0;

    /* Next deadline */

    const upcomingDeadlines = projectTasks
      .map((task) => task.due_date)
      .filter(
        (date): date is string => Boolean(date),
      )
      .filter((date) => date >= today)
      .sort();

    const nextDeadline =
      upcomingDeadlines[0] ?? null;

    /* Phases */

    const projectPhases =
      phasesByProject.get(projectId) ?? [];

    const phaseName =
      projectPhases[0]?.name ?? null;

    /* Result */

    return {
      ...project,

      client_name: clientName,

      progress,

      phase_name: phaseName,

      task_count: taskCount,

      completed_task_count: completedTaskCount,

      member_count: projectMembers.length,

      member_avatars: memberAvatars,

      next_deadline: nextDeadline,

      project_manager: managerName
        ? {
            name: managerName,
          }
        : null,
    };
  });
}
