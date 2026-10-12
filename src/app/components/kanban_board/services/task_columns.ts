import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import type {
  CreateColumnInput,
  KanbanColumn,
  TaskScope,
} from "../types";

function mapColumn(row: any): KanbanColumn {
  return {
    columnId: row.column_id,
    projectId: row.project_id,
    name: row.name,
    position: row.position,
    isCompleted: row.is_completed,
  };
}

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}
async function getCurrentUserId() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  return user.id;
}

async function getCurrentProfileId() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_id")
    .eq("profile_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  console.log("USERRR: ", profile)

  return profile.profile_id;
}

/**
 * Verifies that the current user is a member of a project.
 */


async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("profile_id", user.id)
    .single();

  if (error || !profile) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  return profile.role_id === 1;
}


async function assertProjectMember(
  projectId: string,
): Promise<void> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  // Resolve the current user's profile and role.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_id, role_id")
    .eq("profile_id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  // Admins can bypass project membership checks.
  if (profile.role_id === 1) {
    return;
  }

  // All other users must belong to the project.
  const { data: member, error: memberError } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("project_id", projectId)
    .eq("profile_id", profile.profile_id)
    .limit(1)
    .maybeSingle();

  if (memberError) {
    console.error(
      "[assertProjectMember] Membership lookup failed:",
      memberError,
    );

    throw new Error(
      "Não foi possível verificar o acesso ao projecto.",
    );
  }

  if (!member) {
    throw new Error("Não tem acesso a este projecto.");
  }
}



/**
 * Returns task columns visible to the current user.
 *
 * General:
 *   Only columns created by the current user.
 *
 * Project:
 *   Only columns belonging to projects where the current
 *   user is a member.
 */
