
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getStorageImageUrl } from "@/app/lib/supabase/storage";

import ProjectCover from "./project_cover";

import type { LightboxProject } from "./light_box";
import { motion, useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";

// Load the Lightbox only when needed.
const loadLightbox = () => import("./light_box");
const Lightbox = dynamic(loadLightbox, { ssr: false });

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

const SHOWCASE_LIMIT = 4;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BD9655]";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function getProjectImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];

  return images.filter(isNonEmptyString);
}

function isValidProject(
  project: DisplayProject | null | undefined
): project is DisplayProject {
  return Boolean(
    project &&
    isNonEmptyString(project.id) &&
    isNonEmptyString(project.name)
  );
}

function SectionHeading() {
  return (
    <div className="mb-9 font-body md:mb-11 lg:mb-12">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8B6A2F]">
        Portfólio
      </p>

      <h2
        id="showcase-heading"
        className="font-body text-[clamp(1.9rem,3vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.045em] text-[#1F1E1B]"
      >
        Projectos em destaque.
      </h2>
    </div>
  );
}

interface ProjectCardProps {
  project: DisplayProject & { images: string[] };
  priority: boolean;
  onOpen: (projectId: string, trigger: HTMLElement) => void;
}

function ProjectCard({
  project,
  priority,
  onOpen,
}: ProjectCardProps) {
  const cover = project.images[0];

  return (
    <motion.article
      className="group relative font-body"
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {/* Project image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EEECE6]">
        <ProjectCover src={cover} alt="" priority={priority} />
      </div>

      {/* Project information */}
      <div className="flex items-start justify-between gap-4 pt-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug tracking-[-0.015em] text-[#1F1E1B] sm:text-base">
            <button
              type="button"
              title={project.name}
              aria-haspopup="dialog"
              onClick={(event) =>
                onOpen(project.id, event.currentTarget)
              }
              onPointerEnter={loadLightbox}
              onFocus={loadLightbox}
              className={`cursor-pointer text-left after:absolute after:inset-0 after:content-[''] ${FOCUS_RING}`}
            >
              {project.name}
            </button>
          </h3>

          {project.year && (
            <p className="mt-1.5 text-xs leading-relaxed text-[#5F5B54]">
              {project.year}
            </p>
          )}
        </div>
        </div>
    </motion.article>
  );
}

export default function ProjectsShowcase({
  projects,
}: ProjectsShowcaseProps) {
  const [selectedProjectId, setSelectedProjectId] =
    useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

  const galleryVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.14,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  // Restore focus to the card that opened the Lightbox.
  const triggerRef = useRef<HTMLElement | null>(null);

  const projectsWithImages = useMemo(() => {
    if (!Array.isArray(projects)) return [];

    return projects
      .filter(isValidProject)
      .map((project) => ({
        ...project,
        images: getProjectImages(project.images)
          .map((image) => getStorageImageUrl(image, "portfolio"))
          .filter(isNonEmptyString),
      }))
      .filter((project) => project.images.length > 0)
      .sort((a, b) => {
        if (a.featured !== b.featured) {
          return Number(b.featured) - Number(a.featured);
        }

        const byYear =
          (Number(b.year) || 0) - (Number(a.year) || 0);

        if (byYear !== 0) return byYear;

        return a.name.localeCompare(b.name, "pt");
      })
      .slice(0, SHOWCASE_LIMIT);
  }, [projects]);

  const selectedProject =
    projectsWithImages.find(
      (project) => project.id === selectedProjectId
    ) ?? null;

  const openLightbox = useCallback(
    (projectId: string, trigger: HTMLElement) => {
      triggerRef.current = trigger;
      setSelectedProjectId(projectId);
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setSelectedProjectId(null);

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
      triggerRef.current = null;
    });
  }, []);

  if (projectsWithImages.length === 0) {
    return (
      <section
        id="projects"
        aria-labelledby="showcase-heading"
        className="w-full bg-[#F7F7F5] px-5 py-16 font-body text-[#1F1E1B] sm:px-8 md:px-10 lg:px-16 2xl:px-24"
      >
        <div className="mx-auto w-full max-w-[1920px]">
          <SectionHeading />

          <p className="text-sm text-[#5F5B54]">
            Ainda não há projectos publicados.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="projects"
        aria-labelledby="showcase-heading"
        className="w-full bg-[#F7F7F5] px-5 py-14 font-body text-[#1F1E1B] sm:px-8 md:px-10 md:py-16 lg:px-16 lg:py-20 2xl:px-24"
      >
        <div className="mx-auto w-full max-w-[1920px]">
          <SectionHeading />

          {/* Project gallery */}
          <motion.div
            variants={galleryVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            className="grid w-full grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-14 2xl:gap-x-10"
          >
            {projectsWithImages.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                priority={index === 0}
                onOpen={openLightbox}
              />
            ))}
          </motion.div>

          {/* All projects link */}
          <div className="mt-12 flex justify-center md:mt-16">
            <Link
              href="/projects"
              className={`group inline-flex items-center gap-3 border-b border-[#BD9655] pb-2 font-body text-[11px] font-medium uppercase tracking-[0.14em] text-[#1F1E1B] transition-colors duration-300 hover:text-[#8B6A2F] ${FOCUS_RING}`}
            >
              Ver todos os projectos

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
