
import type { Metadata } from "next";

import ProjectsPage from "./project_showcase";
import { getPublishedPortfolioProjects } from "@/services/portfolio";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Portfólio de Projectos de Arquitectura e Engenharia",
  description:
    "Explore os projectos desenvolvidos pela PRO SOTA em Angola e conheça o nosso trabalho nas áreas de arquitectura, engenharia e construção.",
  alternates: {
    canonical: "/projects",
  },
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const project = await getPortfolioProject(slug);

  if (!project || project.status !== "published") {
    return {
      title: "Projecto não encontrado",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${project.name} | Portfólio PRO SOTA`,

    description:
      project.summary ||
      `Conheça o projecto ${project.name}, desenvolvido pela PRO SOTA em Angola.`,

    alternates: {
      canonical: `/projects/${project.slug}`,
    },

    openGraph: {
      title: `${project.name} | PRO SOTA`,
      description: project.summary,
      type: "article",
      images: project.cover_image
        ? [project.cover_image]
        : ["/images/og-image.jpg"],
    },
  };
}

/**
 * Converts a Supabase Storage path into its public URL.
 * The portfolio bucket must be configured as public.
 */
function getPortfolioImageUrl(path: string | null): string | null {
  if (!path?.trim()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
    return null;
  }

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/portfolio/${encodedPath}`;
}


export default async function PortfolioPage() {
  const portfolioProjects = await getPublishedPortfolioProjects();

  const projects = portfolioProjects.map((project) => ({
    id: project.portfolio_project_id,
    name: project.title,
    slug: project.slug,
    category:
      project.speciality?.trim() || project.project_type,
    location:
      project.location_name || project.municipality,
    year: project.completion_date
      ? Number(project.completion_date.slice(0, 4)) || null
      : null,
    summary: project.summary,
    description: project.description,
    cover_image: getPortfolioImageUrl(
      project.cover_image_path,
    ),
    gallery: (project.gallery_image_paths ?? [])
      .map(getPortfolioImageUrl)
      .filter((url): url is string => Boolean(url)),
    status: project.status,
    featured: project.is_featured,
    display_order: project.display_order,
    created_at: project.created_at,
    updated_at: project.updated_at,
  }));

  console.log(`Loaded ${projects.length} portfolio projects.`);

  return <ProjectsPage projects={projects} />;
}
