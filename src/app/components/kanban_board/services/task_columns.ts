import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import type {
  CreateColumnInput,
  KanbanColumn,
  TaskScope,
} from "../types";

type TaskColumnRow = {
  column_id: string;
  project_id: string | null;
  profile_id: string | null;
  name: string;
  position: number;
  is_completed: boolean;
};

function mapColumn(row: TaskColumnRow): KanbanColumn {
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

async function getCurrentUserId(): Promise<string> {
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

async function getCurrentProfileId(): Promise<string> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("profile_id")
    .eq("profile_id", userId)
    .single();

  if (error || !profile) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  return profile.profile_id;
}

/**
 * Admin = role_id 1.
 * The role is always resolved server-side.
 */
async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("profile_id", userId)
    .single();

  if (error || !profile) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  return profile.role_id === 1;
}

/**
 * Admins bypass project membership checks.
 * Other users must belong to the project.
 */
async function assertProjectMember(
  projectId: string,
): Promise<void> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_id, role_id")
    .eq("profile_id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  if (profile.role_id === 1) {
    return;
  }

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
 * Admin:
 *   Can load columns from any project and personal boards.
 *
 * General:
 *   Non-admin users see only their own columns.
 *
 * Project:
 *   Non-admin users must be project members.
 */
export async function getTaskColumns(scope: TaskScope) {
  const supabase = await getSupabase();
  const isAdmin = await isCurrentUserAdmin();

  let query = supabase
    .from("task_columns")
    .select(
      "column_id, project_id, profile_id, name, position, is_completed",
    )
    .order("position", { ascending: true });

  if (scope.type === "general") {
    query = query.is("project_id", null);

    if (!isAdmin) {
      const profileId = await getCurrentProfileId();
      query = query.eq("profile_id", profileId);
    }
  } else {
    await assertProjectMember(scope.projectId);
    query = query.eq("project_id", scope.projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(
      `Não foi possível carregar as listas: ${error.message}`,
    );
  }

  return (data ?? []).map(mapColumn);
}

/**
 * Creates a task column.
 *
 * Admin:
 *   Can create columns on personal boards and project boards.
 *
 * General:
 *   Non-admin columns belong to the current user.
 *
 * Project:
 *   Non-admin users must be project members.
 */
export async function createTaskColumn(
  scope: TaskScope,
  input: CreateColumnInput,
) {
  const supabase = await getSupabase();
  const isAdmin = await isCurrentUserAdmin();

  const name = input.name.trim();

  if (!name) {
    throw new Error("O nome da lista é obrigatório.");
  }

  let profileId: string | null = null;
  let projectId: string | null = null;

  if (scope.type === "general") {
    // Admin-created personal-board columns are owned by Admin.
    // Non-admin users can create only their own columns.
    profileId = await getCurrentProfileId();
  } else {
    await assertProjectMember(scope.projectId);
    projectId = scope.projectId;
  }

  let positionQuery = supabase
    .from("task_columns")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  if (scope.type === "general") {
    positionQuery = positionQuery
      .is("project_id", null)
      .eq("profile_id", profileId);
  } else {
    positionQuery = positionQuery.eq("project_id", projectId);
  }

  const {
    data: existingColumns,
    error: positionError,
  } = await positionQuery;

  if (positionError) {
    throw new Error(
      `Não foi possível calcular a posição da lista: ${positionError.message}`,
    );
  }

  const position = (existingColumns?.[0]?.position ?? -1) + 1;

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
      `Não foi possível criar a lista: ${error.message}`,
    );
  }

  return mapColumn(data);
}

/**
 * Updates a task column.
 *
 * Admin:
 *   Can update any column, subject to database RLS.
 *
 * General:
 *   Non-admin users can update only their own columns.
 *
 * Project:
 *   Non-admin users must be project members.
 */
