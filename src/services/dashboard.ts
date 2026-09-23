import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { Database } from "@/app/lib/supabase/models";

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function getAllProjects() {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("projects").select("*");

  if (error) {
    console.error("Failed to fetch projects:", error);
    throw new Error("Failed to fetch projects");
  }

  return data;
}

export async function getAllDocuments() {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("documents").select("*");

  if (error) {
    console.error("Failed to fetch activities:", error);
    throw new Error("Failed to fetch activities");
  }

  return data;
}

export async function getAllClients() {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    console.error("Failed to fetch clients: ", error);
    throw new Error("Failed to fetch clients");
  }

  return data;
}

export async function getAllActivities() {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("activities").select("*");

  if (error) {
    console.error("Failed to fetch activities:", error);
    throw new Error("Failed to fetch activities");
  }

  return data;
}
export async function getAllTasks() {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("tasks").select("*");

  if (error) {
    console.error("Failed to fetch tasks:", error);
    throw new Error("Failed to fetch tasks");
  }

  return data;
}

export async function getAllWorkloads() {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("workloads").select("*");

  if (error) {
    console.error("Failed to fetch workloads:", error);
    throw new Error("Failed to fetch workloads");
  }

  return data;
}

export async function getAllUsers() {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("profiles").select("*");

  if (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }

  return data;
}

export async function getDeadlines() {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from("tasks").select("*");

  if (error) {
    console.error("Failed to fetch deadlines:", error);
    throw new Error("Failed to fetch deadlines");
  }

  return data;
}

export async function getUpcomingDeadlines() {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      projects (
        project_id,
        project_code,
        title
      )
    `,
    )
    .not("due_date", "is", null)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch deadlines:", error);
    throw new Error("Failed to fetch deadlines");
  }

  return data;
}

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

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const VALID_STATUSES = [
  "to_do",
  "in_progress",
  "completed",
  "on_hold",
] as const;
type TaskStatus = (typeof VALID_STATUSES)[number];

interface TaskWithProfile extends Task {
  profiles: Profile | null;
}

export async function getTeamWorkload(): Promise<TeamWorkload[]> {
  const supabase = await getSupabase();

  try {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(
        `
        task_id,
        assigned_to,
        status,
        estimated_hours,
        actual_hours,
        profiles:assigned_to(id, full_name)
      `,
      )
      .not("assigned_to", "is", null)
      .returns<TaskWithProfile[]>();

    if (error) {
      console.error("Error fetching team workload:", error.message);
      throw error;
    }

    if (!tasks || tasks.length === 0) {
      return [];
    }

    const members = new Map<string, TeamWorkload>();

    for (const task of tasks) {
      if (!task.assigned_to) continue;

      const profile = task.profiles as Profile | null;
      const fullname = `${profile?.first_name} ${profile?.last_name}`;
      const memberName = fullname ?? "Utilizador";
      const isCompleted = task.status === "completed";
      const estimatedHours = task.estimated_hours ?? 0;
      const actualHours = task.actual_hours ?? 0;

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
          name: memberName,
          total_tasks: 1,
          completed_tasks: isCompleted ? 1 : 0,
          pending_tasks: isCompleted ? 0 : 1,
          estimated_hours: estimatedHours,
          actual_hours: actualHours,
          hours_remaining: isCompleted ? 0 : estimatedHours - actualHours,
          workload_percentage: 0,
        });
      }
    }

    const workload = Array.from(members.values());

    // Calculate hours_remaining for existing members
    for (const member of workload) {
      member.hours_remaining =
        member.pending_tasks > 0
          ? Math.max(0, member.estimated_hours - member.actual_hours)
          : 0;
    }

    // Calculate workload percentage based on remaining hours
    const totalRemainingHours = workload.reduce(
      (total, member) => total + member.hours_remaining,
      0,
    );

    for (const member of workload) {
      member.workload_percentage =
        totalRemainingHours > 0
          ? Math.round((member.hours_remaining / totalRemainingHours) * 100)
          : 0;
    }

    // Sort by workload percentage (descending)
    workload.sort((a, b) => b.workload_percentage - a.workload_percentage);

    return workload;
  } catch (error) {
    console.error("Failed to get team workload:", error);
    return [];
  }
}

// src/services/dashboard.ts

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
type Activity = Database["public"]["Tables"]["activity_logs"]["Row"];

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

  const [
    usersResult,
    projectsResult,
    clientsResult,
    documentsResult,
    tasksResult,
    deadlinesResult,
    activitiesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*"),

    supabase.from("projects")
      .select("*, project_members!inner(*)")
      .eq("project_members.profile_id", user!.id),

    supabase.from("clients").select("*"),

    supabase.from("documents").select("*").eq("uploaded_by", user?.id),

    supabase.from("tasks").select("*").eq("assigned_to", user?.id),

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

  const currentUserResult = user
    ? await supabase
      .from("profiles")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle()
    : { data: null, error: null };

  const errors = [
    usersResult.error,
    projectsResult.error,
    clientsResult.error,
    documentsResult.error,
    tasksResult.error,
    deadlinesResult.error,
    activitiesResult.error,
    currentUserResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error(
      "Failed to fetch dashboard data:",
      JSON.stringify(errors, null, 2),
    );

    throw new Error(
      `Failed to fetch dashboard data: ${JSON.stringify(errors, null, 2)}`,
    );
  }

  return {
    currentUser: currentUserResult.data ?? null,
    users: usersResult.data ?? [],
    projects: projectsResult.data ?? [],
    clients: clientsResult.data ?? [],
    documents: documentsResult.data ?? [],
    tasks: tasksResult.data ?? [],
    deadlines: deadlinesResult.data ?? [],
    activities: activitiesResult.data ?? [],
  };
}
