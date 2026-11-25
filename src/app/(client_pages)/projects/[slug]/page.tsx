
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

import {
  getPublishedPortfolioProjectBySlug,
} from "@/services/portfolio";

import ProjectDetailClient from "./project_detail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getProject = cache(async (slug: string) => {
  return getPublishedPortfolioProjectBySlug(slug);
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);


  console.log("Projecto encontrado: " + project);

  if (!project) {
    return {
      title: "Projecto não encontrado | PRO SOTA",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    project.seo_title?.trim() ||
    `${project.title} | PRO SOTA`;

  const description =
    project.seo_description?.trim() ||
    project.summary ||
    `Conheça o projecto ${project.title}, desenvolvido pela PRO SOTA.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://prosota.ao/projects/${encodeURIComponent(project.slug)}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      type: "article",
      locale: "pt_PT",
      siteName: "PRO SOTA",
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  if (!slug) notFound();

  const project = await getProject(slug);

  if (!project) notFound();

  return <ProjectDetailClient project={project} />;
}
