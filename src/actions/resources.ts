"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

export type ResourceType =
  | "Material consumível"
  | "Equipamento"
  | "Ferramenta"
  | "EPI"
  | "Viatura";

export type ResourceCondition =
  | "Operacional"
  | "Com restrição"
  | "Em manutenção"
  | "Avariado"
  | "Abatido";

export type ResourceUnit =
  | "unidade"
  | "saco"
  | "kg"
  | "tonelada"
  | "m³"
  | "m"
  | "caixa"
  | "litro"
  | "";

export type CreateResourceActionInput = {
  code: string;
  name: string;

  resource_type: ResourceType;

  category: string;
  brand: string;
  model: string;
  serial_number: string;

  condition: ResourceCondition;

  acquisition_date: string;

  replacement_value: string;

  unit_of_measure: ResourceUnit;

  current_stock: string;
  minimum_stock: string;
  average_unit_cost: string;

  supplier_id: string;
  batch_number: string;
  expiry_date: string;

  warehouse_id: string;

  notes: string;
};

export type UpdateResourceActionInput =
  CreateResourceActionInput;

function clean(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function parseNumber(
  value: string | null | undefined,
): number | null {
  if (!value?.trim()) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

function mapResourceType(
  type: ResourceType,
) {
  switch (type) {
    case "Material consumível":
      return "material" as const;

    case "Equipamento":
      return "equipment" as const;

    case "Ferramenta":
      return "tool" as const;

    case "EPI":
      return "ppe" as const;

    case "Viatura":
      return "vehicle" as const;

    default:
      throw new Error(
        "Tipo de recurso inválido.",
      );
  }
}

function mapCondition(
  condition: ResourceCondition,
) {
  switch (condition) {
    case "Operacional":
      return "operational" as const;

    case "Com restrição":
      return "restricted" as const;

    case "Em manutenção":
      return "maintenance" as const;

    case "Avariado":
      return "damaged" as const;

    case "Abatido":
      return "retired" as const;

    default:
      throw new Error(
        "Estado do recurso inválido.",
      );
  }
}

function validateInput(
  input: CreateResourceActionInput,
) {
  const errors: Record<string, string> = {};

  if (!clean(input.code)) {
    errors.code =
      "O código do recurso é obrigatório.";
  }

  if (!clean(input.name)) {
    errors.name =
      "O nome do recurso é obrigatório.";
  }

  if (!input.resource_type) {
    errors.resource_type =
      "O tipo de recurso é obrigatório.";
  }

  if (!input.condition) {
    errors.condition =
      "O estado do recurso é obrigatório.";
  }

  const replacementValue = parseNumber(
    input.replacement_value,
  );

  if (
    input.replacement_value.trim() &&
    replacementValue === null
  ) {
    errors.replacement_value =
      "O valor de substituição é inválido.";
  }

  if (
    replacementValue !== null &&
    replacementValue < 0
  ) {
    errors.replacement_value =
      "O valor de substituição não pode ser negativo.";
  }

  const isConsumable =
    input.resource_type ===
    "Material consumível";

  if (isConsumable) {
    if (!input.unit_of_measure) {
      errors.unit_of_measure =
        "A unidade de medida é obrigatória.";
    }

    const currentStock = parseNumber(
      input.current_stock,
    );

    const minimumStock = parseNumber(
      input.minimum_stock,
    );

    const averageUnitCost = parseNumber(
      input.average_unit_cost,
    );

    if (
      currentStock === null ||
      currentStock < 0
    ) {
      errors.current_stock =
        "O stock inicial é inválido.";
    }

    if (
      minimumStock === null ||
      minimumStock < 0
    ) {
      errors.minimum_stock =
        "O stock mínimo é inválido.";
    }

    if (
      averageUnitCost === null ||
      averageUnitCost < 0
    ) {
      errors.average_unit_cost =
        "O custo unitário médio é inválido.";
    }
  }

  return errors;
}

async function getSupabase() {
  const cookieStore = await cookies();

  return createClient(cookieStore);
}

async function getCurrentUser() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(
      "Sessão expirada. Inicie sessão novamente.",
    );
  }

  return {
    supabase,
    user,
  };
}

/* -------------------------------------------------------------------------- */
/* CREATE                                                                     */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/* UPDATE                                                                     */
/* -------------------------------------------------------------------------- */



///////////////////////////////////////


import {
  createResource,
  updateResource,
} from "@/services/resources";

import type {
  ResourceFormInput,
} from "@/actions/types";

export async function createResourceAction(
  input: ResourceFormInput,
) {
  try {
    const resource = await createResource({
      resource_code: input.resource_code,
      name: input.name,
      resource_type: input.resource_type,
      category: input.category,
      brand: input.brand,
      model: input.model,
      serial_number: input.serial_number,
      condition_status:
        input.condition_status,
      operational_status:
        input.operational_status,
      acquisition_date:
        input.acquisition_date,
      replacement_value:
        input.replacement_value,
      notes: input.notes,
    });

    /*
     * resource_stock must be inserted here
     * separately because it is a different table.
     */

    return {
      success: true,
      resource_id: resource.resource_id,
    };
  } catch (error) {
    console.error(
      "createResourceAction error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o recurso.",
    };
  }
}

export async function updateResourceAction(
  resourceId: string,
  input: ResourceFormInput,
) {
  try {
    const resource =
      await updateResource(resourceId, {
        resource_code: input.resource_code,
        name: input.name,
        resource_type:
          input.resource_type,
        category: input.category,
        brand: input.brand,
        model: input.model,
        serial_number:
          input.serial_number,
        condition_status:
          input.condition_status,
        operational_status:
          input.operational_status,
        acquisition_date:
          input.acquisition_date,
        replacement_value:
          input.replacement_value,
        notes: input.notes,
      });

    /*
     * resource_stock must be updated
     * separately here.
     */

    return {
      success: true,
      resource_id: resource.resource_id,
    };
  } catch (error) {
    console.error(
      "updateResourceAction error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o recurso.",
    };
  }
}