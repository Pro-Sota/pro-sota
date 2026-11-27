
import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

import type { GanttPhase } from "@/app/components/gant_chart/gantt";
import type { Deliverable } from "@/app/management/projects/[projectId]/(details)/phases/types";
import type { DeadlineItem } from "@/app/management/projects/[projectId]/(details)/overview/components/deadlines";

import type {
  ChangeOrder,
  DocumentItem,
  IssueItem,
  ProcurementItem,
  SafetySummary,
  SitePhoto,
  SiteReport,
  TeamMember,
} from "@/app/management/projects/[projectId]/(details)/overview/types";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const ACTIVITY_LIMIT = 50;
const SUBMISSION_LIMIT = 20;

/**
 * Enable temporary query diagnostics in production or development.
 * Set PROJECT_OVERVIEW_DEBUG=true to enable.
 */
const DEBUG = process.env.PROJECT_OVERVIEW_DEBUG === "true";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Row = Record<string, unknown>;

export interface OverviewProject {
  id: string;
  title: string;
  code: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  municipality: string | null;
  country: string | null;
  type: string | null;
}

export interface OverviewActivity {
  activity_id: string;
  project_id: string | null;
  user_id: string | null;
  entity_id: string | null;
  action: string;
  entity_type: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_name: string;
}

export interface OverviewSubmission {
  submission_id: string;
  project_id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  submitted_by: string;
  submitted_at: string;
  due_date: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  revision_number: number;
  created_at: string;
  updated_at: string;
}

export interface OverviewData {
  project: OverviewProject;

  kpis: {
    progress: number;
    remainingDays: number | null;
    openQuestions: number;
    completedTasks: number;
    totalTasks: number;
    pendingApprovals: number;
  };

  phases: GanttPhase[];

  tasks: {
    id: string;
    name: string;
    phaseId: string;
    startDate: string | null;
    endDate: string | null;
    progress: number;
  }[];

  risks: {
    id: string;
    text: string;
    severity: "high" | "medium" | "low";
  }[];

  activities: OverviewActivity[];
  deliverables: Deliverable[];

  rfis: {
    id: string;
    subject: string;
    status: string;
    due: string;
  }[];

  submittals: OverviewSubmission[];
  approvalIds: string[];

  budgetByPhase: {
    phase: string;
    used: number;
    total: number;
  }[];

  upcomingDeadlines: DeadlineItem[];
  overdueDeadlines: DeadlineItem[];

