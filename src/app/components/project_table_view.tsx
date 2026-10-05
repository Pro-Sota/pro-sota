"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FolderKanban,
  MapPin,
  MoreHorizontal,
  Users,
  Building2,
} from "lucide-react";

import { Database } from "../lib/supabase/models";
import { ProjectListItem } from "../management/projects/types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const projectTypeLabels: Record<string, string> = {
  Residential: "Residencial",
  Commercial: "Comercial",
  Industrial: "Industrial",
  Institutional: "Institucional",
  "Mixed Use": "Uso misto",
  Renovation: "Reabilitação",
  "Interior Design": "Design de interiores",
  Landscape: "Paisagismo",
  Other: "Outro",
};

const priorityLabels: Record<string, string> = {
  Low: "Baixa",
  Medium: "Média",
  High: "Alta",
  Critical: "Crítico",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/10",
  High: "bg-rose-50 text-rose-700 ring-rose-600/10",
  Critical: "bg-red-50 text-red-700 ring-red-600/10",
};

const statusStyles: Record<string, string> = {
  "Em curso": "bg-blue-50 text-blue-700 ring-blue-600/10",
  "Em observação": "bg-amber-50 text-amber-700 ring-amber-600/10",
  Concluído: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  "Em pausa": "bg-slate-100 text-slate-600 ring-slate-500/10",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getProjectTypeLabel(type: string | null) {
  if (!type) return null;

  return projectTypeLabels[type] ?? type;
}

function getPriorityLabel(priority: string | null) {
  if (!priority) return "Sem prioridade";

  return priorityLabels[priority] ?? priority;
}

function getPriorityStyle(priority: string | null) {
  if (!priority) {
    return "bg-slate-50 text-slate-600 ring-slate-600/10";
  }

  return (
    priorityStyles[priority] ?? "bg-slate-50 text-slate-600 ring-slate-600/10"
  );
}

function getStatusStyle(status: string | null) {
  if (!status) {
    return "bg-slate-50 text-slate-600 ring-slate-600/10";
  }

  return statusStyles[status] ?? "bg-slate-50 text-slate-600 ring-slate-600/10";
}

function getProgressColor(progress: number) {
  if (progress >= 100) return "bg-emerald-500";
  if (progress >= 60) return "bg-[#BD9655]";

  return "bg-amber-500";
}

function formatDate(date: string | null) {
  if (!date) return null;

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(parsedDate);
}

function isOverdue(date: string | null) {
  if (!date) return false;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const deadline = new Date(`${date}T00:00:00`);

  return deadline < today;
}

/* -------------------------------------------------------------------------- */
/* Project Thumbnail                                                          */
/* -------------------------------------------------------------------------- */

function ProjectThumbnail({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <Building2 className="h-6 w-6 text-slate-300" />
      </div>
    );
  }

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="64px"
        onError={() => setFailed(true)}
        className="object-cover"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Member Stack                                                               */
/* -------------------------------------------------------------------------- */

function MemberStack({ avatars, count }: { avatars: string[]; count: number }) {
  if (count <= 0) {
    return null;
  }

  const visibleAvatars = avatars.slice(0, 3);
  const remaining = Math.max(count - visibleAvatars.length, 0);

  return (
    <div className="flex items-center">
      {visibleAvatars.map((avatar, index) => (
        <div
          key={`${avatar}-${index}`}
          className="-ml-2 first:ml-0 h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-slate-100"
        >
          <Image
            src={avatar}
            alt=""
            width={28}
            height={28}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {remaining > 0 && (
        <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-500">
          +{remaining}
        </div>
      )}

      {visibleAvatars.length === 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <Users className="h-3.5 w-3.5 text-slate-400" />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyProjects() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
        <FolderKanban className="h-6 w-6 text-slate-400" />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        Nenhum projecto encontrado
      </p>

      <p className="mt-1 text-center text-xs text-slate-400">
        Crie um projecto para começar a acompanhar o trabalho.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Project Table View                                                         */
/* -------------------------------------------------------------------------- */

interface ProjectTableViewProps {
  projects: ProjectListItem[];
}

export default function ProjectTableView({ projects }: ProjectTableViewProps) {
  const router = useRouter();

  if (projects.length === 0) {
    return <EmptyProjects />;
  }

  return (
    <div className="space-y-2.5">
      {projects.map((project) => {
        const progress = Math.min(Math.max(project.progress ?? 0, 0), 100);

        const taskCount = Math.max(project.task_count ?? 0, 0);
        const completedTaskCount = Math.min(
          Math.max(project.completed_task_count ?? 0, 0),
          taskCount,
        );

        const memberCount = Math.max(project.member_count ?? 0, 0);

        const deadline = project.next_deadline ?? project.end_date;

        const overdue = isOverdue(deadline);

        const formattedDeadline = formatDate(deadline);

        const typeLabel = getProjectTypeLabel(project.type);

        return (
          <article
            key={project.project_id}
            onClick={() =>
              router.push(`/management/projects/${project.project_id}`)
            }
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
          >
            {/* Completed accent */}
            {progress >= 100 && (
              <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-500" />
            )}

            <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
              {/* ---------------------------------------------------------------- */}
              {/* Image                                                             */}
              {/* ---------------------------------------------------------------- */}

              <ProjectThumbnail src={project.image} alt={project.title} />

              {/* ---------------------------------------------------------------- */}
              {/* Main                                                              */}
              {/* ---------------------------------------------------------------- */}

              <div className="min-w-0 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Project metadata */}
                    <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
                      {project.project_code && (
                        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                          {project.project_code}
                        </span>
                      )}

                      {typeLabel && (
                        <>
                          <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

                          <span className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            {typeLabel}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                      {project.title}
                    </h3>

                    {/* Client + Location */}
                    <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {project.client_name && (
                        <span className="truncate font-medium text-slate-600">
                          {project.client_name}
                        </span>
                      )}

                      {(project.location ||
                        project.municipality ||
                        project.province) && (
                        <span className="flex min-w-0 items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />

                          <span className="truncate">
                            {project.location ??
                              project.municipality ??
                              project.province}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex shrink-0 items-center gap-1"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      aria-label={`Abrir ${project.title}`}
                      onClick={() =>
                        router.push(
                          `/management/projects/${project.project_id}`,
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-all hover:bg-slate-50 hover:text-slate-700 group-hover:opacity-100"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      aria-label="Mais opções"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-all hover:bg-slate-50 hover:text-slate-700 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Progress                                                          */}
                {/* ---------------------------------------------------------------- */}

                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                        progress,
                      )}`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-slate-500">
                    {progress}%
                  </span>
                </div>

                {/* ---------------------------------------------------------------- */}
                {/* Metadata                                                          */}
                {/* ---------------------------------------------------------------- */}

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Status */}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${getStatusStyle(
                      project.status,
                    )}`}
                  >
                    {project.status ?? "Sem estado"}
                  </span>

                  {/* Priority */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${getPriorityStyle(
                      project.urgency,
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />

                    {getPriorityLabel(project.urgency)}
                  </span>

                  {/* Phase */}
                  {project.phase_name && (
                    <div className="hidden items-center gap-1.5 text-[11px] text-slate-500 sm:flex">
                      <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                      <span className="max-w-[180px] truncate">
                        {project.phase_name}
                      </span>
                    </div>
                  )}

                  {/* Tasks */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />

                    <span>
                      {completedTaskCount}/{taskCount} tarefas
                    </span>
                  </div>

                  {/* Team */}
                  {memberCount > 0 && (
                    <div className="ml-2 flex items-center gap-2">
                      <MemberStack
                        avatars={project.member_avatars ?? []}
                        count={memberCount}
                      />
                    </div>
                  )}

                  {/* Deadline */}
                  {formattedDeadline && (
                    <div
                      className={`ml-2 flex items-center gap-1.5 text-[11px] font-medium ${
                        overdue ? "text-rose-600" : "text-slate-500"
                      }`}
                    >
                      {overdue ? (
                        <CircleAlert className="h-3.5 w-3.5" />
                      ) : (
                        <CalendarDays className="h-3.5 w-3.5" />
                      )}

                      <span>
                        {overdue
                          ? `Atrasado · ${formattedDeadline}`
                          : formattedDeadline}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
