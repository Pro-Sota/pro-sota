"use client";

import Image from "next/image";
import Link from "next/link";

import { Database } from "../lib/supabase/models";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS = {
  "em-curso": "Em curso",
  concluido: "Concluído",
  "em-observacao": "Em observação",
  "em-pausa": "Em pausa",
} as const;

const STATUS_COLORS = {
  "em-curso":
    "border-blue-200/80 bg-blue-50/95 text-blue-700",
  concluido:
    "border-emerald-200/80 bg-emerald-50/95 text-emerald-700",
  "em-observacao":
    "border-amber-200/80 bg-amber-50/95 text-amber-700",
  "em-pausa":
    "border-gray-200/80 bg-gray-50/95 text-gray-700",
} as const;

const DEFAULT_PROJECT_IMAGE = "/images/arch.jpg";

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 300;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Project =
  Database["public"]["Tables"]["projects"]["Row"] & {
    progress?: number | null;
    clients?: {
      name: string;
    } | null;
    project_manager?: {
      name: string | null;
    } | null;
  };

type ProjectStatus = keyof typeof STATUS_LABELS;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getStatusKey(
  status: string | null
): ProjectStatus | null {
  if (!status) return null;

  return status in STATUS_LABELS
    ? (status as ProjectStatus)
    : null;
}

function formatDate(date: string | null): string {
  if (!date) return "Sem prazo";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProjectCard({
  project,
}: {
  project: Project;
}) {
  const projectImage =
    project.image || DEFAULT_PROJECT_IMAGE;

  const statusKey = getStatusKey(project.status);

  const statusLabel = statusKey
    ? STATUS_LABELS[statusKey]
    : project.status || "Sem estado";

  const statusColor = statusKey
    ? STATUS_COLORS[statusKey]
    : "border-gray-200/80 bg-gray-50/95 text-gray-600";

  const progress = Math.min(
    Math.max(project.progress ?? 0, 0),
    100
  );

  const clientName =
    project.clients?.name?.trim() ||
    project.client_id ||
    null;

  const location =
    project.address_line_1?.trim() || null;

  const managerName =
    project.project_manager?.name?.trim() ||
    "Sem responsável";

  const endDate = formatDate(project.end_date);

  return (
    <Link
      href={`/management/projects/${project.project_id}`}
      className="
        group block overflow-hidden
        rounded-xl border border-gray-200/80
        bg-white
        shadow-[0_1px_2px_rgba(0,0,0,0.04)]
        transition-all duration-300 ease-out
        hover:-translate-y-0.5
        hover:border-gray-300
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
        focus:outline-none
        focus:ring-2 focus:ring-[#002950]/30
        focus:ring-offset-2
      "
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <Image
          src={projectImage}
          alt={`Imagem do projeto ${project.title}`}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          className="
            h-full w-full object-cover
            transition-transform duration-500 ease-out
            group-hover:scale-[1.04]
          "
        />

        {/* Image overlay */}
        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-t
            from-black/10 via-transparent to-black/5
            opacity-60
          "
        />

        {/* Status */}
        <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
          <span
            className={`
              inline-flex items-center
              rounded-full border
              px-2.5 py-1
              text-[11px] font-semibold
              tracking-tight
              shadow-sm
              backdrop-blur-md
              ${statusColor}
            `}
          >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">          {/* Title */}
        <h2
          className="
    line-clamp-2
    min-h-[2.5rem]
    text-base font-semibold
    leading-6 tracking-[-0.01em]
    text-gray-900
    transition-colors duration-200
    group-hover:text-[#002950]
    sm:text-lg
  "
        >
          {project.title}
        </h2>

        {/* Progress */}
        {/* Progress */}
        <div className="mt-0.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-500 sm:text-sm">
              Progresso
            </span>

            <span className="text-sm font-semibold tabular-nums text-gray-900 sm:text-base">
              {progress}
              <span className="ml-0.5 font-normal text-gray-400">
                %
              </span>
            </span>
          </div>

          <div
            className="
      h-1.5 w-full overflow-hidden
      rounded-full bg-gray-100
      ring-1 ring-gray-200/70
    "
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso do projeto: ${progress}%`}
          >
            <div
              className="
        h-full rounded-full
        bg-[#002950]
        transition-[width] duration-700 ease-out
      "
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Project information */}
        {/* Project information */}
        <div className="mt-1 space-y-2.5 text-xs sm:text-sm">
          {/* Client */}
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-[76px] shrink-0 text-gray-400">
              Cliente
            </span>

            <span
              className={`
        min-w-0 truncate
        ${clientName
                  ? "font-medium text-gray-700"
                  : "text-gray-300"
                }
      `}
            >
              {clientName || "Não definido"}
            </span>
          </div>

          {/* Location */}
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-[76px] shrink-0 text-gray-400">
              Localização
            </span>

            <span
              className={`
        min-w-0 truncate
        ${location
                  ? "text-gray-700"
                  : "text-gray-300"
                }
      `}
            >
              {location || "Não definida"}
            </span>
          </div>

          {/* Manager */}
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-[76px] shrink-0 text-gray-400">
              Responsável
            </span>

            <span className="min-w-0 truncate font-medium text-gray-700">
              {managerName}
            </span>
          </div>

          {/* Deadline */}
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-[76px] shrink-0 text-gray-400">
              Prazo
            </span>

            <span className="min-w-0 truncate font-medium text-gray-700">
              {endDate}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex h-8 items-center
            border-t border-gray-100
          "
        >
          <span
            className="
              inline-flex items-center gap-1
              text-xs font-medium
              text-gray-400
              transition-all duration-200
              group-hover:translate-x-0.5
              group-hover:text-[#002950]
            "
          >
            Ver detalhes

            <span
              aria-hidden="true"
              className="
                text-sm
                transition-transform duration-200
                group-hover:translate-x-0.5
              "
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}