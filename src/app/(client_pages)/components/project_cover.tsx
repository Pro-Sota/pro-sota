"use client";

import { useCallback, useMemo, useState } from "react";
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
        const yearA = Number(a.year) || 0;
        const yearB = Number(b.year) || 0;

        return yearB - yearA;
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
        className="bg-[#F7F7F5] px-6 py-20 text-[#002950] md:px-12 lg:px-20"
      >
        <p className="text-sm text-[#002950]/50">
          Ainda não há projectos publicados.
        </p>
      </section>
    );
  }

  return (
    <>
      {/* Same container as the other pages: max-w-[1600px], px-6 / md:px-12 / lg:px-20 */}
      <section
        id="projects"
        className="
          bg-[#F7F7F5]
          px-6 py-12
          text-[#002950]
          md:px-12 md:py-16
          lg:px-20 lg:py-20
        "
      >
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1600px]
            grid-cols-1
            gap-x-6
            gap-y-10
            sm:grid-cols-2
            sm:gap-x-5
            sm:gap-y-12
            lg:gap-x-8
            lg:gap-y-14
          "
        >
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
                className="
                  group block w-full text-left
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-[#BD9655]
                  disabled:cursor-default
                "
              >
                <div className="overflow-hidden">
                  <ProjectCover
                    src={cover}
                    alt={project.name}
                    priority={index === 0}
                  />
                </div>

                {/* Larger text on phones; original sizes from sm up */}
                <div className="pt-4 sm:pt-3">
                  <h3
                    className="
                      text-2xl
                      font-light
                      tracking-tight
                      text-[#002950]
                      transition-colors
                      duration-300
                      group-hover:text-[#BD9655]
                      sm:text-lg
                      md:text-xl
                    "
                  >
                    {project.name}
                  </h3>

                  {meta && (
                    <p className="mt-1.5 text-sm text-[#002950]/55 sm:mt-1 sm:text-xs md:text-sm">
                      {meta}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
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