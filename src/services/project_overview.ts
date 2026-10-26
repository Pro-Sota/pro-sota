
import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import type { GanttPhase } from "@/app/components/gant_chart/gantt";
import type { Deliverable } from "@/app/management/projects/[projectId]/(details)/phases/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Row = Record<string, unknown>;

export interface OverviewProject {
  id: string;
  name: string;
  code: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  municipality:string | null;
  country:string| null;
  type:string | null;
}

export interface OverviewActivity {
  activity_id: string;
  project_id: string | null;
  user_id: string | null;
  task_id: string | null;
  activity_type: string;
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

  /** All project submissions, including drafts and reviewed submissions. */
  submittals: OverviewSubmission[];

  /** Submissions awaiting review, excluding drafts. */
  approvals: OverviewSubmission[];

  budgetByPhase: {
    phase: string;
    used: number;
    total: number;
  }[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function asRow(value: unknown): Row {
  if (Array.isArray(value)) {
    return value.length > 0 ? asRow(value[0]) : {};
  }

  return value && typeof value === "object" ? (value as Row) : {};
}

function stringValue(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function nullableDate(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) {
      continue;
    }

    const normalized = value.trim();

    // Preserve date-only values to avoid timezone shifts.
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return normalized;
    }

    const date = new Date(normalized);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

function numericValue(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
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

function formatDate(value: string | null): string {
  if (!value) return "Sem prazo";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Sem prazo";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Luanda",
  }).format(date);
}

function normalizedStatus(value: unknown): string {
  return stringValue(value).toLowerCase();
}

function isCompleted(status: string): boolean {
  return [
    "completed",
    "complete",
    "done",
    "concluído",
    "concluido",
    "terminado",
  ].includes(status.trim().toLowerCase());
}

function taskProgress(row: Row): number {
  const status = stringValue(row.status, row.state);

  if (isCompleted(status)) return 100;

  return clampPercent(
    numericValue(
      row.progress_percentage ??
        row.progress ??
        row.completion_percentage,
    ),
  );
}

function stageProgress(row: Row): number {
  const status = normalizedStatus(row.status);

  if (isCompleted(status)) return 100;

  return clampPercent(numericValue(row.progress));
}

/* -------------------------------------------------------------------------- */
/* Map database rows to Gantt data                                            */
/* -------------------------------------------------------------------------- */

function mapPhases(rows: Row[]): GanttPhase[] {
  return rows
    .map((row, index) => ({
      id: stringValue(row.phase_id, row.id),
      name:
        stringValue(
          row.name,
          row.phase_name,
          row.title,
          row.label,
        ) || "Fase sem nome",
      sortOrder: numericValue(
        row.sort_order ?? row.position ?? row.order_index,
      ),
      originalIndex: index,
    }))
    .filter((phase) => phase.id.length > 0)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.originalIndex - b.originalIndex,
    )
    .map(({ originalIndex: _originalIndex, ...phase }) => phase);
}

/**
 * Project tasks remain separate from phase_stages.
 * A task is associated with a phase only when its row contains a valid
 * phase_id or a related phase object.
 */
function mapProjectTasks(
  rows: Row[],
): OverviewData["tasks"] {
  return rows
    .map((row) => {
      const phase = asRow(row.phase);
      const projectPhase = asRow(row.project_phase);

      return {
        id: stringValue(row.task_id, row.id),
        name:
          stringValue(row.title, row.name, row.task_name) ||
          "Tarefa sem título",
        phaseId: stringValue(
          row.phase_id,
          phase.phase_id,
          phase.id,
          projectPhase.phase_id,
          projectPhase.id,
        ),
        startDate: nullableDate(
          row.start_date,
          row.starts_at,
          row.start_at,
          row.scheduled_start,
        ),
        endDate: nullableDate(
          row.end_date,
          row.due_date,
          row.ends_at,
          row.end_at,
          row.deadline,
        ),
        progress: taskProgress(row),
      };
    })
    .filter((task) => task.id.length > 0 && task.phaseId.length > 0);
}

/**
 * phase_stages uses stage_id, phase_id, planned_start and planned_end.
 */
function mapPhaseStages(
  rows: Row[],
): OverviewData["tasks"] {
  return rows
    .map((row) => {
      const status = normalizedStatus(row.status);

      return {
        id: stringValue(row.stage_id),
        name: stringValue(row.name) || "Etapa sem nome",
        phaseId: stringValue(row.phase_id),
        startDate: nullableDate(row.planned_start),
        endDate: nullableDate(row.planned_end),
        progress:
          status === "completed"
            ? 100
            : clampPercent(numericValue(row.progress)),
      };
    })
    .filter((stage) => stage.id.length > 0 && stage.phaseId.length > 0);
}

/**
 * Prevent duplicate IDs from reaching the Gantt component.
 */
function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (!item.id || seen.has(item.id)) return false;

    seen.add(item.id);
    return true;
  });
}

/**
 * Calculate overall progress from tasks when available.
 * Fall back to phase stages when the project has no tasks.
 */
