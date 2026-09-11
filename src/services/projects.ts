import { Database } from "@/app/lib/supabase/models";
import { createClient } from "../app/lib/supabase/client";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

const supabase = createClient();

/* =========================================================
   PROJECT
========================================================= */

export async function getProjectById(projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error) throw error;

  return data;
}

/**
 * Creates a project and its project conversation.
 *
 * The creator is automatically added to:
 * - project_members
 * - conversation_participants
 *
 * This makes the project immediately visible in
 * "Project Messages" for the creator.
 */
export async function createProject(
  project: ProjectInsert,
  creatorProfileId: string,
) {
  const { data: createdProject, error: projectError } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();

  if (projectError) {
    throw new Error(projectError.message);
  }

  /*
   * Add creator as project member.
   *
   * If your project creation flow already creates the creator
   * as a project member, this upsert prevents a duplicate.
   */
  const { error: memberError } = await supabase
    .from("project_members")
    .upsert(
      {
        project_id: createdProject.project_id,
        profile_id: creatorProfileId,
        role: "member",
      },
      {
        onConflict: "project_id,profile_id",
      },
    );

  if (memberError) {
    throw new Error(memberError.message);
  }

  /*
   * Create exactly one project conversation.
   */
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      project_id: createdProject.project_id,
      conversation_type: "project",
      is_group: true,
    })
    .select()
    .single();

  if (conversationError) {
    throw new Error(conversationError.message);
  }

  /*
   * Add creator to the project conversation.
   */
  const { error: participantError } = await supabase
    .from("conversation_participants")
    .upsert(
      {
        conversation_id: conversation.id,
        profile_id: creatorProfileId,
      },
      {
        onConflict: "conversation_id,profile_id",
      },
    );

  if (participantError) {
    throw new Error(participantError.message);
  }

  return createdProject;
}

/* =========================================================
   PROJECT MEMBERS
========================================================= */

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

export async function getProjectMembers(projectId: string) {
  const { data, error } = await supabase
    .from("project_members")
    .select(
      `
      profile_id,
      role,
      joined_at,
      profiles (
        profile_id,
        first_name,
        last_name,
        avatar_url
      )
    `,
    )
    .eq("project_id", projectId);

  if (error) {
    console.error("Supabase:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Returns the project conversation.
 *
 * There should only be one project conversation per project.
 */
export async function getProjectConversation(projectId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("project_id", projectId)
    .eq("conversation_type", "project")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Creates the project conversation if it does not exist.
 *
 * Useful for existing projects created before project
 * conversations were implemented.
 */
export async function ensureProjectConversation(projectId: string) {
  const existingConversation = await getProjectConversation(projectId);

  if (existingConversation) {
    return existingConversation;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      project_id: projectId,
      conversation_type: "project",
      is_group: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Adds a project member and automatically gives them access
 * to the project's group conversation.
 */
export async function addProjectMember(
  projectId: string,
  profileId: string,
  role = "member",
) {
  /*
   * 1. Add user to the project.
   */
  const { data: member, error: memberError } = await supabase
    .from("project_members")
    .upsert(
      {
        project_id: projectId,
        profile_id: profileId,
        role,
      },
      {
        onConflict: "project_id,profile_id",
      },
    )
    .select()
    .single();

  if (memberError) {
    throw new Error(memberError.message);
  }

  /*
   * 2. Find or create the project's group conversation.
   */
  const conversation = await ensureProjectConversation(projectId);

  /*
   * 3. Add the project member to the conversation.
   *
   * getChats() uses conversation_participants, so after
   * this insert the project automatically appears in the
   * user's "Project Messages".
   */
  const { error: participantError } = await supabase
    .from("conversation_participants")
    .upsert(
      {
        conversation_id: conversation.id,
        profile_id: profileId,
      },
      {
        onConflict: "conversation_id,profile_id",
      },
    );

  if (participantError) {
    throw new Error(participantError.message);
  }

  return member;
}

export async function removeProjectMember(
  projectId: string,
  profileId: string,
) {
  /*
   * Find the project conversation first.
   */
  const conversation = await getProjectConversation(projectId);

  /*
   * Remove from the project.
   */
  const { error: memberError } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("profile_id", profileId);

  if (memberError) {
    throw new Error(memberError.message);
  }

  /*
   * Also remove from the project conversation.
   */
  if (conversation) {
    const { error: participantError } = await supabase
      .from("conversation_participants")
      .delete()
      .eq("conversation_id", conversation.id)
      .eq("profile_id", profileId);

    if (participantError) {
      throw new Error(participantError.message);
    }
  }
}

export async function updateProjectMemberRole(
  projectId: string,
  profileId: string,
  role: string,
) {
  const { data, error } = await supabase
    .from("project_members")
    .update({
      role,
    })
    .eq("project_id", projectId)
    .eq("profile_id", profileId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* =========================================================
   PROJECT MANAGER
========================================================= */

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

/* =========================================================
   PROJECT UPDATE
========================================================= */

export async function archiveProject(projectId: string) {
  const { data, error } = await supabase
    .from("projects")
    .update({ archived: true })
    .eq("project_id", projectId)
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

/* =========================================================
   PROJECT STATUS / FILTERS
========================================================= */

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

export async function updateProjectStatus(
  projectId: string,
  status: string,
) {
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

/* =========================================================
   PROJECT FILES
========================================================= */

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

/* =========================================================
   PROJECT PROGRESS
========================================================= */

export async function getProjectProgress(projectId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("status")
    .eq("project_id", projectId);

  if (error) throw error;

  const total = data.length;

  const completed = data.filter(
    (task) => task.status === "Completed",
  ).length;

  return {
    totalTasks: total,
    completedTasks: completed,
    percentage:
      total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/* =========================================================
   PROJECT PHASES / STAGES
========================================================= */

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

/* =========================================================
   PROJECT DOCUMENTS / SITE / REQUESTS / ACTIVITY
========================================================= */

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

/* =========================================================
   PROJECT SUMMARY
========================================================= */

export async function getProjectSummary(projectId: string) {
  const [
    tasks,
    documents,
    files,
    workRequests,
    siteVisits,
    members,
  ] = await Promise.all([
    getProjectTasks(projectId),
    getProjectDocuments(projectId),
    getProjectFiles(projectId),
    getProjectWorkRequests(projectId),
    getProjectSiteVisits(projectId),
    getProjectMembers(projectId),
  ]);

  return {
    members: members.length,asdipo
    tasks: tasks.length,
    completedTasks: tasks.filter(
      (task) => task.status === "Completed",
    ).length,
    documents: documents.length,
    files: files.length,
    workRequests: workRequests.length,
    siteVisits: siteVisits.length,
  };
}