export async function getTaskColumns(scope: TaskScope) {
  const supabase = await getSupabase();

  let query = supabase
    .from("task_columns")
    .select(
      "column_id, project_id, profile_id, name, position, is_completed",
    )
    .order("position", {
      ascending: true,
    });

  if (scope.type === "general") {
    const profileId = await getCurrentProfileId();

    query = query
      .is("project_id", null)
      .eq("profile_id", profileId);
  } else {
    await assertProjectMember(scope.projectId);

    query = query.eq("project_id", scope.projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Failed to load task columns: ${error.message}`,
    );
  }

  return (data ?? []).map(mapColumn);
}
/**
 * Creates a task column.
 *
 * General:
 *   The column belongs to the current user.
 *
 * Project:
 *   The current user must be a project member.
 */
export async function createTaskColumn(
  scope: TaskScope,
  input: CreateColumnInput,
) {
  const supabase = await getSupabase();

  const name = input.name.trim();

  if (!name) {
    throw new Error("O nome da lista é obrigatório.");
  }

  let profileId: string | null = null;
  let projectId: string | null = null;

  if (scope.type === "general") {
    profileId = await getCurrentProfileId();
  } else {
    await assertProjectMember(
      scope.projectId,
    );

    projectId = scope.projectId;
  }

  let positionQuery = supabase
    .from("task_columns")
    .select("position")
    .order("position", {
      ascending: false,
    })
    .limit(1);

  if (scope.type === "general") {
    positionQuery = positionQuery
      .is("project_id", null)
      .eq("profile_id", profileId);
  } else {
    positionQuery = positionQuery.eq(
      "project_id",
      projectId,
    );
  }

  const {
    data: existingColumns,
    error: positionError,
  } = await positionQuery;

  if (positionError) {
    throw new Error(
      `Failed to calculate column position: ${positionError.message}`,
    );
  }

  const position =
    (existingColumns?.[0]?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("task_columns")
    .insert({
      project_id: projectId,
      profile_id: profileId,
      name,
      position,
      is_completed: input.isCompleted ?? false,
    })
    .select(
      "column_id, project_id, profile_id, name, position, is_completed",
    )
    .single();

  if (error) {
    throw new Error(
      `Failed to create task column: ${error.message}`,
    );
  }

  return mapColumn(data);
}

/**
 * Updates a task column.
 *
 * General:
 *   Only the creator can update it.
 *
 * Project:
 *   Only a project member can update it.
 */
export async function updateTaskColumn(
  columnId: string,
  input: Partial<CreateColumnInput>,
) {
  const supabase = await getSupabase();

  const currentProfileId =
    await getCurrentProfileId();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      throw new Error(
        "O nome da lista é obrigatório.",
      );
    }

    payload.name = name;
  }

  if (input.isCompleted !== undefined) {
    payload.is_completed =
      input.isCompleted;
  }

  if (
    Object.keys(payload).length === 0
  ) {
    throw new Error(
      "Nenhuma alteração foi fornecida.",
    );
  }

  const {
    data: existingColumn,
    error: findError,
  } = await supabase
    .from("task_columns")
    .select(
      "column_id, project_id, profile_id, name, position, is_completed",
    )
    .eq("column_id", columnId)
    .single();

  if (findError || !existingColumn) {
    throw new Error(
      "Lista não encontrada.",
    );
  }

  /*
   * General/personal column.
   */
if (existingColumn.project_id === null) {
  const isAdmin = await isCurrentUserAdmin();

  if (
    !isAdmin &&
    existingColumn.profile_id !== currentProfileId
  ) {
    throw new Error(
      "Não tem permissão para alterar esta lista.",
    );
  }
}

  /*
   * Project column.
   */
  else {
    await assertProjectMember(
      existingColumn.project_id,
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("task_columns")
    .update(payload)
    .eq("column_id", columnId)
    .select(
      "column_id, project_id, profile_id, name, position, is_completed",
    )
    .single();

  if (error) {
    throw new Error(
      `Failed to update task column: ${error.message}`,
    );
  }

  return mapColumn(data);
}

/**
 * Deletes a task column.
 *
 * General:
 *   Only the creator can delete it.
 *
 * Project:
 *   Only a project member can delete it.
 */
export async function deleteTaskColumn(
  columnId: string,
) {
  const supabase = await getSupabase();

  const currentProfileId =
    await getCurrentProfileId();

  const {
    data: column,
    error: columnError,
  } = await supabase
    .from("task_columns")
    .select(
      "column_id, project_id, profile_id",
    )
    .eq("column_id", columnId)
    .single();

  if (columnError || !column) {
    throw new Error(
      "Lista não encontrada.",
    );
  }

  /*
   * General/personal column:
   * only its owner can delete it.
   */
 if (column.project_id === null) {
  const isAdmin = await isCurrentUserAdmin();

  if (
    !isAdmin &&
    column.profile_id !== currentProfileId
  ) {
    throw new Error(
      "Não tem permissão para eliminar esta lista.",
    );
  }
}

  /*
   * Project column:
   * any project member can delete it.
   */
  else {
    await assertProjectMember(
      column.project_id,
    );
  }

  const {
    count,
    error: countError,
  } = await supabase
    .from("tasks")
    .select("task_id", {
      count: "exact",
      head: true,
    })
    .eq(
      "column_id",
      columnId,
    );

  if (countError) {
    throw new Error(
      `Failed to check task column: ${countError.message}`,
    );
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "Não é possível eliminar uma lista que contém tarefas. Mova as tarefas primeiro.",
    );
  }

  const { error } =
    await supabase
      .from("task_columns")
      .delete()
      .eq(
        "column_id",
        columnId,
      );

  if (error) {
    throw new Error(
      `Failed to delete task column: ${error.message}`,
    );
  }
}

/**
 * Reorders task columns.
 *
 * General:
 *   Only the current user's columns can be reordered.
 *
 * Project:
 *   Only columns from a project where the current user
 *   is a member can be reordered.
 */

export async function reorderTaskColumns(
  scope: TaskScope,
  orderedColumnIds: string[],
) {
  const supabase = await getSupabase();

  const isAdmin = await isCurrentUserAdmin();

  let profileId: string | null = null;

  if (scope.type === "general") {
    if (!isAdmin) {
      profileId = await getCurrentProfileId();
    }
  } else {
    if (!scope.projectId) {
      throw new Error("ID do projecto inválido.");
    }

    await assertProjectMember(scope.projectId);
  }

  for (
    let index = 0;
    index < orderedColumnIds.length;
    index += 1
  ) {
    let query = supabase
      .from("task_columns")
      .update({
        position: index,
      })
      .eq("column_id", orderedColumnIds[index]);

    if (scope.type === "general") {
      query = query.is("project_id", null);

      // Non-admin users can reorder only their own columns.
      if (!isAdmin) {
        query = query.eq("profile_id", profileId);
      }
    } else {
      // Project columns can only be reordered within this project.
      query = query.eq("project_id", scope.projectId);
    }

    const { error } = await query;

    if (error) {
      console.error(
        "[reorderTaskColumns] Failed:",
        {
          columnId: orderedColumnIds[index],
          error,
        },
      );

      throw new Error(
        `Não foi possível reordenar as listas: ${error.message}`,
      );
    }
  }
}