export async function updateTaskColumn(
  columnId: string,
  input: Partial<CreateColumnInput>,
) {
  const supabase = await getSupabase();
  const isAdmin = await isCurrentUserAdmin();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      throw new Error("O nome da lista é obrigatório.");
    }

    payload.name = name;
  }

  if (input.isCompleted !== undefined) {
    payload.is_completed = input.isCompleted;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Nenhuma alteração foi fornecida.");
  }

  const {
    data: column,
    error: findError,
  } = await supabase
    .from("task_columns")
    .select(
      "column_id, project_id, profile_id, name, position, is_completed",
    )
    .eq("column_id", columnId)
    .single();

  if (findError || !column) {
    throw new Error("Lista não encontrada.");
  }

  if (column.project_id === null) {
    if (
      !isAdmin &&
      column.profile_id !== (await getCurrentProfileId())
    ) {
      throw new Error(
        "Não tem permissão para alterar esta lista.",
      );
    }
  } else {
    await assertProjectMember(column.project_id);
  }

  const { data, error } = await supabase
    .from("task_columns")
    .update(payload)
    .eq("column_id", columnId)
    .select(
      "column_id, project_id, profile_id, name, position, is_completed",
    )
    .single();

  if (error) {
    throw new Error(
      `Não foi possível actualizar a lista: ${error.message}`,
    );
  }

  return mapColumn(data);
}

/**
 * Deletes a task column.
 *
 * General board:
 *   - Non-admin users can delete only their own empty columns.
 *   - Admins can delete populated columns after choosing a destination.
 *   - Only tasks belonging to the current user's personal board
 *     are moved.
 *
 * Project board:
 *   - The user must have project access.
 *   - Admins can delete populated columns after choosing a destination.
 *   - Other users can delete only empty columns.
 */
export async function deleteTaskColumn(
  columnId: string,
  destinationColumnId?: string,
): Promise<void> {
  if (!columnId) {
    throw new Error("ID da lista inválido.");
  }

  const supabase = await getSupabase();
  const isAdmin = await isCurrentUserAdmin();
  const currentUserId = await getCurrentUserId();
  const currentProfileId = await getCurrentProfileId();

  const {
    data: column,
    error: columnError,
  } = await supabase
    .from("task_columns")
    .select("column_id, project_id, profile_id")
    .eq("column_id", columnId)
    .single();

  if (columnError || !column) {
    throw new Error("Lista não encontrada.");
  }

  // Verify access to the source column.
  if (column.project_id === null) {
    if (
      !isAdmin &&
      column.profile_id !== currentProfileId
    ) {
      throw new Error(
        "Não tem permissão para eliminar esta lista.",
      );
    }
  } else {
    await assertProjectMember(column.project_id);
  }

  // Count only tasks belonging to the relevant board scope.
  let tasksQuery = supabase
    .from("tasks")
    .select("task_id", {
      count: "exact",
      head: true,
    })
    .eq("column_id", columnId);

  if (column.project_id === null) {
    tasksQuery = tasksQuery
      .is("project_id", null)
      .eq("created_by", currentUserId);
  } else {
    tasksQuery = tasksQuery.eq(
      "project_id",
      column.project_id,
    );
  }

  const {
    count,
    error: countError,
  } = await tasksQuery;

  if (countError) {
    throw new Error(
      `Não foi possível verificar as tarefas da lista: ${countError.message}`,
    );
  }

  const taskCount = count ?? 0;

  // Non-admin users cannot delete populated columns.
  if (taskCount > 0 && !isAdmin) {
    throw new Error(
      "Não é possível eliminar uma lista que contém tarefas. Mova as tarefas primeiro.",
    );
  }

  // Move tasks before deleting a populated column.
  if (taskCount > 0) {
    if (!destinationColumnId) {
      throw new Error(
        "Esta lista contém tarefas. Seleccione uma lista de destino antes de eliminar.",
      );
    }

    if (destinationColumnId === columnId) {
      throw new Error(
        "A lista de destino tem de ser diferente da lista a eliminar.",
      );
    }

    let destinationQuery = supabase
      .from("task_columns")
      .select("column_id")
      .eq("column_id", destinationColumnId);

    if (column.project_id === null) {
      destinationQuery = destinationQuery
        .is("project_id", null)
        .eq("profile_id", column.profile_id);
    } else {
      destinationQuery = destinationQuery.eq(
        "project_id",
        column.project_id,
      );
    }

    const {
      data: destination,
      error: destinationError,
    } = await destinationQuery.maybeSingle();

    if (destinationError || !destination) {
      throw new Error(
        "A lista de destino não existe ou não pertence ao mesmo quadro.",
      );
    }

    let moveQuery = supabase
      .from("tasks")
      .update({ column_id: destinationColumnId })
      .eq("column_id", columnId);

    if (column.project_id === null) {
      moveQuery = moveQuery
        .is("project_id", null)
        .eq("created_by", currentUserId);
    } else {
      moveQuery = moveQuery.eq(
        "project_id",
        column.project_id,
      );
    }

    const { error: moveError } = await moveQuery;

    if (moveError) {
      throw new Error(
        `Não foi possível mover as tarefas: ${moveError.message}`,
      );
    }
  }

  // Delete only after the required task movement succeeds.
  const { error: deleteError } = await supabase
    .from("task_columns")
    .delete()
    .eq("column_id", columnId);

  if (deleteError) {
    throw new Error(
      `Não foi possível eliminar a lista: ${deleteError.message}`,
    );
  }
}

