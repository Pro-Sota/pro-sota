"use server";

import { createClient } from "@/app/lib/supabase/server";
import {
  addSupplierProject,
  createSupplierActivity,
  createSupplierEvaluation,
  removeSupplierProject,
  SupplierUpdate,
} from "@/services/supplier";
import { cookies } from "next/headers";

export async function createSupplierEvaluationAction(
  supplierId: string,
  input: {
    projectId?: string | null;
    quality: number;
    delivery: number;
    price: number;
    communication: number;
    reliability: number;
    comment?: string | null;
  }
) {
  if (!supplierId) {
    throw new Error("O fornecedor é obrigatório.");
  }

  const evaluation = await createSupplierEvaluation({
    supplier_id: supplierId,
    project_id: input.projectId ?? null,
    evaluated_by: null,
    quality: input.quality,
    delivery: input.delivery,
    price: input.price,
    communication: input.communication,
    reliability: input.reliability,
    comment: input.comment ?? null,
  });

  await createSupplierActivity(
    supplierId,
    "evaluation_created",
    `Avaliação adicionada — ${calculateRating(input).toFixed(1)}`,
    null,
    {
      evaluation_id: evaluation.evaluation_id,
      rating: calculateRating(input),
    }
  );

  return evaluation;
}

export async function addSupplierProjectAction(
  supplierId: string,
  projectId: string,
  category?: string | null
) {
  const relationship = await addSupplierProject(
    supplierId,
    projectId,
    category
  );

  await createSupplierActivity(
    supplierId,
    "project_associated",
    "Fornecedor associado a um projecto.",
    null,
    {
      project_id: projectId,
    }
  );

  return relationship;
}

export async function removeSupplierProjectAction(
  supplierId: string,
  supplierProjectId: string
) {
  await removeSupplierProject(supplierProjectId);

  await createSupplierActivity(
    supplierId,
    "project_removed",
    "Fornecedor removido de um projecto.",
    null,
    {
      supplier_project_id: supplierProjectId,
    }
  );
}

function calculateRating(input: {
  quality: number;
  delivery: number;
  price: number;
  communication: number;
  reliability: number;
}) {
  return (
    (input.quality +
      input.delivery +
      input.price +
      input.communication +
      input.reliability) /
    5
  );
}


export async function updateSupplierAction(
  supplierId: string,
  data: SupplierUpdate
) {
  const supabase = createClient(await cookies());

  const { data: supplier, error } = await supabase
    .from("suppliers")
    .update(data)
    .eq("supplier_id", supplierId)
    .select()
    .single();

  if (error) {
    console.error("updateSupplier:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      "Não foi possível actualizar o fornecedor."
    );
  }

  return supplier;
}