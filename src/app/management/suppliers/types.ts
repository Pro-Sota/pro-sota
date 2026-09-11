import { Database } from "@/app/lib/supabase/models";

export type Supplier =
  Database["public"]["Tables"]["suppliers"]["Row"];

export type SupplierInsert =
  Database["public"]["Tables"]["suppliers"]["Insert"];

export type SupplierUpdate =
  Database["public"]["Tables"]["suppliers"]["Update"];

export type SupplierStatus =
  | "Active"
  | "Inactive"
  | "Prospective";