import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type SubmissionStatus =
  | "draft"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "changes_requested";

export type SubmissionType =
  | "design"
  | "technical"
  | "client_approval"
  | "permit"
  | "tender"
  | "construction"
  | "as_built"
  | "other";

export type Submission = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  type: SubmissionType;
  status: SubmissionStatus;
  submitted_by: string;
  submitted_by_name: string;
  submitted_date: string;
  due_date: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  revision_number: number;
  created_at: string;
  updated_at: string;
};

export type SubmissionFile = {
  submission_file_id: string;
  submission_id: string;
  document_id: string | null;
  file_name: string;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

export type ProjectDocument = {
  document_id: string;
  project_id: string;
  name: string | null;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

export type CreateSubmissionInput = {
  projectId: string;
  documentIds: string[];
  type: SubmissionType;
  title?: string;
  description?: string;
  dueDate?: string | null;
};

export type UpdateSubmissionInput = {
  title?: string;
  description?: string | null;
  type?: SubmissionType;
  dueDate?: string | null;
  notes?: string | null;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SUBMISSION_SELECT = `
  submission_id,
  project_id,
  title,
  description,
  type,
  status,
  submitted_by,
  submitted_at,
  due_date,
  reviewed_by,
  reviewed_at,
  notes,
  revision_number,
  created_at,
  updated_at,
  profiles!submissions_submitted_by_fkey (
    profile_id,
    first_name,
    last_name
  )
`;

/* -------------------------------------------------------------------------- */
/* Supabase                                                                   */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  const cookieStore = await cookies();

  return createClient(cookieStore);
}

/* -------------------------------------------------------------------------- */
/* Current user/profile                                                       */
/* -------------------------------------------------------------------------- */

async function getCurrentProfile() {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select(
        "profile_id, first_name, last_name",
      )
      .eq("profile_id", user.id)
      .single();

  if (profileError || !profile) {
    throw new Error(
      `Não foi possível carregar o perfil do utilizador: ${
        profileError?.message ??
        "Perfil não encontrado."
      }`,
    );
  }

  return {
    user,
    profile,
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getFullName(
  profile:
    | {
        first_name: string | null;
        last_name: string | null;
      }
    | null
    | undefined,
): string {
  if (!profile) {
    return "Utilizador";
  }

  const name = [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Utilizador";
}

function normalizeProfile(
  profile:
    | {
        profile_id?: string;
        first_name?: string | null;
        last_name?: string | null;
      }
    | Array<{
        profile_id?: string;
        first_name?: string | null;
        last_name?: string | null;
      }>
    | null
    | undefined,
): {
  profile_id?: string;
  first_name: string | null;
  last_name: string | null;
} | null {
  const normalized = Array.isArray(profile)
    ? profile[0] ?? null
    : profile ?? null;

  if (!normalized) {
    return null;
  }

  return {
    profile_id: normalized.profile_id,
    first_name: normalized.first_name ?? null,
    last_name: normalized.last_name ?? null,
  };
}

function mapSubmission(row: any): Submission {
  const profile = normalizeProfile(
    row.profiles,
  );

  return {
    id: row.submission_id,
    project_id: row.project_id,
    title: row.title,
    description: row.description,
    type: row.type as SubmissionType,
    status: row.status as SubmissionStatus,
    submitted_by: row.submitted_by,
    submitted_by_name: getFullName(profile),
    submitted_date: row.submitted_at,
    due_date: row.due_date,
    reviewed_by: row.reviewed_by,
    reviewed_at: row.reviewed_at,
    notes: row.notes,
    revision_number: row.revision_number,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Project documents                                                          */
/* -------------------------------------------------------------------------- */

export async function getProjectDocuments(
  projectId: string,
): Promise<ProjectDocument[]> {
  if (!projectId) {
    throw new Error("O projecto é obrigatório.");
  }

  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("documents")
    .select(
      `
        document_id,
        project_id,
        name,
        file_path,
        file_size,
        mime_type,
        created_at
      `,
    )
    .eq("project_id", projectId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Não foi possível carregar os documentos do projecto: ${error.message}`,
    );
  }

  return (data ?? []) as ProjectDocument[];
}

/* -------------------------------------------------------------------------- */
/* Get project submissions                                                    */
/* -------------------------------------------------------------------------- */

export async function getProjectSubmissions(
  projectId: string,
): Promise<Submission[]> {
  if (!projectId) {
    throw new Error("O projecto é obrigatório.");
  }

  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("submissions")
    .select(SUBMISSION_SELECT)
    .eq("project_id", projectId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Não foi possível carregar as submissões: ${error.message}`,
    );
  }

  return (data ?? []).map(mapSubmission);
}

/* -------------------------------------------------------------------------- */
/* Get current user's submissions for a project                               */
/* -------------------------------------------------------------------------- */

export async function getCurrentUserProjectSubmissions(
  projectId: string,
): Promise<Submission[]> {
  if (!projectId) {
    throw new Error("O projecto é obrigatório.");
  }

  const { profile } =
    await getCurrentProfile();

  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("submissions")
    .select(SUBMISSION_SELECT)
    .eq("project_id", projectId)
    .eq("submitted_by", profile.profile_id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Não foi possível carregar as suas submissões: ${error.message}`,
    );
  }

  return (data ?? []).map(mapSubmission);
}

/* -------------------------------------------------------------------------- */
/* Get all submissions                                                        */
/* -------------------------------------------------------------------------- */

export async function fetchAllProjectSubmissions(): Promise<
  Submission[]
> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("submissions")
    .select(SUBMISSION_SELECT)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Não foi possível carregar as submissões: ${error.message}`,
    );
  }

  return (data ?? []).map(mapSubmission);
}

/* -------------------------------------------------------------------------- */
/* Get one submission                                                         */
/* -------------------------------------------------------------------------- */

export async function getSubmission(
  submissionId: string,
): Promise<Submission | null> {
  if (!submissionId) {
    throw new Error("A submissão é obrigatória.");
  }

  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("submissions")
    .select(SUBMISSION_SELECT)
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível carregar a submissão: ${error.message}`,
    );
  }

  return data
    ? mapSubmission(data)
    : null;
}

/* -------------------------------------------------------------------------- */
/* Get submission files                                                       */
/* -------------------------------------------------------------------------- */

export async function getSubmissionFiles(
  submissionId: string,
): Promise<SubmissionFile[]> {
  if (!submissionId) {
    throw new Error("A submissão é obrigatória.");
  }

  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("submission_files")
    .select(
      `
        submission_file_id,
        submission_id,
        document_id,
        file_name,
        file_url,
        file_type,
        file_size,
        created_at
      `,
    )
    .eq("submission_id", submissionId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Não foi possível carregar os ficheiros da submissão: ${error.message}`,
    );
  }

  return (data ?? []) as SubmissionFile[];
}

/* -------------------------------------------------------------------------- */
/* Create submission                                                          */
/* -------------------------------------------------------------------------- */

export async function createSubmission(
  input: CreateSubmissionInput,
): Promise<Submission> {
  const {
    projectId,
    documentIds,
    type,
    title,
    description,
    dueDate,
  } = input;

  if (!projectId) {
    throw new Error("O projecto é obrigatório.");
  }

  if (!type) {
    throw new Error(
      "O tipo de submissão é obrigatório.",
    );
  }

  if (
    !Array.isArray(documentIds) ||
    documentIds.length === 0
  ) {
    throw new Error(
      "Seleccione pelo menos um documento.",
    );
  }

  const uniqueDocumentIds = [
    ...new Set(documentIds),
  ];

  const validTypes: SubmissionType[] = [
    "design",
    "technical",
    "client_approval",
    "permit",
    "tender",
    "construction",
    "as_built",
    "other",
  ];

  if (!validTypes.includes(type)) {
    throw new Error(
      "Tipo de submissão inválido.",
    );
  }

  const { profile } =
    await getCurrentProfile();

  const supabase = await getSupabase();

  /* ------------------------------------------------------------------------ */
  /* Verify selected documents                                                */
  /* ------------------------------------------------------------------------ */

  const {
    data: documents,
    error: documentsError,
  } = await supabase
    .from("documents")
    .select(
      `
        document_id,
        project_id,
        name,
        file_path,
        file_size,
        mime_type,
        created_at
      `,
    )
    .eq("project_id", projectId)
    .in(
      "document_id",
      uniqueDocumentIds,
    );

  if (documentsError) {
    throw new Error(
      `Não foi possível validar os documentos seleccionados: ${documentsError.message}`,
    );
  }

  if (
    !documents ||
    documents.length !==
      uniqueDocumentIds.length
  ) {
    throw new Error(
      "Um ou mais documentos seleccionados não pertencem a este projecto.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Create submission                                                        */
  /* ------------------------------------------------------------------------ */

  const firstDocument = documents[0];

  const generatedTitle =
    title?.trim() ||
    (documents.length === 1
      ? firstDocument.name ||
        firstDocument.file_path ||
        "Nova submissão"
      : `${
          firstDocument.name ||
          "Documentos"
        } + ${
          documents.length - 1
        } documento${
          documents.length - 1 === 1
            ? ""
            : "s"
        }`);

  const {
    data: submission,
    error: submissionError,
  } = await supabase
    .from("submissions")
    .insert({
      project_id: projectId,
      title: generatedTitle,
      description:
        description?.trim() || null,
      type,
      status: "pending",
      submitted_by: profile.profile_id,
      due_date: dueDate || null,
      revision_number: 1,
    })
    .select(SUBMISSION_SELECT)
    .single();

  if (
    submissionError ||
    !submission
  ) {
    throw new Error(
      `Não foi possível criar a submissão: ${
        submissionError?.message ??
        "Erro desconhecido."
      }`,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Attach selected documents                                                */
  /* ------------------------------------------------------------------------ */

  const submissionFiles =
    documents.map((document) => ({
      submission_id:
        submission.submission_id,
      document_id:
        document.document_id,
      file_name:
        document.name?.trim() ||
        document.file_path
          ?.split("/")
          .pop() ||
        "Documento",
      file_url:
        document.file_path || null,
      file_type:
        document.mime_type || null,
      file_size:
        document.file_size ?? null,
    }));

  const {
    error: filesError,
  } = await supabase
    .from("submission_files")
    .insert(submissionFiles);

  if (filesError) {
    await supabase
      .from("submissions")
      .delete()
      .eq(
        "submission_id",
        submission.submission_id,
      );

    throw new Error(
      `Não foi possível associar os documentos à submissão: ${filesError.message}`,
    );
  }

  return mapSubmission(submission);
}

/* -------------------------------------------------------------------------- */
/* Update submission                                                          */
/* -------------------------------------------------------------------------- */

export async function updateSubmission(
  submissionId: string,
  input: UpdateSubmissionInput,
): Promise<Submission> {
  if (!submissionId) {
    throw new Error(
      "A submissão é obrigatória.",
    );
  }

  const supabase = await getSupabase();

  const updates: Record<
    string,
    unknown
  > = {
    updated_at:
      new Date().toISOString(),
  };

  if (input.title !== undefined) {
    const title = input.title.trim();

    if (!title) {
      throw new Error(
        "O título da submissão é obrigatório.",
      );
    }

    updates.title = title;
  }

  if (
    input.description !==
    undefined
  ) {
    updates.description =
      input.description?.trim() ||
      null;
  }

  if (input.type !== undefined) {
    updates.type = input.type;
  }

  if (
    input.dueDate !== undefined
  ) {
    updates.due_date =
      input.dueDate || null;
  }

  if (input.notes !== undefined) {
    updates.notes =
      input.notes?.trim() || null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("submissions")
    .update(updates)
    .eq(
      "submission_id",
      submissionId,
    )
    .select(SUBMISSION_SELECT)
    .single();

  if (error || !data) {
    throw new Error(
      `Não foi possível actualizar a submissão: ${
        error?.message ??
        "Submissão não encontrada."
      }`,
    );
  }

  return mapSubmission(data);
}

/* -------------------------------------------------------------------------- */
/* Update submission status                                                   */
/* -------------------------------------------------------------------------- */

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
): Promise<Submission> {
  if (!submissionId) {
    throw new Error(
      "A submissão é obrigatória.",
    );
  }

  const validStatuses: SubmissionStatus[] =
    [
      "draft",
      "pending",
      "under_review",
      "approved",
      "rejected",
      "changes_requested",
    ];

  if (!validStatuses.includes(status)) {
    throw new Error(
      "Estado de submissão inválido.",
    );
  }

  const { profile } =
    await getCurrentProfile();

  const supabase =
    await getSupabase();

  const isReviewStatus = [
    "approved",
    "rejected",
    "changes_requested",
  ].includes(status);

  const updates = {
    status,
    reviewed_by: isReviewStatus
      ? profile.profile_id
      : null,
    reviewed_at: isReviewStatus
      ? new Date().toISOString()
      : null,
    updated_at:
      new Date().toISOString(),
  };

  const {
    data,
    error,
  } = await supabase
    .from("submissions")
    .update(updates)
    .eq(
      "submission_id",
      submissionId,
    )
    .select(SUBMISSION_SELECT)
    .single();

  if (error || !data) {
    throw new Error(
      `Não foi possível actualizar o estado da submissão: ${
        error?.message ??
        "Submissão não encontrada."
      }`,
    );
  }

  return mapSubmission(data);
}

/* -------------------------------------------------------------------------- */
/* Delete submission                                                          */
/* -------------------------------------------------------------------------- */

export async function deleteSubmission(
  submissionId: string,
): Promise<boolean> {
  if (!submissionId) {
    throw new Error(
      "A submissão é obrigatória.",
    );
  }

  const supabase =
    await getSupabase();

  /*
   * Remove the file relationships first.
   *
   * This is safe even if the database also has
   * ON DELETE CASCADE configured.
   */
  const {
    error: filesError,
  } = await supabase
    .from("submission_files")
    .delete()
    .eq(
      "submission_id",
      submissionId,
    );

  if (filesError) {
    throw new Error(
      `Não foi possível remover os ficheiros da submissão: ${filesError.message}`,
    );
  }

  const {
    error: submissionError,
  } = await supabase
    .from("submissions")
    .delete()
    .eq(
      "submission_id",
      submissionId,
    );

  if (submissionError) {
    throw new Error(
      `Não foi possível eliminar a submissão: ${submissionError.message}`,
    );
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Request changes                                                            */
/* -------------------------------------------------------------------------- */

export async function requestSubmissionChanges(
  submissionId: string,
  notes: string,
): Promise<Submission> {
  if (!submissionId) {
    throw new Error(
      "A submissão é obrigatória.",
    );
  }

  const cleanNotes = notes.trim();

  if (!cleanNotes) {
    throw new Error(
      "Indique as alterações necessárias antes de enviar o pedido.",
    );
  }

  const { profile } =
    await getCurrentProfile();

  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("submissions")
    .update({
      status: "changes_requested",
      notes: cleanNotes,
      reviewed_by:
        profile.profile_id,
      reviewed_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "submission_id",
      submissionId,
    )
    .select(SUBMISSION_SELECT)
    .single();

  if (error || !data) {
    throw new Error(
      `Não foi possível solicitar alterações: ${
        error?.message ??
        "Submissão não encontrada."
      }`,
    );
  }

  return mapSubmission(data);
}

/* -------------------------------------------------------------------------- */
/* Approve submission                                                         */
/* -------------------------------------------------------------------------- */

export async function approveSubmission(
  submissionId: string,
): Promise<Submission> {
  return updateSubmissionStatus(
    submissionId,
    "approved",
  );
}

/* -------------------------------------------------------------------------- */
/* Reject submission                                                          */
/* -------------------------------------------------------------------------- */

export async function rejectSubmission(
  submissionId: string,
  notes?: string,
): Promise<Submission> {
  if (!submissionId) {
    throw new Error(
      "A submissão é obrigatória.",
    );
  }

  const { profile } =
    await getCurrentProfile();

  const supabase =
    await getSupabase();

  const {
    data,
    error,
  } = await supabase
    .from("submissions")
    .update({
      status: "rejected",
      notes:
        notes?.trim() || null,
      reviewed_by:
        profile.profile_id,
      reviewed_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "submission_id",
      submissionId,
    )
    .select(SUBMISSION_SELECT)
    .single();

  if (error || !data) {
    throw new Error(
      `Não foi possível rejeitar a submissão: ${
        error?.message ??
        "Submissão não encontrada."
      }`,
    );
  }

  return mapSubmission(data);
}