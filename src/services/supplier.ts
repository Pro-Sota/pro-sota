import { createClient } from "@/app/lib/supabase/server";
import { Database } from "@/app/lib/supabase/models";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Supplier =
    Database["public"]["Tables"]["suppliers"]["Row"];

export type SupplierInsert =
    Database["public"]["Tables"]["suppliers"]["Insert"];

export type SupplierUpdate =
    Database["public"]["Tables"]["suppliers"]["Update"];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

/* -------------------------------------------------------------------------- */
/* Get all suppliers                                                          */
/* -------------------------------------------------------------------------- */

export async function getSuppliers(): Promise<Supplier[]> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get suppliers error:", error);

        throw new Error(
            error.message ||
                "Não foi possível carregar os fornecedores."
        );
    }

    return data ?? [];
}

/* -------------------------------------------------------------------------- */
/* Get supplier by ID                                                         */
/* -------------------------------------------------------------------------- */

export async function getSupplierById(
    supplierId: string
): Promise<Supplier | null> {
    if (!supplierId) {
        return null;
    }

    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("supplier_id", supplierId)
        .maybeSingle();

    if (error) {
        console.error(
            "Get supplier by ID error:",
            error
        );

        throw new Error(
            error.message ||
                "Não foi possível carregar o fornecedor."
        );
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Create supplier                                                            */
/* -------------------------------------------------------------------------- */

export async function createSupplier(
    supplier: SupplierInsert
): Promise<Supplier> {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("suppliers")
        .insert(supplier)
        .select("*")
        .single();

    if (error) {
        console.error(
            "Create supplier error:",
            error
        );

        throw new Error(
            error.message ||
                "Não foi possível criar o fornecedor."
        );
    }

    if (!data) {
        throw new Error(
            "O fornecedor foi criado, mas não foi possível obter os dados."
        );
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Update supplier                                                            */
/* -------------------------------------------------------------------------- */

export async function updateSupplier(
    supplierId: string,
    supplier: SupplierUpdate
): Promise<Supplier> {
    if (!supplierId) {
        throw new Error(
            "O ID do fornecedor é obrigatório."
        );
    }

    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("suppliers")
        .update(supplier)
        .eq("supplier_id", supplierId)
        .select("*")
        .single();

    if (error) {
        console.error(
            "Update supplier error:",
            error
        );

        throw new Error(
            error.message ||
                "Não foi possível actualizar o fornecedor."
        );
    }

    if (!data) {
        throw new Error(
            "Não foi possível encontrar o fornecedor actualizado."
        );
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Delete supplier                                                            */
/* -------------------------------------------------------------------------- */

export async function deleteSupplier(
    supplierId: string
): Promise<void> {
    if (!supplierId) {
        throw new Error(
            "O ID do fornecedor é obrigatório."
        );
    }

    const supabase = await getSupabase();

    const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("supplier_id", supplierId);

    if (error) {
        console.error(
            "Delete supplier error:",
            error
        );

        throw new Error(
            error.message ||
                "Não foi possível eliminar o fornecedor."
        );
    }
}