// src/services/documents.ts

import { Json } from "@/app/lib/supabase/models";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function getProjectFolders(projectId: string) {
   const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getProjectFolders error:", error);
    throw new Error(`Failed to load project folders: ${error.message}`);
  }

  return data ?? [];
}

export async function getProjectDocuments(projectId: string) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getProjectDocuments error:", error);
    throw new Error(`Failed to load project documents: ${error.message}`);
  }

  return data ?? [];
}



/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type UserProjectDocument = {
  document_id: string;
  folder_id: string;
  project_id: string;
  name: string;
  file_path: string;
  version: number | null;
  uploaded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getCurrentUserProjectDocuments(
  projectId: string,
): Promise<UserProjectDocument[]> {
  if (!projectId) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data, error } = await supabase
    .from("documents")
    .select(`
      document_id,
      folder_id,
      project_id,
      name,
      file_path,
      version,
      uploaded_by,
      created_at,
      updated_at
    `)
    .eq("project_id", projectId)
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "Error fetching current user's project documents:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(
      "Não foi possível carregar os documentos.",
    );
  }

  console.log("Documents: " + JSON.stringify(data))

  return data ?? [];
}