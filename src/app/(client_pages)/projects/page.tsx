
import type { Metadata } from "next";

import ProjectsPage from "./project_showcase";
import { getPublishedPortfolioProjects } from "@/services/portfolio";

export const metadata: Metadata = {
  title: "Portfólio de Projectos de Arquitectura e Engenharia",
  description:
    "Explore os projectos desenvolvidos pela PRO SOTA em Angola e conheça o nosso trabalho nas áreas de arquitectura, engenharia e construção.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Portfólio | PRO SOTA",
    description:
      "Conheça os projectos de arquitectura, engenharia e construção desenvolvidos pela PRO SOTA em Angola.",
    url: "/projects",
    type: "website",
    images: ["/images/og-image.jpg"],
  },
};

function getPortfolioImageUrl(path: string | null): string | null {
  if (!path?.trim()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
    return null;
  }

  const encodedPath = path
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/portfolio/${encodedPath}`;
}

export default async function PortfolioPage() {
  const portfolioProjects = await getPublishedPortfolioProjects();

  const projects = portfolioProjects.map((project) => ({
    id: project.portfolio_project_id,
    name: project.title,
    slug: project.slug,
    category: project.speciality?.trim() || project.project_type,
    location: project.location_name || project.municipality,
    year: project.completion_date
      ? Number(project.completion_date.slice(0, 4)) || null
      : null,
    summary: project.summary,
    description: project.description,
    cover_image: getPortfolioImageUrl(project.cover_image_path),
    gallery: (project.gallery_image_paths ?? [])
      .map(getPortfolioImageUrl)
      .filter((url): url is string => Boolean(url)),
    status: project.status,
    featured: project.is_featured,
    display_order: project.display_order,
    created_at: project.created_at,
    updated_at: project.updated_at,
  }));

  return <ProjectsPage projects={projects} />;
}
