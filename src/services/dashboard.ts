// src/services/dashboard.ts

import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { Database } from "@/app/lib/supabase/models";

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Activity = Database["public"]["Tables"]["activity_logs"]["Row"];

export type TeamWorkload = {
  user_id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  estimated_hours: number;
  actual_hours: number;
  hours_remaining: number;
  workload_percentage: number;
};

export interface DashboardData {
  currentUser: Profile | null;
  users: Profile[];
  projects: Project[];
  clients: Client[];
  documents: Document[];
  tasks: Task[];
  deadlines: Task[];
  activities: Activity[];
}

export interface AdminDashboardData extends DashboardData {
  teamWorkload: TeamWorkload[];
}

/* -------------------------------------------------------------------------- */
/* User dashboard                                                             */
/* -------------------------------------------------------------------------- */

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Failed to get authenticated user:", userError);
    throw new Error("Failed to get authenticated user");
  }

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  const [
    currentUserResult,
    projectsResult,
    clientsResult,
    documentsResult,
    taskMembersResult,
    deadlinesResult,
    activitiesResult,
  ] = await Promise.all([
    /* Current profile */
    supabase
      .from("profiles")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle(),

    /* Projects where the current user is a member */
    supabase
      .from("projects")
      .select("*, project_members!inner(*)")
      .eq("project_members.profile_id", user.id),

    /* Clients */
    supabase
      .from("clients")
      .select("*"),

    /* Documents uploaded by the current user */
    supabase
      .from("documents")
      .select("*")
      .eq("uploaded_by", user.id),

    /*
     * Tasks assigned to the current user.
     *
     * IMPORTANT:
     * tasks.assigned_to no longer exists.
     * Assignment is now represented by task_members.
     */
    supabase
      .from("task_members")
      .select(`
        task_id,
        tasks (*)
      `)
      .eq("profile_id", user.id),

    /* Tasks with deadlines assigned to the current user */
    supabase
      .from("task_members")
      .select(`
        task_id,
        tasks (*)
      `)
      .eq("profile_id", user.id),

    /* Recent activities */
    supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const errors = [
    currentUserResult.error,
    projectsResult.error,
    clientsResult.error,
    documentsResult.error,
    taskMembersResult.error,
    deadlinesResult.error,
    activitiesResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error(
      "Failed to fetch dashboard data:",
      JSON.stringify(errors, null, 2),
    );

    throw new Error("Failed to fetch dashboard data");
  }

  /*
   * task_members is the assignment table.
   * Extract the actual tasks from the relationship.
   */
  const tasks: Task[] = (taskMembersResult.data ?? []).flatMap((member) => {
    const relatedTasks = member.tasks;

    if (!relatedTasks) {
      return [];
    }

    return Array.isArray(relatedTasks) ? relatedTasks : [relatedTasks];
  });

  /*
   * Remove duplicates because a task should normally have one membership
   * for the current user, but this also protects the dashboard from
   * accidental duplicate task_members rows.
   */
  const uniqueTasks = Array.from(
    new Map(tasks.map((task) => [task.task_id, task])).values(),
  );

  /*
   * Only return tasks that actually have a deadline.
   */
  const deadlines: Task[] = uniqueTasks
    .filter((task) => task.due_date !== null)
    .sort((a, b) => {
      const dateA = new Date(a.due_date!).getTime();
      const dateB = new Date(b.due_date!).getTime();

      return dateA - dateB;
    });

  return {
    currentUser: currentUserResult.data ?? null,
    users: [],
    projects: projectsResult.data ?? [],
    clients: clientsResult.data ?? [],
    documents: documentsResult.data ?? [],
    tasks: uniqueTasks,
    deadlines,
    activities: activitiesResult.data ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* Admin dashboard                                                            */
/* -------------------------------------------------------------------------- */

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Failed to get authenticated user:", userError);
    throw new Error("Failed to get authenticated user");
  }

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  /*
   * Get the authenticated profile first.
   */
  const currentUserResult = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (currentUserResult.error) {
    console.error(
      "Failed to fetch current admin profile:",
      currentUserResult.error,
    );

    throw new Error("Failed to fetch current user");
  }

  const currentUser = currentUserResult.data;

  if (!currentUser) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  if (currentUser.role_id !== 1) {
    throw new Error("Acesso não autorizado.");
  }

  const [
    usersResult,
    projectsResult,
    clientsResult,
    documentsResult,
    tasksResult,
    deadlinesResult,
    activitiesResult,
    workloadResult,
  ] = await Promise.all([
    /* All users */
    supabase
      .from("profiles")
      .select("*"),

    /* All projects */
    supabase
      .from("projects")
      .select("*"),

    /* All clients */
    supabase
      .from("clients")
      .select("*"),

    /* All documents */
    supabase
      .from("documents")
      .select("*"),

    /* All tasks */
    supabase
      .from("tasks")
      .select("*"),

    /* All tasks with deadlines */
    supabase
      .from("tasks")
      .select("*")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true }),

    /* Recent activities */
    supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false }),

    /* Workload based on task_members */
    getTeamWorkload(),
  ]);

  const errors = [
    usersResult.error,
    projectsResult.error,
    clientsResult.error,
    documentsResult.error,
    tasksResult.error,
    deadlinesResult.error,
    activitiesResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error(
      "Failed to fetch admin dashboard data:",
      JSON.stringify(errors, null, 2),
    );

    throw new Error("Failed to fetch admin dashboard data");
  }

  return {
    currentUser,
    users: usersResult.data ?? [],
    projects: projectsResult.data ?? [],
    clients: clientsResult.data ?? [],
    documents: documentsResult.data ?? [],
    tasks: tasksResult.data ?? [],
    deadlines: deadlinesResult.data ?? [],
    activities: activitiesResult.data ?? [],
    teamWorkload: workloadResult,
  };
}

