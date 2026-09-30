import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

export type ResourceMovementType =
  | "entry"
  | "exit"
  | "transfer"
  | "return"
  | "consumption"
  | "maintenance"
  | "retirement";


export type ResourceMovementFormInput = {
  resource_id: string;
  movement_type: ResourceMovementType;
  quantity: number | null;
  origin_location_id: string | null;
  destination_location_id: string | null;
  project_id: string | null;
  profile_id: string | null;
  notes: string | null;
};

export async function createResourceMovement(
  input: ResourceMovementFormInput,
) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  if (!input.resource_id) {
    throw new Error("O recurso é obrigatório.");
  }

  if (!input.movement_type) {
    throw new Error(
      "O tipo de movimentação é obrigatório.",
    );
  }

  if (
    input.quantity !== null &&
    (!Number.isFinite(input.quantity) ||
      input.quantity <= 0)
  ) {
    throw new Error(
      "A quantidade deve ser superior a zero.",
    );
  }

  if (
    input.movement_type === "transfer" &&
    !input.origin_location_id
  ) {
    throw new Error(
      "A origem é obrigatória para uma transferência.",
    );
  }

  if (
    input.movement_type === "transfer" &&
    !input.destination_location_id
  ) {
    throw new Error(
      "O destino é obrigatório para uma transferência.",
    );
  }

  if (
    input.origin_location_id &&
    input.destination_location_id &&
    input.origin_location_id ===
      input.destination_location_id
  ) {
    throw new Error(
      "A origem e o destino não podem ser iguais.",
    );
  }

  if (
    input.movement_type === "consumption" &&
    !input.project_id
  ) {
    throw new Error(
      "A obra é obrigatória para um consumo.",
    );
  }

  const { data, error } = await supabase
    .from("resource_movements")
    .insert({
      resource_id: input.resource_id,
      movement_type: input.movement_type,
      quantity: input.quantity,
      origin_location_id:
        input.origin_location_id,
      destination_location_id:
        input.destination_location_id,
      project_id: input.project_id,
      profile_id: input.profile_id,
      notes: input.notes,
    })
    .select(`
      movement_id,
      resource_id,
      movement_type,
      quantity,
      unit,
      origin_location_id,
      destination_location_id,
      project_id,
      profile_id,
      movement_date,
      notes,
      created_by
    `)
    .single();

  if (error) {
    console.error(
      "createResourceMovement error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(
      `Não foi possível registar a movimentação: ${error.message}`,
    );
  }

  return data;
}