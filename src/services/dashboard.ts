
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";
import type { Database } from "@/app/lib/supabase/models";

/* -------------------------------------------------------------------------- */
/* Supabase                                                                    */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  return createClient();
}

async function getAuthenticatedUser() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // A missing session is a normal unauthenticated state.
  if (error?.name === "AuthSessionMissingError") {
    redirect("/login");
  }

  // Do not hide unexpected authentication errors.
  if (error) {
    console.error("Failed to get authenticated user:", {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
    });

    throw new Error(
      `Authentication failed: ${
        error.message || "Unknown Supabase auth error"
      }`,
    );
  }

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Activity = Database["public"]["Tables"]["activity_logs"]["Row"];

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type ProjectBrief = Database["public"]["Tables"]["project_briefs"]["Row"];
type AttendanceRecord =
  Database["public"]["Tables"]["attendance_records"]["Row"];
type Resource = Database["public"]["Tables"]["resources"]["Row"];
type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"];
type ProjectPhase = Database["public"]["Tables"]["project_phases"]["Row"];
type PhaseStage = Database["public"]["Tables"]["phase_stages"]["Row"];

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
  currentUser: Profile;
  users: Profile[];
  projects: Project[];
  clients: Client[];
  documents: Document[];
  tasks: Task[];
  deadlines: Task[];
  activities: Activity[];
}

export interface AdminDashboardData extends DashboardData {
  suppliers: Supplier[];
  participants: {
    profile_id: Profile["profile_id"];
    first_name: string | null;
    email: string | null;
  }[];
  teamWorkload: TeamWorkload[];

  leads: Lead[];
  projectBriefs: ProjectBrief[];
  attendance: AttendanceRecord[];
  resources: Resource[];
  calendarEvents: CalendarEvent[];
  projectPhases: ProjectPhase[];
  phaseStages: PhaseStage[];
}

type QueryError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
} | null;

/* -------------------------------------------------------------------------- */
/* Utilities                                                                   */
/* -------------------------------------------------------------------------- */

