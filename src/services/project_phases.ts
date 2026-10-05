import { createClient } from "@/app/lib/supabase/server";
import { Database } from "@/app/lib/supabase/models";
import { cookies } from "next/headers";

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/* -------------------------------------------------------------------------- */
/* Phases                                                                     */
/* -------------------------------------------------------------------------- */

// Get all phases for a project
export async function getProjectPhases(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data;
}

// Get a single phase
export async function getPhase(phaseId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .select("*")
    .eq("phase_id", phaseId)
    .single();

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Phase detail                                                               */
/* -------------------------------------------------------------------------- */

// Get everything needed by the phase detail page
//
// The phase detail page contains only:
// - Phase
// - Milestones
// - Deliverables
//
// Tasks, documents and steps are intentionally not loaded here.
export async function getPhaseDetail(
  projectId: string,
  phaseId: string,
) {
  const supabase = await getSupabase();

  const [phaseResult, milestonesResult, deliverablesResult, projectResult] =
    await Promise.all([
      supabase
        .from("project_phases")
        .select("*")
        .eq("phase_id", phaseId)
        .eq("project_id", projectId)
        .single(),

      supabase
        .from("milestones")
        .select("*")
        .eq("phase_id", phaseId)
        .order("date", { ascending: true }),

      supabase
        .from("deliverables")
        .select("*")
        .eq("phase_id", phaseId)
        .order("sort_order", { ascending: true }),

      supabase
        .from("projects")
        .select("project_id, title, project_code")
        .eq("project_id", projectId)
        .single(),
    ]);

  if (phaseResult.error) throw phaseResult.error;
  if (milestonesResult.error) throw milestonesResult.error;
  if (deliverablesResult.error) throw deliverablesResult.error;
  if (projectResult.error) throw projectResult.error;

  return {
    phase: phaseResult.data,
    project: projectResult.data,
    milestones: milestonesResult.data ?? [],
    deliverables: deliverablesResult.data ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* Phase + deliverables                                                       */
/* -------------------------------------------------------------------------- */

// Get phases with their deliverables
export async function getProjectPhasesWithDeliverables(
  projectId: string,
) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .select(`
      *,
      deliverables (*)
    `)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Deliverables                                                               */
/* -------------------------------------------------------------------------- */

// Get deliverables for a phase
export async function getPhaseDeliverables(phaseId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("phase_id", phaseId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data;
}

// Get a single deliverable
export async function getDeliverable(deliverableId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("id", deliverableId)
    .single();

  if (error) throw error;

  return data;
}

// Get deliverables with their steps
export async function getDeliverablesWithSteps(phaseId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("deliverables")
    .select(`
      *,
      steps (*)
    `)
    .eq("phase_id", phaseId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Steps                                                                      */
/* -------------------------------------------------------------------------- */

// Get steps for a deliverable
export async function getDeliverableSteps(deliverableId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("steps")
    .select("*")
    .eq("deliverable_id", deliverableId)
    .order("position", { ascending: true });

  if (error) throw error;

  return data;
}

// Get a single step
export async function getStep(stepId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("steps")
    .select("*")
    .eq("id", stepId)
    .single();

  if (error) throw error;

  return data;
}

// Get all steps belonging to a phase
export async function getPhaseSteps(phaseId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("steps")
    .select(`
      *,
      deliverables!inner (
        id,
        phase_id
      )
    `)
    .eq("deliverables.phase_id", phaseId)
    .order("position", { ascending: true });

  if (error) throw error;

  return data;
}

// Get all project steps
export async function getProjectSteps(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("steps")
    .select(`
      *,
      deliverables!inner (
        id,
        phase_id,
        project_phases!inner (
          phase_id,
          project_id
        )
      )
    `)
    .eq("deliverables.project_phases.project_id", projectId)
    .order("position", { ascending: true });

  if (error) throw error;

  return data;
}

// Get incomplete steps for a project
export async function getIncompleteProjectSteps(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("steps")
    .select(`
      *,
      deliverables!inner (
        id,
        title,
        phase_id,
        project_phases!inner (
          phase_id,
          name,
          project_id
        )
      )
    `)
    .eq("deliverables.project_phases.project_id", projectId)
    .neq("status", "completed")
    .order("position", { ascending: true });

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Deliverable queries                                                        */
/* -------------------------------------------------------------------------- */

// Get overdue deliverables
export async function getOverdueDeliverables(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("deliverables")
    .select(`
      *,
      project_phases!inner (
        phase_id,
        name,
        project_id
      )
    `)
    .eq("project_phases.project_id", projectId)
    .lt("due_date", new Date().toISOString())
    .neq("status", "completed")
    .order("due_date", { ascending: true });

  if (error) throw error;

  return data;
}

// Get upcoming deliverables
export async function getUpcomingDeliverables(
  projectId: string,
  limit = 10,
) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("deliverables")
    .select(`
      *,
      project_phases!inner (
        phase_id,
        name,
        project_id
      )
    `)
    .eq("project_phases.project_id", projectId)
    .neq("status", "completed")
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Milestones                                                                 */
/* -------------------------------------------------------------------------- */

// Get project milestones
export async function getProjectMilestones(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("date", { ascending: true });

  if (error) throw error;

  return data;
}

// Get milestones for a phase
export async function getPhaseMilestones(phaseId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("phase_id", phaseId)
    .order("date", { ascending: true });

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Phase status                                                               */
/* -------------------------------------------------------------------------- */

// Get current/active phases
export async function getActiveProjectPhases(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", "in_progress")
    .order("planned_start", { ascending: true });

  if (error) throw error;

  return data;
}

// Get completed phases
export async function getCompletedProjectPhases(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .order("planned_end", { ascending: false });

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Project phase tree                                                         */
/* -------------------------------------------------------------------------- */

// Get all project phases with their complete hierarchy
export async function getProjectPhaseTree(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .select(`
      *,
      deliverables (
        *,
        steps (*)
      ),
      milestones (*)
    `)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

// Get basic project progress data
export async function getProjectProgress(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .select(`
      phase_id,
      name,
      status,
      progress,
      deliverables (
        id,
        title,
        status,
        progress,
        steps (
          id,
          status
        )
      )
    `)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data;
}

// Get a phase's progress data
export async function getPhaseProgress(phaseId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .select(`
      phase_id,
      name,
      status,
      progress,
      deliverables (
        id,
        title,
        status,
        progress,
        steps (
          id,
          status
        )
      )
    `)
    .eq("phase_id", phaseId)
    .single();

  if (error) throw error;

  return data;
}

// Get phase statistics
export async function getPhaseStats(phaseId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("deliverables")
    .select(`
      id,
      title,
      status,
      progress,
      steps (
        id,
        status
      )
    `)
    .eq("phase_id", phaseId);

  if (error) throw error;

  return data;
}

/* -------------------------------------------------------------------------- */
/* Activity                                                                   */
/* -------------------------------------------------------------------------- */

// Get project activity/history
export async function getProjectActivity(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("activity")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}


export async function getProjectPhaseBoard(projectId: string) {
    const supabase = await getSupabase();

    const [phasesResult, deliverablesResult, milestonesResult] =
        await Promise.all([
            supabase
                .from("project_phases")
                .select("*")
                .eq("project_id", projectId)
                .order("sort_order", { ascending: true }),

            supabase
                .from("deliverables")
                .select("*")
                .eq(
                    "phase_id",
                 
                    ""
                ),

            supabase
                .from("milestones")
                .select("*")
                .eq("project_id", projectId)
                .order("date", { ascending: true }),
        ]);

    if (phasesResult.error) throw phasesResult.error;
    if (milestonesResult.error) throw milestonesResult.error;

    const phaseIds = (phasesResult.data ?? []).map(
        (phase) => phase.phase_id
    );

    let deliverables = [];

    if (phaseIds.length > 0) {
        const { data, error } = await supabase
            .from("deliverables")
            .select("*")
            .in("phase_id", phaseIds)
            .order("sort_order", { ascending: true });

        if (error) throw error;

        deliverables = data ?? [];
    }

    return {
        phases: phasesResult.data ?? [],
        deliverables,
        milestones: milestonesResult.data ?? [],
    };
}