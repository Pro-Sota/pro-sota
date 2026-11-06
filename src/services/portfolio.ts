
import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

const STORAGE_BUCKET = "portfolio";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ACCEPTED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type PortfolioStatus = "draft" | "published" | "archived";

export interface PortfolioProject {
  featured: any;
  category: string;
  cover_image: any;
  gallery: never[];
  id: string;
  name: any;
  year: any;
  location: string;
  portfolio_project_id: string;
  project_id: string | null;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  project_code: string | null;
  client_display_name: string | null;
  project_type: string;
  architectural_style: string | null;
  country: string;
  speciality: string | null;
  municipality: string | null;
  location_name: string | null;
  area_sqm: number | null;
  floors: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  start_date: string | null;
  completion_date: string | null;
  services: string[];
  cover_image_path: string | null;
  gallery_image_paths: string[];
  cover_image_alt: string | null;
  status: PortfolioStatus;
  is_featured: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProjectInput {
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  project_type: string;
  country: string;
  speciality: string | null;
  municipality: string | null;
  location_name: string | null;
  completion_date: string | null;
  services: string[];
  cover_image_path: string | null;
  gallery_image_paths: string[];
  cover_image_alt: string | null;
  status: PortfolioStatus;
  is_featured: boolean;
}

export type PortfolioProjectUpdate = Partial<PortfolioProjectInput>;

export interface PortfolioFilters {
  search?: string;
  projectType?: string;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface UploadedPortfolioImage {
  path: string;
  publicUrl: string;
}

async function getSupabase() {
  return createClient(await cookies());
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function sanitizeSearch(value: string) {
  return value.trim().replace(/[,%()]/g, "");
}

function sanitizeFolder(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9/_-]/g, "")
      .replace(/^\/+|\/+$/g, "") || "projects"
  );
}

/* -------------------------------------------------------------------------- */
/* Public portfolio                                                           */
/* -------------------------------------------------------------------------- */

