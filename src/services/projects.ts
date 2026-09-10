import { Database } from "@/app/lib/supabase/models";
import { createClient } from "../app/lib/supabase/client";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const supabase = createClient();

export async function getProjectById(projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error) throw error;

  return data;
}


export async function getProjectsByUser(userId: string) {
  const { data, error } = await supabase
    .from("project_members")
    .select("*")
    .eq("profile_id", userId);

  if (error) throw error;

  return data;
}

type UserProjectResult = {
  projects: Project | null;
};

export async function getUserProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("project_members")
    .select(
      `
      projects (*)
    `,
    )
    .eq("profile_id", userId);

  if (error) throw error;

  return (data as unknown as UserProjectResult[]).flatMap((row) =>
    row.projects ? [row.projects] : [],
  );
}

export async function getProjectMembers(profileID: string) {
  const { data, error } = await supabase
    .from("project_members")
    .select(
      `
      role (name),
      profiles (
        profile_id,
        first_name,
        last_name,
        avatar_url
      )
    `,
    )
    .eq("profile_id", profileID);

  if (error) {
    console.error("Supabase:", error);
    throw new Error(error.message);}

    console.log("Project members data:", data);
    
  return data;
}

export async function getProjectManager(projectId: string) {
  const { data: projectMember, error: projectError } = await supabase
    .from("project_members")
    .select("profile_id")
    .eq("project_id", projectId)
    .eq("role_id", 3)
    .maybeSingle();

  if (projectError) {
    throw new Error(projectError.message);
  }

  if (!projectMember?.profile_id) {
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("profile_id", projectMember.profile_id)
    .maybeSingle();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return null;
  }

  return `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
}

export async function archiveProject(id: string) {
  const { data, error } = await supabase
    .from("projects")
    .update({ archived: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>,
) {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getRecentProjects(limit = 5) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}

export async function searchProjects(query: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role = "Member",
) {
  const { data, error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: userId,
      project_role: role,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function removeProjectMember(projectId: string, userId: string) {
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("profile_id", userId);

  if (error) throw error;
}

export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: string,
) {
  const { data, error } = await supabase
    .from("project_members")
    .update({
      project_role: role,
    })
    .eq("project_id", projectId)
    .eq("profile_id", userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function duplicateProject(projectId: string) {
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error) throw error;

  const { project_id, created_at, updated_at, ...copy } = project;

  const { data, error: insertError } = await supabase
    .from("projects")
    .insert({
      ...copy,
      name: `${project.name} (Copy)`,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return data;
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("project_id", projectId);

  if (error) throw error;
}

export async function getProjectsByStatus(status: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProjectsByPriority(priority: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      project_id,
      projects (*)
    `,
    )
    .eq("priority", priority);

  if (error) throw error;

  return data;
}

export async function getProjectsByDateRange(start: string, end: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .gte("start_date", start)
    .lte("end_date", end);

  if (error) throw error;

  return data;
}

export async function updateProjectStatus(projectId: string, status: string) {
  const { data, error } = await supabase
    .from("projects")
    .update({ status })
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function completeProject(projectId: string) {
  return updateProjectStatus(projectId, "Completed");
}

export async function reopenProject(projectId: string) {
  return updateProjectStatus(projectId, "Active");
}

export async function getProjectFiles(projectId: string) {
  const { data, error } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function uploadProjectFile(file: {
  project_id: string;
  name: string;
  file_url: string;
  file_type: string;
  uploaded_by: string;
}) {
  const { data, error } = await supabase
    .from("project_files")
    .insert(file)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProjectFile(projectFileId: string) {
  const { error } = await supabase
    .from("project_files")
    .delete()
    .eq("project_file_id", projectFileId);

  if (error) throw error;
}

export async function getProjectProgress(projectId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("status")
    .eq("project_id", projectId);

  if (error) throw error;

  const total = data.length;

  const completed = data.filter((t) => t.status === "Completed").length;

  return {
    totalTasks: total,
    completedTasks: completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export async function getProjectTimeline(projectId: string) {
  const { data, error } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .order("order_number");

  if (error) throw error;

  return data;
}

export async function getProjectTasks(projectId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProjectPhases(projectId: string) {
  const { data, error } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .order("order_number");

  if (error) throw error;

  return data;
}

export async function getProjectStages(projectId: string) {
  const { data, error } = await supabase
    .from("project_phases")
    .select(
      `
      *,
      project_stages (
        *
      )
    `,
    )
    .eq("project_id", projectId);

  if (error) throw error;

  return data;
}

export async function getProjectDocuments(projectId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProjectSiteVisits(projectId: string) {
  const { data, error } = await supabase
    .from("site_visits")
    .select("*")
    .eq("project_id", projectId)
    .order("visit_date", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProjectWorkRequests(projectId: string) {
  const { data, error } = await supabase
    .from("work_requests")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProjectActivity(projectId: string) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("entity_id", projectId)
    .eq("entity_type", "project")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProjectSummary(projectId: string) {
  const [tasks, documents, files, workRequests, siteVisits, members] =
    await Promise.all([
      getProjectTasks(projectId),
      getProjectDocuments(projectId),
      getProjectFiles(projectId),
      getProjectWorkRequests(projectId),
      getProjectSiteVisits(projectId),
      getProjectMembers(projectId),
    ]);

  return {
    members: members.length,
    tasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "Completed").length,
    documents: documents.length,
    files: files.length,
    workRequests: workRequests.length,
    siteVisits: siteVisits.length,
  };
}
