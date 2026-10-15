"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export type StageStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type PhaseStageInput = {
  name: string;
  description?: string | null;
  status?: StageStatus;
  progress?: number;
  planned_start?: string | null;
  planned_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  sort_order?: number;
};

export type PhaseStageUpdate = Partial<PhaseStageInput>;

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

function fail(message: string): ActionResult<never> {
  return { success: false, error: message };
}

function normalizeDate(value?: string | null) {
  return value?.trim() || null;
}

function validateStage(input: PhaseStageInput | PhaseStageUpdate) {
  if ("name" in input && input.name !== undefined) {
    if (!input.name.trim()) {
      return "O nome da etapa é obrigatório.";
    }

    if (input.name.trim().length > 150) {
      return "O nome da etapa não pode exceder 150 caracteres.";
    }
  }

  if (
    input.progress !== undefined &&
    (!Number.isInteger(input.progress) ||
      input.progress < 0 ||
      input.progress > 100)
  ) {
    return "O progresso deve ser um número inteiro entre 0 e 100.";
  }

  if (
    input.status !== undefined &&
    !["not_started", "in_progress", "completed"].includes(input.status)
  ) {
    return "O estado da etapa é inválido.";
  }

  if (
    input.sort_order !== undefined &&
    (!Number.isInteger(input.sort_order) || input.sort_order < 0)
  ) {
    return "A ordem da etapa é inválida.";
  }

  const plannedStart = input.planned_start;
  const plannedEnd = input.planned_end;
  const actualStart = input.actual_start;
  const actualEnd = input.actual_end;

  for (const date of [
    plannedStart,
    plannedEnd,
    actualStart,
    actualEnd,
  ]) {
    if (date !== undefined && date !== null && date !== "") {
      if (Number.isNaN(Date.parse(date))) {
        return "Uma das datas indicadas é inválida.";
      }
    }
  }

  if (plannedStart && plannedEnd && plannedStart > plannedEnd) {
    return "A data prevista de início não pode ser posterior à data de conclusão prevista.";
  }

  if (actualStart && actualEnd && actualStart > actualEnd) {
    return "A data real de início não pode ser posterior à data real de conclusão.";
  }

  return null;
}

async function getAuthorizedClient() {
  const supabase =  createClient(await cookies());

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: "Sessão inválida. Inicie sessão novamente.",
    } as const;
  }

  return { supabase, user } as const;
}

/**
 * Creates a stage inside an existing project phase.
 */
