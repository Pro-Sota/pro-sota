import "server-only";

import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";
import type { Database } from "@/app/lib/supabase/models";

import type {
  CreateTaskInput,
  KanbanBoardData,
  Task,
  TaskMember,
  TaskScope,
  UpdateTaskInput,
} from "../types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Supabase = Awaited<ReturnType<typeof getSupabase>>;

type TaskRow =
  Database["public"]["Tables"]["tasks"]["Row"];

type TaskUpdate =
  Database["public"]["Tables"]["tasks"]["Update"];

type DatabaseTaskPriority = "Low" | "Medium" | "High" | "Critical";

type TaskMemberRow = {
  profile_id: string;
  profiles:
    | {
        profile_id: string;
        first_name: string | null;
        last_name: string | null;
        profile_picture: string | null;
      }
    | {
        profile_id: string;
        first_name: string | null;
        last_name: string | null;
        profile_picture: string | null;
      }[]
    | null;
};

type TaskWithMembers = Omit<TaskRow, "status"> & {
  task_members: TaskMemberRow[] | null;
};

const TASK_SELECT = `
  task_id,
  project_id,
  created_by,
  column_id,
  phase_id,
  stage_id,
  review_status,
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
  task_members (
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
/* Normalization                                                              */
/* -------------------------------------------------------------------------- */

const PRIORITY_MAP: Record<string, DatabaseTaskPriority> = {
  low: "Low",
  baixa: "Low",
  medium: "Medium",
  media: "Medium",
  média: "Medium",
  high: "High",
  alta: "High",
  critical: "Critical",
  critica: "Critical",
  crítica: "Critical",
};

function normalizePriority(value: unknown): DatabaseTaskPriority {
  if (typeof value !== "string") return "Medium";

  return PRIORITY_MAP[value.trim().toLowerCase()] ?? "Medium";
}

function normalizeReviewStatus(value: unknown): Task["reviewStatus"] {
  switch (value) {
    case "in_review":
    case "changes_requested":
    case "approved":
    case "not_submitted":
      return value;
    default:
      throw new Error("Estado de revisão da tarefa inválido.");
  }
}

function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  return value.trim() || null;
}

function normalizeMemberIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeHours(
  value: number | null | undefined,
  fieldName: string,
): number | null {
  if (value == null) return null;

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${fieldName} deve ser igual ou superior a zero.`);
  }

  return value;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (value == null || value.trim() === "") return null;

  const date = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Data inválida. Utilize o formato YYYY-MM-DD.");
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error("Data inválida.");
  }

  return date;
}

function validateDateRange(
  startDate: string | null,
  dueDate: string | null,
): void {
  if (startDate && dueDate && dueDate < startDate) {
    throw new Error(
      "A data de conclusão não pode ser anterior à data de início.",
    );
  }
}

function assertTaskEditable(
  projectId: string | null,
  reviewStatus: unknown,
): void {
  if (
    projectId !== null &&
    (reviewStatus === "in_review" || reviewStatus === "approved")
  ) {
    throw new Error(
      "Uma tarefa em revisão ou aprovada não pode ser alterada ou eliminada.",
    );
  }
}

