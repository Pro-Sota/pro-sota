"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type PortfolioStatus = "draft" | "published" | "archived";

export type PortfolioProject = {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string | null;
  year: number | null;
  description: string | null;
  cover_image: string | null;
  gallery: string[];
  status: PortfolioStatus;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioInput = {
  name: string;
  slug: string;
  category: string;
  location: string;
  year: number | null;
  description: string;
  cover_image: string;
  gallery: string[];
  status: PortfolioStatus;
  featured: boolean;
};

type ActionResult =
  | { success: true; project?: PortfolioProject }
  | { success: false; error: string };

type PortfolioDatabaseRow = {
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
  area_sqm: number | string | null;
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
};

const PORTFOLIO_PATH = "/management/portfolio";

/*
 * ============================================================
 * SUPABASE
 * ============================================================
 */

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/*
 * ============================================================
 * NORMALISATION
 * ============================================================
 */

function normaliseSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normaliseImagePath(value: string): string | null {
  const imagePath = value.trim();

  return imagePath || null;
}

function getYear(row: PortfolioDatabaseRow): number | null {
  const date = row.completion_date ?? row.start_date;

  if (!date) return null;

  const year = Number(date.slice(0, 4));

  return Number.isInteger(year) ? year : null;
}

/**
 * Adapta o modelo da tabela Supabase ao modelo utilizado pela UI.
 */
function mapPortfolioProject(
  row: PortfolioDatabaseRow,
): PortfolioProject {
  return {
    id: row.portfolio_project_id,
    name: row.title,
    slug: row.slug,
    category: row.project_type,
    location: row.location_name ?? row.municipality,
    year: getYear(row),
    description: row.description ?? row.summary,
    cover_image: row.cover_image_path,
    // A tabela actual não tem uma coluna gallery.
    gallery: [],
    status: row.status,
    featured: row.is_featured,
    display_order: row.display_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/*
 * ============================================================
 * VALIDATION
 * ============================================================
 */

function validateProject(input: PortfolioInput): string | null {
  if (!input || typeof input !== "object") {
    return "Os dados do projecto são inválidos.";
  }

  if (typeof input.name !== "string" || !input.name.trim()) {
    return "O nome do projecto é obrigatório.";
  }

  if (typeof input.slug !== "string" || !input.slug.trim()) {
    return "O slug do projecto é obrigatório.";
  }

  if (typeof input.category !== "string" || !input.category.trim()) {
    return "A categoria é obrigatória.";
  }

  if (
    input.year !== null &&
    (!Number.isInteger(input.year) ||
      input.year < 1900 ||
      input.year > new Date().getFullYear() + 10)
  ) {
    return "Introduza um ano válido.";
  }

  if (
    !["draft", "published", "archived"].includes(input.status)
  ) {
    return "O estado seleccionado não é válido.";
  }

  if (
    typeof input.featured !== "boolean" ||
    typeof input.description !== "string" ||
    typeof input.location !== "string" ||
    typeof input.cover_image !== "string"
  ) {
    return "Um ou mais campos do projecto são inválidos.";
  }

  if (!Array.isArray(input.gallery)) {
    return "A lista de imagens é inválida.";
  }

  // Aceita URLs HTTP(S) e caminhos relativos do Supabase Storage.
  const imageValues = [input.cover_image, ...input.gallery];

  for (const value of imageValues) {
    if (typeof value !== "string") {
      return "Uma das imagens é inválida.";
    }

    const image = value.trim();

    if (!image) continue;

    if (
      image.startsWith("/") ||
      !image.includes("://")
    ) {
      continue;
    }

    try {
      const url = new URL(image);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "As imagens devem utilizar URLs HTTP ou HTTPS.";
      }
    } catch {
      return "Uma das URLs de imagem não é válida.";
    }
  }

  return null;
}

/*
 * ============================================================
 * READ
 * ============================================================
 */

export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPortfolioProjects:", error.message);
    throw new Error("Não foi possível carregar os projectos do portefólio.");
  }

  return ((data ?? []) as unknown as PortfolioDatabaseRow[]).map(
    mapPortfolioProject,
  );
}

/*
 * ============================================================
 * CREATE
 * ============================================================
 */