export async function createPhaseStage(
  phaseId: string,
  input: PhaseStageInput,
): Promise<ActionResult> {
  if (!phaseId) return fail("A fase do projeto é obrigatória.");

  const supabase = createClient(await cookies());

  const validationError = validateStage(input);
  if (validationError) return fail(validationError);

  const auth = await getAuthorizedClient();
  if ("error" in auth) return fail(auth.error ?? "");


  const { data: phase, error: phaseError } = await supabase
    .from("project_phases")
    .select("phase_id, project_id")
    .eq("phase_id", phaseId)
    .maybeSingle();

  if (phaseError) return fail(phaseError.message);
  if (!phase) return fail("A fase não existe ou não tem acesso a ela.");

  const { data, error } = await supabase
    .from("phase_stages")
    .insert({
      phase_id: phaseId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      status: input.status ?? "not_started",
      progress: input.progress ?? 0,
      planned_start: normalizeDate(input.planned_start),
      planned_end: normalizeDate(input.planned_end),
      actual_start: normalizeDate(input.actual_start),
      actual_end: normalizeDate(input.actual_end),
      sort_order: input.sort_order ?? 0,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createPhaseStage:", error);
    return fail(error.message);
  }

  revalidatePath(`/management/projects/${phase.project_id}`);

  return { success: true, data };
}

/**
 * Updates the editable fields of a stage.
 */
export async function updatePhaseStage(
  stageId: string,
  input: PhaseStageUpdate,
): Promise<ActionResult> {
  if (!stageId) return fail("A etapa é obrigatória.");

  const validationError = validateStage(input);
  if (validationError) return fail(validationError);

  const auth = await getAuthorizedClient();
  if ("error" in auth) return fail(auth.error ?? "");

  const supabase = createClient(await cookies());

  const { data: stage, error: stageError } = await supabase
    .from("phase_stages")
    .select("stage_id, phase_id")
    .eq("stage_id", stageId)
    .maybeSingle();

  if (stageError) return fail(stageError.message);
  if (!stage) return fail("A etapa não existe ou não tem acesso a ela.");

  const { data: phase, error: phaseError } = await supabase
    .from("project_phases")
    .select("project_id")
    .eq("phase_id", stage.phase_id)
    .maybeSingle();

  if (phaseError) return fail(phaseError.message);
  if (!phase) return fail("Não foi possível localizar a fase.");

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) updates.name = input.name.trim();

  if (input.description !== undefined) {
    updates.description = input.description?.trim() || null;
  }

  if (input.status !== undefined) updates.status = input.status;
  if (input.progress !== undefined) updates.progress = input.progress;
  if (input.sort_order !== undefined) updates.sort_order = input.sort_order;

  if (input.planned_start !== undefined) {
    updates.planned_start = normalizeDate(input.planned_start);
  }

  if (input.planned_end !== undefined) {
    updates.planned_end = normalizeDate(input.planned_end);
  }

  if (input.actual_start !== undefined) {
    updates.actual_start = normalizeDate(input.actual_start);
  }

  if (input.actual_end !== undefined) {
    updates.actual_end = normalizeDate(input.actual_end);
  }

  if (Object.keys(updates).length === 0) {
    return fail("Não existem alterações para guardar.");
  }

  const { data, error } = await supabase
    .from("phase_stages")
    .update(updates)
    .eq("stage_id", stageId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("updatePhaseStage:", error);
    return fail(error.message);
  }

  if (!data) {
    return fail("A etapa não foi atualizada. Verifique as permissões.");
  }

  revalidatePath(`/management/projects/${phase.project_id}`);

  return { success: true, data };
}

/**
 * Updates only the status and progress of a stage.
 */
export async function updatePhaseStageStatus(
  stageId: string,
  status: StageStatus,
  progress?: number,
): Promise<ActionResult> {
  const input: PhaseStageUpdate = { status };

  if (progress !== undefined) input.progress = progress;

  if (status === "completed" && progress === undefined) {
    input.progress = 100;
  }

  return updatePhaseStage(stageId, input);
}

/**
 * Deletes a stage.
 */
export async function deletePhaseStage(
  stageId: string,
): Promise<ActionResult<{ stage_id: string }>> {
  if (!stageId) return fail("A etapa é obrigatória.");

  const auth = await getAuthorizedClient();
  if ("error" in auth) return fail(auth.error ?? "");

  const supabase = createClient(await cookies());

  const { data: stage, error: stageError } = await supabase
    .from("phase_stages")
    .select("stage_id, phase_id")
    .eq("stage_id", stageId)
    .maybeSingle();

  if (stageError) return fail(stageError.message);
  if (!stage) return fail("A etapa não existe ou não tem acesso a ela.");

  const { data: phase, error: phaseError } = await supabase
    .from("project_phases")
    .select("project_id")
    .eq("phase_id", stage.phase_id)
    .maybeSingle();

  if (phaseError) return fail(phaseError.message);
  if (!phase) return fail("Não foi possível localizar a fase.");

  const { data: deleted, error } = await supabase
    .from("phase_stages")
    .delete()
    .eq("stage_id", stageId)
    .select("stage_id")
    .maybeSingle();

  if (error) {
    console.error("deletePhaseStage:", error);
    return fail(error.message);
  }

  if (!deleted) {
    return fail("A etapa não foi eliminada. Verifique as permissões.");
  }

  revalidatePath(`/management/projects/${phase.project_id}`);

  return {
    success: true,
    data: { stage_id: deleted.stage_id },
  };
}


type SavePhaseStageInput = {
  projectId: string;
  phaseId: string;
  stageId: string | null;
  name: string;
  description: string | null;
  status: StageStatus;
  progress: number;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  sort_order: number;
};

