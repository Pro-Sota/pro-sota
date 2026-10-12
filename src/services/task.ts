import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import type {
  KanbanBoardData,
  KanbanColumn,
  Task,
  TaskScope,
} from "@/app/components/kanban_board/types";

const DEFAULT_GENERAL_COLUMNS = [
  {
    name: "Por Fazer",
    position: 0,
    is_completed: false,
  },
  {
    name: "Em Curso",
    position: 1,
    is_completed: false,
  },
  {
    name: "Concluído",
    position: 2,
    is_completed: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Selects                                                                    */
/* -------------------------------------------------------------------------- */

const COLUMN_SELECT = `
  column_id,
  project_id,
  profile_id,
  name,
  position,
  is_completed,
  created_at,
  updated_at
`;

/* -------------------------------------------------------------------------- */
/* Task mapper                                                                */
/* -------------------------------------------------------------------------- */

function mapTask(row: any): Task {
  const members = Array.isArray(row.task_members)
    ? row.task_members
    : [];

  return {
    taskId: row.task_id,
    projectId: row.project_id,
    columnId: row.column_id,

    title: row.title,
    description: row.description,

    priority: row.priority,

    startDate: row.start_date,
    dueDate: row.due_date,

    estimatedHours: row.estimated_hours,
    actualHours: row.actual_hours,

    position: row.position,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    completed: row.completed,

    members: members.map((member: any) => {
      const profile = Array.isArray(member.profiles)
        ? member.profiles[0]
        : member.profiles;

      return {
        profileId: member.profile_id,
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        picture: profile?.profile_picture ?? null,
      };
    }),

    createdBy: row.created_by ?? "",
  };
}

/* -------------------------------------------------------------------------- */
/* General columns                                                            */
/* -------------------------------------------------------------------------- */

async function getGeneralColumns(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
) {
  // Always restrict general columns to the authenticated user's profile.
  const {
    data: existingColumns,
    error: fetchError,
  } = await supabase
    .from("task_columns")
    .select(COLUMN_SELECT)
    .is("project_id", null)
    .eq("profile_id", profileId)
    .order("position", { ascending: true });

  if (fetchError) {
    throw new Error(
      `Não foi possível carregar as colunas pessoais: ${fetchError.message}`,
    );
  }

  if (existingColumns && existingColumns.length > 0) {
    return existingColumns;
  }

  // No personal columns exist: create this user's defaults.
  const {
    data: createdColumns,
    error: createError,
  } = await supabase
    .from("task_columns")
    .insert(
      DEFAULT_GENERAL_COLUMNS.map((column) => ({
        project_id: null,
        profile_id: profileId,
        name: column.name,
        position: column.position,
        is_completed: column.is_completed,
      })),
    )
    .select(COLUMN_SELECT)
    .order("position", { ascending: true });

  if (!createError && createdColumns?.length) {
    // Defensive check: never return rows belonging to another profile.
    return createdColumns.filter(
      (column) =>
        column.profile_id === profileId &&
        column.project_id === null,
    );
  }

  /*
   * Another request may have created the columns concurrently.
   * Re-fetch only this user's columns instead of returning other
   * users' columns or assuming that creation succeeded.
   */
  const {
    data: retryColumns,
    error: retryError,
  } = await supabase
    .from("task_columns")
    .select(COLUMN_SELECT)
    .is("project_id", null)
    .eq("profile_id", profileId)
    .order("position", { ascending: true });

  if (retryError) {
    throw new Error(
      `Não foi possível recuperar as colunas pessoais: ${retryError.message}`,
    );
  }

  if (retryColumns && retryColumns.length > 0) {
    return retryColumns;
  }

  throw new Error(
    `Não foi possível criar as colunas padrão. ${
      createError?.message ?? "Nenhuma coluna foi devolvida."
    }`,
  );
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */



export async function getTaskBoard(
  scope: TaskScope,
): Promise<KanbanBoardData> {
  const supabase = await createClient(await cookies());

  // 1. Authenticate the current user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  // 2. Resolve the profile and role.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_id, role_id")
    .eq("profile_id", user.id)
    .single();

  if (profileError || !profile) {
    console.error(
      "[getTaskBoard] Profile lookup failed:",
      profileError,
    );
    throw new Error("Perfil do utilizador não encontrado.");
  }

  const profileId = profile.profile_id;
  const isAdmin = profile.role_id === 1;

  // 3. Load the appropriate board columns.
  let columns: any[] = [];

  if (scope.type === "general") {
    // Personal columns remain restricted to their owner.
    columns = await getGeneralColumns(supabase, profileId);
  } else {
    if (!scope.projectId) {
      throw new Error("ID do projecto inválido.");
    }

    // Admins can access any project board.
    // Other users must be members of the requested project.
    if (!isAdmin) {
      const { data: membership, error: membershipError } =
        await supabase
          .from("project_members")
          .select("project_id")
          .eq("project_id", scope.projectId)
          .eq("profile_id", profileId)
          .limit(1)
          .maybeSingle();

      if (membershipError) {
        console.error(
          "[getTaskBoard] Membership lookup failed:",
          membershipError,
        );

        throw new Error(
          "Não foi possível verificar o acesso ao projecto.",
        );
      }

      if (!membership) {
        throw new Error("Não tem acesso a este projecto.");
      }
    }

    // Project columns are shared across the project.
    const { data: projectColumns, error: columnsError } =
      await supabase
        .from("task_columns")
        .select(COLUMN_SELECT)
        .eq("project_id", scope.projectId)
        .order("position", { ascending: true });

    if (columnsError) {
      console.error(
        "[getTaskBoard] Project columns lookup failed:",
        columnsError,
      );

      throw new Error(
        `Não foi possível carregar as colunas: ${columnsError.message}`,
      );
    }

    columns = projectColumns ?? [];
  }

  // 4. Query tasks according to board scope.
  let tasksQuery = supabase
    .from("tasks")
    .select(`
      task_id,
      project_id,
      column_id,
      title,
      description,
      priority,
      start_date,
      due_date,
      estimated_hours,
      actual_hours,
      position,
      created_at,
      updated_at,
      completed,
      created_by,
      task_members (
        task_member_id,
        task_id,
        profile_id,
        profiles (
          profile_id,
          first_name,
          last_name,
          profile_picture
        )
      )
    `)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (scope.type === "general") {
    // Personal tasks: only tasks created by the current user.
    tasksQuery = tasksQuery
      .is("project_id", null)
      .eq("created_by", user.id);
  } else {
    // All tasks for this project, not just tasks assigned
    // to the current user or created by the current user.
    tasksQuery = tasksQuery.eq("project_id", scope.projectId);
  }

  const { data: taskRows, error: tasksError } =
    await tasksQuery;

  if (tasksError) {
    console.error(
      "[getTaskBoard] Tasks lookup failed:",
      tasksError,
    );

    throw new Error(
      `Não foi possível carregar as tarefas: ${tasksError.message}`,
    );
  }

  // 5. Normalize columns for the Kanban UI.
  const normalizedColumns: KanbanColumn[] = columns.map(
    (column) => ({
      columnId: column.column_id,
      projectId: column.project_id,
      name: column.name,
      position: column.position,
      isCompleted: column.is_completed,
      createdAt: column.created_at,
      updatedAt: column.updated_at,
    }),
  );

  // 6. Normalize tasks.
  const normalizedTasks: Task[] = (taskRows ?? []).map(mapTask);

  return {
    scope,
    columns: normalizedColumns,
    tasks: normalizedTasks,
  };
}
