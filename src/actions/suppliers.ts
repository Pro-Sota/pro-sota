"use server";

import { redirect } from "next/navigation";

import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/supplier";

function getString(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function getTags(formData: FormData) {
  const value = getString(formData, "tags");

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function createSupplierAction(
  formData: FormData
) {
  const supplierName = getString(
    formData,
    "supplier_name"
  );

  if (!supplierName) {
    throw new Error(
      "O nome do fornecedor é obrigatório."
    );
  }

  await createSupplier({
    supplier_name: supplierName,
    nif: getString(formData, "nif"),
    person_of_contact: getString(
      formData,
      "person_of_contact"
    ),
    phone_number: getString(
      formData,
      "phone_number"
    ),
    address_line_1: getString(
      formData,
      "address_line_1"
    ),
    city: getString(formData, "city"),
    country:
      getString(formData, "country") ||
      "Angola",
    category: getString(formData, "category"),
    sub_category: getString(
      formData,
      "sub_category"
    ),
    rating: null,
    tags: getTags(formData),
  });

  redirect("/management/suppliers");
}

export async function updateSupplierAction(
  formData: FormData
) {
  const supplierId = getString(
    formData,
    "supplier_id"
  );

  const supplierName = getString(
    formData,
    "supplier_name"
  );

  if (!supplierId) {
    throw new Error(
      "Fornecedor inválido."
    );
  }

  if (!supplierName) {
    throw new Error(
      "O nome do fornecedor é obrigatório."
    );
  }

  const ratingValue = getString(
    formData,
    "rating"
  );

  const rating =
    ratingValue === null ||
    ratingValue === ""
      ? null
      : Number(ratingValue);

  await updateSupplier(supplierId, {
    supplier_name: supplierName,
    nif: getString(formData, "nif"),
    person_of_contact: getString(
      formData,
      "person_of_contact"
    ),
    phone_number: getString(
      formData,
      "phone_number"
    ),
    address_line_1: getString(
      formData,
      "address_line_1"
    ),
    city: getString(formData, "city"),
    country:
      getString(formData, "country") ||
      "Angola",
    category: getString(formData, "category"),
    sub_category: getString(
      formData,
      "sub_category"
    ),
    rating,
    status:
      getString(formData, "status") ||
      "Prospective",
    tags: getTags(formData),
  });

  redirect(
    `/management/suppliers/${supplierId}`
  );
}

export async function deleteSupplierAction(
  formData: FormData
) {
  const supplierId = getString(
    formData,
    "supplier_id"
  );

  if (!supplierId) {
    throw new Error(
      "Fornecedor inválido."
    );
  }

  await deleteSupplier(supplierId);

  redirect("/management/suppliers");
}