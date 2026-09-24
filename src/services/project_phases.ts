import { createClient } from "@/app/lib/supabase/server";
import { Database } from "@/app/lib/supabase/models";
import { cookies } from "next/headers";

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];

// Get all phases for a project

export async function getProjectPhases(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true });

    return data;
}

// Get a single phase
export async function getPhase(phaseId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("phase_id", phaseId)
        .single();
        
    return data;
}

// Get phases with their deliverables
export async function getProjectPhasesWithDeliverables(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    return supabase
        .from("project_phases")
        .select(`
      *,
      deliverables (*)
    `)
        .eq("project_id", projectId)
        .order("start_date", { ascending: true });
}

// Get deliverables for a phase
export async function getPhaseDeliverables(phaseId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .eq("phase_id", phaseId)
        .order("due_date", { ascending: true });

    return data;
}

// Get a single deliverable
export async function getDeliverable(deliverableId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("deliverables")
        .select("*")
        .eq("id", deliverableId)
        .single();
    return data;
}


// Get deliverables with their steps
export async function getDeliverablesWithSteps(phaseId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("deliverables")
        .select(`
      *,
      steps (*)
    `)
        .eq("phase_id", phaseId)
        .order("due_date", { ascending: true });

    return data;
}


// Get steps for a deliverable
export async function getDeliverableSteps(deliverableId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("steps")
        .select("*")
        .eq("deliverable_id", deliverableId)
        .order("position", { ascending: true });

    return data;
}

// Get a single step
export async function getStep(stepId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("steps")
        .select("*")
        .eq("id", stepId)
        .single();
    return data;
}

// Get all steps belonging to a phase
export async function getPhaseSteps(phaseId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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

    return data;
}


// Get all project steps
export async function getProjectSteps(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("steps")
        .select(`
      *,
      deliverables!inner (
        id,
        phase_id,
        phases!inner (
          id,
          project_id
        )
      )
    `)
        .eq("deliverables.phases.project_id", projectId)
        .order("position", { ascending: true });

    return data;
}

// Get incomplete steps for a project
export async function getIncompleteProjectSteps(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("steps")
        .select(`
      *,
      deliverables!inner (
        id,
        title,
        phase_id,
        phases!inner (
          id,
          name,
          project_id
        )
      )
    `)
        .eq("deliverables.phases.project_id", projectId)
        .neq("status", "completed")
        .order("position", { ascending: true });

    return data;
}

// Get overdue deliverables
export async function getOverdueDeliverables(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("deliverables")
        .select(`
      *,
      phases!inner (
        id,
        name,
        project_id
      )
    `)
        .eq("phases.project_id", projectId)
        .lt("due_date", new Date().toISOString())
        .neq("status", "completed")
        .order("due_date", { ascending: true });

    return data;
}

// Get upcoming deliverables
export async function getUpcomingDeliverables(
    projectId: string,
    limit = 10
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("deliverables")
        .select(`
      *,
      phases!inner (
        id,
        name,
        project_id
      )
    `)
        .eq("phases.project_id", projectId)
        .neq("status", "completed")
        .order("due_date", { ascending: true })
        .limit(limit);

    return data;
}

// Get project milestones
export async function getProjectMilestones(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: true });

    return data;
}


// Get milestones for a phase
export async function getPhaseMilestones(phaseId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("phase_id", phaseId)
        .order("date", { ascending: true });

    return data;
}

// Get the current/active phases
export async function getActiveProjectPhases(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "in_progress")
        .order("start_date", { ascending: true });

    return data;
}

// Get completed phases
export async function getCompletedProjectPhases(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("project_phases")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "completed")
        .order("end_date", { ascending: false });

    return data;
}


// Get all project phases with their complete hierarchy
export async function getProjectPhaseTree(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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

    return data;
}

// Get basic project progress data
export async function getProjectProgress(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("project_phases")
        .select(`
      id,
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

    return data;
}

// Get a phase's progress data
export async function getPhaseProgress(phaseId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("project_phases")
        .select(`
      id,
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
        .eq("id", phaseId)
        .single();
}

// Get phase statistics
export async function getPhaseStats(phaseId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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

    return data;
}

// Get project activity/history
export async function getProjectActivity(projectId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from("activity")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

    return data;
}