"use server";

import {
  createResource,
  type CreateResourceInput,
} from "@/services/resources";

export type CreateResourceActionInput = {
  code: string;
  name: string;

  resource_type:
    | "Material consumível"
    | "Equipamento"
    | "Ferramenta"
    | "EPI"
    | "Viatura";

  category: string;
  brand: string;
  model: string;
  serial_number: string;

  condition:
    | "Operacional"
    | "Com restrição"
    | "Em manutenção"
    | "Avariado"
    | "Abatido";

  acquisition_date: string;
  last_maintenance_date: string;
  next_maintenance_date: string;

  replacement_value: string;

  unit_of_measure:
    | "unidade"
    | "saco"
    | "kg"
    | "tonelada"
    | "m³"
    | "m"
    | "caixa"
    | "litro"
    | "";

  current_stock: string;
  minimum_stock: string;
  average_unit_cost: string;

  supplier_id: string;
  batch_number: string;
  expiry_date: string;
};

function mapResourceType(
  type: CreateResourceActionInput["resource_type"],
): CreateResourceInput["resource_type"] {
  switch (type) {
    case "Material consumível":
      return "material";

    case "Equipamento":
      return "equipment";

    case "Ferramenta":
      return "tool";

    case "EPI":
      return "ppe";

    case "Viatura":
      return "vehicle";
  }
}

function mapCondition(
  condition: CreateResourceActionInput["condition"],
): CreateResourceInput["condition_status"] {
  switch (condition) {
    case "Operacional":
      return "operational";

    case "Com restrição":
      return "restricted";

    case "Em manutenção":
      return "maintenance";

    case "Avariado":
      return "damaged";

    case "Abatido":
      return "retired";
  }
}

function parseNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

export async function createResourceAction(
  input: CreateResourceActionInput,
) {
  if (!input.code.trim()) {
    throw new Error("O código do recurso é obrigatório.");
  }

  if (!input.name.trim()) {
    throw new Error("O nome do recurso é obrigatório.");
  }

  const resourceType = mapResourceType(input.resource_type);
  const condition = mapCondition(input.condition);

  const isConsumable =
    input.resource_type === "Material consumível";

  const replacementValue = parseNumber(input.replacement_value);

  if (
    input.replacement_value.trim() &&
    replacementValue === null
  ) {
    throw new Error("O valor de substituição é inválido.");
  }

  let stock: CreateResourceInput["stock"] = null;

  if (isConsumable) {
    if (!input.unit_of_measure) {
      throw new Error("A unidade de medida é obrigatória.");
    }

    const currentStock = parseNumber(input.current_stock);
    const minimumStock = parseNumber(input.minimum_stock);
    const averageUnitCost = parseNumber(input.average_unit_cost);

    if (currentStock === null || currentStock < 0) {
      throw new Error("O stock inicial é inválido.");
    }

    if (minimumStock === null || minimumStock < 0) {
      throw new Error("O stock mínimo é inválido.");
    }

    if (averageUnitCost === null || averageUnitCost < 0) {
      throw new Error("O custo unitário médio é inválido.");
    }

    stock = {
      unit: input.unit_of_measure,
      current_quantity: currentStock,
      minimum_quantity: minimumStock,
      average_unit_cost: averageUnitCost,
      batch_number: input.batch_number.trim() || null,
      expiry_date: input.expiry_date || null,
    };
  }

  return createResource({
      resource_code: input.code,
      name: input.name,

      resource_type: resourceType,

      category: input.category || null,
      brand: input.brand || null,
      model: input.model || null,

      serial_number: input.resource_type === "Material consumível"
          ? null
          : input.serial_number || null,

      condition_status: condition,

      acquisition_date: input.acquisition_date || null,

      replacement_value: replacementValue,

      supplier_id: input.supplier_id || null,

      stock,
      operational_status: "available",
      created_by: null
  });
}