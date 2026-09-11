import { createClient } from "@/app/lib/supabase/server";
import { Database } from "@/app/lib/supabase/models";
import { cookies } from "next/headers";

export type Supplier =
    Database["public"]["Tables"]["suppliers"]["Row"];

export type SupplierInsert =
    Database["public"]["Tables"]["suppliers"]["Insert"];

export type SupplierUpdate =
    Database["public"]["Tables"]["suppliers"]["Update"];

export type SupplierStatus =
    "Active" | "Inactive" | "Prospective";

export async function getSuppliers(): Promise<Supplier[]> {
    const cookiesStore = await cookies();
    const supabase = await createClient(cookiesStore);

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