export async function getPublishedPortfolioProjects(
  filters: PortfolioFilters = {},
): Promise<PortfolioProject[]> {
  const supabase = await getSupabase();

  let query = supabase
    .from("portfolio_projects")
    .select("*")
    .order("display_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (filters.featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (filters.projectType) {
    query = query.eq("project_type", filters.projectType);
  }

  if (filters.search?.trim()) {
    const search = sanitizeSearch(filters.search);

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,summary.ilike.%${search}%,municipality.ilike.%${search}%`,
      );
    }
  }

  if (filters.limit !== undefined) {
    const limit = Math.max(1, Math.min(filters.limit, 100));
    query = query.limit(limit);

    if (filters.offset !== undefined) {
      query = query.range(
        Math.max(0, filters.offset),
        Math.max(0, filters.offset) + limit - 1,
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPublishedPortfolioProjects:", error.message);
    throw new Error("Não foi possível carregar o portefólio.");
  }

  return (data ?? []) as PortfolioProject[];
}

export async function getPublishedPortfolioProjectBySlug(
  slug: string,
): Promise<PortfolioProject | null> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getPublishedPortfolioProjectBySlug:", error.message);
    throw new Error("Não foi possível carregar o projecto.");
  }

  return (data as PortfolioProject | null) ?? null;
}

export async function getPublishedPortfolioTypes(): Promise<string[]> {
  const projects = await getPublishedPortfolioProjects();

  return [...new Set(projects.map((project) => project.project_type))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-PT"));
}

/* -------------------------------------------------------------------------- */
/* Portfolio management                                                      */
/* -------------------------------------------------------------------------- */

export async function getPortfolioProjects(
  filters: PortfolioFilters = {},
): Promise<PortfolioProject[]> {
  const supabase = await getSupabase();

  let query = supabase
    .from("portfolio_projects")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters.projectType) {
    query = query.eq("project_type", filters.projectType);
  }

  if (filters.featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (filters.search?.trim()) {
    const search = sanitizeSearch(filters.search);

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,summary.ilike.%${search}%,municipality.ilike.%${search}%`,
      );
    }
  }

  if (filters.limit !== undefined) {
    const limit = Math.max(1, Math.min(filters.limit, 100));
    query = query.limit(limit);

    if (filters.offset !== undefined) {
      query = query.range(
        Math.max(0, filters.offset),
        Math.max(0, filters.offset) + limit - 1,
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPortfolioProjects:", error.message);
    throw new Error("Não foi possível carregar os projectos do portefólio.");
  }

  return (data ?? []) as PortfolioProject[];
}

export async function getPortfolioProjectById(
  portfolioProjectId: string,
): Promise<PortfolioProject | null> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("portfolio_project_id", portfolioProjectId)
    .maybeSingle();

  if (error) {
    console.error("getPortfolioProjectById:", error.message);
    throw new Error("Não foi possível carregar o projecto.");
  }

  return (data as PortfolioProject | null) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Image storage                                                              */
/* -------------------------------------------------------------------------- */

export async function uploadPortfolioImage(
  file: File,
  folder = "projects",
): Promise<UploadedPortfolioImage> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Seleccione uma imagem válida.");
  }

  const extension = ACCEPTED_TYPES[file.type];

  if (!extension) {
    throw new Error("Formato não permitido. Utilize JPG, PNG, WebP ou AVIF.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A imagem não pode ultrapassar 8 MB.");
  }

  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("É necessário iniciar sessão para carregar imagens.");
  }

  const safeFolder = sanitizeFolder(folder);
  const path = `${safeFolder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("uploadPortfolioImage:", error.message);
    throw new Error("Não foi possível carregar a imagem.");
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}

export async function deletePortfolioImage(path: string): Promise<void> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("É necessário iniciar sessão.");
  }

  const safePath = path.trim();

  if (
    !safePath ||
    safePath.startsWith("/") ||
    safePath.includes("..")
  ) {
    throw new Error("Caminho de imagem inválido.");
  }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([safePath]);

  if (error) {
    console.error("deletePortfolioImage:", error.message);
    throw new Error("Não foi possível remover a imagem.");
  }
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export async function createPortfolioProject(
  input: PortfolioProjectInput,
): Promise<PortfolioProject> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("É necessário iniciar sessão para criar um projecto.");
  }

  const now = new Date().toISOString();

  const payload = {
    project_id: null,
    project_code: null,
    client_display_name: null,
    architectural_style: null,
    area_sqm: null,
    floors: null,
    bedrooms: null,
    bathrooms: null,
    start_date: null,
    display_order: 0,
    seo_title: input.title.trim(),
    seo_description: input.summary.trim().slice(0, 160),

    title: input.title.trim(),
    slug: input.slug.trim(),
    summary: input.summary.trim(),
    description: input.description?.trim() || null,
    project_type: input.project_type,
    country: input.country,
    speciality: input.speciality,
    municipality: input.municipality,
    location_name: input.location_name,
    completion_date: input.completion_date,
    services: input.services,
    cover_image_path: input.cover_image_path,
    gallery_image_paths: input.gallery_image_paths,
    cover_image_alt: input.cover_image_alt,
    status: input.status,
    is_featured: input.is_featured,

    created_by: user.id,
    updated_by: user.id,
    published_at: input.status === "published" ? now : null,
  };

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("createPortfolioProject:", error.message);

    if (error.code === "23505") {
      throw new Error("Já existe um projecto com este endereço (slug).");
    }

    if (error.code === "42501") {
      throw new Error("Não tem permissão para criar projectos no portefólio.");
    }

    throw new Error("Não foi possível criar o projecto do portefólio.");
  }

  return data as PortfolioProject;
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function updatePortfolioProject(
  portfolioProjectId: string,
  input: PortfolioProjectUpdate,
): Promise<PortfolioProject> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("É necessário iniciar sessão para editar o projecto.");
  }

  const { status, ...fields } = input;

  const payload: Record<string, unknown> = {
    ...fields,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  if (fields.title !== undefined) {
    payload.title = fields.title.trim();
  }

  if (fields.slug !== undefined) {
    payload.slug = fields.slug.trim();
  }

  if (fields.summary !== undefined) {
    payload.summary = fields.summary.trim();
  }

  if (status !== undefined) {
    payload.status = status;

    if (status === "published") {
      const existing = await getPortfolioProjectById(portfolioProjectId);

      if (!existing) {
        throw new Error("O projecto não foi encontrado.");
      }

      payload.published_at =
        existing.published_at ?? new Date().toISOString();
    } else {
      payload.published_at = null;
    }
  }

  const { data, error } = await supabase
    .from("portfolio_projects")
    .update(payload)
    .eq("portfolio_project_id", portfolioProjectId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("updatePortfolioProject:", error.message);

    if (error.code === "23505") {
      throw new Error("O endereço do projecto já está a ser utilizado.");
    }

    throw new Error("Não foi possível actualizar o projecto.");
  }

  if (!data) {
    throw new Error("Projecto não encontrado ou sem permissão.");
  }

  return data as PortfolioProject;
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function deletePortfolioProject(
  portfolioProjectId: string,
): Promise<void> {
  const supabase = await getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("É necessário iniciar sessão para eliminar o projecto.");
  }

  const { data, error } = await supabase
    .from("portfolio_projects")
    .delete()
    .eq("portfolio_project_id", portfolioProjectId)
    .select("portfolio_project_id")
    .maybeSingle();

  if (error) {
    console.error("deletePortfolioProject:", error.message);
    throw new Error("Não foi possível eliminar o projecto.");
  }

  if (!data) {
    throw new Error("Projecto não encontrado ou sem permissão.");
  }
}
