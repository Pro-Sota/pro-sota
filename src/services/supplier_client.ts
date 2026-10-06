import { createClient } from "@/app/lib/supabase/client";
import { Database } from "@/app/lib/supabase/models";

type Supplier =
  Database["public"]["Tables"]["suppliers"]["Row"];

export type SupplierInsert =
  Database["public"]["Tables"]["suppliers"]["Insert"];

export type SupplierUpdate =
  Database["public"]["Tables"]["suppliers"]["Update"];

const supabase = createClient();

/**
 * Get all suppliers.
 */
export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("supplier_name", { ascending: true });

  if (error) {
    console.error("Get suppliers error:", error);
    throw new Error(
      error.message || "Não foi possível carregar os fornecedores."
    );
  }

  return data ?? [];
}

/**
 * Get a single supplier by ID.
 */
export async function getSupplier(
  supplierId: string
): Promise<Supplier | null> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("supplier_id", supplierId)
    .maybeSingle();

  if (error) {
    console.error("Get supplier error:", error);
    throw new Error(
      error.message || "Não foi possível carregar o fornecedor."
    );
  }

  return data;
}

/**
 * Create a new supplier.
 */
export async function createSupplier(
  supplier: SupplierInsert
): Promise<Supplier> {
  const payload: SupplierInsert = {
    supplier_name: supplier.supplier_name!.trim(),

    nif: supplier.nif?.trim() || null,

    person_of_contact:
      supplier.person_of_contact?.trim() || null,

    phone_number:
      supplier.phone_number?.trim() || null,

    address_line_1:
      supplier.address_line_1?.trim() || null,

    city: supplier.city?.trim() || null,

    country:
      supplier.country?.trim() || "Angola",

    category:
      supplier.category?.trim() || null,

    sub_category:
      supplier.sub_category?.trim() || null,

    rating:
      supplier.rating ?? null,

    status:
      supplier.status ?? "Prospective",

    tags:
      supplier.tags ?? null,
  };

  const { data, error } = await supabase
    .from("suppliers")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Create supplier error:", error);

    throw new Error(
      error.message ||
        "Não foi possível criar o fornecedor."
    );
  }

  return data;
}

/**
 * Update an existing supplier.
 */
export async function updateSupplier(
  supplierId: string,
  supplier: SupplierUpdate
): Promise<Supplier> {
  const payload: SupplierUpdate = {
    ...supplier,

    supplier_name:
      supplier.supplier_name?.trim(),

    nif:
      supplier.nif?.trim() || null,

    person_of_contact:
      supplier.person_of_contact?.trim() || null,

    phone_number:
      supplier.phone_number?.trim() || null,

    address_line_1:
      supplier.address_line_1?.trim() || null,

    city:
      supplier.city?.trim() || null,

    country:
      supplier.country?.trim() || "Angola",

    category:
      supplier.category?.trim() || null,

    sub_category:
      supplier.sub_category?.trim() || null,
  };

  const { data, error } = await supabase
    .from("suppliers")
    .update(payload)
    .eq("supplier_id", supplierId)
    .select()
    .single();

  if (error) {
    console.error("Update supplier error:", error);

    throw new Error(
      error.message ||
        "Não foi possível atualizar o fornecedor."
    );
  }

  return data;
}

/**
 * Delete a supplier.
 *
 * The current suppliers table does not have deleted_at,
 * so this performs a permanent delete.
 */
export async function deleteSupplier(
  supplierId: string
): Promise<void> {
  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("supplier_id", supplierId);

  if (error) {
    console.error("Delete supplier error:", error);

    throw new Error(
      error.message ||
        "Não foi possível eliminar o fornecedor."
    );
  }
}

/**
 * Update only the supplier status.
 */
export async function updateSupplierStatus(
  supplierId: string,
  status: Supplier["status"]
): Promise<Supplier> {
  const { data, error } = await supabase
    .from("suppliers")
    .update({ status })
    .eq("supplier_id", supplierId)
    .select()
    .single();

  if (error) {
    console.error(
      "Update supplier status error:",
      error
    );

    throw new Error(
      error.message ||
        "Não foi possível atualizar o estado do fornecedor."
    );
  }

  return data;
}

/**
 * Update only the supplier rating.
 */
export async function updateSupplierRating(
  supplierId: string,
  rating: number | null
): Promise<Supplier> {
  if (
    rating !== null &&
    (!Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5)
  ) {
    throw new Error(
      "A avaliação deve estar entre 1 e 5."
    );
  }

  const { data, error } = await supabase
    .from("suppliers")
    .update({ rating })
    .eq("supplier_id", supplierId)
    .select()
    .single();

  if (error) {
    console.error(
      "Update supplier rating error:",
      error
    );

    throw new Error(
      error.message ||
        "Não foi possível atualizar a avaliação."
    );
  }

  return data;
}