/**
 * Reorders task columns.
 *
 * Admin:
 *   Can reorder any personal-board columns and project columns.
 *
 * General:
 *   Non-admin users can reorder only their own columns.
 *
 * Project:
 *   Non-admin users must be project members.
 */
export async function reorderTaskColumns(
  scope: TaskScope,
  orderedColumnIds: string[],
): Promise<void> {
  const supabase = await getSupabase();
  const isAdmin = await isCurrentUserAdmin();

  let profileId: string | null = null;

  if (scope.type === "general") {
    if (!isAdmin) {
      profileId = await getCurrentProfileId();
    }
  } else {
    await assertProjectMember(scope.projectId);
  }

  // Validate the entire ordered set before changing positions.
  if (orderedColumnIds.length > 0) {
    const { data: columns, error: columnsError } = await supabase
      .from("task_columns")
      .select("column_id, project_id, profile_id")
      .in("column_id", orderedColumnIds);

    if (columnsError) {
      throw new Error(
        `Não foi possível validar as listas: ${columnsError.message}`,
      );
    }

    const foundColumns = columns ?? [];

    if (foundColumns.length !== new Set(orderedColumnIds).size) {
      throw new Error(
        "Uma ou mais listas não foram encontradas.",
      );
    }

    const allInScope = foundColumns.every((column) => {
      if (scope.type === "general") {
        return (
          column.project_id === null &&
          (isAdmin || column.profile_id === profileId)
        );
      }

      return column.project_id === scope.projectId;
    });

    if (!allInScope) {
      throw new Error(
        "Não pode reordenar listas que pertencem a outro quadro.",
      );
    }
  }

  for (let index = 0; index < orderedColumnIds.length; index += 1) {
    let query = supabase
      .from("task_columns")
      .update({ position: index })
      .eq("column_id", orderedColumnIds[index]);

    if (scope.type === "general") {
      query = query.is("project_id", null);

      if (!isAdmin) {
        query = query.eq("profile_id", profileId);
      }
    } else {
      query = query.eq("project_id", scope.projectId);
    }

    const { error } = await query;

    if (error) {
      console.error("[reorderTaskColumns] Failed:", {
        columnId: orderedColumnIds[index],
        error,
      });

      throw new Error(
        `Não foi possível reordenar as listas: ${error.message}`,
      );
    }
  }
}