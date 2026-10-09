
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

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

export type AccessibleProject = {
  project_id: string;
  project_name: string;
};

export type DocumentVersionRow = {
  version_id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  uploaded_by: string | null;
  created_at: string;
};

/* -------------------------------------------------------------------------- */
/* Supabase                                                                   */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/* -------------------------------------------------------------------------- */
/* Project documents                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Returns all documents accessible to the authenticated user
 * within a project. RLS remains responsible for authorisation.
 */
export async function getProjectDocuments(
  projectId: string,
): Promise<UserProjectDocument[]> {
  if (!projectId) {
    return [];
  }

  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
        document_id,
        folder_id,
        project_id,
        name,
        file_path,
        version,
        uploaded_by,
        created_at,
        updated_at
      `,
    )
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getProjectDocuments error:", {
      code: error.code,
      message: error.message,
    });

    throw new Error("Não foi possível carregar os documentos do projecto.");
  }

  return data ?? [];
}

/**
 * Returns folders belonging to one project.
 */
export async function getProjectFolders(projectId: string) {
  if (!projectId) {
    return [];
  }

  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getProjectFolders error:", {
      code: error.code,
      message: error.message,
    });

    throw new Error("Não foi possível carregar as pastas do projecto.");
  }

  return data ?? [];
}

/* -------------------------------------------------------------------------- */
/* Central document library                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Returns documents visible to the current user across projects.
 *
 * Do not filter by uploaded_by here: the central library must include
 * documents uploaded by other authorised project members.
 *
 * The query relies on the documents table's RLS policies.
 */
export async function getAccessibleDocuments(): Promise<
  UserProjectDocument[]
> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
        document_id,
        folder_id,
        project_id,
        name,
        file_path,
        version,
        uploaded_by,
        created_at,
        updated_at
      `,
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getAccessibleDocuments error:", {
      code: error.code,
      message: error.message,
    });

    throw new Error("Não foi possível carregar a biblioteca de documentos.");
  }

  return data ?? [];
}

/**
 * Returns folders visible to the current user across projects.
 *
 * Keep project_id on every row. Folder IDs and slugs must not be
 * treated as globally unique paths across different projects.
 */
export async function getAccessibleFolders() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getAccessibleFolders error:", {
      code: error.code,
      message: error.message,
    });

    throw new Error("Não foi possível carregar as pastas disponíveis.");
  }

  return data ?? [];
}

/**
 * Returns projects visible to the current user.
 *
 * The projects table must have a project_name column, as used by
 * the existing UploadDocument component.
 */
export async function getAccessibleProjects(): Promise<
  AccessibleProject[]
> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data, error } = await supabase
    .from("projects")
    .select("project_id, project_name")
    .order("project_name", { ascending: true });

  if (error) {
    console.error("getAccessibleProjects error:", {
      code: error.code,
      message: error.message,
    });

    throw new Error("Não foi possível carregar os projectos disponíveis.");
  }

  return data ?? [];
}

/* -------------------------------------------------------------------------- */
/* Document version history                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Returns the version history for one document.
 *
 * Access to document_versions must be restricted by RLS according
 * to access to the associated document and project.
 */
export async function getDocumentVersions(
  documentId: string,
): Promise<DocumentVersionRow[]> {
  if (!documentId) {
    return [];
  }

  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data, error } = await supabase
    .from("document_versions")
    .select(
      `
        version_id,
        document_id,
        version_number,
        file_path,
        uploaded_by,
        created_at
      `,
    )
    .eq("document_id", documentId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error("getDocumentVersions error:", {
      code: error.code,
      message: error.message,
    });

    throw new Error("Não foi possível carregar o histórico de versões.");
  }

  return data ?? [];
}

/* -------------------------------------------------------------------------- */
/* Documents uploaded by the current user                                     */
/* -------------------------------------------------------------------------- */

/**
 * Retained for screens that specifically need documents uploaded
 * by the current user. Do not use this for the central library.
 */
export async function getCurrentUserProjectDocuments(
  projectId: string,
): Promise<UserProjectDocument[]> {
  if (!projectId) {
    return [];
  }

  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
        document_id,
        folder_id,
        project_id,
        name,
        file_path,
        version,
        uploaded_by,
        created_at,
        updated_at
      `,
    )
    .eq("project_id", projectId)
    .eq("uploaded_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCurrentUserProjectDocuments error:", {
      code: error.code,
      message: error.message,
    });

    throw new Error("Não foi possível carregar os seus documentos.");
  }

  return data ?? [];
}