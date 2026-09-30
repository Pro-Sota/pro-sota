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

/**
 * Current authenticated user's dashboard.
 * Data is scoped to the authenticated user where appropriate.
 */
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
    tasksResult,
    deadlinesResult,
    activitiesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle(),

    supabase
      .from("projects")
      .select("*, project_members!inner(*)")
      .eq("project_members.profile_id", user.id),

    supabase
      .from("clients")
      .select("*"),

    supabase
      .from("documents")
      .select("*")
      .eq("uploaded_by", user.id),

    supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", user.id),

    supabase
      .from("tasks")
      .select("*")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true }),

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
    tasksResult.error,
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

  return {
    currentUser: currentUserResult.data ?? null,
    users: [],
    projects: projectsResult.data ?? [],
    clients: clientsResult.data ?? [],
    documents: documentsResult.data ?? [],
    tasks: tasksResult.data ?? [],
    deadlines: deadlinesResult.data ?? [],
    activities: activitiesResult.data ?? [],
  };
}

/**
 * Admin dashboard.
 *
 * Unlike getDashboardData(), this function does NOT scope the data
 * to the currently authenticated user.
 *
 * The admin receives company-wide data.
 */
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
   * First get the authenticated profile.
   * This also lets us verify that the caller is an administrator.
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

  /*
   * Admin data:
   *
   * profiles   -> all users
   * projects   -> all projects
   * clients    -> all clients
   * documents  -> all documents
   * tasks      -> all tasks
   * deadlines  -> all tasks with deadlines
   * activities -> all activities
   */
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
    supabase
      .from("profiles")
      .select("*"),

    supabase
      .from("projects")
      .select("*"),

    supabase
      .from("clients")
      .select("*"),

    supabase
      .from("documents")
      .select("*"),

    supabase
      .from("tasks")
      .select("*"),

    supabase
      .from("tasks")
      .select("*")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true }),

    supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false }),

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

/**
 * Calculates workload for the entire team.
 */
export async function getTeamWorkload(): Promise<TeamWorkload[]> {
  const supabase = await getSupabase();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      `
        task_id,
        assigned_to,
        estimated_hours,
        actual_hours,
        profiles:assigned_to(
          profile_id,
          first_name,
          last_name
        )
      `,
    )
    .not("assigned_to", "is", null);

  if (error) {
    if (error) {
      console.error("Error fetching team workload:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return [];
    }

    return [];
  }

  if (!tasks || tasks.length === 0) {
    return [];
  }

  const members = new Map<string, TeamWorkload>();

  for (const task of tasks) {
    if (!task.assigned_to) {
      continue;
    }

    const profile = Array.isArray(task.profiles)
      ? task.profiles[0]
      : task.profiles;

    const firstName = profile?.first_name ?? "";
    const lastName = profile?.last_name ?? "";

    const name =
      `${firstName} ${lastName}`.trim() || "Utilizador";

    const estimatedHours = Number(task.estimated_hours ?? 0);
    const actualHours = Number(task.actual_hours ?? 0);

    const isCompleted =
      task.status === "completed";

    const existing = members.get(task.assigned_to);

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
      members.set(task.assigned_to, {
        user_id: task.assigned_to,
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

  for (const member of workload) {
    member.hours_remaining =
      member.pending_tasks > 0
        ? Math.max(
          0,
          member.estimated_hours - member.actual_hours,
        )
        : 0;
  }

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

  workload.sort(
    (a, b) =>
      b.workload_percentage -
      a.workload_percentage,
  );

  return workload;
}