function mapTask(row: TaskWithMembers): Task {
  return {
    taskId: row.task_id,
    projectId: row.project_id,
    createdBy: row.created_by ?? "not defined",
    columnId: row.column_id,
    phaseId: row.phase_id,
    stageId: row.stage_id,

    reviewStatus: normalizeReviewStatus(row.review_status),
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewNotes: row.review_notes,

    title: row.title,
    description: row.description,
    priority: normalizePriority(row.priority).toLowerCase() as Task["priority"],

    startDate: row.start_date,
    dueDate: row.due_date,

    estimatedHours:
      row.estimated_hours == null ? null : Number(row.estimated_hours),
    actualHours:
      row.actual_hours == null ? null : Number(row.actual_hours),

    position: row.position ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completed: Boolean(row.completed),

    members: (row.task_members ?? []).map((item): TaskMember => {
      const profile = Array.isArray(item.profiles)
        ? item.profiles[0]
        : item.profiles;

      return {
        profileId: item.profile_id,
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        picture: profile?.profile_picture ?? null,
      };
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* Authentication and permissions                                           */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  return createClient();
}

async function getCurrentUserId(supabase: Supabase): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  return user.id;
}

async function getCurrentProfile(supabase: Supabase) {
  const userId = await getCurrentUserId(supabase);

  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id, role_id")
    .eq("profile_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Perfil do utilizador não encontrado.");
  }

  return data;
}

async function assertProjectMember(
  supabase: Supabase,
  projectId: string,
): Promise<string> {
  if (!projectId) throw new Error("ID do projecto inválido.");

  const profile = await getCurrentProfile(supabase);

  if (profile.role_id === 1) return profile.profile_id;

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

  if (!data) throw new Error("Não tem acesso a este projecto.");

  return profile.profile_id;
}

async function assertProjectBoardManager(
  supabase: Supabase,
  projectId: string,
): Promise<string> {
  if (!projectId) throw new Error("ID do projecto inválido.");

  const profile = await getCurrentProfile(supabase);

  if (profile.role_id === 1) return profile.profile_id;

  const { data, error } = await supabase
    .from("project_members")
    .select("project_members_id")
    .eq("project_id", projectId)
    .eq("profile_id", profile.profile_id)
    .eq("role_id", 1)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível verificar as permissões do projecto.");
  }

  if (!data) {
    throw new Error(
      "Apenas o Project Manager ou um Administrador pode gerir as tarefas.",
    );
  }

  return profile.profile_id;
}

