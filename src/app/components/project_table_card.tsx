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
  Flag,
  MapPin,
  MoreHorizontal,
  Users,
  Building2,
} from "lucide-react";

import { ProjectListItem } from "../management/projects/types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

/*
 * Palette: brand navy (#002950) + slate grays. Status and priority are told
 * apart by shape and weight (filled dot, hollow dot, check, outline, solid)
 * instead of hue. Rose is kept only for overdue deadlines.
 */

const DEFAULT_PROJECT_IMAGE = "/images/project_default.png";

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
  Critical: "Crítica",
};

/* Only High and Critical get a visible chip; Low/Medium stay quiet. */
const priorityChips: Record<string, string> = {
  High: "border border-[#002950]/30 bg-white text-[#002950]",
  Critical: "border border-[#002950] bg-[#002950] text-white",
};

const statusLabels: Record<string, string> = {
  "Em curso": "Em curso",
  "Em observação": "Em observação",
  Concluído: "Concluído",
  "Em pausa": "Em pausa",
};

type StatusIndicator = "filled" | "hollow" | "check" | "muted";

const statusIndicators: Record<string, StatusIndicator> = {
  "Em curso": "filled",
  "Em observação": "hollow",
  Concluído: "check",
  "Em pausa": "muted",
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
  const [useDefault, setUseDefault] = useState(false);
  const [defaultFailed, setDefaultFailed] = useState(false);

  const hasCustomImage = Boolean(src) && !useDefault;
  const imageSrc = hasCustomImage ? (src as string) : DEFAULT_PROJECT_IMAGE;

  if (defaultFailed) {
    return (
      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <Building2 className="h-6 w-6 text-slate-300" />
      </div>
    );
  }

  return (
    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="96px"
        onError={() => {
          if (hasCustomImage) {
            setUseDefault(true);
          } else {
            setDefaultFailed(true);
          }
        }}
        className="object-cover"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status indicator                                                           */
/* -------------------------------------------------------------------------- */

function StatusMark({ status }: { status: string | null }) {
  const label = statusLabels[status ?? ""] ?? status ?? "Sem estado";
  const indicator = statusIndicators[status ?? ""] ?? "muted";

  const textColor =
    indicator === "muted" ? "text-slate-500" : "text-[#002950]";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium ${textColor}`}
    >
      {indicator === "check" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <span
          className={`h-2 w-2 rounded-full ${
            indicator === "filled"
              ? "bg-[#002950]"
              : indicator === "hollow"
                ? "border-[1.5px] border-[#002950]"
                : "bg-slate-300"
          }`}
        />
      )}
      {label}
    </span>
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
/* Project Table Card                                                         */
/* -------------------------------------------------------------------------- */

interface ProjectTableCardProps {
  project: ProjectListItem;
}

export default function ProjectTableCard({ project }: ProjectTableCardProps) {
  const router = useRouter();

  const href = `/management/projects/${project.project_id}`;

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

  const priorityChip = priorityChips[project.urgency ?? ""];

  const location =
    project.location ?? project.municipality ?? project.province ?? null;

  return (
    <article
      onClick={() => router.push(href)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
    >
      {/* Completed accent */}
      {progress >= 100 && (
        <div className="absolute inset-y-0 left-0 w-0.5 bg-[#002950]" />
      )}

      <div className="flex items-center gap-4 px-4 py-4 sm:px-5">
        {/* Image */}
        <ProjectThumbnail src={project.image} alt={project.title} />

        {/* Main */}
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
              <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-slate-900 transition-colors duration-200 group-hover:text-[#002950]">
                {project.title}
              </h3>

              {/* Client + Location */}
              <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                {project.client_name && (
                  <span className="truncate font-medium text-slate-600">
                    {project.client_name}
                  </span>
                )}

                {location && (
                  <span className="flex min-w-0 items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />

                    <span className="truncate">{location}</span>
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
                onClick={() => router.push(href)}
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

          {/* Progress */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#002950] transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-slate-500">
              {progress}%
            </span>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Status */}
            <StatusMark status={project.status} />

            {/* Priority (High and Critical only) */}
            {priorityChip && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityChip}`}
              >
                <Flag className="h-2.5 w-2.5" />

                {getPriorityLabel(project.urgency)}
              </span>
            )}

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
}