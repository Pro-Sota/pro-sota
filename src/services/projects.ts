import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";
import type { Database } from "@/app/lib/supabase/models";

type ProjectPhase =
    Database["public"]["Tables"]["project_phases"]["Row"];

type Deliverable =
    Database["public"]["Tables"]["deliverables"]["Row"];

type Step =
    Database["public"]["Tables"]["phase_steps"]["Row"];

type Milestone =
    Database["public"]["Tables"]["milestones"]["Row"];

/* -------------------------------------------------------------------------- */
/* Supabase helper                                                            */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

/* -------------------------------------------------------------------------- */
/* Project phases                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Get all phases for a project.
 */
export async function getProjectPhases(projectId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("getProjectPhases:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get a single phase.
 */
export async function getPhase(phaseId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("phase_id", phaseId)
        .single();

    if (error) {
        console.error("getPhase:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get phases with their deliverables.
 */
export async function getProjectPhasesWithDeliverables(
    projectId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("project_phases")
        .select(`
            *,
            deliverables (*)
        `)
        .eq("project_id", projectId)
        .order("start_date", { ascending: true });

    if (error) {
        console.error(
            "getProjectPhasesWithDeliverables:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Deliverables                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Get deliverables for a phase.
 */
export async function getPhaseDeliverables(phaseId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .eq("phase_id", phaseId)
        .order("due_date", { ascending: true });

    if (error) {
        console.error("getPhaseDeliverables:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get a single deliverable.
 */
export async function getDeliverable(deliverableId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .eq("id", deliverableId)
        .single();

    if (error) {
        console.error("getDeliverable:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get deliverables with their steps.
 */
export async function getDeliverablesWithSteps(
    phaseId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("deliverables")
        .select(`
            *,
            steps (*)
        `)
        .eq("phase_id", phaseId)
        .order("due_date", { ascending: true });

    if (error) {
        console.error("getDeliverablesWithSteps:", error);
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Steps                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Get steps for a deliverable.
 */
export async function getDeliverableSteps(
    deliverableId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("steps")
        .select("*")
        .eq("deliverable_id", deliverableId)
        .order("position", { ascending: true });

    if (error) {
        console.error("getDeliverableSteps:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get a single step.
 */
export async function getStep(stepId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("steps")
        .select("*")
        .eq("id", stepId)
        .single();

    if (error) {
        console.error("getStep:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get all steps belonging to a phase.
 */
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

    if (error) {
        console.error("getPhaseSteps:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get all steps belonging to a project.
 */
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
        .eq(
            "deliverables.project_phases.project_id",
            projectId
        )
        .order("position", { ascending: true });

    if (error) {
        console.error("getProjectSteps:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get incomplete steps for a project.
 */
export async function getIncompleteProjectSteps(
    projectId: string
) {
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
        .eq(
            "deliverables.project_phases.project_id",
            projectId
        )
        .neq("status", "completed")
        .order("position", { ascending: true });

    if (error) {
        console.error(
            "getIncompleteProjectSteps:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Deliverable status                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Get overdue deliverables.
 */
export async function getOverdueDeliverables(
    projectId: string
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
        .eq(
            "project_phases.project_id",
            projectId
        )
        .lt("due_date", new Date().toISOString())
        .neq("status", "completed")
        .order("due_date", { ascending: true });

    if (error) {
        console.error(
            "getOverdueDeliverables:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get upcoming deliverables.
 */
export async function getUpcomingDeliverables(
    projectId: string,
    limit = 10
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
        .eq(
            "project_phases.project_id",
            projectId
        )
        .neq("status", "completed")
        .order("due_date", { ascending: true })
        .limit(limit);

    if (error) {
        console.error(
            "getUpcomingDeliverables:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Milestones                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Get all project milestones.
 */
export async function getProjectMilestones(
    projectId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: true });

    if (error) {
        console.error("getProjectMilestones:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get milestones for a phase.
 */
export async function getPhaseMilestones(
    phaseId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("phase_id", phaseId)
        .order("date", { ascending: true });

    if (error) {
        console.error("getPhaseMilestones:", error);
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Phase status                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Get active phases.
 */
export async function getActiveProjectPhases(
    projectId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "in_progress")
        .order("start_date", { ascending: true });

    if (error) {
        console.error(
            "getActiveProjectPhases:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get completed phases.
 */
export async function getCompletedProjectPhases(
    projectId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "completed")
        .order("end_date", { ascending: false });

    if (error) {
        console.error(
            "getCompletedProjectPhases:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Complete project hierarchy                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Get the complete project phase hierarchy.
 *
 * Project
 *   └── Phases
 *       ├── Deliverables
 *       │   └── Steps
 *       └── Milestones
 */
export async function getProjectPhaseTree(
    projectId: string
) {
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
        .order("start_date", { ascending: true });

    if (error) {
        console.error(
            "getProjectPhaseTree:",
            error
        );
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Get basic project progress data.
 */
export async function getProjectProgress(
    projectId: string
) {
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
                status,
                progress,
                steps (
                    id,
                    status
                )
            )
        `)
        .eq("project_id", projectId)
        .order("start_date", { ascending: true });

    if (error) {
        console.error("getProjectProgress:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get a phase's progress data.
 */
export async function getPhaseProgress(
    phaseId: string
) {
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

    if (error) {
        console.error("getPhaseProgress:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get phase statistics.
 */
export async function getPhaseStats(
    phaseId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("deliverables")
        .select(`
            id,
            status,
            progress,
            steps (
                id,
                status
            )
        `)
        .eq("phase_id", phaseId);

    if (error) {
        console.error("getPhaseStats:", error);
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Activity                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Get project activity/history.
 */
export async function getProjectActivity(
    projectId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("activity")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getProjectActivity:", error);
        throw new Error(error.message);
    }

    return data;
}


