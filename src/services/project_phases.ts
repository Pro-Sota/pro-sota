
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/app/lib/supabase/server";
import type { Database } from "../../models";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SaveTaskInput = {
  id?: string;
  projectId: string;
  phaseId: string;
  stageId: string | null;
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  position: number;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function validateDate(value: string | null, field: string) {
  if (value === null) return;

  // The tasks table uses PostgreSQL DATE columns (YYYY-MM-DD).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`A data de "${field}" é inválida.`);
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`A data de "${field}" é inválida.`);
  }
}

/* -------------------------------------------------------------------------- */
/* Save Task                                                                  */
/* -------------------------------------------------------------------------- */

export async function saveTask(input: SaveTaskInput) {
  const supabase = await createClient();

  /* ------------------------------------------------------------------------ */
  /* 1. Authentication                                                        */
  /* ------------------------------------------------------------------------ */

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("A sessão expirou. Inicie sessão novamente.");
  }

  /* ------------------------------------------------------------------------ */
  /* 2. Validate input                                                        */
  /* ------------------------------------------------------------------------ */

  if (!input.projectId || !input.phaseId) {
    throw new Error("O projecto e a fase são obrigatórios.");
  }

  const title = input.title.trim();

  if (!title) {
    throw new Error("O título é obrigatório.");
  }

  if (title.length > 200) {
    throw new Error("O título não pode exceder 200 caracteres.");
  }

  if (!Number.isInteger(input.position) || input.position < 0) {
    throw new Error(
      "A ordem deve ser um número inteiro igual ou superior a zero.",
    );
  }

  validateDate(input.startDate, "início");
  validateDate(input.dueDate, "entrega");

  if (
    input.startDate &&
    input.dueDate &&
    input.startDate > input.dueDate
  ) {
    throw new Error(
      "A data de início não pode ser posterior à data de entrega.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* 3. Validate phase                                                        */
  /* ------------------------------------------------------------------------ */

  const { data: phase, error: phaseError } = await supabase
    .from("project_phases")
    .select("phase_id")
    .eq("phase_id", input.phaseId)
    .eq("project_id", input.projectId)
    .maybeSingle();

  if (phaseError) {
    console.error("[saveTask] Phase lookup failed:", phaseError);

    throw new Error(
      `Não foi possível validar a fase: ${phaseError.message}`,
    );
  }

  if (!phase) {
    throw new Error(
      "A fase não existe ou não pertence a este projecto.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* 4. Validate stage                                                        */
  /* ------------------------------------------------------------------------ */

  if (input.stageId) {
    const { data: stage, error: stageError } = await supabase
      .from("phase_stages")
      .select("stage_id")
      .eq("stage_id", input.stageId)
      .eq("phase_id", input.phaseId)
      .maybeSingle();

    if (stageError) {
      console.error("[saveTask] Stage lookup failed:", stageError);

      throw new Error(
        `Não foi possível validar a etapa: ${stageError.message}`,
      );
    }

    if (!stage) {
      throw new Error(
        "A etapa seleccionada não existe ou não pertence a esta fase.",
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* 5. Prepare payload                                                       */
  /* ------------------------------------------------------------------------ */

  const payload = {
    project_id: input.projectId,
    phase_id: input.phaseId,
    stage_id: input.stageId,
    title,
    description: input.description?.trim() || null,
    start_date: input.startDate,
    due_date: input.dueDate,
    position: input.position,
    updated_at: new Date().toISOString(),
  };

  /* ------------------------------------------------------------------------ */
  /* 6. Update existing task                                                  */
  /* ------------------------------------------------------------------------ */

  if (input.id) {
    const { data, error } = await supabase
      .from("tasks")
      .update(payload)
      .eq("task_id", input.id)
      .eq("project_id", input.projectId)
      .eq("phase_id", input.phaseId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[saveTask] Update failed:", error);

      throw new Error(
        `Não foi possível actualizar o entregável: ${error.message}`,
      );
    }

    if (!data) {
      throw new Error(
        "O entregável não foi actualizado. Verifique se existe e se tem permissão para o editar.",
      );
    }

    revalidatePath(`/management/projects/${input.projectId}`);

    return {
      success: true,
      task: data,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* 7. Insert new task                                                       */
  /* ------------------------------------------------------------------------ */

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...payload,
      completed: false,
      review_status: "not_submitted",
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[saveTask] Insert failed:", error);

    throw new Error(
      `Não foi possível adicionar o entregável: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error("O Supabase não devolveu o entregável criado.");
  }

  revalidatePath(`/management/projects/${input.projectId}`);

  return {
    success: true,
    task: data,
  };
}

/* -------------------------------------------------------------------------- */
/* Project Phase Board                                                        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Project Phase Board                                                        */
/* -------------------------------------------------------------------------- */

export async function getProjectPhaseBoard(projectId: string) {
  const supabase = await createClient();

  // Fetch independent project data concurrently.
  const [phasesResult, tasksResult, milestonesResult] =
    await Promise.all([
      supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true }),

      supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("position", { ascending: true }),

      supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: true }),
    ]);

  if (phasesResult.error) throw phasesResult.error;
  if (tasksResult.error) throw tasksResult.error;
  if (milestonesResult.error) throw milestonesResult.error;

  const phases = phasesResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const milestones = milestonesResult.data ?? [];

  // Fetch stages only when phases exist.
  const phaseIds = phases.map((phase) => phase.phase_id);

  let stages: Database["public"]["Tables"]["phase_stages"]["Row"][] = [];

  if (phaseIds.length > 0) {
    const { data, error } = await supabase
      .from("phase_stages")
      .select("*")
      .in("phase_id", phaseIds)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    stages = data ?? [];
  }

  return {
    phases,
    stages,
    tasks,
    milestones,
  };
}

/* -------------------------------------------------------------------------- */
/* Phase Detail                                                               */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Phase Detail                                                               */
/* -------------------------------------------------------------------------- */

export async function getPhaseDetail(
  projectId: string,
  phaseId: string,
) {
  const supabase = await createClient();

  /* ------------------------------------------------------------------------ */
  /* 1. Authentication                                                        */
  /* ------------------------------------------------------------------------ */

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("A sessão expirou. Inicie sessão novamente.");
  }

  /* ------------------------------------------------------------------------ */
  /* 2. Fetch project                                                         */
  /* ------------------------------------------------------------------------ */

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("project_id, title, project_code")
    .eq("project_id", projectId)
    .maybeSingle();

  if (projectError) throw projectError;

  if (!project) {
    throw new Error("O projecto não foi encontrado.");
  }

  /* ------------------------------------------------------------------------ */
  /* 3. Fetch phase                                                           */
  /* ------------------------------------------------------------------------ */

  const { data: phase, error: phaseError } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .eq("phase_id", phaseId)
    .maybeSingle();

  if (phaseError) throw phaseError;

  if (!phase) {
    throw new Error("A fase não existe ou não pertence a este projecto.");
  }

  /* ------------------------------------------------------------------------ */
  /* 4. Fetch stages, tasks and milestones                                    */
  /* ------------------------------------------------------------------------ */

  const [
    stagesResult,
    tasksResult,
    milestonesResult,
  ] = await Promise.all([
    supabase
      .from("phase_stages")
      .select("*")
      .eq("phase_id", phaseId)
      .order("sort_order", { ascending: true }),

    supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("phase_id", phaseId)
      .order("position", { ascending: true }),

    supabase
      .from("milestones")
      .select("*")
      .eq("project_id", projectId)
      .eq("phase_id", phaseId)
      .order("date", { ascending: true }),
  ]);

  if (stagesResult.error) {
    console.error("[getPhaseDetail] Stages query failed:", stagesResult.error);
    throw stagesResult.error;
  }

  if (tasksResult.error) {
    console.error("[getPhaseDetail] Tasks query failed:", tasksResult.error);
    throw tasksResult.error;
  }

  if (milestonesResult.error) {
    console.error(
      "[getPhaseDetail] Milestones query failed:",
      milestonesResult.error,
    );
    throw milestonesResult.error;
  }

  /* ------------------------------------------------------------------------ */
  /* 5. Return phase detail                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    phase,
    project,
    stages: stagesResult.data ?? [],
    tasks: tasksResult.data ?? [],
    milestones: milestonesResult.data ?? [],
  };
}
