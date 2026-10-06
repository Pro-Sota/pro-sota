"use server";

import {
  addSupplierProject,
  createSupplierActivity,
  createSupplierEvaluation,
  removeSupplierProject,
  Supplier,
  SupplierInsert,
  updateSupplier,
  type SupplierUpdate,
} from "@/services/supplier";
import { revalidatePath } from "next/cache";

/* -------------------------------------------------------------------------- */
/* Supplier evaluation                                                       */
/* -------------------------------------------------------------------------- */

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

  const rating = calculateRating(input);

  await createSupplierActivity(
    supplierId,
    "evaluation_created",
    `Avaliação adicionada — ${rating.toFixed(1)}`,
    null,
    {
      evaluation_id: evaluation.evaluation_id,
      rating,
    }
  );

  return evaluation;
}

/* -------------------------------------------------------------------------- */
/* Supplier project                                                          */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Update supplier                                                            */
/* -------------------------------------------------------------------------- */

export async function updateSupplierAction(
  formData: FormData
): Promise<void> {
  const supplierId = String(
    formData.get("supplier_id") ?? ""
  ).trim();

  if (!supplierId) {
    throw new Error(
      "O ID do fornecedor é obrigatório."
    );
  }

  const supplierName = String(
    formData.get("supplier_name") ?? ""
  ).trim();

  if (!supplierName) {
    throw new Error(
      "O nome do fornecedor é obrigatório."
    );
  }

  const ratingValue = String(
    formData.get("rating") ?? ""
  ).trim();

  const rating = ratingValue
    ? Number(ratingValue)
    : null;

  if (
    rating !== null &&
    (!Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5)
  ) {
    throw new Error(
      "A avaliação deve estar entre 1 e 5."
    );
  }

  const tags = String(
    formData.get("tags") ?? ""
  )
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const data: SupplierUpdate = {
    supplier_name: supplierName,
    nif: String(
      formData.get("nif") ?? ""
    ).trim(),
    person_of_contact: String(
      formData.get("person_of_contact") ?? ""
    ).trim(),
    phone_number: String(
      formData.get("phone_number") ?? ""
    ).trim(),
    address_line_1: String(
      formData.get("address_line_1") ?? ""
    ).trim(),
    city: String(
      formData.get("city") ?? ""
    ).trim(),
    country:
      String(
        formData.get("country") ?? ""
      ).trim() || "Angola",
    category: String(
      formData.get("category") ?? ""
    ).trim(),
    sub_category: String(
      formData.get("sub_category") ?? ""
    ).trim(),
    tags,
    rating,
    status:
      String(
        formData.get("status") ?? ""
      ).trim() || "Prospective",
  };

  await updateSupplier(
    supplierId,
    data
  );

  revalidatePath("/management/suppliers");
  revalidatePath(
    `/management/suppliers/${supplierId}`
  );
  revalidatePath(
    `/management/suppliers/${supplierId}/edit`
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

