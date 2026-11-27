
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import type {
  CreateColumnInput,
  KanbanColumn,
  TaskScope,
} from "../types";

type Supabase = Awaited<ReturnType<typeof getSupabase>>;

type TaskColumnRow = {
  column_id: string;
  project_id: string | null;
  profile_id: string | null;
  name: string;
  position: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

type UserProfile = {
  profile_id: string;
  role_id: number;
};

async function getSupabase() {
  return createClient();
}

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
    profile: profile as UserProfile,
  };
}

function mapColumn(row: TaskColumnRow): KanbanColumn {
  return {
    columnId: row.column_id,
    projectId: row.project_id,
    name: row.name,
    position: row.position,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertProjectMember(
  supabase: Supabase,
  projectId: string,
  profile: UserProfile,
): Promise<void> {
  if (profile.role_id === 1) return;

  const { data, error } = await supabase
    .from("project_members")
    .select("project_members_id")
    .eq("project_id", projectId)
    .eq("profile_id", profile.profile_id)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível verificar o acesso ao projecto.");
  }

  if (!data) {
    throw new Error("Não tem acesso a este projecto.");
  }
}

async function assertProjectBoardManager(
  supabase: Supabase,
  projectId: string,
  profile: UserProfile,
): Promise<void> {
  // Admin da plataforma.
  if (profile.role_id === 1) return;

  // Project Manager deste projecto.
  const { data, error } = await supabase
    .from("project_members")
    .select("project_members_id")
    .eq("project_id", projectId)
    .eq("profile_id", profile.profile_id)
    .eq("role_id", 1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível verificar as permissões do projecto.");
  }

  if (!data) {
    throw new Error(
      "Apenas o Project Manager ou um Administrador pode gerir este quadro.",
    );
  }
}

function assertPersonalBoardOwner(
  columnProfileId: string | null,
  currentProfileId: string,
): void {
  if (!columnProfileId || columnProfileId !== currentProfileId) {
    throw new Error("Não tem permissão para gerir esta lista pessoal.");
  }
}

async function getColumn(
  supabase: Supabase,
  columnId: string,
): Promise<TaskColumnRow> {
  const { data, error } = await supabase
    .from("task_columns")
    .select(
      "column_id, project_id, profile_id, name, position, is_completed, created_at, updated_at",
    )
    .eq("column_id", columnId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Lista não encontrada.");
  }

  return data as TaskColumnRow;
}

function validateColumnName(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new Error("O nome da lista é obrigatório.");
  }

  if (trimmed.length > 100) {
    throw new Error("O nome da lista não pode exceder 100 caracteres.");
  }

  return trimmed;
}

async function assertScopeAccess(
  supabase: Supabase,
  scope: TaskScope,
  profile: UserProfile,
  management = false,
): Promise<void> {
  if (scope.type === "general") return;

  if (management) {
    await assertProjectBoardManager(supabase, scope.projectId, profile);
  } else {
    await assertProjectMember(supabase, scope.projectId, profile);
  }
}

/* GET */

