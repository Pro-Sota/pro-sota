
import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type PortfolioStatus = "draft" | "published" | "archived";

export interface PortfolioProject {
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

export type PortfolioProjectInput = Omit<
  PortfolioProject,
  | "portfolio_project_id"
  | "created_by"
  | "updated_by"
  | "created_at"
  | "updated_at"
  | "published_at"
> & {
  published_at?: string | null;
};

export type PortfolioProjectUpdate = Partial<PortfolioProjectInput>;

export interface PortfolioFilters {
  search?: string;
  projectType?: string;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}

/* -------------------------------------------------------------------------- */
/* Client                                                                     */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  return createClient(await cookies());
}

/* -------------------------------------------------------------------------- */
/* Public portfolio                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Returns published projects for the public website.
 * Results follow the configured display order.
 */
export async function getPublishedPortfolioProjects(
  filters: PortfolioFilters = {},
): Promise<PortfolioProject[]> {
  const supabase = await getSupabase();

  let query = supabase
    .from("portfolio_projects")
    .select("*")
    .eq("status", "published")
    .order("display_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (filters.featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (filters.projectType) {
    query = query.eq("project_type", filters.projectType);
  }

  if (filters.search?.trim()) {
    const search = filters.search.trim().replace(/[,%()]/g, "");
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,summary.ilike.%${search}%,municipality.ilike.%${search}%`,
      );
    }
  }

  if (filters.limit !== undefined) {
    query = query.limit(Math.max(1, Math.min(filters.limit, 100)));
  }

  if (filters.offset !== undefined && filters.limit !== undefined) {
    query = query.range(
      Math.max(0, filters.offset),
      Math.max(0, filters.offset) +
        Math.max(1, Math.min(filters.limit, 100)) -
        1,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPublishedPortfolioProjects:", error.message);
    throw new Error("Não foi possível carregar o portefólio.");
  }

  return (data ?? []) as PortfolioProject[];
}

/**
 * Returns a single published project by its public URL slug.
 * Draft and archived projects are never returned.
 */
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

/**
 * Returns the distinct project types currently published.
 */
export async function getPublishedPortfolioTypes(): Promise<string[]> {
  const projects = await getPublishedPortfolioProjects();

  return [...new Set(projects.map((project) => project.project_type))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "pt-PT"));
}

/* -------------------------------------------------------------------------- */
/* Portfolio management                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Returns all portfolio entries, including drafts and archived projects.
 *
 * Call only from an authenticated management page after verifying that
 * the current user has portfolio-management permission.
 */
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
    const search = filters.search.trim().replace(/[,%()]/g, "");
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,summary.ilike.%${search}%,municipality.ilike.%${search}%`,
      );
    }
  }

  if (filters.limit !== undefined) {
    query = query.limit(Math.max(1, Math.min(filters.limit, 100)));
  }

  if (filters.offset !== undefined && filters.limit !== undefined) {
    query = query.range(
      Math.max(0, filters.offset),
      Math.max(0, filters.offset) +
        Math.max(1, Math.min(filters.limit, 100)) -
        1,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPortfolioProjects:", error.message);
    throw new Error("Não foi possível carregar os projectos do portefólio.");
  }

  return (data ?? []) as PortfolioProject[];
}

/**
 * Returns a portfolio entry by its database ID.
 *
 * Use only in an authorized management context.
 */
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
/* Mutations                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Creates a portfolio entry for the authenticated user.
 *
 * The caller must enforce the user's portfolio-management permission.
 * Database RLS must independently enforce the same authorization policy.
 */
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

  const payload = {
    ...input,
    title: input.title.trim(),
    slug: input.slug.trim(),
    summary: input.summary.trim(),
    created_by: user.id,
    updated_by: user.id,
    published_at:
      input.status === "published"
        ? input.published_at ?? new Date().toISOString()
        : null,
  };

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("createPortfolioProject:", error.message);

    if (error.code === "23505") {
      throw new Error(
        "Já existe um projecto com este endereço (slug) ou projecto associado.",
      );
    }

    throw new Error("Não foi possível criar o projecto do portefólio.");
  }

  return data as PortfolioProject;
}

/**
 * Updates a portfolio entry.
 */
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

  const { published_at: requestedPublishedAt, ...fields } = input;

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

  // Preserve the original publication date when editing an already
  // published project. Set it when publishing for the first time.
  if (fields.status === "published") {
    const existing = await getPortfolioProjectById(portfolioProjectId);

    if (!existing) {
      throw new Error("O projecto do portefólio não foi encontrado.");
    }

    payload.published_at =
      existing.published_at ??
      requestedPublishedAt ??
      new Date().toISOString();
  } else if (fields.status === "draft" || fields.status === "archived") {
    payload.published_at = null;
  } else if (requestedPublishedAt !== undefined) {
    payload.published_at = requestedPublishedAt;
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
      throw new Error("O slug ou projecto associado já está a ser utilizado.");
    }

    throw new Error("Não foi possível actualizar o projecto.");
  }

  if (!data) {
    throw new Error(
      "Projecto não encontrado ou sem permissão para o actualizar.",
    );
  }

  return data as PortfolioProject;
}

/**
 * Deletes a portfolio entry.
 * This does not delete the original record in public.projects.
 */
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
    throw new Error("Não foi possível eliminar o projecto do portefólio.");
  }

  if (!data) {
    throw new Error(
      "Projecto não encontrado ou sem permissão para o eliminar.",
    );
  }
}
