"use client";

import Image from "next/image";
import Link from "next/link";
import { Database } from "../lib/supabase/models";
import { getProjectManager } from "@/services/projects";
import { useEffect, useState } from "react";

const STATUS_LABELS = {
  "em-curso": "Em curso",
  concluido: "Concluído",
  "em-observacao": "Em observação",
  "em-pausa": "Em pausa",
} as const;

const STATUS_COLORS = {
  "em-curso": "bg-blue-100 text-blue-700 border border-blue-200",
  concluido: "bg-green-100 text-green-700 border border-green-200",
  "em-observacao": "bg-amber-100 text-amber-700 border border-amber-200",
  "em-pausa": "bg-gray-100 text-gray-700 border border-gray-200",
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

  const statusKey = project.status as keyof typeof STATUS_LABELS | undefined;
  const statusLabel =
    statusKey && statusKey in STATUS_LABELS
      ? STATUS_LABELS[statusKey]
      : project.status ?? "Sem estado";

  const statusColor =
    statusKey && statusKey in STATUS_COLORS
      ? STATUS_COLORS[statusKey]
      : "bg-gray-100 text-gray-600 border border-gray-200";

  const progress = Math.min(Math.max(project.progress ?? 0, 0), 100);

  const clientName = project.client_id ?? null;
  const hasClient = Boolean(clientName);
  const hasLocation = Boolean(project.address_line_1?.trim());
  const [manager, setManager] = useState("");

  useEffect(() => {
    async function setProjectManager(){
      const manager = await getProjectManager(project.project_id);
      setManager(manager ?? "Sem responsável");
    }

    setProjectManager();
  },[project.project_id, setManager])
  
  return (
    <Link
      href={`/management/projects/${project.project_id}`}
      className="
        group block
        bg-white rounded-xl shadow-sm border border-gray-200
        hover:shadow-lg hover:border-gray-300 transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002950] focus:ring-offset-gray-100
        overflow-hidden
      "
    >
      {/* Image Container */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden flex-shrink-0">
        <Image
          src={projectImage}
          alt={`Imagem do projeto ${project.title}`}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          className="
            object-cover w-full h-full
            group-hover:scale-110 transition-transform duration-500 ease-out
          "
          priority={false}
        />

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <span
            className={`
              inline-flex px-2.5 py-1 rounded-md text-xs font-medium
              backdrop-blur-sm bg-white/90
              ${statusColor}
              transition-all duration-300
            `}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col h-full p-3 sm:p-2 md:p-4 gap-3 sm:gap-2">
        {/* Title */}
        <div className="flex-shrink-0 min-w-0">
          <h2
            className="
              text-base sm:text-lg font-semibold text-gray-900
              line-clamp-2
              group-hover:text-gray-700 transition-colors duration-200
            "
          >
            {project.title}
          </h2>
        </div>

        {/* Progress Section */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              Progresso
            </span>
            <span className="text-sm sm:text-base font-semibold text-gray-900 tabular-nums">
              {progress}<span className="text-gray-500 font-normal">%</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div
            className="
              w-full h-2 bg-gray-200 rounded-full
              overflow-hidden flex-shrink-0 ring-1 ring-gray-300/50
            "
          >
            <div
              className="
                h-full bg-gradient-to-r from-gray-900 to-gray-800
                transition-all duration-700 ease-out
                rounded-full
              "
              style={{
                width: `${progress}%`,
              }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso do projeto: ${progress}%`}
            />
          </div>
        </div>

        {/* Info Section - Flexes to fill space */}
        <div className="flex-grow min-w-0 gap-2 mt-2">
          <div className="space-y-2 text-xs sm:text-sm">
            {hasClient && (
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-gray-500 flex-shrink-0 font-medium">
                  Cliente:
                </span>
                <span className="text-gray-700 truncate font-medium">
                  {clientName}
                </span>
              </div>
            )}

            {hasLocation && (
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-gray-500 flex-shrink-0 font-medium">
                  Localização:
                </span>
                <span className="text-gray-700 truncate">
                  {project.address_line_1}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2 min-w-0">
                <span className="text-gray-500 flex-shrink-0 font-medium">
                  Responsavel:
                </span>
                <span className="text-gray-700 truncate font-medium">
                  {manager}
                </span>
              </div>
            <div className="flex items-start gap-2 min-w-0">
                <span className="text-gray-500 flex-shrink-0 font-medium">
                  Prazo:
                </span>
                <span className="text-gray-700 truncate font-medium">
                  {project.end_date}
                </span>
              </div>

            {!hasClient && !hasLocation && (
              <p className="text-gray-400 text-xs italic pt-1">
                Sem detalhes adicionais
              </p>
            )}
          </div>
        </div>

        {/* Footer Action Hint - Only on hover */}
        <div className="flex-shrink-0 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
            Clique para ver detalhes →
          </p>
        </div>
      </div>
    </Link>
  );
}