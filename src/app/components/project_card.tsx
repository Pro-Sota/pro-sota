"use client";

import Image from "next/image";
import Link from "next/link";
import { Database } from "../lib/supabase/models";

const STATUS_LABELS = {
  "em-curso": "Em curso",
  concluido: "Concluído",
  "em-observacao": "Em observação",
} as const;

const DEFAULT_PROJECT_IMAGE = "/images/arch.jpg";
const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 300;

type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  progress?: number | null;
  clients?: {
    name: string;
  } | null;
};

export default function ProjectCard({ project }: { project: Project }) {
  const projectImage = project.image ?? DEFAULT_PROJECT_IMAGE;

  const statusLabel =
    project.status && project.status in STATUS_LABELS
      ? STATUS_LABELS[project.status as keyof typeof STATUS_LABELS]
      : project.status ?? "Sem estado";

  const progress = Math.min(Math.max(project.progress ?? 0, 0), 100);

  const clientName = project.clients?.name ?? null;
  const hasClient = Boolean(clientName);
  const hasLocation = Boolean(project.location?.trim());

  return (
    <Link
      href={`/management/projects/${project.project_id}`}
      className="
        group flex flex-col bg-white rounded-lg shadow-md overflow-hidden
        hover:shadow-xl transition-shadow duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800
        w-full max-w-sm
      "
    >
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={projectImage}
          alt={`Imagem do projeto ${project.title}`}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          className="
            object-cover w-full h-full
            group-hover:scale-105 transition-transform duration-300
          "
        />
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 text-sm text-gray-600">
        {/* Title */}
        <h2
          className="
            text-lg text-gray-900 font-semibold line-clamp-1 mb-3
            group-hover:text-slate-700 transition-colors
          "
        >
          {project.title}
        </h2>

        {/* Status + Progress */}
        <div className="flex justify-between items-center gap-4 mb-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gray-500">
              Estado:
            </span>

            <span className="font-medium truncate">
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-gray-500">
              Progresso:
            </span>

            <span className="font-medium text-slate-800">
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="
            w-full bg-gray-200 rounded-full h-1.5 mb-3
            overflow-hidden flex-shrink-0
          "
        >
          <div
            className="
              bg-slate-800 h-full
              transition-all duration-500
            "
            style={{
              width: `${progress}%`,
            }}
            aria-label={`Progresso do projeto: ${progress}%`}
          />
        </div>

        {/* Extra info */}
        <div className="space-y-1 text-xs text-gray-600">
          {hasClient && (
            <p className="truncate">
              <span className="text-gray-500">
                Cliente:
              </span>{" "}
              {clientName}
            </p>
          )}

          {hasLocation && (
            <p className="truncate">
              <span className="text-gray-500">
                Localização:
              </span>{" "}
              {project.location}
            </p>
          )}

          {!hasClient && !hasLocation && (
            <p className="text-gray-400 italic">
              Sem informações adicionais
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}