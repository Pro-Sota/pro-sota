"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarDays, FolderKanban, Building2 } from "lucide-react";
import { Database } from "../lib/supabase/models";

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
  Low: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  High: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  Critical: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
} as const;

const statusStyles = {
  "em-curso": "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  concluido:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  "em-observacao":
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
} as const;

function getPriorityLabel(priority: string | null) {
  return priority &&
    priority in priorityLabels
    ? priorityLabels[priority as keyof typeof priorityLabels]
    : "Sem prioridade";
}

function getPriorityStyle(priority: string | null) {
  return priority &&
    priority in priorityStyles
    ? priorityStyles[priority as keyof typeof priorityStyles]
    : "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
}

function getStatusLabel(status: string | null) {
  return status &&
    status in statusLabels
    ? statusLabels[status as keyof typeof statusLabels]
    : "Sem estado";
}

function getStatusStyle(status: string | null) {
  return status &&
    status in statusStyles
    ? statusStyles[status as keyof typeof statusStyles]
    : "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200";
}

function progressBarColor(progress: number) {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 50) return "bg-[#1B3A5C]";
  return "bg-slate-400";
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200">
        <Building2 className="h-4 w-4" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-inset ring-slate-200"
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
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
        <FolderKanban className="h-6 w-6 text-slate-400" />
        <p className="text-sm text-slate-400">
          Nenhum projecto encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase text-slate-500">
                Nome
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">
                Progresso
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">
                Prioridade
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">
                Estado
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">
                Entrega
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase text-slate-500">
                Localização
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => {
              const progress = Math.min(
                Math.max(project.progress ?? 0, 0),
                100
              );

              return (
                <tr
                  key={project.project_id}
                  onClick={() =>
                    router.push(
                      `/management/projects/${project.project_id}`
                    )
                  }
                  className="group cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <ProjectThumbnail
                        src={project.image}
                        alt={project.title}
                      />

                      <span className="truncate text-sm font-semibold text-slate-800">
                        {project.title}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full max-w-[110px] rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${progressBarColor(
                            progress
                          )}`}
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <span className="font-mono text-xs text-slate-400">
                        {progress}%
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityStyle(
                        project.urgency
                      )}`}
                    >
                      {getPriorityLabel(project.urgency)}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                        project.status
                      )}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {project.end_date ?? "—"}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {project.location ?? "—"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}