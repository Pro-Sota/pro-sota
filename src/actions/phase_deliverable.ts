
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

const VALID_STATUSES = [
    "not_started",
    "in_progress",
    "completed",
    "on_hold",
    "cancelled",
] as const;

type DeliverableStatus = (typeof VALID_STATUSES)[number];

export type SaveDeliverableInput = {
  id?: string;
  projectId: string;
  phaseId: string;
  title: string;
  description: string | null;
  status:
    | "not_started"
    | "in_progress"
    | "completed"
    | "on_hold"
    | "cancelled";
  progress: number;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
};

function validateDate(value: string | null, field: string) {
    if (value === null) return;

    if (!Number.isFinite(Date.parse(value))) {
        throw new Error(`A data "${field}" é inválida.`);
    }
}
export async function saveDeliverable(input: SaveDeliverableInput) {
  const supabase = createClient(await cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("A sessão expirou. Inicie sessão novamente.");
  }

  const title = input.title.trim();

  if (!input.projectId || !input.phaseId) {
    throw new Error("O projecto e a fase são obrigatórios.");
  }

  if (!title) {
    throw new Error("O título é obrigatório.");
  }

  if (!VALID_STATUSES.includes(input.status)) {
    throw new Error("O estado do entregável é inválido.");
  }

  if (
    !Number.isInteger(input.progress) ||
    input.progress < 0 ||
    input.progress > 100
  ) {
    throw new Error("O progresso deve estar entre 0 e 100.");
  }

  if (
    !Number.isInteger(input.sort_order) ||
    input.sort_order < 0
  ) {
    throw new Error(
      "A ordem deve ser um número inteiro não negativo."
    );
  }

  validateDate(input.start_date, "início");
  validateDate(input.due_date, "entrega");

  if (
    input.start_date &&
    input.due_date &&
    Date.parse(input.start_date) > Date.parse(input.due_date)
  ) {
    throw new Error(
      "A data de início não pode ser posterior à data de entrega."
    );
  }

  // 1. Confirm that the phase belongs to the specified project.
  const { data: phase, error: phaseError } = await supabase
    .from("project_phases")
    .select("phase_id")
    .eq("phase_id", input.phaseId)
    .eq("project_id", input.projectId)
    .maybeSingle();

  if (phaseError) {
    console.error("[saveDeliverable] Phase lookup:", phaseError);
    throw new Error(
      `Não foi possível validar a fase: ${phaseError.message}`
    );
  }

  if (!phase) {
    throw new Error(
      "A fase não existe ou não pertence a este projecto."
    );
  }

  // 2. Prepare the database payload.
  const payload = {
    phase_id: input.phaseId,
    title,
    description: input.description?.trim() || null,
    status: input.status,
    progress: input.progress,
    start_date: input.start_date,
    due_date: input.due_date,
    completed_at:
      input.status === "completed"
        ? input.completed_at ?? new Date().toISOString()
        : null,
    sort_order: input.sort_order,
    updated_at: new Date().toISOString(),
  };

  // 3. Update an existing deliverable.
  if (input.id) {
    const { data, error } = await supabase
      .from("deliverables")
      .update(payload)
      .eq("id", input.id)
      .eq("phase_id", input.phaseId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[saveDeliverable] Update failed:", error);
      throw new Error(
        `Não foi possível actualizar o entregável: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "O entregável não foi actualizado. Verifique se existe e se tem permissão para o editar."
      );
    }

    revalidatePath(`/management/projects/${input.projectId}`);

    return {
      success: true,
      deliverable: data,
    };
  }

  // 4. Insert a new deliverable.
  const { data, error } = await supabase
    .from("deliverables")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[saveDeliverable] Insert failed:", error);
    throw new Error(
      `Não foi possível adicionar o entregável: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "O Supabase não devolveu o entregável criado."
    );
  }

  revalidatePath(`/management/projects/${input.projectId}`);

  return {
    success: true,
    deliverable: data,
  };
}