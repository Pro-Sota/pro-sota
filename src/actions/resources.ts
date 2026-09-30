"use server";

import { revalidatePath } from "next/cache";

import {
  createResource,
  updateResource,
} from "@/services/resources";

import type {
  ResourceCondition,
  ResourceFormInput,
  ResourceOperationalStatus,
  ResourceType,
  UnitOfMeasure,
} from "@/services/resources";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Raw values coming from the client form.
 *
 * HTML inputs keep numeric values as strings.
 * Nullable database fields are represented as empty strings in the form.
 */
export type CreateResourceActionInput = {
  resource_code: string;
  name: string;
  description: string;

  resource_type: ResourceType;

  category: string;
  brand: string;
  model: string;
  serial_number: string;
  asset_tag: string;

  unit_of_measure: UnitOfMeasure | "";

  condition_status: ResourceCondition;
  operational_status: ResourceOperationalStatus;

  acquisition_date: string;

  acquisition_value: string;
  replacement_value: string;

  notes: string;
};

export type UpdateResourceActionInput =
  CreateResourceActionInput;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Units                                                                      */
/* -------------------------------------------------------------------------- */

const VALID_UNITS: UnitOfMeasure[] = [
  "unidade",
  "saco",
  "kg",
  "tonelada",
  "m³",
  "m",
  "caixa",
  "litro",
];

function isValidUnit(
  value: string,
): value is UnitOfMeasure {
  return VALID_UNITS.includes(
    value as UnitOfMeasure,
  );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validateInput(
  input: CreateResourceActionInput,
) {
  const errors: Record<string, string> = {};

  if (!clean(input.resource_code)) {
    errors.resource_code =
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

  if (!input.condition_status) {
    errors.condition_status =
      "O estado de conservação é obrigatório.";
  }

  if (!input.operational_status) {
    errors.operational_status =
      "O estado operacional é obrigatório.";
  }

  /* ------------------------------------------------------------------------ */
  /* Acquisition value                                                        */
  /* ------------------------------------------------------------------------ */

  const acquisitionValue =
    parseNumber(
      input.acquisition_value,
    );

  if (
    input.acquisition_value.trim() &&
    acquisitionValue === null
  ) {
    errors.acquisition_value =
      "O valor de aquisição é inválido.";
  }

  if (
    acquisitionValue !== null &&
    acquisitionValue < 0
  ) {
    errors.acquisition_value =
      "O valor de aquisição não pode ser negativo.";
  }

  /* ------------------------------------------------------------------------ */
  /* Replacement value                                                        */
  /* ------------------------------------------------------------------------ */

  const replacementValue =
    parseNumber(
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

  /* ------------------------------------------------------------------------ */
  /* Unit                                                                      */
  /* ------------------------------------------------------------------------ */

  if (
    input.unit_of_measure &&
    !isValidUnit(input.unit_of_measure)
  ) {
    errors.unit_of_measure =
      "A unidade de medida é inválida.";
  }

  /* ------------------------------------------------------------------------ */
  /* Acquisition date                                                          */
  /* ------------------------------------------------------------------------ */

  if (input.acquisition_date) {
    const date = new Date(
      `${input.acquisition_date}T00:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
      errors.acquisition_date =
        "A data de aquisição é inválida.";
    }
  }

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Build service input                                                        */
/* -------------------------------------------------------------------------- */

function buildResourceInput(
  input: CreateResourceActionInput,
): ResourceFormInput {
  const errors =
    validateInput(input);

  if (Object.keys(errors).length > 0) {
    throw new Error(
      Object.values(errors).join(" "),
    );
  }

  return {
    resource_code:
      input.resource_code.trim(),

    name:
      input.name.trim(),

    description:
      clean(input.description),

    resource_type:
      input.resource_type,

    category:
      clean(input.category),

    brand:
      clean(input.brand),

    model:
      clean(input.model),

    serial_number:
      clean(input.serial_number),

    asset_tag:
      clean(input.asset_tag),

    unit_of_measure:
      input.unit_of_measure || null,

    condition_status:
      input.condition_status,

    operational_status:
      input.operational_status,

    acquisition_date:
      input.acquisition_date || null,

    acquisition_value:
      parseNumber(
        input.acquisition_value,
      ),

    replacement_value:
      parseNumber(
        input.replacement_value,
      ),

    notes:
      clean(input.notes),
  };
}

/* -------------------------------------------------------------------------- */
/* CREATE                                                                     */
/* -------------------------------------------------------------------------- */

export async function createResourceAction(
  input: CreateResourceActionInput,
) {
  try {
    const resourceInput =
      buildResourceInput(input);

    const resource =
      await createResource(
        resourceInput,
      );

    revalidatePath(
      "/management/work-resources",
    );

    revalidatePath(
      `/management/work-resources/${resource.resource_id}`,
    );

    return {
      success: true,
      resource_id:
        resource.resource_id,
      resource,
    };
  } catch (error) {
    console.error(
      "createResourceAction error:",
      error,
    );

    return {
      success: false,
      resource_id: null,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível criar o recurso.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateResourceAction(
  resourceId: string,
  input: UpdateResourceActionInput,
) {
  try {
    if (!resourceId) {
      throw new Error(
        "ID do recurso inválido.",
      );
    }

    const resourceInput =
      buildResourceInput(input);

    const resource =
      await updateResource(
        resourceId,
        resourceInput,
      );

    revalidatePath(
      "/management/work-resources",
    );

    revalidatePath(
      `/management/work-resources/${resourceId}`,
    );

    return {
      success: true,
      resource_id:
        resource.resource_id,
      resource,
    };
  } catch (error) {
    console.error(
      "updateResourceAction error:",
      error,
    );

    return {
      success: false,
      resource_id: null,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o recurso.",
    };
  }
}