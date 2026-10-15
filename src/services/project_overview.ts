import "server-only";

import { createClient } from "@/app/lib/supabase/server";
import type {
  GanttPhase,
} from "@/app/components/gant_chart/gantt";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Row = Record<string, unknown>;

type PhaseStageStatus = "not_started" | "in_progress" | "completed";

export interface OverviewProject {
  id: string;
  name: string;
  code: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

export interface OverviewActivity {
  id: string;
  text: string;
  who: string;
  time: string;
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

  rfis: {
    id: string;
    subject: string;
    status: string;
    due: string;
  }[];

  submittals: {
    id: string;
    subject: string;
    status: string;
    due: string;
  }[];

  approvals: {
    id: string;
    item: string;
    date: string;
    requestedFrom: string;
  }[];

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

    // Date-only values should remain date-only to avoid timezone shifts.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      return value.trim();
    }

    const date = new Date(value);

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

function StageProgress(row: Row): number {
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
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        a.originalIndex - b.originalIndex,
    )
    .map(({ originalIndex: _originalIndex, ...phase }) => phase);
}

/**
 * Project tasks remain separate from phase_stages.
 * A task is associated with a phase only when its row contains a valid
 * phase_id or a related phase object.
 */
function mapProjectTasks(rows: Row[]): {
  id: string;
  name: string;
  phaseId: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
}[] {
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
    .filter((task) => task.id && task.phaseId);
}

/**
 * phase_stages uses stage_id, phase_id, planned_start and planned_end.
 * Those fields are mapped explicitly from the schema supplied.
 */
function mapPhaseStages(rows: Row[]): {
  id: string;
  name: string;
  phaseId: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
}[] {
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
    .filter((Stage) => Stage.id.length > 0 && Stage.phaseId.length > 0);
}

/**
 * Prevent duplicate IDs from reaching the Gantt component.
 * The first occurrence wins, preserving the original query order.
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
 * Calculate overall progress from task rows when available.
 * When no project tasks exist, calculate progress from phase Stages.
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
      phaseStages.reduce((sum, Stage) => sum + StageProgress(Stage), 0) /
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

  /*
   * This assumes project_phases contains project_id.
   * If your actual foreign-key column has a different name, update this
   * filter to match your database schema.
   */
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
  /* Phase Stages                                                              */
  /* ------------------------------------------------------------------------ */

  let StageRows: Row[] = [];

  if (phaseIds.length > 0) {
    const { data: StageData, error: StageError } = await supabase
      .from("phase_stages")
      .select(
        "stage_id, phase_id, name, status, progress, planned_start, planned_end, sort_order",
      )
      .in("phase_id", phaseIds)
      .order("sort_order", { ascending: true });

    if (StageError) {
      throw new Error(
        `Não foi possível carregar as etapas das fases: ${StageError.message}`,
      );
    }

    StageRows = (StageData ?? []).map(asRow);
  }

  /* ------------------------------------------------------------------------ */
  /* Project tasks                                                             */
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
  /* Project model                                                             */
  /* ------------------------------------------------------------------------ */

  const project: OverviewProject = {
    id: stringValue(projectRow.project_id) || projectId,
    name:
      stringValue(
        projectRow.name,
        projectRow.project_name,
        projectRow.title,
      ) || "Projecto sem nome",
    code: stringValue(projectRow.project_code) || null,
    status: stringValue(projectRow.status) || "Sem estado",
    startDate: nullableDate(
      projectRow.start_date,
      projectRow.started_at,
    ),
    endDate: nullableDate(
      projectRow.end_date,
      projectRow.due_date,
      projectRow.deadline,
    ),
  };

  /* ------------------------------------------------------------------------ */
  /* KPIs                                                                      */
  /* ------------------------------------------------------------------------ */

  const completedTasks = taskRows.filter((row) =>
    isCompleted(stringValue(row.status, row.state)),
  ).length;

  const progress = calculateProgress(taskRows, StageRows);

  const remainingDays = project.endDate
    ? dayDifference(new Date(), new Date(project.endDate))
    : null;

  /* ------------------------------------------------------------------------ */
  /* Gantt                                                                     */
  /* ------------------------------------------------------------------------ */

  /*
   * This implementation combines actual project tasks and phase Stages.
   * Their IDs are prefixed to prevent a task_id and stage_id from colliding.
   * If you want the Gantt to show only phase Stages, use mapPhaseStages(StageRows)
   * instead of combining the two arrays.
   */
  const ganttTasks = uniqueById([
    ...mapProjectTasks(taskRows).map((task) => ({
      ...task,
      id: `task:${task.id}`,
    })),
    ...mapPhaseStages(StageRows).map((Stage) => ({
      ...Stage,
      id: `Stage:${Stage.id}`,
    })),
  ]);

  return {
    project,
    kpis: {
      progress,
      remainingDays,
      openQuestions: 0,
      completedTasks,
      totalTasks: taskRows.length,
      pendingApprovals: 0,
    },
    phases,
    tasks: ganttTasks,
    risks: [],
    activities: [],
    rfis: [],
    submittals: [],
    approvals: [],
    budgetByPhase: [],
  };
}

export { formatDate };