  changeOrders: ChangeOrder[];
  teamMembers: TeamMember[];
  documents: DocumentItem[];
  issues: IssueItem[];
  siteReports: SiteReport[];
  sitePhotos: SitePhoto[];
  safety: SafetySummary;
  procurement: ProcurementItem[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function asRow(value: unknown): Row {
  if (Array.isArray(value)) return asRow(value[0]);

  return value && typeof value === "object"
    ? (value as Row)
    : {};
}

function asRows(value: unknown): Row[] {
  return Array.isArray(value) ? value.map(asRow) : [];
}

function str(value: unknown): string {
  if (typeof value === "string") return value.trim();

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function num(value: unknown): number {
  const n =
    typeof value === "string" && value.trim()
      ? Number(value)
      : value;

  return typeof n === "number" && Number.isFinite(n)
    ? n
    : 0;
}

function pct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Keeps date-only values unchanged to prevent timezone shifts.
 */
function toDate(value: unknown): string | null {
  const s = str(value);

  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  const date = new Date(s);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

function dayDifference(from: Date, to: Date): number {
  const start = Date.UTC(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
  );

  const end = Date.UTC(
    to.getFullYear(),
    to.getMonth(),
    to.getDate(),
  );

  return Math.ceil((end - start) / 86_400_000);
}

export function formatDate(value: string | null): string {
  if (!value) return "Sem prazo";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Luanda",
  }).format(date);
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

const DONE_STATUSES = new Set([
  "completed",
  "complete",
  "done",
  "concluído",
  "concluido",
  "terminado",
]);

/**
 * A task is completed only after approval.
 */
const isApproved = (row: Row): boolean =>
  str(row.review_status).toLowerCase() === "approved";

const taskProgress = (row: Row): number =>
  isApproved(row) ? 100 : 0;

function storedProgress(row: Row): number {
  return pct(
    num(
      row.progress_percentage ??
        row.progress ??
        row.completion_percentage,
    ),
  );
}

function stageProgress(row: Row): number {
  return DONE_STATUSES.has(
    str(row.status).toLowerCase(),
  )
    ? 100
    : storedProgress(row);
}

function averageProgress(
  rows: Row[],
  getProgress: (row: Row) => number,
): number {
  if (rows.length === 0) return 0;

  const total = rows.reduce(
    (sum, row) => sum + getProgress(row),
    0,
  );

  return pct(total / rows.length);
}

/* -------------------------------------------------------------------------- */
/* Diagnostics and errors                                                     */
/* -------------------------------------------------------------------------- */

async function timed<T>(
  name: string,
  operation: PromiseLike<T>,
): Promise<T> {
  if (!DEBUG) return operation;

  const start = performance.now();

  try {
    return await operation;
  } finally {
    console.info("[PROJECT_OVERVIEW]", {
      query: name,
      durationMs: Math.round(performance.now() - start),
    });
  }
}

function fail(
  label: string,
  error: { message: string } | null,
): void {
  if (error) {
    throw new Error(
      `Não foi possível carregar ${label}: ${error.message}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Mappers                                                                    */
/* -------------------------------------------------------------------------- */

function groupTasksByPhase(
  tasks: Row[],
): Map<string, Row[]> {
  const map = new Map<string, Row[]>();

  for (const task of tasks) {
    const phaseId = str(task.phase_id);

    if (!phaseId) continue;

    const existing = map.get(phaseId);

    if (existing) {
      existing.push(task);
    } else {
      map.set(phaseId, [task]);
    }
  }

  return map;
}

/**
 * Task approval progress is authoritative when tasks exist.
 * Otherwise, use the stored phase progress.
 */
function mapPhases(
  rows: Row[],
  tasksByPhase: Map<string, Row[]>,
): GanttPhase[] {
  return rows
    .map((row) => {
      const id = str(row.phase_id);

      const phaseTasks = tasksByPhase.get(id) ?? [];

      return {
        id,
        name: str(row.name) || "Fase sem nome",
        sortOrder: num(row.sort_order),

        progress:
          phaseTasks.length > 0
            ? averageProgress(phaseTasks, taskProgress)
            : storedProgress(row),
      };
    })
    .filter((phase) => phase.id);
}

function mapTasks(rows: Row[]): OverviewData["tasks"] {
  return rows
    .filter(
      (row) =>
        str(row.task_id) &&
        str(row.phase_id),
    )
    .map((row) => ({
      id: `task:${str(row.task_id)}`,
      name: str(row.title) || "Tarefa sem título",
      phaseId: str(row.phase_id),
      startDate: toDate(row.start_date),
      endDate: toDate(row.due_date),
      progress: taskProgress(row),
    }));
}

function mapStages(rows: Row[]): OverviewData["tasks"] {
  return rows
    .filter(
      (row) =>
        str(row.stage_id) &&
        str(row.phase_id),
    )
    .map((row) => ({
      id: `stage:${str(row.stage_id)}`,
      name: str(row.name) || "Etapa sem nome",
      phaseId: str(row.phase_id),
      startDate: toDate(row.planned_start),
      endDate: toDate(row.planned_end),
      progress: stageProgress(row),
    }));
}

function mapDeliverable(row: Row): Deliverable {
  return {
    id: str(row.id),
    phase_id: str(row.phase_id),
    title: str(row.title) || "Entregável sem título",
    description: str(row.description) || null,
    status: (
      str(row.status) || "not_started"
    ) as Deliverable["status"],
    progress: num(row.progress),
    start_date: str(row.start_date) || null,
    due_date: str(row.due_date) || null,
    completed_at: str(row.completed_at) || null,
    sort_order: num(row.sort_order),
  } as Deliverable;
}

function mapActivity(row: Row): OverviewActivity {
  const profile = asRow(row.profiles);

  const fullName = [
    str(profile.first_name),
    str(profile.last_name),
  ]
    .filter(Boolean)
    .join(" ");

  const metadata =
    row.metadata &&
    typeof row.metadata === "object" &&
    !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : null;

  return {
    activity_id: str(row.activity_id),
    project_id: str(row.project_id) || null,
    user_id: str(row.user_id) || null,
    entity_id: str(row.entity_id) || null,
    action: str(row.action) || "unknown",
    entity_type: str(row.entity_type) || "unknown",
    description: str(row.description) || null,
    metadata,
    created_at: str(row.created_at),
    user_name: fullName || "Utilizador desconhecido",
  };
}

function mapSubmission(row: Row): OverviewSubmission {
  return {
    submission_id: str(row.submission_id),
    project_id: str(row.project_id),
    title: str(row.title) || "Submissão sem título",
    description: str(row.description) || null,
    type: str(row.type) || "other",
    status: str(row.status) || "pending",
    submitted_by: str(row.submitted_by),
    submitted_at: str(row.submitted_at),
    due_date: str(row.due_date) || null,
    reviewed_by: str(row.reviewed_by) || null,
    reviewed_at: str(row.reviewed_at) || null,
    notes: str(row.notes) || null,
    revision_number: num(row.revision_number) || 1,
    created_at: str(row.created_at),
    updated_at: str(row.updated_at),
  };
}

/* -------------------------------------------------------------------------- */
/* Query definitions                                                          */
/* -------------------------------------------------------------------------- */

const PROJECT_SELECT = `
  project_id,
  title,
  project_code,
  status,
  start_date,
  end_date,
  municipality,
  country,
  type
`;

const PHASES_SELECT = `
  phase_id,
  name,
  sort_order,
  progress,

  phase_stages (
    stage_id,
    phase_id,
    name,
    status,
    progress,
    planned_start,
    planned_end,
    sort_order
  ),

  deliverables (
    id,
    phase_id,
    title,
    description,
    status,
    progress,
    start_date,
    due_date,
    completed_at,
    sort_order
  )
`;

const TASKS_SELECT = `
  task_id,
  phase_id,
  title,
  start_date,
  due_date,
  review_status
`;

const ACTIVITY_SELECT = `
  activity_id,
  user_id,
  project_id,
  action,
  entity_type,
  entity_id,
  description,
  metadata,
  created_at,

  profiles (
    first_name,
    last_name
  )
`;

const SUBMISSION_SELECT = `
  submission_id,
  project_id,
  title,
  description,
  type,
  status,
  submitted_by,
  submitted_at,
  due_date,
  reviewed_by,
  reviewed_at,
  notes,
  revision_number,
  created_at,
  updated_at
`;

/* -------------------------------------------------------------------------- */
/* Server-side overview data                                                  */
/* -------------------------------------------------------------------------- */

/**
 * React cache deduplicates this function within the same server request.
 *
 * Independent database queries execute concurrently.
 * Nested relationships avoid unnecessary additional requests.
 */
export const getOverviewData = cache(
  async (
    projectId: string,
  ): Promise<OverviewData | null> => {
    if (!projectId?.trim()) {
      return null;
    }

    const supabase = await createClient();

    /* ---------------------------------------------------------------------- */
    /* Parallel database queries                                              */
    /* ---------------------------------------------------------------------- */

    const [
      project_,
      phases_,
      tasks_,
      activities_,
      submissions_,
    ] = await Promise.all([
      timed(
        "project",
        supabase
          .from("projects")
          .select(PROJECT_SELECT)
          .eq("project_id", projectId)
          .maybeSingle(),
      ),

      timed(
        "phases",
        supabase
          .from("project_phases")
          .select(PHASES_SELECT)
          .eq("project_id", projectId)
          .order("sort_order", {
            ascending: true,
          })
          .order("sort_order", {
            ascending: true,
            referencedTable: "phase_stages",
          })
          .order("sort_order", {
            ascending: true,
            referencedTable: "deliverables",
          }),
      ),

      timed(
        "tasks",
        supabase
          .from("tasks")
          .select(TASKS_SELECT)
          .eq("project_id", projectId),
      ),

      timed(
        "activities",
        supabase
          .from("activity_logs")
          .select(ACTIVITY_SELECT)
          .eq("project_id", projectId)
          .order("created_at", {
            ascending: false,
          })
          .limit(ACTIVITY_LIMIT),
      ),

      timed(
        "submissions",
        supabase
          .from("submissions")
          .select(SUBMISSION_SELECT)
          .eq("project_id", projectId)
          .order("created_at", {
            ascending: false,
          })
          .limit(SUBMISSION_LIMIT),
      ),
    ]);

    /* ---------------------------------------------------------------------- */
    /* Error handling                                                         */
    /* ---------------------------------------------------------------------- */

    fail("o projecto", project_.error);
    fail("as fases do projecto", phases_.error);
    fail("as tarefas", tasks_.error);
    fail("as actividades", activities_.error);
    fail("as submissões", submissions_.error);

    if (!project_.data) {
      return null;
    }

    /* ---------------------------------------------------------------------- */
    /* Normalize database results                                             */
    /* ---------------------------------------------------------------------- */

    const projectRow = asRow(project_.data);
    const phaseRows = asRows(phases_.data);
    const taskRows = asRows(tasks_.data);
    const activityRows = asRows(activities_.data);
    const submissionRows = asRows(submissions_.data);

    /* ---------------------------------------------------------------------- */
    /* Project                                                                */
    /* ---------------------------------------------------------------------- */

    const project: OverviewProject = {
      id: str(projectRow.project_id) || projectId,
      title: str(projectRow.title) || "Projecto sem nome",
      code: str(projectRow.project_code) || null,
      status: str(projectRow.status) || "Sem estado",
      startDate: toDate(projectRow.start_date),
      endDate: toDate(projectRow.end_date),
      municipality: str(projectRow.municipality) || null,
      country: str(projectRow.country) || null,
      type: str(projectRow.type) || null,
    };

    /* ---------------------------------------------------------------------- */
    /* Phases, stages and deliverables                                        */
    /* ---------------------------------------------------------------------- */

    const tasksByPhase = groupTasksByPhase(taskRows);

    const phases = mapPhases(
      phaseRows,
      tasksByPhase,
    );

    const stageRows = phaseRows.flatMap(
      (phase) => asRows(phase.phase_stages),
    );

    const deliverables = phaseRows
      .flatMap(
        (phase) => asRows(phase.deliverables),
      )
      .map(mapDeliverable);

    /* ---------------------------------------------------------------------- */
    /* Gantt tasks                                                             */
    /* ---------------------------------------------------------------------- */

    const tasks = [
      ...mapTasks(taskRows),
      ...mapStages(stageRows),
    ];

    /* ---------------------------------------------------------------------- */
    /* Activities and submissions                                             */
    /* ---------------------------------------------------------------------- */

    const activities = activityRows.map(mapActivity);

    const submittals = submissionRows.map(mapSubmission);

    const approvalIds = submittals
      .filter(
        (submission) =>
          submission.status.toLowerCase() !== "draft" &&
          submission.reviewed_at === null,
      )
      .map(
        (submission) => submission.submission_id,
      );

    /* ---------------------------------------------------------------------- */
    /* KPIs                                                                    */
    /* ---------------------------------------------------------------------- */

    const completedTasks = taskRows.filter(isApproved).length;

    const remainingDays = project.endDate
      ? dayDifference(
          new Date(),
          new Date(`${project.endDate}T00:00:00`),
        )
      : null;

    /* ---------------------------------------------------------------------- */
    /* Final response                                                         */
    /* ---------------------------------------------------------------------- */

    const result: OverviewData = {
      project,

      kpis: {
        progress: averageProgress(
          taskRows,
          taskProgress,
        ),

        remainingDays,

        openQuestions: 0,

        completedTasks,

        totalTasks: taskRows.length,

        pendingApprovals: approvalIds.length,
      },

      phases,
      tasks,
      deliverables,
      activities,
      submittals,
      approvalIds,

      risks: [],
      rfis: [],
      budgetByPhase: [],
      upcomingDeadlines: [],
      overdueDeadlines: [],
      teamMembers: [],
      changeOrders: [],
      documents: [],
      issues: [],
      siteReports: [],
      sitePhotos: [],
      procurement: [],

      safety: {
        daysSinceIncident: 0,
        openActions: 0,
        incidents: [],
      },
    };

    if (DEBUG) {
      console.info("[PROJECT_OVERVIEW] completed", {
        projectId,
        phases: phases.length,
        tasks: taskRows.length,
        stages: stageRows.length,
        deliverables: deliverables.length,
        activities: activities.length,
        submissions: submittals.length,
      });
    }

    return result;
  },
);
