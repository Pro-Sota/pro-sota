"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

type PhaseStatus =
  | "not_started"
  | "in_progress"
  | "completed";

type PhasePayload = {
  project_id: string;
  name: string;
  description: string | null;
  status: PhaseStatus;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  sort_order: number | null;
};

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function savePhase(
  phaseId: string | null,
  payload: PhasePayload
) {
  const supabase = await getSupabase();

  if (phaseId) {
    const { data, error } = await supabase
      .from("project_phases")
      .update({
        name: payload.name,
        description: payload.description,
        status: payload.status,
        planned_start: payload.planned_start,
        planned_end: payload.planned_end,
        actual_start: payload.actual_start,
        actual_end: payload.actual_end,
        sort_order: payload.sort_order,
      })
      .eq("phase_id", phaseId)
      .eq("project_id", payload.project_id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(
      `/management/projects/${payload.project_id}/phases/${phaseId}`
    );

    revalidatePath(
      `/management/projects/${payload.project_id}/phases`
    );

    return data;
  }

  const { data, error } = await supabase
    .from("project_phases")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/management/projects/${payload.project_id}/phases`
  );

  return data;
}


export async function createPhase(payload: {
  project_id: string;
  name: string;
  description: string | null;
  planned_start: string | null;
  planned_end: string | null;
  sort_order: number;
}) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("project_phases")
    .insert({
      project_id: payload.project_id,
      name: payload.name,
      description: payload.description,
      status: "not_started",
      planned_start: payload.planned_start,
      planned_end: payload.planned_end,
      sort_order: payload.sort_order,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    `/management/projects/${payload.project_id}/phases`
  );

  return data;
}