function assertPersonalTaskOwner(
  createdBy: string,
  currentUserId: string,
): void {
  if (createdBy !== currentUserId) {
    throw new Error("Não tem permissão para gerir esta tarefa.");
  }
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

async function validateProjectMemberIds(
  supabase: Supabase,
  projectId: string,
  profileIds: string[],
): Promise<void> {
  if (!profileIds.length) return;

  const { data, error } = await supabase
    .from("project_members")
    .select("profile_id")
    .eq("project_id", projectId)
    .in("profile_id", profileIds);

  if (error) {
    throw new Error("Não foi possível validar os membros da tarefa.");
  }

  const validIds = new Set((data ?? []).map((member) => member.profile_id));

  if (profileIds.some((id) => !validIds.has(id))) {
    throw new Error(
      "Uma ou mais pessoas seleccionadas não pertencem ao projecto.",
    );
  }
}

async function validateTaskColumn(
  supabase: Supabase,
  scope: TaskScope,
  columnId: string,
  currentProfileId: string,
): Promise<void> {
  const { data: column, error } = await supabase
    .from("task_columns")
    .select("column_id, project_id, profile_id, is_completed")
    .eq("column_id", columnId)
    .single();

  if (error || !column) {
    throw new Error("A coluna seleccionada não existe.");
  }

  if (scope.type === "general") {
    if (
      column.project_id !== null ||
      column.profile_id !== currentProfileId
    ) {
      throw new Error("A coluna não pertence ao seu quadro pessoal.");
    }

    return;
  }

  if (column.project_id !== scope.projectId) {
    throw new Error("A coluna não pertence a este projecto.");
  }

  if (column.is_completed) {
    throw new Error(
      "As tarefas de projecto só podem entrar numa coluna concluída após aprovação.",
    );
  }
}

async function validatePhaseAndStage(
  supabase: Supabase,
  scope: TaskScope,
  phaseId: string | null,
  stageId: string | null,
): Promise<void> {
  if (scope.type === "general") {
    if (phaseId || stageId) {
      throw new Error(
        "Fases e etapas só podem ser associadas a tarefas de projecto.",
      );
    }

    return;
  }

  if (stageId && !phaseId) {
    throw new Error("Uma etapa deve estar associada a uma fase.");
  }

  if (phaseId) {
    const { data, error } = await supabase
      .from("project_phases")
      .select("phase_id")
      .eq("phase_id", phaseId)
      .eq("project_id", scope.projectId)
      .maybeSingle();

    if (error || !data) {
      throw new Error("A fase seleccionada não pertence ao projecto.");
    }
  }

  if (stageId && phaseId) {
    const { data, error } = await supabase
      .from("phase_stages")
      .select("stage_id")
      .eq("stage_id", stageId)
      .eq("phase_id", phaseId)
      .maybeSingle();

    if (error || !data) {
      throw new Error("A etapa seleccionada não pertence à fase.");
    }
  }
}

async function validateAssignments(
  supabase: Supabase,
  scope: TaskScope,
  memberIds: string[],
): Promise<void> {
  if (scope.type === "general") {
    if (memberIds.length) {
      throw new Error("As tarefas pessoais não podem ter membros atribuídos.");
    }

    return;
  }

  await validateProjectMemberIds(supabase, scope.projectId, memberIds);
}

/* -------------------------------------------------------------------------- */
/* Read                                                                       */
/* -------------------------------------------------------------------------- */

export async function getTasks(scope: TaskScope): Promise<Task[]> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId(supabase);

  let query = supabase
    .from("tasks")
    .select(TASK_SELECT)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (scope.type === "general") {
    query = query.is("project_id", null).eq("created_by", userId);
  } else {
    await assertProjectMember(supabase, scope.projectId);
    query = query.eq("project_id", scope.projectId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Não foi possível carregar as tarefas: ${error.message}`);
  }

  return (data ?? []).map(mapTask);
}

export async function getTask(taskId: string): Promise<Task> {
  if (!taskId) throw new Error("ID da tarefa inválido.");

  const supabase = await getSupabase();
  const userId = await getCurrentUserId(supabase);

  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("task_id", taskId)
    .single();

  if (error || !data) throw new Error("Tarefa não encontrada.");

  if (data.project_id === null) {
    assertPersonalTaskOwner(data.created_by, userId);
  } else {
    await assertProjectMember(supabase, data.project_id);
  }

  return mapTask(data);
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export async function createTask(
  scope: TaskScope,
  input: CreateTaskInput,
): Promise<Task> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId(supabase);
  const projectId = scope.type === "project" ? scope.projectId : null;

  if (scope.type === "project") {
    await assertProjectBoardManager(supabase, scope.projectId);
  }

  const title = input.title?.trim();

  if (!title) throw new Error("O título da tarefa é obrigatório.");

  const columnId = normalizeNullableString(input.columnId);
  const phaseId = normalizeNullableString(input.phaseId);
  const stageId = normalizeNullableString(input.stageId);
  const memberIds = normalizeMemberIds(input.memberIds);
  const startDate = normalizeDate(input.startDate);
  const dueDate = normalizeDate(input.dueDate);

  if (columnId) {
    await validateTaskColumn(supabase, scope, columnId, userId);
  }

  await validatePhaseAndStage(supabase, scope, phaseId, stageId);
  await validateAssignments(supabase, scope, memberIds);
  validateDateRange(startDate, dueDate);

  const estimatedHours = normalizeHours(
    input.estimatedHours,
    "Horas estimadas",
  );

  let positionQuery = supabase
    .from("tasks")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  positionQuery = columnId
    ? positionQuery.eq("column_id", columnId)
    : positionQuery.is("column_id", null);

  positionQuery = projectId
    ? positionQuery.eq("project_id", projectId)
    : positionQuery.is("project_id", null).eq("created_by", userId);

  const { data: positions, error: positionError } = await positionQuery;

  if (positionError) {
    throw new Error("Não foi possível calcular a posição da tarefa.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      created_by: userId,
      column_id: columnId,
      phase_id: phaseId,
      stage_id: stageId,
      title,
      description: normalizeNullableString(input.description),
      priority: normalizePriority(input.priority),
      start_date: startDate,
      due_date: dueDate,
      estimated_hours: estimatedHours,
      position: (positions?.[0]?.position ?? -1) + 1,
    })
    .select("task_id")
    .single();

  if (error || !data) {
    throw new Error(
      `Não foi possível criar a tarefa: ${error?.message ?? "Erro desconhecido."}`,
    );
  }

  if (memberIds.length) {
    const { error: memberError } = await supabase
      .from("task_members")
      .insert(
        memberIds.map((profileId) => ({
          task_id: data.task_id,
          profile_id: profileId,
        })),
      );

    if (memberError) {
      await supabase.from("tasks").delete().eq("task_id", data.task_id);

      throw new Error(
        `Não foi possível atribuir os membros: ${memberError.message}`,
      );
    }
  }

  return getTask(data.task_id);
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  if (!taskId) throw new Error("ID da tarefa inválido.");

  const supabase = await getSupabase();
  const userId = await getCurrentUserId(supabase);

  const { data: existing, error } = await supabase
    .from("tasks")
    .select(
      "task_id, project_id, created_by, phase_id, stage_id, start_date, due_date, review_status",
    )
    .eq("task_id", taskId)
    .single();

  if (error || !existing) throw new Error("Tarefa não encontrada.");

  const scope: TaskScope = existing.project_id
    ? { type: "project", projectId: existing.project_id }
    : { type: "general", projectId: null };

  if (scope.type === "project") {
    await assertProjectBoardManager(supabase, scope.projectId);
  } else {
    assertPersonalTaskOwner(existing.created_by, userId);
  }

  assertTaskEditable(existing.project_id, existing.review_status);

  if (scope.type === "project" && input.completed !== undefined) {
    throw new Error(
      "As tarefas de projecto só podem ser concluídas através da aprovação.",
    );
  }

  const phaseId =
    input.phaseId !== undefined
      ? normalizeNullableString(input.phaseId)
      : existing.phase_id;

  const stageId =
    input.stageId !== undefined
      ? normalizeNullableString(input.stageId)
      : existing.stage_id;

  await validatePhaseAndStage(supabase, scope, phaseId, stageId);

  const startDate =
    input.startDate !== undefined
      ? normalizeDate(input.startDate)
      : existing.start_date;

  const dueDate =
    input.dueDate !== undefined
      ? normalizeDate(input.dueDate)
      : existing.due_date;

  validateDateRange(startDate, dueDate);

  const memberIds =
    input.memberIds !== undefined
      ? normalizeMemberIds(input.memberIds)
      : null;

  if (memberIds !== null) {
    await validateAssignments(supabase, scope, memberIds);
  }

  const payload: TaskUpdate = {};

  if (input.title !== undefined) {
    const title = input.title.trim();

    if (!title) throw new Error("O título da tarefa é obrigatório.");

    payload.title = title;
  }

  if (input.description !== undefined) {
    payload.description = normalizeNullableString(input.description);
  }

  if (input.columnId !== undefined) {
    const columnId = normalizeNullableString(input.columnId);

    if (columnId) {
      await validateTaskColumn(supabase, scope, columnId, userId);
    }

    payload.column_id = columnId;
  }

  if (input.phaseId !== undefined) payload.phase_id = phaseId;
  if (input.stageId !== undefined) payload.stage_id = stageId;

  if (input.priority !== undefined) {
    payload.priority = normalizePriority(input.priority);
  }

  if (input.startDate !== undefined) payload.start_date = startDate;
  if (input.dueDate !== undefined) payload.due_date = dueDate;

  if (input.estimatedHours !== undefined) {
    payload.estimated_hours = normalizeHours(
      input.estimatedHours,
      "Horas estimadas",
    );
  }

  if (input.actualHours !== undefined) {
    payload.actual_hours = normalizeHours(
      input.actualHours,
      "Horas realizadas",
    );
  }

  if (scope.type === "general" && input.completed !== undefined) {
    payload.completed = input.completed;
  }

  if (Object.keys(payload).length) {
    let update = supabase
      .from("tasks")
      .update(payload)
      .eq("task_id", taskId);

    if (scope.type === "project") {
      update = update
        .eq("project_id", scope.projectId)
        .not("review_status", "in", "(in_review,approved)");
    } else {
      update = update
        .is("project_id", null)
        .eq("created_by", userId);
    }

    const { data: updated, error: updateError } = await update
      .select("task_id")
      .single();

    if (updateError || !updated) {
      throw new Error("Não foi possível actualizar a tarefa.");
    }
  }

  if (memberIds !== null) {
    const { error: deleteError } = await supabase
      .from("task_members")
      .delete()
      .eq("task_id", taskId);

    if (deleteError) {
      throw new Error("Não foi possível actualizar os membros da tarefa.");
    }

    if (memberIds.length) {
      const { error: memberError } = await supabase
        .from("task_members")
        .insert(
          memberIds.map((profileId) => ({
            task_id: taskId,
            profile_id: profileId,
          })),
        );

      if (memberError) {
        throw new Error(
          `Não foi possível atribuir os membros: ${memberError.message}`,
        );
      }
    }
  }

  return getTask(taskId);
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function deleteTask(taskId: string): Promise<void> {
  if (!taskId) throw new Error("ID da tarefa inválido.");

  const supabase = await getSupabase();
  const userId = await getCurrentUserId(supabase);

  const { data: task, error } = await supabase
    .from("tasks")
    .select("task_id, project_id, created_by, review_status")
    .eq("task_id", taskId)
    .single();

  if (error || !task) throw new Error("Tarefa não encontrada.");

  if (task.project_id) {
    await assertProjectBoardManager(supabase, task.project_id);
  } else {
    assertPersonalTaskOwner(task.created_by, userId);
  }

  assertTaskEditable(task.project_id, task.review_status);

  let deletion = supabase
    .from("tasks")
    .delete()
    .eq("task_id", taskId);

  if (task.project_id) {
    deletion = deletion
      .eq("project_id", task.project_id)
      .not("review_status", "in", "(in_review,approved)");
  } else {
    deletion = deletion
      .is("project_id", null)
      .eq("created_by", userId);
  }

  const { data: deleted, error: deleteError } = await deletion
    .select("task_id")
    .single();

  if (deleteError || !deleted) {
    throw new Error("Não foi possível eliminar a tarefa.");
  }
}

/* -------------------------------------------------------------------------- */
/* Reorder                                                                    */
/* -------------------------------------------------------------------------- */

export async function reorderTasks(
  scope: TaskScope,
  columnId: string,
  orderedTaskIds: string[],
): Promise<void> {
  if (!columnId) throw new Error("ID da coluna inválido.");

  const supabase = await getSupabase();
  const userId = await getCurrentUserId(supabase);

  if (scope.type === "project") {
    await assertProjectBoardManager(supabase, scope.projectId);
  }

  await validateTaskColumn(supabase, scope, columnId, userId);

  const uniqueIds = [...new Set(orderedTaskIds)];

  if (uniqueIds.length !== orderedTaskIds.length) {
    throw new Error("A lista contém tarefas duplicadas.");
  }

  if (!uniqueIds.length) return;

  let query = supabase
    .from("tasks")
    .select("task_id, review_status")
    .in("task_id", uniqueIds);

  query =
    scope.type === "project"
      ? query.eq("project_id", scope.projectId)
      : query.is("project_id", null).eq("created_by", userId);

  const { data, error } = await query;

  if (error) {
    throw new Error("Não foi possível validar as tarefas.");
  }

  const validIds = new Set((data ?? []).map((task) => task.task_id));

  if (uniqueIds.some((id) => !validIds.has(id))) {
    throw new Error("Uma ou mais tarefas não pertencem a este quadro.");
  }

  if (
    scope.type === "project" &&
    (data ?? []).some(
      (task) =>
        task.review_status === "in_review" ||
        task.review_status === "approved",
    )
  ) {
    throw new Error(
      "As tarefas em revisão ou aprovadas não podem ser reordenadas.",
    );
  }

  for (let position = 0; position < uniqueIds.length; position++) {
    let update = supabase
      .from("tasks")
      .update({ column_id: columnId, position })
      .eq("task_id", uniqueIds[position]);

    if (scope.type === "project") {
      update = update
        .eq("project_id", scope.projectId)
        .not("review_status", "in", "(in_review,approved)");
    } else {
      update = update
        .is("project_id", null)
        .eq("created_by", userId);
    }

    const { data: updated, error: updateError } = await update
      .select("task_id")
      .single();

    if (updateError || !updated) {
      throw new Error("Não foi possível reordenar as tarefas.");
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Complete board                                                             */
/* -------------------------------------------------------------------------- */

export async function getKanbanBoard(
  scope: TaskScope,
): Promise<KanbanBoardData> {
  const { getTaskColumns } = await import("./task_columns");

  const [tasks, columns] = await Promise.all([
    getTasks(scope),
    getTaskColumns(scope),
  ]);

  return { scope, columns, tasks };
}