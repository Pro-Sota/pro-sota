import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";
import type { Database } from "@/app/lib/supabase/models";

type ProjectPhase =
    Database["public"]["Tables"]["project_phases"]["Row"];

type Deliverable =
    Database["public"]["Tables"]["deliverables"]["Row"];

type Stage =
    Database["public"]["Tables"]["phase_stages"]["Row"];

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
 * Get deliverables with their Stages.
 */
export async function getDeliverablesWithStages(
    phaseId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("deliverables")
        .select(`
            *,
            Stages (*)
        `)
        .eq("phase_id", phaseId)
        .order("due_date", { ascending: true });

    if (error) {
        console.error("getDeliverablesWithStages:", error);
        throw new Error(error.message);
    }

    return data;
}

/* -------------------------------------------------------------------------- */
/* Stages                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Get Stages for a deliverable.
 */
export async function getDeliverableStages(
    deliverableId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("Stages")
        .select("*")
        .eq("deliverable_id", deliverableId)
        .order("position", { ascending: true });

    if (error) {
        console.error("getDeliverableStages:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get a single Stage.
 */
export async function getStage(StageId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("Stages")
        .select("*")
        .eq("id", StageId)
        .single();

    if (error) {
        console.error("getStage:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get all Stages belonging to a phase.
 */
export async function getPhaseStages(phaseId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("Stages")
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
        console.error("getPhaseStages:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get all Stages belonging to a project.
 */
export async function getProjectStages(projectId: string) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("Stages")
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
        console.error("getProjectStages:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get incomplete Stages for a project.
 */
export async function getIncompleteProjectStages(
    projectId: string
) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from("Stages")
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
            "getIncompleteProjectStages:",
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
 *       │   └── Stages
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
                Stages (*)
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
                Stages (
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
                Stages (
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
            Stages (
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


/**
 * Get a single project by ID.
 */
export async function getProjectById(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    console.error("getProject:", error);
    throw new Error("Não foi possível carregar o projecto.");
  }

  return data;
}

export async function getProjectClient(projectId:string): Promise<
  { id: string; name: string }[]
> {
  const supabase = createClient(await cookies());

  const project = await getProjectById(projectId);

  const { data, error } = await supabase
    .from("clients")
    .select(`
      client_id,
      name,
      first_name,
      last_name,
      organization_name
    `).eq("client_id", project.client_id)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("getProjectClients:", error);
    throw new Error("Não foi possível carregar os clientes.");
  }

  return (data ?? []).map((client) => ({
    id: client.client_id,
    name:
      client.name?.trim() ||
      client.organization_name?.trim() ||
      [client.first_name, client.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "Cliente sem nome",
  }));
}