function calculateProgress(
  projectTasks: Row[],
  phaseStages: Row[],
): number {
  if (projectTasks.length > 0) {
    return clampPercent(
      projectTasks.reduce((sum, task) => sum + taskProgress(task), 0) /
        projectTasks.length,
    );
  }

  if (phaseStages.length > 0) {
    return clampPercent(
      phaseStages.reduce((sum, stage) => sum + stageProgress(stage), 0) /
        phaseStages.length,
    );
  }

  return 0;
}

/* -------------------------------------------------------------------------- */
/* Server-side overview data                                                  */
/* -------------------------------------------------------------------------- */

export async function getOverviewData(
  projectId: string,
): Promise<OverviewData | null> {
  const supabase = await createClient(await cookies());

  /* ------------------------------------------------------------------------ */
  /* Project                                                                  */
  /* ------------------------------------------------------------------------ */

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (projectError) {
    throw new Error(
      `Não foi possível carregar o projecto: ${projectError.message}`,
    );
  }

  if (!projectData) return null;

  const projectRow = asRow(projectData);

  /* ------------------------------------------------------------------------ */
  /* Project phases                                                           */
  /* ------------------------------------------------------------------------ */

  const { data: phaseData, error: phaseError } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (phaseError) {
    throw new Error(
      `Não foi possível carregar as fases do projecto: ${phaseError.message}`,
    );
  }

  const phaseRows = (phaseData ?? []).map(asRow);
  const phases = uniqueById(mapPhases(phaseRows));
  const phaseIds = phases.map((phase) => phase.id);

  /* ------------------------------------------------------------------------ */
  /* Phase stages                                                             */
  /* ------------------------------------------------------------------------ */

  let stageRows: Row[] = [];

  if (phaseIds.length > 0) {
    const { data: stageData, error: stageError } = await supabase
      .from("phase_stages")
      .select(
        "stage_id, phase_id, name, status, progress, planned_start, planned_end, sort_order",
      )
      .in("phase_id", phaseIds)
      .order("sort_order", { ascending: true });

    if (stageError) {
      throw new Error(
        `Não foi possível carregar as etapas das fases: ${stageError.message}`,
      );
    }

    stageRows = (stageData ?? []).map(asRow);
  }

  /* ------------------------------------------------------------------------ */
  /* Deliverables                                                             */
  /* ------------------------------------------------------------------------ */

  let deliverableRows: Row[] = [];

  if (phaseIds.length > 0) {
    const { data: deliverableData, error: deliverableError } =
      await supabase
        .from("deliverables")
        .select("*")
        .in("phase_id", phaseIds)
        .order("sort_order", { ascending: true });

    if (deliverableError) {
      throw new Error(
        `Não foi possível carregar os entregáveis: ${deliverableError.message}`,
      );
    }

    deliverableRows = (deliverableData ?? []).map(asRow);
  }

  /* ------------------------------------------------------------------------ */
  /* Project tasks                                                            */
  /* ------------------------------------------------------------------------ */

  const { data: taskData, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);

  if (taskError) {
    throw new Error(
      `Não foi possível carregar as tarefas: ${taskError.message}`,
    );
  }

  const taskRows = (taskData ?? []).map(asRow);

  /* ------------------------------------------------------------------------ */
  /* Project activities                                                       */
  /* ------------------------------------------------------------------------ */

  const { data: activityData, error: activityError } = await supabase
    .from("activities")
    .select(`
      activity_id,
      project_id,
      user_id,
      task_id,
      activity_type,
      description,
      metadata,
      created_at
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (activityError) {
    throw new Error(
      `Não foi possível carregar as actividades: ${activityError.message}`,
    );
  }

  const activityRows = (activityData ?? []).map(asRow);

  /* ------------------------------------------------------------------------ */
  /* Activity authors                                                         */
  /* ------------------------------------------------------------------------ */

  const activityUserIds = [
    ...new Set(
      activityRows
        .map((row) => stringValue(row.user_id))
        .filter(Boolean),
    ),
  ];

  const { data: profileData, error: profileError } =
    activityUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("profile_id, first_name, last_name")
          .in("profile_id", activityUserIds)
      : { data: [], error: null };

  if (profileError) {
    throw new Error(
      `Não foi possível carregar os autores das actividades: ${profileError.message}`,
    );
  }

  const profileNameById = new Map<string, string>(
    (profileData ?? []).map((profile) => {
      const firstName = stringValue(profile.first_name);
      const lastName = stringValue(profile.last_name);
      const fullName = [firstName, lastName].filter(Boolean).join(" ");

      return [
        profile.profile_id,
        fullName || "Utilizador desconhecido",
      ];
    }),
  );

  /* ------------------------------------------------------------------------ */
  /* Project submissions                                                      */
  /* ------------------------------------------------------------------------ */

  const { data: submissionData, error: submissionError } = await supabase
    .from("submissions")
    .select(`
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
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (submissionError) {
    throw new Error(
      `Não foi possível carregar as submissões: ${submissionError.message}`,
    );
  }

  const submissionRows = (submissionData ?? []).map(asRow);

  /* ------------------------------------------------------------------------ */
  /* Project model                                                            */
  /* ------------------------------------------------------------------------ */

  const project: OverviewProject = {
    id: stringValue(projectRow.project_id) || projectId,
    name: stringValue(
      projectRow.name,
      projectRow.project_name,
      projectRow.title
    ) || "Projecto sem nome",
    code: stringValue(projectRow.project_code) || null,
    status: stringValue(projectRow.status) || "Sem estado",
    startDate: nullableDate(
      projectRow.start_date,
      projectRow.started_at
    ),
    endDate: nullableDate(
      projectRow.end_date,
      projectRow.due_date,
      projectRow.deadline
    ),
    municipality: stringValue(projectRow.municipality) || null,
    country: stringValue(projectRow.country) || null,
    type: stringValue(projectRow.type) || null
  };

  /* ------------------------------------------------------------------------ */
  /* KPIs                                                                     */
  /* ------------------------------------------------------------------------ */

  const completedTasks = taskRows.filter((row) =>
    isCompleted(stringValue(row.status, row.state)),
  ).length;

  const progress = calculateProgress(taskRows, stageRows);

  const remainingDays = project.endDate
    ? dayDifference(new Date(), new Date(project.endDate))
    : null;

  /* ------------------------------------------------------------------------ */
  /* Gantt                                                                    */
  /* ------------------------------------------------------------------------ */

  const ganttTasks = uniqueById([
    ...mapProjectTasks(taskRows).map((task) => ({
      ...task,
      id: `task:${task.id}`,
    })),
    ...mapPhaseStages(stageRows).map((stage) => ({
      ...stage,
      id: `stage:${stage.id}`,
    })),
  ]);

  /* ------------------------------------------------------------------------ */
  /* Deliverables model                                                       */
  /* ------------------------------------------------------------------------ */

  const deliverables: Deliverable[] = deliverableRows.map((row) => ({
    ...row,
    id: stringValue(row.id),
    phase_id: stringValue(row.phase_id),
    title: stringValue(row.title) || "Entregável sem título",
    description: stringValue(row.description) || null,
    status: (
      stringValue(row.status) || "not_started"
    ) as Deliverable["status"],
    progress: numericValue(row.progress),
    start_date: stringValue(row.start_date) || null,
    due_date: stringValue(row.due_date) || null,
    completed_at: stringValue(row.completed_at) || null,
    sort_order: numericValue(row.sort_order),
  }));

  /* ------------------------------------------------------------------------ */
  /* Activities model                                                         */
  /* ------------------------------------------------------------------------ */

  const activities: OverviewActivity[] = activityRows.map((row) => {
    const userId = stringValue(row.user_id) || null;

    return {
      activity_id: stringValue(row.activity_id),
      project_id: stringValue(row.project_id) || null,
      user_id: userId,
      task_id: stringValue(row.task_id) || null,
      activity_type: stringValue(row.activity_type),
      description: stringValue(row.description) || null,
      metadata:
        row.metadata &&
        typeof row.metadata === "object" &&
        !Array.isArray(row.metadata)
          ? (row.metadata as Record<string, unknown>)
          : null,
      created_at: stringValue(row.created_at),
      user_name: userId
        ? profileNameById.get(userId) ?? "Utilizador desconhecido"
        : "Utilizador desconhecido",
    };
  });

  /* ------------------------------------------------------------------------ */
  /* Submissions model                                                        */
  /* ------------------------------------------------------------------------ */

  const submittals: OverviewSubmission[] = submissionRows.map((row) => ({
    submission_id: stringValue(row.submission_id),
    project_id: stringValue(row.project_id),
    title: stringValue(row.title) || "Submissão sem título",
    description: stringValue(row.description) || null,
    type: stringValue(row.type) || "other",
    status: stringValue(row.status) || "pending",
    submitted_by: stringValue(row.submitted_by),
    submitted_at: stringValue(row.submitted_at),
    due_date: stringValue(row.due_date) || null,
    reviewed_by: stringValue(row.reviewed_by) || null,
    reviewed_at: stringValue(row.reviewed_at) || null,
    notes: stringValue(row.notes) || null,
    revision_number: numericValue(row.revision_number) || 1,
    created_at: stringValue(row.created_at),
    updated_at: stringValue(row.updated_at),
  }));

  /* ------------------------------------------------------------------------ */
  /* Approvals: submissions awaiting review, excluding drafts                 */
  /* ------------------------------------------------------------------------ */

  const approvals = submittals.filter(
    (submission) =>
      submission.status.toLowerCase() !== "draft" &&
      submission.reviewed_at === null,
  );

  /* ------------------------------------------------------------------------ */
  /* Return                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    project,

    kpis: {
      progress,
      remainingDays,
      openQuestions: 0,
      completedTasks,
      totalTasks: taskRows.length,
      pendingApprovals: approvals.length,
    },

    phases,
    tasks: ganttTasks,
    deliverables,
    risks: [],
    activities,
    rfis: [],
    submittals,
    approvals,
    budgetByPhase: [],
  };
}

export { formatDate };
