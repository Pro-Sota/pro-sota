import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarDays, FolderKanban, Building2 } from "lucide-react";
import type { Project, Status } from "../management/projects/types";

const priorityLabels: Record<Project["priority"], string> = {
  Low: "Baixa",
  Medium: "Média",
  High: "Alta",
};

const statusLabels: Record<Status, string> = {
  "em-curso": "Em curso",
  concluido: "Concluído",
  "em-observacao": "Em observação",
};

const priorityStyles: Record<Project["priority"], string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  High: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
};

const statusStyles: Record<Status, string> = {
  "em-curso": "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  concluido: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  "em-observacao": "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
};

const progressBarColor = (progress: number) => {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 50) return "bg-[#1B3A5C]";
  return "bg-slate-400";
};

// NOTE: assumes `Project` has an `imageUrl?: string | null` field — rename
// below if your type uses a different key (e.g. `thumbnailUrl`).
function ProjectThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200">
        <Building2 className="h-4 w-4" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- plain img avoids
    // needing next.config remotePatterns for arbitrary project image hosts
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-inset ring-slate-200"
    />
  );
}

export default function ProjectTableView({ projects }: { projects: Project[] }) {
  const router = useRouter();

  const goToProject = (id: number) => {
    router.push(`/management/projects/${id}`);
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FolderKanban className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-400">Nenhum projecto encontrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[760px] table-fixed border-collapse"
          aria-label="Tabela de projectos"
        >
          <caption className="sr-only">
            Lista de projectos com progresso, prioridade, estado, data de entrega e localização
          </caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
              <th className="w-1/4 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nome do Projecto
              </th>
              <th className="w-1/6 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Progresso
              </th>
              <th className="w-[13%] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Prioridade
              </th>
              <th className="w-[15%] px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
              </th>
              <th className="w-1/6 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Data de Entrega
              </th>
              <th className="w-1/6 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Localização
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => {
              const progress = Math.min(100, Math.max(0, project.progress));

              return (
                <tr
                  key={project.id}
                  tabIndex={0}
                  role="link"
                  aria-label={`Ver detalhes do projecto ${project.name}`}
                  onClick={() => goToProject(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToProject(project.id);
                    }
                  }}
                  className="group cursor-pointer transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3A5C]/20 focus-visible:ring-inset"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <ProjectThumbnail src={""} alt="" />
                      <div className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#1B3A5C]">
                        {project.name}
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-full max-w-[110px] overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${progressBarColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="shrink-0 font-mono text-xs text-slate-400">
                        {progress}%
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[project.priority]}`}
                    >
                      {priorityLabels[project.priority]}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
                    >
                      {statusLabels[project.status]}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{project.dueDate}</span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{project.location}</span>
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