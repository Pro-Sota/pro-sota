
import "server-only";

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export type ProjectBriefing = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  municipality: string | null;
  province: string | null;
  status: string | null;
  created_at: string;
};

export type ProjectBriefAttachment = {
  id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  download_url: string | null;
};

type GetProjectBriefingsParams = {
  query?: string;
  status?: string;
};

const VALID_STATUSES = [
  "pending",
  "in_review",
  "contacted",
  "approved",
  "rejected",
  "converted",
] as const;

async function getAuthorisedSupabase() {
  const supabase = await createClient(await cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Erro ao verificar permissões do utilizador:",
      profileError.message,
    );

    throw new Error("Não foi possível verificar as permissões.");
  }

  // Replace with your existing permission helper if Directors
  // are also authorised to review project briefings.
  if (!profile || profile.role_id !== 1) {
    redirect("/management");
  }

  return supabase;
}

export async function getProjectBriefings({
  query = "",
  status = "",
}: GetProjectBriefingsParams = {}) {
  const supabase = await getAuthorisedSupabase();

  const search = query
    .replace(/[%_,()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const selectedStatus = VALID_STATUSES.includes(
    status as (typeof VALID_STATUSES)[number],
  )
    ? status
    : "";

  // Use the real database column names.
  // Aliases preserve the property names used by the existing page.
  let request = supabase
    .from("project_briefs")
    .select(`
      id,
      full_name,
      email:contact_email,
      phone:contact_phone,
      municipality:location_municipality,
      province:location_province,
      status,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (selectedStatus) {
    request = request.eq("status", selectedStatus);
  }

  if (search) {
    request = request.or(
      [
        `full_name.ilike.%${search}%`,
        `contact_email.ilike.%${search}%`,
        `contact_phone.ilike.%${search}%`,
      ].join(","),
    );
  }

  const [
    { data, error },
    { count: totalCount, error: totalError },
    { count: pendingCount, error: pendingError },
    { count: reviewCount, error: reviewError },
  ] = await Promise.all([
    request,

    supabase
      .from("project_briefs")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("project_briefs")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("project_briefs")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_review"),
  ]);

  const errors = [
    error,
    totalError,
    pendingError,
    reviewError,
  ].filter((item) => item !== null);

  if (errors.length > 0) {
    console.error(
      "Erro ao carregar dados dos briefings:",
      errors.map((item) => ({
        message: item.message,
        code: item.code,
        details: item.details,
      })),
    );

    throw new Error("Não foi possível carregar os briefings.");
  }

  return {
    briefings: (data ?? []) as ProjectBriefing[],
    totalCount: totalCount ?? 0,
    pendingCount: pendingCount ?? 0,
    reviewCount: reviewCount ?? 0,
  };
}

export async function getProjectBriefingDetails(briefingId: string) {
  if (!briefingId?.trim()) {
    notFound();
  }

  const supabase = await getAuthorisedSupabase();

  const { data: briefing, error: briefingError } = await supabase
    .from("project_briefs")
    .select("*")
    .eq("id", briefingId)
    .maybeSingle();

  if (briefingError) {
    console.error(
      "Erro ao carregar briefing:",
      briefingError.message,
    );

    throw new Error("Não foi possível carregar o briefing.");
  }

  if (!briefing) {
    notFound();
  }

  const {
    data: attachments,
    error: attachmentError,
  } = await supabase
    .from("project_brief_attachments")
    .select(
      "id, original_name, mime_type, file_size, storage_path, created_at",
    )
    .eq("brief_id", briefingId)
    .order("created_at", { ascending: true });

  if (attachmentError) {
    console.error(
      "Erro ao carregar anexos do briefing:",
      attachmentError.message,
    );

    throw new Error("Não foi possível carregar os anexos do briefing.");
  }

  const safeAttachments: ProjectBriefAttachment[] = await Promise.all(
    (attachments ?? []).map(async (attachment) => {
      const { data, error } = await supabase.storage
        .from("project-brief-attachments")
        .createSignedUrl(attachment.storage_path, 5 * 60);

      if (error) {
        console.error(
          `Erro ao gerar link para o anexo ${attachment.id}:`,
          error.message,
        );
      }

      return {
        id: attachment.id,
        original_name: attachment.original_name,
        mime_type: attachment.mime_type,
        file_size: attachment.file_size,
        created_at: attachment.created_at,
        download_url: data?.signedUrl ?? null,
      };
    }),
  );

  return {
    briefing,
    attachments: safeAttachments,
  };
}
