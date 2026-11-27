
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import type { TaskMember } from "../types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Supabase = Awaited<ReturnType<typeof getSupabase>>;

type TaskAccessRow = {
  task_id: string;
  project_id: string | null;
  created_by: string;
};

type MemberProfileRow = {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
  profile_picture: string | null;
};

type MemberRow = {
  profile_id: string;
  profiles:
    | MemberProfileRow
    | MemberProfileRow[]
    | null;
};

/* -------------------------------------------------------------------------- */
/* Supabase                                                                   */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  return createClient();
}

/* -------------------------------------------------------------------------- */
/* Current user context                                                       */
/* -------------------------------------------------------------------------- */

async function getCurrentContext() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_id, role_id")
    .eq("profile_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  return {
    supabase,
    user,
    profile,
  };
}

/* -------------------------------------------------------------------------- */
/* Member mapper                                                              */
/* -------------------------------------------------------------------------- */

function mapMember(row: MemberRow): TaskMember {
  const profile = Array.isArray(row.profiles)
    ? row.profiles[0]
    : row.profiles;

  return {
    profileId: row.profile_id,
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    picture: profile?.profile_picture ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Load task                                                                  */
/* -------------------------------------------------------------------------- */

async function getTaskAccess(
  supabase: Supabase,
  taskId: string,
): Promise<TaskAccessRow> {
  if (!taskId?.trim()) {
    throw new Error("ID da tarefa inválido.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("task_id, project_id, created_by")
    .eq("task_id", taskId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Tarefa não encontrada.");
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Read permissions                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Personal task:
 * Only the creator can read its assignments.
 *
 * Project task:
 * Any project member or platform Admin can read its assignments.
 */
async function assertTaskReadAccess(
  supabase: Supabase,
  task: TaskAccessRow,
  profileId: string,
  userId: string,
  platformRoleId: number | null,
): Promise<void> {
  if (task.project_id === null) {
    if (task.created_by !== userId) {
      throw new Error("Não tem acesso a esta tarefa.");
    }

    return;
  }

  // Platform Admin.
  if (platformRoleId === 1) {
    return;
  }

  // Any member of the project.
  const { data, error } = await supabase
    .from("project_members")
    .select("project_members_id")
    .eq("project_id", task.project_id)
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Não tem acesso a esta tarefa.");
  }
}

/* -------------------------------------------------------------------------- */
/* Management permissions                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Personal task:
 * Only its creator can manage assignments, including when the caller
 * is a platform Admin.
 *
 * Project task:
 * Only the Project Manager (project_members.role_id = 1) or
 * platform Admin (profiles.role_id = 1) can manage assignments.
 */
async function assertTaskManagementAccess(
  supabase: Supabase,
  task: TaskAccessRow,
  profileId: string,
  userId: string,
  platformRoleId: number | null,
): Promise<void> {
  if (task.project_id === null) {
    if (task.created_by !== userId) {
      throw new Error(
        "Não tem permissão para gerir as atribuições desta tarefa pessoal.",
      );
    }

    return;
  }

  // Platform Admin.
  if (platformRoleId === 1) {
    return;
  }

  // Project Manager of this project.
  const { data, error } = await supabase
    .from("project_members")
    .select("project_members_id")
    .eq("project_id", task.project_id)
    .eq("profile_id", profileId)
    .eq("role_id", 1)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      "Apenas o Project Manager ou um Administrador pode alterar as atribuições.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Validate project assignments                                               */
/* -------------------------------------------------------------------------- */

/**
 * A project task can only be assigned to profiles that belong
 * to the same project.
 *
 * Multiple roles for the same profile are supported.
 */
async function validateProjectMemberIds(
  supabase: Supabase,
  projectId: string,
  profileIds: string[],
): Promise<void> {
  if (profileIds.length === 0) {
    return;
  }

  const { data, error } = await supabase
    .from("project_members")
    .select("profile_id")
    .eq("project_id", projectId)
    .in("profile_id", profileIds);

  if (error) {
    throw new Error(
      `Não foi possível validar os membros seleccionados: ${error.message}`,
    );
  }

  const validIds = new Set(
    (data ?? []).map((member) => member.profile_id),
  );

  const invalidIds = profileIds.filter(
    (profileId) => !validIds.has(profileId),
  );

  if (invalidIds.length > 0) {
    throw new Error(
      "Uma ou mais pessoas seleccionadas não pertencem ao projecto.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Load task members                                                          */
/* -------------------------------------------------------------------------- */

async function loadTaskMembers(
  supabase: Supabase,
  taskId: string,
): Promise<TaskMember[]> {
  const { data, error } = await supabase
    .from("task_members")
    .select(`
      profile_id,
      profiles (
        profile_id,
        first_name,
        last_name,
        profile_picture
      )
    `)
    .eq("task_id", taskId);

  if (error) {
    throw new Error(
      `Não foi possível carregar os membros da tarefa: ${error.message}`,
    );
  }

  return (data ?? []).map((row) =>
    mapMember(row as unknown as MemberRow),
  );
}

/* -------------------------------------------------------------------------- */
/* Authorization                                                              */
/* -------------------------------------------------------------------------- */

async function authorize(
  taskId: string,
  management: boolean,
) {
  const { supabase, user, profile } = await getCurrentContext();

  const task = await getTaskAccess(supabase, taskId);

  if (management) {
    await assertTaskManagementAccess(
      supabase,
      task,
      profile.profile_id,
      user.id,
      profile.role_id,
    );
  } else {
    await assertTaskReadAccess(
      supabase,
      task,
      profile.profile_id,
      user.id,
      profile.role_id,
    );
  }

  return {
    supabase,
    task,
  };
}

/* -------------------------------------------------------------------------- */
/* Normalize profile IDs                                                      */
/* -------------------------------------------------------------------------- */

function normalizeProfileIds(
  profileIds: unknown,
): string[] {
  if (!Array.isArray(profileIds)) {
    throw new Error("A lista de colaboradores é inválida.");
  }

  return [
    ...new Set(
      profileIds
        .filter(
          (id): id is string =>
            typeof id === "string" && id.trim().length > 0,
        )
        .map((id) => id.trim()),
    ),
  ];
}

function normalizeProfileId(
  profileId: unknown,
): string {
  if (typeof profileId !== "string" || !profileId.trim()) {
    throw new Error("Colaborador inválido.");
  }

  return profileId.trim();
}

/* -------------------------------------------------------------------------- */
/* GET TASK MEMBERS                                                           */
/* -------------------------------------------------------------------------- */

export async function getTaskMembers(
  taskId: string,
): Promise<TaskMember[]> {
  const { supabase } = await authorize(taskId, false);

  return loadTaskMembers(supabase, taskId);
}

/* -------------------------------------------------------------------------- */
/* ADD TASK MEMBER                                                            */
/* -------------------------------------------------------------------------- */

export async function addTaskMember(
  taskId: string,
  profileId: string,
): Promise<TaskMember[]> {
  const normalizedProfileId = normalizeProfileId(profileId);

  const { supabase, task } = await authorize(taskId, true);

  // Project assignments must belong to the same project.
  if (task.project_id !== null) {
    await validateProjectMemberIds(
      supabase,
      task.project_id,
      [normalizedProfileId],
    );
  }

  // Avoid duplicate assignments.
  const { data: existing, error: existingError } = await supabase
    .from("task_members")
    .select("task_id")
    .eq("task_id", taskId)
    .eq("profile_id", normalizedProfileId)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Não foi possível verificar a atribuição existente: ${existingError.message}`,
    );
  }

  if (!existing) {
    const { error } = await supabase
      .from("task_members")
      .insert({
        task_id: taskId,
        profile_id: normalizedProfileId,
      });

    if (error) {
      throw new Error(
        `Não foi possível atribuir o colaborador: ${error.message}`,
      );
    }
  }

  return loadTaskMembers(supabase, taskId);
}

/* -------------------------------------------------------------------------- */
/* REMOVE TASK MEMBER                                                         */
/* -------------------------------------------------------------------------- */

export async function removeTaskMember(
  taskId: string,
  profileId: string,
): Promise<TaskMember[]> {
  const normalizedProfileId = normalizeProfileId(profileId);

  const { supabase } = await authorize(taskId, true);

  const { error } = await supabase
    .from("task_members")
    .delete()
    .eq("task_id", taskId)
    .eq("profile_id", normalizedProfileId);

  if (error) {
    throw new Error(
      `Não foi possível remover o colaborador: ${error.message}`,
    );
  }

  return loadTaskMembers(supabase, taskId);
}

/* -------------------------------------------------------------------------- */
/* REPLACE TASK MEMBERS                                                       */
/* -------------------------------------------------------------------------- */

export async function replaceTaskMembers(
  taskId: string,
  profileIds: string[],
): Promise<TaskMember[]> {
  const { supabase, task } = await authorize(taskId, true);

  const uniqueProfileIds = normalizeProfileIds(profileIds);

  // Validate all project assignments before changing existing ones.
  if (task.project_id !== null) {
    await validateProjectMemberIds(
      supabase,
      task.project_id,
      uniqueProfileIds,
    );
  }

  // Remove existing assignments.
  const { error: deleteError } = await supabase
    .from("task_members")
    .delete()
    .eq("task_id", taskId);

  if (deleteError) {
    throw new Error(
      `Não foi possível limpar as atribuições: ${deleteError.message}`,
    );
  }

  // Insert the new assignments.
  if (uniqueProfileIds.length > 0) {
    const { error: insertError } = await supabase
      .from("task_members")
      .insert(
        uniqueProfileIds.map((profileId) => ({
          task_id: taskId,
          profile_id: profileId,
        })),
      );

    if (insertError) {
      throw new Error(
        `Não foi possível guardar as atribuições: ${insertError.message}`,
      );
    }
  }

  return loadTaskMembers(supabase, taskId);
}