function logQueryErrors(
  scope: string,
  queries: Array<{ name: string; error: QueryError }>,
): string[] {
  const failures = queries.filter((query) => query.error !== null);

  for (const { name, error } of failures) {
    if (!error) continue;

    console.error(`[${scope}] Query failed: ${name}`, {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  return failures.map(({ name }) => name);
}

function getLuandaDate() {
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

/* -------------------------------------------------------------------------- */
/* User dashboard                                                              */
/* -------------------------------------------------------------------------- */

export async function getDashboardData(): Promise<DashboardData> {
  const { supabase, user } = await getAuthenticatedUser();

  const [
    currentUserResult,
    projectsResult,
    clientsResult,
    documentsResult,
    taskMembersResult,
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

    supabase.from("clients").select("*"),

    supabase
      .from("documents")
      .select("*")
      .eq("uploaded_by", user.id)
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("task_members")
      .select("task_id, tasks(*)")
      .eq("profile_id", user.id),

    // Personal activity only.
    supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const failedQueries = logQueryErrors("Dashboard", [
    { name: "currentUser", error: currentUserResult.error },
    { name: "projects", error: projectsResult.error },
    { name: "clients", error: clientsResult.error },
    { name: "documents", error: documentsResult.error },
    { name: "taskMembers", error: taskMembersResult.error },
    { name: "activities", error: activitiesResult.error },
  ]);

  if (failedQueries.length > 0) {
    throw new Error(
      `Failed dashboard queries: ${failedQueries.join(", ")}`,
    );
  }

  const currentUser = currentUserResult.data;

  if (!currentUser) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  const taskMap = new Map<string, Task>();

  for (const member of taskMembersResult.data ?? []) {
    const relation = member.tasks;

    const relatedTasks = Array.isArray(relation)
      ? relation
      : relation
        ? [relation]
        : [];

    for (const task of relatedTasks) {
      if (task) {
        taskMap.set(task.task_id, task as Task);
      }
    }
  }

  const tasks = Array.from(taskMap.values());

  const deadlines = tasks
    .filter((task) => task.due_date !== null)
    .sort((a, b) => {
      const aDate = new Date(a.due_date as string).getTime();
      const bDate = new Date(b.due_date as string).getTime();

      return aDate - bDate;
    });

  return {
    currentUser,
    users: [],
    projects: (projectsResult.data ?? []).map(
      ({ project_members: _members, ...project }) => project as Project,
    ),
    clients: clientsResult.data ?? [],
    documents: documentsResult.data ?? [],
    tasks,
    deadlines,
    activities: activitiesResult.data ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* Admin dashboard                                                             */
/* -------------------------------------------------------------------------- */

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: currentUser, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (profileError) {
    logQueryErrors("Admin dashboard", [
      { name: "currentUser", error: profileError },
    ]);

    throw new Error("Failed to fetch current user");
  }

  if (!currentUser) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  if (currentUser.role_id !== 1) {
    throw new Error("Acesso não autorizado.");
  }

  const now = new Date();

  const nextSevenDays = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000,
  );

  const today = getLuandaDate();

  const [
    usersResult,
    projectsResult,
    clientsResult,
    suppliersResult,
    documentsResult,
    tasksResult,
    deadlinesResult,
    activitiesResult,
    leadsResult,
    projectBriefsResult,
    attendanceResult,
    resourcesResult,
    calendarEventsResult,
    projectPhasesResult,
    phaseStagesResult,
    teamWorkload,
  ] = await Promise.all([
    supabase.from("profiles").select("*"),

    supabase.from("projects").select("*"),

    supabase.from("clients").select("*"),

    supabase
      .from("suppliers")
      .select("*")
      .order("supplier_name", { ascending: true }),

    supabase.from("documents").select("*"),

    supabase.from("tasks").select("*"),

    supabase
      .from("tasks")
      .select("*")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true }),

    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("project_briefs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12),

    supabase
      .from("attendance_records")
      .select("*")
      .eq("attendance_date", today),

    supabase
      .from("resources")
      .select("*")
      .order("name", { ascending: true }),

    supabase
      .from("calendar_events")
      .select("*")
      .gte("start_at", now.toISOString())
      .lte("start_at", nextSevenDays.toISOString())
      .order("start_at", { ascending: true })
      .limit(12),

    supabase
      .from("project_phases")
      .select("*")
      .not("planned_end", "is", null)
      .order("planned_end", { ascending: true })
      .limit(20),

    supabase
      .from("phase_stages")
      .select("*")
      .not("planned_end", "is", null)
      .order("planned_end", { ascending: true })
      .limit(20),

    // Reuse the already authenticated Supabase client.
    getTeamWorkload(supabase),
  ]);

  const failedQueries = logQueryErrors("Admin dashboard", [
    { name: "users", error: usersResult.error },
    { name: "projects", error: projectsResult.error },
    { name: "clients", error: clientsResult.error },
    { name: "suppliers", error: suppliersResult.error },
    { name: "documents", error: documentsResult.error },
    { name: "tasks", error: tasksResult.error },
    { name: "deadlines", error: deadlinesResult.error },
    { name: "activities", error: activitiesResult.error },
    { name: "leads", error: leadsResult.error },
    { name: "projectBriefs", error: projectBriefsResult.error },
    { name: "attendance", error: attendanceResult.error },
    { name: "resources", error: resourcesResult.error },
    { name: "calendarEvents", error: calendarEventsResult.error },
    { name: "projectPhases", error: projectPhasesResult.error },
    { name: "phaseStages", error: phaseStagesResult.error },
  ]);

  if (failedQueries.length > 0) {
    throw new Error(
      `Failed admin dashboard queries: ${failedQueries.join(", ")}`,
    );
  }

  const users = usersResult.data ?? [];

  const participants = users.map((profile) => ({
    profile_id: profile.profile_id,
    first_name: profile.first_name ?? null,
    email: profile.email ?? null,
  }));

  return {
    currentUser,
    users,
    participants,
    projects: projectsResult.data ?? [],
    clients: clientsResult.data ?? [],
    suppliers: suppliersResult.data ?? [],
    documents: documentsResult.data ?? [],
    tasks: tasksResult.data ?? [],
    deadlines: deadlinesResult.data ?? [],
    activities: activitiesResult.data ?? [],
    teamWorkload,

    leads: leadsResult.data ?? [],
    projectBriefs: projectBriefsResult.data ?? [],
    attendance: attendanceResult.data ?? [],
    resources: resourcesResult.data ?? [],
    calendarEvents: calendarEventsResult.data ?? [],
    projectPhases: projectPhasesResult.data ?? [],
    phaseStages: phaseStagesResult.data ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* Team workload                                                               */
/* -------------------------------------------------------------------------- */

export async function getTeamWorkload(
  existingSupabase?: Awaited<ReturnType<typeof getSupabase>>,
): Promise<TeamWorkload[]> {
  const supabase =
    existingSupabase ?? (await getAuthenticatedUser()).supabase;

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
    logQueryErrors("Team workload", [
      { name: "taskMembers", error },
    ]);

    throw new Error("Failed to fetch team workload");
  }

  if (!taskMembers?.length) {
    return [];
  }

  const members = new Map<string, TeamWorkload>();
  const seenAssignments = new Set<string>();

  for (const member of taskMembers) {
    if (!member.profile_id) continue;

    const taskRelation = member.tasks;

    const task = Array.isArray(taskRelation)
      ? taskRelation[0]
      : taskRelation;

    if (!task) continue;

    const assignmentKey = `${member.profile_id}:${task.task_id}`;

    if (seenAssignments.has(assignmentKey)) continue;

    seenAssignments.add(assignmentKey);

    const profileRelation = member.profiles;

    const profile = Array.isArray(profileRelation)
      ? profileRelation[0]
      : profileRelation;

    const name =
      `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
      "Utilizador";

    const estimatedHours = Math.max(
      0,
      Number(task.estimated_hours ?? 0) || 0,
    );

    const actualHours = Math.max(
      0,
      Number(task.actual_hours ?? 0) || 0,
    );

    const isCompleted = task.completed === true;

    const workload = members.get(member.profile_id);

    if (workload) {
      workload.total_tasks += 1;
      workload.estimated_hours += estimatedHours;
      workload.actual_hours += actualHours;

      if (isCompleted) {
        workload.completed_tasks += 1;
      } else {
        workload.pending_tasks += 1;

        workload.hours_remaining += Math.max(
          0,
          estimatedHours - actualHours,
        );
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

  const totalRemainingHours = workload.reduce(
    (total, member) => total + member.hours_remaining,
    0,
  );

  for (const member of workload) {
    member.workload_percentage =
      totalRemainingHours > 0
        ? Math.round(
            (member.hours_remaining / totalRemainingHours) * 100,
          )
        : 0;
  }

  workload.sort(
    (a, b) => b.workload_percentage - a.workload_percentage,
  );

  return workload;
}
