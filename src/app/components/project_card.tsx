"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  MapPin,
  Users,
  Building2,
} from "lucide-react";

import { ProjectListItem } from "../management/projects/types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_LABELS: Record<string, string> = {
  "Em curso": "Em curso",
  "Em observação": "Em observação",
  Concluído: "Concluído",
  "Em pausa": "Em pausa",
};

const STATUS_COLORS: Record<string, string> = {
  "Em curso": "border-blue-200/80 bg-blue-50/95 text-blue-700",
  "Em observação": "border-amber-200/80 bg-amber-50/95 text-amber-700",
  Concluído: "border-emerald-200/80 bg-emerald-50/95 text-emerald-700",
  "Em pausa": "border-gray-200/80 bg-gray-50/95 text-gray-700",
};

const PRIORITY_LABELS: Record<string, string> = {
  Low: "Baixa",
  Medium: "Média",
  High: "Alta",
  Critical: "Crítico",
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Medium: "bg-amber-50 text-amber-700 ring-amber-600/10",
  High: "bg-rose-50 text-rose-700 ring-rose-600/10",
  Critical: "bg-red-50 text-red-700 ring-red-600/10",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
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

const DEFAULT_PROJECT_IMAGE = "/images/arch.jpg";

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 300;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getStatusColor(status: string | null) {
  return (
    STATUS_COLORS[status ?? ""] ??
    "border-gray-200/80 bg-gray-50/95 text-gray-600"
  );
}

function getPriorityColor(priority: string | null) {
  return (
    PRIORITY_COLORS[priority ?? ""] ??
    "bg-gray-50 text-gray-600 ring-gray-600/10"
  );
}

function getPriorityLabel(priority: string | null) {
  if (!priority) return "Sem prioridade";

  return PRIORITY_LABELS[priority] ?? priority;
}

function getProjectTypeLabel(type: string | null) {
  if (!type) return null;

  return PROJECT_TYPE_LABELS[type] ?? type;
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

function getProgressColor() {
  return "bg-[#002950]";
}

/* -------------------------------------------------------------------------- */
/* Member Stack                                                               */
/* -------------------------------------------------------------------------- */

function MemberStack({ avatars, count }: { avatars: string[]; count: number }) {
  if (count <= 0) return null;

  const visibleAvatars = avatars.slice(0, 3);
  const remaining = Math.max(count - visibleAvatars.length, 0);

  return (
    <div className="flex items-center">
      {visibleAvatars.map((avatar, index) => (
        <div
          key={`${avatar}-${index}`}
          className="
            -ml-2 first:ml-0
            h-6 w-6 overflow-hidden
            rounded-full border-2 border-white
            bg-gray-100
          "
        >
          <Image
            src={avatar}
            alt=""
            width={24}
            height={24}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className="
            -ml-2 flex h-6 w-6
            items-center justify-center
            rounded-full border-2 border-white
            bg-gray-100
            text-[9px] font-semibold text-gray-500
          "
        >
          +{remaining}
        </div>
      )}

      {visibleAvatars.length === 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
          <Users className="h-3 w-3 text-gray-400" />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProjectCard({ project }: { project: ProjectListItem }) {
  const projectImage = project.image || DEFAULT_PROJECT_IMAGE;

  const progress = Math.min(Math.max(project.progress ?? 0, 0), 100);

  const taskCount = Math.max(project.task_count ?? 0, 0);

  const completedTaskCount = Math.min(
    Math.max(project.completed_task_count ?? 0, 0),
    taskCount,
  );

  const memberCount = Math.max(project.member_count ?? 0, 0);

  const deadline = project.next_deadline ?? project.end_date;

  const formattedDeadline = formatDate(deadline);

  const overdue = isOverdue(deadline);

  const projectType = getProjectTypeLabel(project.type);

  const clientName = project.client_name?.trim() || null;

  const location =
    project.location?.trim() ||
    project.municipality?.trim() ||
    project.province?.trim() ||
    null;

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
      {/* Image — same dimensions */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {projectImage ? (
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
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-6 w-6 text-gray-300" />
          </div>
        )}

        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-t
            from-black/10 via-transparent to-black/5
            opacity-60
          "
        />

        {/* Status */}
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <span
            className={`
              inline-flex items-center
              rounded-full border
              px-2.5 py-1
              text-[11px] font-semibold
              tracking-tight
              shadow-sm
              backdrop-blur-md
              ${getStatusColor(project.status)}
            `}
          >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {STATUS_LABELS[project.status ?? ""] ??
              project.status ??
              "Sem estado"}
          </span>
        </div>

        {/* Priority */}
        <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
          <span
            className={`
              inline-flex items-center
              rounded-full
              px-2.5 py-1
              text-[10px] font-semibold
              ring-1 ring-inset
              shadow-sm
              backdrop-blur-md
              ${getPriorityColor(project.urgency)}
            `}
          >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {getPriorityLabel(project.urgency)}
          </span>
        </div>
      </div>

      {/* Content — same overall sizing */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        {/* Project identity */}
        <div className="flex min-w-0 items-center gap-2">
          {project.project_code && (
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
              {project.project_code}
            </span>
          )}

          {project.project_code && projectType && (
            <span className="h-1 w-1 shrink-0 rounded-full bg-gray-300" />
          )}

          {projectType && (
            <span className="truncate text-[10px] font-medium uppercase tracking-wide text-gray-400">
              {projectType}
            </span>
          )}
        </div>

        {/* Title — same sizing */}
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

        {/* Client + location */}
        <div className="flex min-w-0 flex-col gap-1">
          {clientName && (
            <span className="truncate text-xs font-medium text-gray-600 sm:text-sm">
              {clientName}
            </span>
          )}

          {location && (
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
              <MapPin className="h-3 w-3 shrink-0 text-gray-400" />
              <span className="truncate">{location}</span>
            </span>
          )}
        </div>

        {/* Progress — same size */}
        <div className="mt-0.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-500 sm:text-sm">
              Progresso
            </span>

            <span className="text-sm font-semibold tabular-nums text-gray-900 sm:text-base">
              {progress}
              <span className="ml-0.5 font-normal text-gray-400">%</span>
            </span>
          </div>

          <div
            className="
              h-1.5 w-full overflow-hidden
              rounded-full bg-gray-100
              ring-1 ring-gray-200/70
            "
          >
            <div
              className={`
                h-full rounded-full
                transition-[width] duration-700 ease-out
                ${getProgressColor()}
              `}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-1 flex items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm">
          {/* Tasks */}
          <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />

            <span>
              {completedTaskCount}/{taskCount} tarefas
            </span>
          </div>

          {/* Members */}
          {memberCount > 0 && (
            <div className="shrink-0">
              <MemberStack
                avatars={project.member_avatars ?? []}
                count={memberCount}
              />
            </div>
          )}

          {/* Deadline */}
          {formattedDeadline && (
            <div
              className={`
        ml-auto flex shrink-0 items-center gap-1.5
        text-[11px] font-medium
        ${overdue ? "text-rose-600" : "text-gray-500"}
      `}
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
    </Link>
  );
}
