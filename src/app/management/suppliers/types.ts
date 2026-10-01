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

export type SupplierEvaluation =
  Database["public"]["Tables"]["supplier_evaluations"]["Row"];

export type SupplierProject =
  Database["public"]["Tables"]["supplier_projects"]["Row"];

export type SupplierDocument =
  Database["public"]["Tables"]["supplier_documents"]["Row"];

export type SupplierActivity =
  Database["public"]["Tables"]["supplier_activity"]["Row"];

export type SupplierEvaluationInput = {
  supplierId: string;
  projectId?: string | null;
  quality: number;
  delivery: number;
  price: number;
  communication: number;
  reliability: number;
  comment?: string | null;
};

export type SupplierProjectWithProject = SupplierProject & {
  project: {
    project_id: string;
    project_code: string | null;
    name: string;
    status: string | null;
  } | null;
};