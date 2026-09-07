"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CalendarDays,
  FolderKanban,
  Building2,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Database } from "../lib/supabase/models";
import Image from "next/image";

type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  progress?: number | null;
  image?: string | null;
};

const priorityLabels = {
  Low: "Baixa",
  Medium: "Média",
  High: "Alta",
  Critical: "Crítico",
} as const;

const statusLabels = {
  "em-curso": "Em curso",
  concluido: "Concluído",
  "em-observacao": "Em observação",
} as const;

const priorityStyles = {
  Low: "bg-emerald-100/50 text-emerald-700 border border-emerald-200",
  Medium: "bg-amber-100/50 text-amber-700 border border-amber-200",
  High: "bg-rose-100/50 text-rose-700 border border-rose-200",
  Critical: "bg-red-100/50 text-red-700 border border-red-200",
} as const;

const priorityDotStyles = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-rose-500",
  Critical: "bg-red-500",
} as const;

const statusStyles = {
  "em-curso": "bg-blue-100/50 text-blue-700 border border-blue-200",
  concluido: "bg-emerald-100/50 text-emerald-700 border border-emerald-200",
  "em-observacao": "bg-amber-100/50 text-amber-700 border border-amber-200",
} as const;

function getPriorityLabel(priority: string | null) {
  return priority && priority in priorityLabels
    ? priorityLabels[priority as keyof typeof priorityLabels]
    : "Sem prioridade";
}

function getPriorityStyle(priority: string | null) {
  return priority && priority in priorityStyles
    ? priorityStyles[priority as keyof typeof priorityStyles]
    : "bg-slate-100/50 text-slate-700 border border-slate-200";
}

function getPriorityDot(priority: string | null) {
  return priority && priority in priorityDotStyles
    ? priorityDotStyles[priority as keyof typeof priorityDotStyles]
    : "bg-slate-300";
}

function getStatusLabel(status: string | null) {
  return status && status in statusLabels
    ? statusLabels[status as keyof typeof statusLabels]
    : "Sem estado";
}

function getStatusStyle(status: string | null) {
  return status && status in statusStyles
    ? statusStyles[status as keyof typeof statusStyles]
    : "bg-slate-100/50 text-slate-700 border border-slate-200";
}

function progressBarColor(progress: number) {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 50) return "bg-[#BD9655]";
  return "bg-amber-500";
}

function ProjectThumbnail({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-slate-400">
        <Building2 className="h-6 w-6" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-lg object-cover"
    />
  );
}

export default function ProjectTableView({
  projects,
}: {
  projects: Project[];
}) {
  const router = useRouter();

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/50 to-slate-50 py-20 px-6">
        <div className="rounded-full bg-slate-100 p-3">
          <FolderKanban className="h-6 w-6 text-slate-400" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">
            Nenhum projecto encontrado.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Comece criando seu primeiro projecto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const progress = Math.min(
          Math.max(project.progress ?? 0, 0),
          100
        );

        return (
          <div
            key={project.project_id}
            onClick={() =>
              router.push(
                `/management/projects/${project.project_id}`
              )
            }
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:border-[#BD9655]/50 hover:shadow-md"
          >
            {/* Hover background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent transition-all duration-300 group-hover:from-[#BD9655]/5 group-hover:via-transparent group-hover:to-transparent" />

            <div className="relative flex items-center gap-4 px-6 py-4 sm:px-8">
              {/* Image */}
              <div className="shrink-0">
                <ProjectThumbnail
                  src={project.image}
                  alt={project.title}
                />
              </div>

              {/* Main content */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Title — no hover color */}
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {project.title}
                    </h3>

                    {project.location && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {project.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 text-slate-300 transition-colors group-hover:text-[#BD9655]">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-slate-400" />

                      <span className="text-xs font-medium text-slate-600">
                        Progresso
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-slate-700">
                      {progress}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressBarColor(
                        progress
                      )}`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                      project.urgency
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${getPriorityDot(
                        project.urgency
                      )}`}
                    />

                    {getPriorityLabel(project.urgency)}
                  </div>

                  {/* Status */}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      project.status
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>

                  {/* End date */}
                  {project.end_date && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />

                      <span>{project.end_date}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}