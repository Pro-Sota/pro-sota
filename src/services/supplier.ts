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



type SupplierEvaluation =
  Database["public"]["Tables"]["supplier_evaluations"]["Row"];

type SupplierEvaluationInsert =
  Database["public"]["Tables"]["supplier_evaluations"]["Insert"];

type SupplierProject =
  Database["public"]["Tables"]["supplier_projects"]["Row"];

type SupplierDocument =
  Database["public"]["Tables"]["supplier_documents"]["Row"];

type SupplierActivity =
  Database["public"]["Tables"]["supplier_activity"]["Row"];

/* -------------------------------------------------------------------------- */
/* Supplier                                                                   */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/* Evaluations                                                                */
/* -------------------------------------------------------------------------- */

export async function getSupplierEvaluations(
  supplierId: string
): Promise<SupplierEvaluation[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("supplier_evaluations")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSupplierEvaluations:", error);
    throw new Error("Não foi possível carregar as avaliações.");
  }

  return data ?? [];
}

export async function createSupplierEvaluation(
  evaluation: SupplierEvaluationInsert
): Promise<SupplierEvaluation> {
  const supabase = await getSupabase();

  validateRating(evaluation.quality);
  validateRating(evaluation.delivery);
  validateRating(evaluation.price);
  validateRating(evaluation.communication);
  validateRating(evaluation.reliability);

  const { data, error } = await supabase
    .from("supplier_evaluations")
    .insert(evaluation)
    .select("*")
    .single();

  if (error) {
    console.error("createSupplierEvaluation:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteSupplierEvaluation(
  evaluationId: string
): Promise<void> {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("supplier_evaluations")
    .delete()
    .eq("evaluation_id", evaluationId);

  if (error) {
    console.error("deleteSupplierEvaluation:", error);
    throw new Error(error.message);
  }
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */
export async function getSupplierProjects(
  supplierId: string
) {
  const supabase = await getSupabase();

  const { data: relations, error: relationsError } =
    await supabase
      .from("supplier_projects")
      .select("*")
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false });

  if (relationsError) {
    console.error(
      "getSupplierProjects relations:",
      relationsError
    );

    throw new Error(
      "Não foi possível carregar os projectos."
    );
  }

  if (!relations?.length) {
    return [];
  }

  const projectIds = relations.map(
    (item) => item.project_id
  );

  const { data: projects, error: projectsError } =
    await supabase
      .from("projects")
      .select(
        "project_id, project_code, name, status"
      )
      .in("project_id", projectIds);

  if (projectsError) {
    console.error(
      "getSupplierProjects projects:",
      projectsError
    );

    throw new Error(
      "Não foi possível carregar os dados dos projectos."
    );
  }

  const projectMap = new Map(
    (projects ?? []).map((project) => [
      project.project_id,
      project,
    ])
  );

  return relations.map((relation) => ({
    ...relation,
    project:
      projectMap.get(relation.project_id) ?? null,
  }));
}

export async function addSupplierProject(
  supplierId: string,
  projectId: string,
  category?: string | null
): Promise<SupplierProject> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("supplier_projects")
    .insert({
      supplier_id: supplierId,
      project_id: projectId,
      category: category ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("addSupplierProject:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function removeSupplierProject(
  supplierProjectId: string
): Promise<void> {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("supplier_projects")
    .delete()
    .eq("supplier_project_id", supplierProjectId);

  if (error) {
    console.error("removeSupplierProject:", error);
    throw new Error(error.message);
  }
}

/* -------------------------------------------------------------------------- */
/* Documents                                                                  */
/* -------------------------------------------------------------------------- */

export async function getSupplierDocuments(
  supplierId: string
): Promise<SupplierDocument[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("supplier_documents")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSupplierDocuments:", error);
    throw new Error("Não foi possível carregar os documentos.");
  }

  return data ?? [];
}

/* -------------------------------------------------------------------------- */
/* Activity                                                                   */
/* -------------------------------------------------------------------------- */

export async function getSupplierActivity(
  supplierId: string
): Promise<SupplierActivity[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("supplier_activity")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("getSupplierActivity:", error);
    throw new Error("Não foi possível carregar a actividade.");
  }

  return data ?? [];
}

export async function createSupplierActivity(
  supplierId: string,
  activityType: string,
  description: string,
  actorId?: string | null,
  metadata?: Record<string, unknown>
): Promise<SupplierActivity> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("supplier_activity")
    .insert({
      supplier_id: supplierId,
      activity_type: activityType,
      description,
      actor_id: actorId ?? null,
      metadata: metadata ?? {},
    })
    .select("*")
    .single();

  if (error) {
    console.error("createSupplierActivity:", error);
    throw new Error(error.message);
  }

  return data;
}

/* -------------------------------------------------------------------------- */

function validateRating(value: number | null | undefined) {
  if (
    value == null ||
    !Number.isFinite(value) ||
    value < 1 ||
    value > 5
  ) {
    throw new Error("A avaliação deve estar entre 1 e 5.");
  }
}


