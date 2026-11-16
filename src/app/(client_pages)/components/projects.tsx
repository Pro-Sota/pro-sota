
"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { getStorageImageUrl } from "@/app/lib/supabase/storage";

import Lightbox from "./light_box";
import ProjectCover from "./project_cover";

import type { LightboxProject } from "./light_box";

export type DisplayProject = LightboxProject & {
  category: string;
  categories: string[];
  summary: string;
  description: string;
  featured: boolean;
};

interface ProjectsShowcaseProps {
  projects: DisplayProject[];
}

function getProjectImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];

  return images.filter(
    (image): image is string =>
      typeof image === "string" && image.trim().length > 0
  );
}

function isValidProject(
  project: DisplayProject | null | undefined
): project is DisplayProject {
  return Boolean(
    project &&
      typeof project.id === "string" &&
      project.id.trim() &&
      typeof project.name === "string" &&
      project.name.trim()
  );
}

export default function ProjectsShowcase({
  projects,
}: ProjectsShowcaseProps) {
  const [selectedProjectId, setSelectedProjectId] =
    useState<string | null>(null);

  const safeProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];

    return projects
      .filter(isValidProject)
      .sort((a, b) => {
        if (a.featured !== b.featured) {
          return Number(b.featured) - Number(a.featured);
        }

        return (Number(b.year) || 0) - (Number(a.year) || 0);
      })
      .slice(0, 4);
  }, [projects]);

  const projectsWithImages = useMemo(
    () =>
      safeProjects.map((project) => ({
        ...project,
        images: getProjectImages(project.images)
          .map((image) => getStorageImageUrl(image, "portfolio"))
          .filter(
            (image): image is string =>
              typeof image === "string" && image.trim().length > 0
          ),
      })),
    [safeProjects]
  );

  const selectedProject =
    projectsWithImages.find(
      (project) => project.id === selectedProjectId
    ) ?? null;

  const closeLightbox = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const openLightbox = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);

  if (projectsWithImages.length === 0) {
    return (
      <section
        id="projects"
        className="w-full bg-[#F7F7F5] px-5 py-16 text-[#002950] sm:px-8 md:px-10 lg:px-16 2xl:px-24"
      >
        <p className="text-sm text-[#002950]/50">
          Ainda não há projectos publicados.
        </p>
      </section>
    );
  }

  return (
    <>
      <section
        id="projects"
        aria-labelledby="showcase-heading"
        className="w-full bg-[#F7F7F5] px-5 py-14 text-[#002950] sm:px-8 md:px-10 md:py-16 lg:px-16 lg:py-20 2xl:px-24"
      >
        <div className="mx-auto w-full max-w-[1920px]">
          {/* Section heading */}
          <div className="mb-9 md:mb-11 lg:mb-13">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#BD9655]">
              Portfólio
            </p>

            <h2
              id="showcase-heading"
              className="text-[clamp(1.75rem,3vw,2.5rem)] font-light leading-tight tracking-[-0.04em] text-[#002950]"
            >
              Projectos em destaque.
            </h2>
          </div>

          {/* Project gallery */}
          <div className="grid w-full grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14 2xl:gap-x-10">
            {projectsWithImages.map((project, index) => {
              const cover = project.images[0];

              const meta = [
                project.location,
                project.year,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => openLightbox(project.id)}
                  aria-label={`Ver imagens do projecto ${project.name}`}
                  aria-haspopup="dialog"
                  disabled={!cover}
                  className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BD9655] disabled:cursor-default"
                >
                  {/* Project image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#EAE9E4]">
                    {cover && (
                      <ProjectCover
                        src={cover}
                        alt={project.name}
                        priority={index === 0}
                      />
                    )}
                  </div>

                  {/* Project information */}
                  <div className="flex items-start justify-between gap-4 pt-4">
                    <div className="min-w-0">
                      <h3
                        title={project.name}
                        className="line-clamp-2 text-sm font-medium leading-snug tracking-[-0.015em] text-[#002950] transition-colors duration-300 group-hover:text-[#BD9655] sm:text-base"
                      >
                        {project.name}
                      </h3>

                      {meta && (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-[#002950]/55 sm:text-xs">
                          {meta}
                        </p>
                      )}
                    </div>

                    {cover && (
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-base text-[#BD9655] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:transition-none"
                      >
                        ↗
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* All projects link */}
          <div className="mt-12 flex justify-center md:mt-16">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-4 border-b border-[#BD9655] pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#002950] transition-colors duration-300 hover:text-[#BD9655] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BD9655]"
            >
              Ver todos os projectos

              <span
                aria-hidden="true"
                className="inline-block text-base transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none"
              >
                ↗
              </span>
            </Link>
          </div>
        </div>
      </section>

      {selectedProject && (
        <Lightbox
          key={selectedProject.id}
          project={selectedProject}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