type SavePhaseStageResult =
  | { success: true; stageId: string }
  | { success: false; error: string };

export async function savePhaseStage(
  input: SavePhaseStageInput
): Promise<SavePhaseStageResult> {
  const supabase = await createClient(await cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "A sua sessão expirou. Inicie sessão novamente.",
    };
  }

  const name = input.name.trim();

  if (!name) {
    return {
      success: false,
      error: "O nome da etapa é obrigatório.",
    };
  }

  if (
    !Number.isFinite(input.progress) ||
    input.progress < 0 ||
    input.progress > 100
  ) {
    return {
      success: false,
      error: "O progresso deve estar entre 0 e 100.",
    };
  }

  if (
    !Number.isInteger(input.sort_order) ||
    input.sort_order < 0
  ) {
    return {
      success: false,
      error: "A ordem deve ser um número inteiro igual ou superior a zero.",
    };
  }

  const validStatuses: StageStatus[] = [
    "not_started",
    "in_progress",
    "completed",
  ];

  if (!validStatuses.includes(input.status)) {
    return {
      success: false,
      error: "O estado selecionado não é válido.",
    };
  }

  if (
    input.planned_start &&
    input.planned_end &&
    input.planned_start > input.planned_end
  ) {
    return {
      success: false,
      error: "O período previsto não é válido.",
    };
  }

  if (
    input.actual_start &&
    input.actual_end &&
    input.actual_start > input.actual_end
  ) {
    return {
      success: false,
      error: "O período real não é válido.",
    };
  }

  // Confirm that the phase belongs to the requested project.
  const { data: phase, error: phaseError } = await supabase
    .from("project_phases")
    .select("phase_id")
    .eq("phase_id", input.phaseId)
    .eq("project_id", input.projectId)
    .maybeSingle();

  if (phaseError) {
    console.error("Phase verification failed:", phaseError.message);

    return {
      success: false,
      error: "Não foi possível verificar a fase do projecto.",
    };
  }

  if (!phase) {
    return {
      success: false,
      error: "A fase não existe ou não pertence a este projecto.",
    };
  }

  const payload = {
    phase_id: input.phaseId,
    name,
    description: input.description?.trim() || null,
    status: input.status,
    progress: input.progress,
    planned_start: input.planned_start,
    planned_end: input.planned_end,
    actual_start: input.actual_start,
    actual_end: input.actual_end,
    sort_order: input.sort_order,
    updated_at: new Date().toISOString(),
  };

  if (input.stageId) {
    // Updating a stage must also verify that it belongs to this phase.
    const { data: existingStage, error: existingError } = await supabase
      .from("phase_stages")
      .select("stage_id")
      .eq("stage_id", input.stageId)
      .eq("phase_id", input.phaseId)
      .maybeSingle();

    if (existingError) {
      console.error("Stage verification failed:", existingError.message);

      return {
        success: false,
        error: "Não foi possível verificar a etapa.",
      };
    }

    if (!existingStage) {
      return {
        success: false,
        error: "A etapa não existe ou não pertence a esta fase.",
      };
    }

    const { data, error } = await supabase
      .from("phase_stages")
      .update(payload)
      .eq("stage_id", input.stageId)
      .eq("phase_id", input.phaseId)
      .select("stage_id")
      .maybeSingle();

    if (error) {
      console.error("Stage update failed:", error.message);

      return {
        success: false,
        error: "Não foi possível actualizar a etapa na base de dados.",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "A etapa não foi actualizada. Verifique as permissões.",
      };
    }

    revalidatePath(
      `/management/projects/${input.projectId}`
    );

    return { success: true, stageId: data.stage_id };
  }

  const { data, error } = await supabase
    .from("phase_stages")
    .insert(payload)
    .select("stage_id")
    .single();

  if (error) {
    console.error("Stage insert failed:", error.message);

    return {
      success: false,
      error: "Não foi possível adicionar a etapa à base de dados.",
    };
  }

  revalidatePath(
    `/management/projects/${input.projectId}`
  );

  return { success: true, stageId: data.stage_id };
}
