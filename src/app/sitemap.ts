
import type { MetadataRoute } from "next";

import {
  getPublishedPortfolioProjects,
} from "@/services/portfolio";

const SITE_URL = "https://prosota.ao";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/solutions`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];

  const projects = await getPublishedPortfolioProjects();

  // Defensive filtering: only explicitly published projects are indexed.
  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter(
      (project) =>
        project.status === "published" &&
        typeof project.slug === "string" &&
        project.slug.trim().length > 0,
    )
    .map((project) => {
      const updatedAt = project.updated_at
        ? new Date(project.updated_at)
        : lastModified;

      return {
        url: `${SITE_URL}/projects/${encodeURIComponent(project.slug)}`,
        lastModified: Number.isNaN(updatedAt.getTime())
          ? lastModified
          : updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      };
    });

  return [...staticRoutes, ...projectRoutes];
}
