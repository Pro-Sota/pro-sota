import type { SupabaseClient } from "@supabase/supabase-js";

import { WorkStatus, GanttStage, GanttDeliverable, GanttData, GanttPhase } from "@/app/components/gant_chart/types";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Database row shapes                                                        */
/* -------------------------------------------------------------------------- */

type NumericValue = number | string | null;

type StageRow = {
    stage_id: string;
    name: string;
    status: string | null;
    progress: NumericValue;
    planned_start: string | null;
    planned_end: string | null;
    actual_start: string | null;
    actual_end: string | null;
    sort_order: NumericValue;
};

type DeliverableRow = {
    id: string;
    title: string;
    status: string | null;
    progress: NumericValue;
    start_date: string | null; // timestamptz
    due_date: string | null; // timestamptz
    sort_order: NumericValue;
};

type PhaseRow = {
    phase_id: string;
    name: string;
    status: string | null;
    progress: NumericValue;
    planned_start: string | null;
    planned_end: string | null;
    actual_start: string | null;
    actual_end: string | null;
    sort_order: NumericValue;
    phase_stages: StageRow[] | null;
    deliverables: DeliverableRow[] | null;
};

/**
 * One request: phases with their Stages and deliverables embedded through the
 * foreign keys (phase_stages.phase_id and deliverables.phase_id).
 */
const PHASES_WITH_ITEMS_SELECT = `
  phase_id,
  name,
  status,
  progress,
  planned_start,
  planned_end,
  actual_start,
  actual_end,
  sort_order,
  phase_Stages (
    stage_id,
    name,
    status,
    progress,
    planned_start,
    planned_end,
    actual_start,
    actual_end,
    sort_order
  ),
  deliverables (
    id,
    title,
    status,
    progress,
    start_date,
    due_date,
    sort_order
  )
`;

/* -------------------------------------------------------------------------- */
/* Normalizers                                                                */
/* -------------------------------------------------------------------------- */

const WORK_STATUSES: readonly WorkStatus[] = [
    "not_started",
    "in_progress",
    "completed",
    "on_hold",
    "cancelled",
];

function toWorkStatus(value: string | null | undefined): WorkStatus {
    return WORK_STATUSES.includes(value as WorkStatus)
        ? (value as WorkStatus)
        : "not_started";
}

function toNumberOrNull(value: NumericValue | undefined): number | null {
    if (value === null || value === undefined) return null;

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
}

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

/**
 * Converts a Postgres `date` ("2026-10-12") or `timestamptz`
 * ("2026-10-12T23:00:00+00:00") into a local "YYYY-MM-DD" string.
 *
 * Timestamps are converted using the runtime's time zone. If this service
 * runs on a server whose time zone differs from your users', a deliverable
 * due late in the evening can land on the wrong day. Run it in the browser,
 * or change deliverables.start_date/due_date to `date`.
 */
export function toLocalDateString(value: string | null | undefined): string | null {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* -------------------------------------------------------------------------- */
/* Mappers                                                                    */
/* -------------------------------------------------------------------------- */

function mapPhase(row: PhaseRow): GanttPhase {
    return {
        id: row.phase_id,
        name: row.name,
        status: toWorkStatus(row.status),
        progress: toNumberOrNull(row.progress),
        plannedStart: toLocalDateString(row.planned_start),
        plannedEnd: toLocalDateString(row.planned_end),
        actualStart: toLocalDateString(row.actual_start),
        actualEnd: toLocalDateString(row.actual_end),
        sortOrder: toNumberOrNull(row.sort_order),
    };
}

function mapStage(row: StageRow, phaseId: string): GanttStage {
    return {
        id: row.stage_id,
        phaseId,
        name: row.name,
        status: toWorkStatus(row.status),
        progress: toNumberOrNull(row.progress),
        plannedStart: toLocalDateString(row.planned_start),
        plannedEnd: toLocalDateString(row.planned_end),
        actualStart: toLocalDateString(row.actual_start),
        actualEnd: toLocalDateString(row.actual_end),
        sortOrder: toNumberOrNull(row.sort_order),
    };
}

function mapDeliverable(row: DeliverableRow, phaseId: string): GanttDeliverable {
    return {
        id: row.id,
        phaseId,
        name: row.title,
        status: toWorkStatus(row.status),
        progress: toNumberOrNull(row.progress) ?? 0,
        startDate: toLocalDateString(row.start_date),
        dueDate: toLocalDateString(row.due_date),
        sortOrder: toNumberOrNull(row.sort_order),
    };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Loads everything the Gantt chart needs for one project.
 *
 * The Supabase client is passed in (instead of imported) so the same service
 * works with your browser client, server client, or a test double.
 *
 * Throws on failure, so callers can show an error state.
 */
export async function getProjectGanttData(
    projectId: string,
): Promise<GanttData> {
    
    const supabase = createClient(await cookies());

    const { data, error } = await supabase
        .from("project_phases")
        .select(PHASES_WITH_ITEMS_SELECT)
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true, nullsFirst: false });

    if (error) {
        throw new Error(`Não foi possível carregar o cronograma: ${error.message}`);
    }

    const rows = (data ?? []) as unknown as PhaseRow[];

    const phases: GanttPhase[] = [];
    const Stages: GanttStage[] = [];
    const deliverables: GanttDeliverable[] = [];

    for (const row of rows) {
        phases.push(mapPhase(row));

        for (const Stage of row.phase_stages ?? []) {
            Stages.push(mapStage(Stage, row.phase_id));
        }

        for (const deliverable of row.deliverables ?? []) {
            deliverables.push(mapDeliverable(deliverable, row.phase_id));
        }
    }

    return { phases, Stages, deliverables };
}