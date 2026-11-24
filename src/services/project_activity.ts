import "server-only";

import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";
import type {
  ActivityLog,
  ActivityProfile,
  ProjectActivityData,
} from "@/app/management/projects/types";

const PAGE_SIZE = 100;

export type ProjectActivityResult =
  | { status: "unauthenticated" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProjectActivityData };

export async function getProjectActivity(
  projectId: string,
  page = 0,
): Promise<ProjectActivityResult> {
  if (!projectId?.trim()) {
    return {
      status: "error",
      message: "Identificador do projecto inválido.",
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: "unauthenticated" };
  }

  const safePage = Math.max(0, Math.floor(page));
  const from = safePage * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: activityData,
    error: activityError,
    count,
  } = await supabase
    .from("activity_logs")
    .select(
      `
        activity_id,
        user_id,
        project_id,
        action,
        entity_type,
        entity_id,
        description,
        metadata,
        created_at
      `,
      { count: "exact" },
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (activityError) {
    console.error("Project activity query failed:", activityError);

    return {
      status: "error",
      message: "Não foi possível carregar o histórico do projecto.",
    };
  }

  const activities = (activityData ?? []) as ActivityLog[];

  const userIds = [
    ...new Set(
      activities
        .map((activity) => activity.user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  let profiles: ActivityProfile[] = [];

  if (userIds.length > 0) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("profile_id, first_name, last_name")
      .in("profile_id", userIds);

    if (profileError) {
      console.error("Project activity profiles query failed:", profileError);
    } else {
      profiles = (profileData ?? []) as ActivityProfile[];
    }
  }

  return {
    status: "success",
    data: {
      activities,
      profiles,
      totalCount: count ?? activities.length,
    },
  };
}