export async function getTaskColumns(
  scope: TaskScope,
): Promise<KanbanColumn[]> {
  const { supabase, profile } = await getCurrentContext();

  await assertScopeAccess(supabase, scope, profile);

  let query = supabase
    .from("task_columns")
    .select(
      "column_id, project_id, profile_id, name, position, is_completed, created_at, updated_at",
    )
    .order("position", { ascending: true });

  if (scope.type === "general") {
    query = query
      .is("project_id", null)
      .eq("profile_id", profile.profile_id);
  } else {
    query = query.eq("project_id", scope.projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Não foi possível carregar as listas: ${error.message}`);
  }

  return (data ?? []).map((row) => mapColumn(row as TaskColumnRow));
}

/* CREATE */

export async function createTaskColumn(
  scope: TaskScope,
  input: CreateColumnInput,
): Promise<KanbanColumn> {
  const { supabase, profile } = await getCurrentContext();

  await assertScopeAccess(supabase, scope, profile, true);

  const name = validateColumnName(input.name);

  const projectId = scope.type === "project" ? scope.projectId : null;
  const profileId = scope.type === "general" ? profile.profile_id : null;

  let positionQuery = supabase
    .from("task_columns")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  if (scope.type === "general") {
    positionQuery = positionQuery
      .is("project_id", null)
      .eq("profile_id", profile.profile_id);
  } else {
    positionQuery = positionQuery.eq("project_id", scope.projectId);
  }

  const { data: existing, error: positionError } = await positionQuery;

  if (positionError) {
    throw new Error(
      `Não foi possível calcular a posição da lista: ${positionError.message}`,
    );
  }

  const position = (existing?.[0]?.position ?? -1) + 1;

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
      "column_id, project_id, profile_id, name, position, is_completed, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(
      `Não foi possível criar a lista: ${error?.message ?? "Erro desconhecido."}`,
    );
  }

  return mapColumn(data as TaskColumnRow);
}

/* UPDATE */

export async function updateTaskColumn(
  columnId: string,
  input: {
    name?: string;
    isCompleted?: boolean;
  },
): Promise<KanbanColumn> {
  if (!columnId) {
    throw new Error("ID da lista inválido.");
  }

  const { supabase, profile } = await getCurrentContext();
  const column = await getColumn(supabase, columnId);

  if (column.project_id === null) {
    assertPersonalBoardOwner(column.profile_id, profile.profile_id);
  } else {
    await assertProjectBoardManager(supabase, column.project_id, profile);
  }

  const payload: {
    name?: string;
    is_completed?: boolean;
    updated_at?: string;
  } = {};

  if (input.name !== undefined) {
    payload.name = validateColumnName(input.name);
  }

  if (input.isCompleted !== undefined) {
    payload.is_completed = input.isCompleted;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("Nenhuma alteração foi fornecida.");
  }

  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("task_columns")
    .update(payload)
    .eq("column_id", columnId)
    .select(
      "column_id, project_id, profile_id, name, position, is_completed, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(
      `Não foi possível actualizar a lista: ${error?.message ?? "Erro desconhecido."}`,
    );
  }

  return mapColumn(data as TaskColumnRow);
}

/* DELETE */

export async function deleteTaskColumn(
  columnId: string,
  destinationColumnId?: string,
): Promise<void> {
  if (!columnId) {
    throw new Error("ID da lista inválido.");
  }

  const { supabase, user, profile } = await getCurrentContext();
  const column = await getColumn(supabase, columnId);

  if (column.project_id === null) {
    assertPersonalBoardOwner(column.profile_id, profile.profile_id);
  } else {
    await assertProjectBoardManager(supabase, column.project_id, profile);
  }

  let tasksQuery = supabase
    .from("tasks")
    .select("task_id", { count: "exact", head: true })
    .eq("column_id", columnId);

  if (column.project_id === null) {
    tasksQuery = tasksQuery
      .is("project_id", null)
      .eq("created_by", user.id);
  } else {
    tasksQuery = tasksQuery.eq("project_id", column.project_id);
  }

  const { count, error: countError } = await tasksQuery;

  if (countError) {
    throw new Error(
      `Não foi possível verificar as tarefas da lista: ${countError.message}`,
    );
  }

  const taskCount = count ?? 0;

  if (taskCount > 0 && !destinationColumnId) {
    throw new Error(
      "Esta lista contém tarefas. Seleccione uma lista de destino antes de eliminar.",
    );
  }

  if (destinationColumnId) {
    if (destinationColumnId === columnId) {
      throw new Error("A lista de destino tem de ser diferente da lista a eliminar.");
    }

    let destinationQuery = supabase
      .from("task_columns")
      .select("column_id")
      .eq("column_id", destinationColumnId);

    if (column.project_id === null) {
      destinationQuery = destinationQuery
        .is("project_id", null)
        .eq("profile_id", profile.profile_id);
    } else {
      destinationQuery = destinationQuery.eq("project_id", column.project_id);
    }

    const { data: destination, error: destinationError } =
      await destinationQuery.maybeSingle();

    if (destinationError || !destination) {
      throw new Error(
        "A lista de destino não existe ou não pertence ao mesmo quadro.",
      );
    }

    if (taskCount > 0) {
      let moveQuery = supabase
        .from("tasks")
        .update({
          column_id: destinationColumnId,
          updated_at: new Date().toISOString(),
        })
        .eq("column_id", columnId);

      if (column.project_id === null) {
        moveQuery = moveQuery
          .is("project_id", null)
          .eq("created_by", user.id);
      } else {
        moveQuery = moveQuery.eq("project_id", column.project_id);
      }

      const { error: moveError } = await moveQuery;

      if (moveError) {
        throw new Error(`Não foi possível mover as tarefas: ${moveError.message}`);
      }
    }
  }

  const { error: deleteError } = await supabase
    .from("task_columns")
    .delete()
    .eq("column_id", columnId);

  if (deleteError) {
    throw new Error(`Não foi possível eliminar a lista: ${deleteError.message}`);
  }
}

/* REORDER */

export async function reorderTaskColumns(
  scope: TaskScope,
  orderedColumnIds: string[],
): Promise<void> {
  const { supabase, profile } = await getCurrentContext();

  await assertScopeAccess(supabase, scope, profile, true);

  if (new Set(orderedColumnIds).size !== orderedColumnIds.length) {
    throw new Error("A lista contém IDs duplicados.");
  }

  let query = supabase
    .from("task_columns")
    .select("column_id");

  if (scope.type === "general") {
    query = query
      .is("project_id", null)
      .eq("profile_id", profile.profile_id);
  } else {
    query = query.eq("project_id", scope.projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Não foi possível validar as listas: ${error.message}`);
  }

  const availableIds = new Set((data ?? []).map((item) => item.column_id));

  if (
    orderedColumnIds.length !== availableIds.size ||
    orderedColumnIds.some((id) => !availableIds.has(id))
  ) {
    throw new Error("A ordem enviada não corresponde às listas deste quadro.");
  }

  for (let index = 0; index < orderedColumnIds.length; index += 1) {
    let updateQuery = supabase
      .from("task_columns")
      .update({
        position: index,
        updated_at: new Date().toISOString(),
      })
      .eq("column_id", orderedColumnIds[index]);

    if (scope.type === "general") {
      updateQuery = updateQuery
        .is("project_id", null)
        .eq("profile_id", profile.profile_id);
    } else {
      updateQuery = updateQuery.eq("project_id", scope.projectId);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      throw new Error(
        `Não foi possível reordenar as listas: ${updateError.message}`,
      );
    }
  }
}