export async function createPortfolioProject(
  input: PortfolioInput,
): Promise<ActionResult> {
  const validationError = validateProject(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await getSupabase();
  const slug = normaliseSlug(input.slug);

  if (!slug) {
    return { success: false, error: "O slug não é válido." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("portfolio_projects")
    .select("portfolio_project_id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingError) {
    console.error("Portfolio slug check:", existingError.message);

    return {
      success: false,
      error: "Não foi possível validar o endereço do projecto.",
    };
  }

  if (existing) {
    return {
      success: false,
      error: "Já existe um projecto com este slug.",
    };
  }

  const { data: lastProject, error: orderError } = await supabase
    .from("portfolio_projects")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    console.error("Portfolio order:", orderError.message);

    return {
      success: false,
      error: "Não foi possível preparar a ordem do projecto.",
    };
  }

  const now = new Date().toISOString();

  const insertData = {
    title: input.name.trim(),
    slug,
    summary: input.description.trim() || input.name.trim(),
    description: input.description.trim() || null,
    project_type: input.category.trim(),
    location_name: input.location.trim() || null,
    completion_date: input.year ? `${input.year}-12-31` : null,
    cover_image_path: normaliseImagePath(input.cover_image),
    status: input.status,
    is_featured: input.featured,
    display_order: (lastProject?.display_order ?? 0) + 1,
    published_at: input.status === "published" ? now : null,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    console.error("createPortfolioProject:", error.message);

    return {
      success: false,
      error:
        "Não foi possível criar o projecto. Verifique os dados e as permissões.",
    };
  }

  revalidatePath(PORTFOLIO_PATH);
  revalidatePath("/");

  return {
    success: true,
    project: mapPortfolioProject(data as unknown as PortfolioDatabaseRow),
  };
}

/*
 * ============================================================
 * UPDATE
 * ============================================================
 */

export async function updatePortfolioProject(
  id: string,
  input: PortfolioInput,
): Promise<ActionResult> {
  if (typeof id !== "string" || !id.trim()) {
    return { success: false, error: "Projecto inválido." };
  }

  const validationError = validateProject(input);

  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await getSupabase();
  const slug = normaliseSlug(input.slug);

  if (!slug) {
    return { success: false, error: "O slug não é válido." };
  }

  const { data: existing, error: lookupError } = await supabase
    .from("portfolio_projects")
    .select("portfolio_project_id")
    .eq("slug", slug)
    .neq("portfolio_project_id", id)
    .maybeSingle();

  if (lookupError) {
    console.error("Portfolio slug check:", lookupError.message);

    return {
      success: false,
      error: "Não foi possível validar o endereço do projecto.",
    };
  }

  if (existing) {
    return {
      success: false,
      error: "Já existe outro projecto com este slug.",
    };
  }

  const updateData = {
    title: input.name.trim(),
    slug,
    summary: input.description.trim() || input.name.trim(),
    description: input.description.trim() || null,
    project_type: input.category.trim(),
    location_name: input.location.trim() || null,
    completion_date: input.year ? `${input.year}-12-31` : null,
    cover_image_path: normaliseImagePath(input.cover_image),
    status: input.status,
    is_featured: input.featured,
    published_at: input.status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("portfolio_projects")
    .update(updateData)
    .eq("portfolio_project_id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("updatePortfolioProject:", error.message);

    return {
      success: false,
      error: "Não foi possível actualizar o projecto.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Projecto não encontrado ou sem permissão para o editar.",
    };
  }

  revalidatePath(PORTFOLIO_PATH);
  revalidatePath("/");

  return {
    success: true,
    project: mapPortfolioProject(data as unknown as PortfolioDatabaseRow),
  };
}

/*
 * ============================================================
 * DELETE
 * ============================================================
 */

export async function deletePortfolioProject(
  id: string,
): Promise<ActionResult> {
  if (typeof id !== "string" || !id.trim()) {
    return { success: false, error: "Projecto inválido." };
  }

  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("portfolio_projects")
    .delete()
    .eq("portfolio_project_id", id)
    .select("portfolio_project_id")
    .maybeSingle();

  if (error) {
    console.error("deletePortfolioProject:", error.message);

    return {
      success: false,
      error: "Não foi possível eliminar o projecto.",
    };
  }

  if (!data) {
    return {
      success: false,
      error: "Projecto não encontrado ou sem permissão para o eliminar.",
    };
  }

  revalidatePath(PORTFOLIO_PATH);
  revalidatePath("/");

  return { success: true };
}

/*
 * ============================================================
 * REORDER
 * ============================================================
 */

export async function updatePortfolioOrder(
  orderedIds: string[],
): Promise<ActionResult> {
  if (
    !Array.isArray(orderedIds) ||
    orderedIds.some((id) => typeof id !== "string" || !id.trim())
  ) {
    return { success: false, error: "A lista de projectos é inválida." };
  }

  if (new Set(orderedIds).size !== orderedIds.length) {
    return { success: false, error: "A lista contém projectos duplicados." };
  }

  const supabase = await getSupabase();

  // Cada actualização é verificada individualmente.
  for (const [index, id] of orderedIds.entries()) {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .update({
        display_order: index + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("portfolio_project_id", id)
      .select("portfolio_project_id")
      .maybeSingle();

    if (error || !data) {
      console.error("updatePortfolioOrder:", error?.message);

      return {
        success: false,
        error: "Não foi possível guardar a ordem dos projectos.",
      };
    }
  }

  revalidatePath(PORTFOLIO_PATH);
  revalidatePath("/");

  return { success: true };
}