
"use client";

import { useCallback, useState } from "react";

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
      typeof image === "string" &&
      image.trim().length > 0
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

  const safeProjects = Array.isArray(projects)
    ? projects
        .filter(isValidProject)
        .slice(0, 4)
    : [];

  const selectedProject =
    safeProjects.find(
      (project) => project.id === selectedProjectId
    ) ?? null;

  const closeLightbox = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const openLightbox = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);

  if (safeProjects.length === 0) {
    return (
      <section
        id="projects"
        className="bg-[#101010] px-6 py-32 text-[#f0eee9] md:px-12 lg:px-20"
      >
        <p className="text-sm text-white/50">
          Ainda não há projectos publicados.
        </p>
      </section>
    );
  }

  return (
    <>
      <section
        id="projects"
        className="bg-[#101010] px-6 py-16 text-[#f0eee9] md:px-12 md:py-24 lg:px-20"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:gap-x-10 lg:gap-y-20">
          {safeProjects.map((project, index) => {
            const images = getProjectImages(project.images);
            const cover = images[0];

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
                disabled={images.length === 0}
                className={`
                  group block w-full text-left
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-[#f0eee9]
                  disabled:cursor-default
                  ${
                    index % 2 === 1
                      ? "md:mt-24"
                      : ""
                  }
                `}
              >
                <ProjectCover
                  src={cover}
                  alt={project.name}
                  priority={index === 0}
                />

                <div className="pt-4">
                  <h3 className="text-xl font-light tracking-tight md:text-2xl">
                    {project.name}
                  </h3>

                  {meta && (
                    <p className="mt-1 text-sm text-white/45">
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
