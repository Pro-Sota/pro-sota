
import "server-only";

import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";
import type { Database } from "@/app/lib/supabase/models";

import type {
  KanbanBoardData,
  KanbanColumn,
  Task,
  TaskPriority,
  TaskScope,
  TaskReviewStatus,
} from "@/app/components/kanban_board/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

type ColumnRow =
  Database["public"]["Tables"]["task_columns"]["Row"];

type TaskMemberRow =
  Database["public"]["Tables"]["task_members"]["Row"];

type ProfileRow =
  Database["public"]["Tables"]["profiles"]["Row"];

type MemberWithProfile = Pick<TaskMemberRow, "profile_id"> & {
  profiles:
    | Pick<
        ProfileRow,
        "first_name" | "last_name" | "profile_picture"
      >
    | Pick<
        ProfileRow,
        "first_name" | "last_name" | "profile_picture"
      >[]
    | null;
};

type TaskWithMembers = TaskRow & {
  task_members: MemberWithProfile[] | null;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

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

const TASK_SELECT = `
  task_id,
  project_id,
  column_id,
  phase_id,
  stage_id,
  review_status,
  status,
  submitted_at,
  reviewed_at,
  reviewed_by,
  review_notes,
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
`;

/* -------------------------------------------------------------------------- */
/* Normalizers                                                                */
/* -------------------------------------------------------------------------- */

function normalizePriority(
  priority: string | null,
): TaskPriority {
  switch (priority?.toLowerCase()) {
    case "low":
      return "low";

    case "high":
      return "high";

    case "critical":
      return "critical";

    case "medium":
    default:
      return "medium";
  }
}


function normalizeReviewStatus(
  status: string | null,
): TaskReviewStatus {
  switch (status) {
    case "not_submitted":
    case "in_review":
    case "changes_requested":
    case "approved":
      return status;

    default:
      return "not_submitted";
  }
}


/* -------------------------------------------------------------------------- */
/* Mappers                                                                    */
/* -------------------------------------------------------------------------- */

function mapColumn(column: ColumnRow): KanbanColumn {
  return {
    columnId: column.column_id,
    projectId: column.project_id,
    name: column.name,
    position: column.position,
    isCompleted: column.is_completed,
    createdAt: column.created_at,
    updatedAt: column.updated_at,
  };
}

function mapTask(row: TaskWithMembers): Task {
  return {
  taskId: row.task_id,
  projectId: row.project_id,
  createdBy: row.created_by ?? "",
  columnId: row.column_id,

  phaseId: row.phase_id,
  stageId: row.stage_id,
  reviewStatus: normalizeReviewStatus(row.review_status),

  title: row.title,
  description: row.description,
  priority: normalizePriority(row.priority),

  startDate: row.start_date,
  dueDate: row.due_date,

  estimatedHours: row.estimated_hours === null
    ? null
    : Number(row.estimated_hours),

  actualHours: row.actual_hours === null
    ? null
    : Number(row.actual_hours),

  position: row.position,
  createdAt: row.created_at,
  updatedAt: row.updated_at,

  completed: row.completed,

  members: (row.task_members ?? []).map((member) => {
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
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at,
  reviewedBy: row.reviewed_by,
  reviewNotes: row.review_notes,

};
}

/* -------------------------------------------------------------------------- */
/* Authentication                                                             */
/* -------------------------------------------------------------------------- */

async function getCurrentProfile(
  supabase: SupabaseClient,
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("profile_id, role_id")
      .eq("profile_id", user.id)
      .single();

  if (profileError || !profile) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  return {
    userId: user.id,
    profileId: profile.profile_id,
    roleId: profile.role_id,
  };
}

/* -------------------------------------------------------------------------- */
/* Personal columns                                                           */
/* -------------------------------------------------------------------------- */

async function getGeneralColumns(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ColumnRow[]> {
  const { data: existingColumns, error: fetchError } =
    await supabase
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

  if (existingColumns?.length) {
    return existingColumns;
  }

  const { data: createdColumns, error: createError } =
    await supabase
      .from("task_columns")
      .insert(
        DEFAULT_GENERAL_COLUMNS.map((column) => ({
          project_id: null,
          profile_id: profileId,
          ...column,
        })),
      )
      .select(COLUMN_SELECT)
      .order("position", { ascending: true });

  if (!createError && createdColumns?.length) {
    return createdColumns;
  }

  // Outra requisição pode ter criado as colunas entretanto.
  const { data: retryColumns, error: retryError } =
    await supabase
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

  if (retryColumns?.length) {
    return retryColumns;
  }

  throw new Error(
    `Não foi possível criar as colunas padrão: ${
      createError?.message ?? "Nenhuma coluna foi devolvida."
    }`,
  );
}

/* -------------------------------------------------------------------------- */
/* Project access                                                             */
/* -------------------------------------------------------------------------- */

async function verifyProjectAccess(
  supabase: SupabaseClient,
  projectId: string,
  profileId: string,
  roleId: number,
): Promise<void> {
  // Administradores da plataforma podem consultar quadros de projecto.
  if (roleId === 1) {
    return;
  }

  const { data: membership, error } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("project_id", projectId)
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível verificar o acesso ao projecto: ${error.message}`,
    );
  }

  if (!membership) {
    throw new Error("Não tem acesso a este projecto.");
  }
}

/* -------------------------------------------------------------------------- */
/* Task board                                                                 */
/* -------------------------------------------------------------------------- */

export async function getTaskBoard(
  scope: TaskScope,
): Promise<KanbanBoardData> {
  const supabase = await createClient();

  const currentUser = await getCurrentProfile(supabase);

  let columns: ColumnRow[];

  if (scope.type === "general") {
    // O quadro pessoal pertence exclusivamente ao utilizador autenticado.
    columns = await getGeneralColumns(
      supabase,
      currentUser.profileId,
    );
  } else {
    if (!scope.projectId?.trim()) {
      throw new Error("ID do projecto inválido.");
    }

    await verifyProjectAccess(
      supabase,
      scope.projectId,
      currentUser.profileId,
      currentUser.roleId,
    );

    const { data: projectColumns, error: columnsError } =
      await supabase
        .from("task_columns")
        .select(COLUMN_SELECT)
        .eq("project_id", scope.projectId)
        .order("position", { ascending: true });

    if (columnsError) {
      throw new Error(
        `Não foi possível carregar as colunas: ${columnsError.message}`,
      );
    }

    columns = projectColumns ?? [];
  }

  let tasksQuery = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (scope.type === "general") {
    tasksQuery = tasksQuery
      .is("project_id", null)
      .eq("created_by", currentUser.userId);
  } else {
    tasksQuery = tasksQuery.eq(
      "project_id",
      scope.projectId,
    );
  }

  const { data: taskRows, error: tasksError } =
    await tasksQuery;

  if (tasksError) {
    throw new Error(
      `Não foi possível carregar as tarefas: ${tasksError.message}`,
    );
  }

  return {
    scope,
    columns: columns.map(mapColumn),
    tasks: (taskRows ?? []).map((row) =>
      mapTask(row as TaskWithMembers),
    ),
  };
}
