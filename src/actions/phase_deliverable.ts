
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

const VALID_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "on_hold",
  "cancelled",
] as const;

type DeliverableStatus =
  (typeof VALID_STATUSES)[number];

export type SaveDeliverableInput = {
  id?: string;
  projectId: string;
  phaseId: string;
  stageId: string | null;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
};

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateDate(
  value: string | null,
  field: string,
) {
  if (value === null) return;

  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(`A data "${field}" é inválida.`);
  }
}

function validateInput(input: SaveDeliverableInput) {
  const title = input.title.trim();

  if (!input.projectId || !input.phaseId) {
    throw new Error(
      "O projecto e a fase são obrigatórios.",
    );
  }

  if (!title) {
    throw new Error("O título é obrigatório.");
  }

  if (title.length > 200) {
    throw new Error(
      "O título não pode ultrapassar 200 caracteres.",
    );
  }

  if (!VALID_STATUSES.includes(input.status)) {
    throw new Error(
      "O estado do entregável é inválido.",
    );
  }

  if (
    !Number.isInteger(input.progress) ||
    input.progress < 0 ||
    input.progress > 100
  ) {
    throw new Error(
      "O progresso deve estar entre 0 e 100.",
    );
  }

  if (
    !Number.isInteger(input.sort_order) ||
    input.sort_order < 0
  ) {
    throw new Error(
      "A ordem deve ser um número inteiro não negativo.",
    );
  }

  validateDate(input.start_date, "início");
  validateDate(input.due_date, "entrega");
  validateDate(input.completed_at, "conclusão");

  if (
    input.start_date &&
    input.due_date &&
    Date.parse(input.start_date) >
      Date.parse(input.due_date)
  ) {
    throw new Error(
      "A data de início não pode ser posterior à data de entrega.",
    );
  }

  if (
    input.status === "completed" &&
    input.progress !== 100
  ) {
    throw new Error(
      "Um entregável concluído deve ter 100% de progresso.",
    );
  }

  return title;
}

/* -------------------------------------------------------------------------- */
/* Database validation                                                        */
/* -------------------------------------------------------------------------- */

async function validatePhase(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  phaseId: string,
) {
  const { data, error } = await supabase
    .from("project_phases")
    .select("phase_id")
    .eq("phase_id", phaseId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    console.error(
      "[saveDeliverable] Phase lookup:",
      error,
    );

    throw new Error(
      "Não foi possível validar a fase do projecto.",
    );
  }

  if (!data) {
    throw new Error(
      "A fase não existe ou não pertence a este projecto.",
    );
  }
}

async function validateStage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  phaseId: string,
  stageId: string | null,
) {
  if (!stageId) return;

  const { data, error } = await supabase
    .from("phase_stages")
    .select("stage_id")
    .eq("stage_id", stageId)
    .eq("phase_id", phaseId)
    .maybeSingle();

  if (error) {
    console.error(
      "[saveDeliverable] Stage lookup:",
      error,
    );

    throw new Error(
      "Não foi possível validar a etapa.",
    );
  }

  if (!data) {
    throw new Error(
      "A etapa não existe ou não pertence a esta fase.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Resolve Por Fazer column                                                   */
/* -------------------------------------------------------------------------- */

async function getTodoColumn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
) {
  const { data, error } = await supabase
    .from("task_columns")
    .select("column_id, project_id, name")
    .eq("project_id", projectId)
    .ilike("name", "Por Fazer")
    .maybeSingle();

  if (error) {
    console.error(
      "[saveDeliverable] Column lookup:",
      error,
    );

    throw new Error(
      `Não foi possível consultar a coluna Por Fazer: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      'A coluna "Por Fazer" não existe neste projecto. Crie-a antes de adicionar entregáveis.',
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Save deliverable                                                           */
/* -------------------------------------------------------------------------- */

export async function saveDeliverable(
  input: SaveDeliverableInput,
) {
  const supabase = createClient();

  /* Authentication */
  const {
    data: { user },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError || !user) {
    throw new Error(
      "A sessão expirou. Inicie sessão novamente.",
    );
  }

  /* Input validation */
  const title = validateInput(input);

  /* Ownership validation */
  await validatePhase(
    (await supabase),
    input.projectId,
    input.phaseId,
  );

  await validateStage(
    (await supabase),
    input.phaseId,
    input.stageId,
  );

  /* Database payload */
  const payload = {
    project_id: input.projectId,
    phase_id: input.phaseId,
    stage_id: input.stageId,
    title,
    description: input.description?.trim() || null,
    status: input.status,
    start_date: input.start_date,
    due_date: input.due_date,
    position: input.sort_order,
    updated_at: new Date().toISOString(),
  };

  /* ------------------------------------------------------------------------ */
  /* Update existing deliverable                                              */
  /* ------------------------------------------------------------------------ */

  if (input.id) {
    const { data, error } = await (await supabase)
      .from("tasks")
      .update(payload)
      .eq("task_id", input.id)
      .eq("project_id", input.projectId)
      .eq("phase_id", input.phaseId)
      .select()
      .maybeSingle();

    if (error) {
      console.error(
        "[saveDeliverable] Update:",
        error,
      );

      throw new Error(
        `Não foi possível actualizar o entregável: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        "O entregável não foi encontrado ou não tem permissão para o editar.",
      );
    }

    revalidatePath(
      `/management/projects/${input.projectId}`,
    );

    return {
      success: true,
      deliverable: data,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Insert new deliverable                                                   */
  /* ------------------------------------------------------------------------ */

  // Every new deliverable starts in Por Fazer.
  const todoColumn = await getTodoColumn(
    (await supabase),
    input.projectId,
  );

  const { data, error } = await (await supabase)
    .from("tasks")
    .insert({
      ...payload,
      column_id: todoColumn.column_id,
      created_by: user.id,
      review_status: "not_submitted",
      completed: false,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "[saveDeliverable] Insert:",
      error,
    );

    throw new Error(
      `Não foi possível adicionar o entregável: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "O Supabase não devolveu o entregável criado.",
    );
  }

  /* Revalidate project data */
  revalidatePath(
    `/management/projects/${input.projectId}`,
  );

  return {
    success: true,
    deliverable: data,
  };
}