/* -------------------------------------------------------------------------- */
/* Team workload                                                              */
/* -------------------------------------------------------------------------- */

export async function getTeamWorkload(): Promise<TeamWorkload[]> {
  const supabase = await getSupabase();

  /*
   * IMPORTANT:
   *
   * tasks.assigned_to no longer exists.
   *
   * Assignment is:
   *
   * task_members.profile_id
   * task_members.task_id
   *
   * Therefore workload must be calculated from task_members.
   */
  const { data: taskMembers, error } = await supabase
    .from("task_members")
    .select(`
      task_id,
      profile_id,
      tasks (
        task_id,
        estimated_hours,
        actual_hours,
        completed
      ),
      profiles (
        profile_id,
        first_name,
        last_name
      )
    `);

  if (error) {
    console.error("Error fetching team workload:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return [];
  }

  if (!taskMembers || taskMembers.length === 0) {
    return [];
  }

  const members = new Map<string, TeamWorkload>();

  for (const member of taskMembers) {
    const task = Array.isArray(member.tasks)
      ? member.tasks[0]
      : member.tasks;

    if (!member.profile_id || !task) {
      continue;
    }

    const profile = Array.isArray(member.profiles)
      ? member.profiles[0]
      : member.profiles;

    const firstName = profile?.first_name ?? "";
    const lastName = profile?.last_name ?? "";

    const name =
      `${firstName} ${lastName}`.trim() || "Utilizador";

    const estimatedHours = Number(task.estimated_hours ?? 0);
    const actualHours = Number(task.actual_hours ?? 0);

    /*
     * tasks.completed is a boolean in the current schema.
     */
    const isCompleted = Boolean(task.completed);

    const existing = members.get(member.profile_id);

    if (existing) {
      existing.total_tasks += 1;
      existing.estimated_hours += estimatedHours;
      existing.actual_hours += actualHours;

      if (isCompleted) {
        existing.completed_tasks += 1;
      } else {
        existing.pending_tasks += 1;
      }
    } else {
      members.set(member.profile_id, {
        user_id: member.profile_id,
        name,
        total_tasks: 1,
        completed_tasks: isCompleted ? 1 : 0,
        pending_tasks: isCompleted ? 0 : 1,
        estimated_hours: estimatedHours,
        actual_hours: actualHours,
        hours_remaining: isCompleted
          ? 0
          : Math.max(0, estimatedHours - actualHours),
        workload_percentage: 0,
      });
    }
  }

  const workload = Array.from(members.values());

  /*
   * Calculate remaining hours.
   */
  for (const member of workload) {
    member.hours_remaining =
      member.pending_tasks > 0
        ? Math.max(
            0,
            member.estimated_hours -
              member.actual_hours,
          )
        : 0;
  }

  /*
   * Calculate percentage of total remaining workload.
   */
  const totalRemainingHours = workload.reduce(
    (total, member) =>
      total + member.hours_remaining,
    0,
  );

  for (const member of workload) {
    member.workload_percentage =
      totalRemainingHours > 0
        ? Math.round(
            (member.hours_remaining /
              totalRemainingHours) *
              100,
          )
        : 0;
  }

  /*
   * Highest workload first.
   */
  workload.sort(
    (a, b) =>
      b.workload_percentage -
      a.workload_percentage,
  );

  return workload;
}