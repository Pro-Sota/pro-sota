
import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ActivityLog {
  activity_id: string;
  user_id: string | null;
  project_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ActivityProfile {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
}

export interface ActivityPageData {
  activities: ActivityLog[];
  profiles: ActivityProfile[];
  totalCount: number;
}

export type ActivityPageResult =
  | { authorized: false; reason: "unauthenticated" | "unauthorized" }
  | { authorized: true; data: ActivityPageData };

const ACTIVITY_HISTORY_LIMIT = 500;

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export async function getActivityPageData(): Promise<ActivityPageResult> {
  const supabase = createClient();

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

  const {
    data: { user },
    error: authError,
  } = await (await supabase).auth.getUser();

  if (authError) {
    throw new Error(
      `Não foi possível verificar a sessão: ${authError.message}`,
    );
  }

  if (!user) {
    return {
      authorized: false,
      reason: "unauthenticated",
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Authorization                                                            */
  /* ------------------------------------------------------------------------ */

  const { data: currentProfile, error: profileError } = await (await supabase)
    .from("profiles")
    .select("profile_id, role_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(
      `Não foi possível verificar as permissões: ${profileError.message}`,
    );
  }

  if (!currentProfile || currentProfile.role_id !== 1) {
    return {
      authorized: false,
      reason: "unauthorized",
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Activity logs                                                            */
  /* ------------------------------------------------------------------------ */

  const { data: activityData, error: activityError, count } = await (await supabase)
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
    .order("created_at", { ascending: false })
    .limit(ACTIVITY_HISTORY_LIMIT);

  if (activityError) {
    throw new Error(
      `Não foi possível carregar as actividades: ${activityError.message}`,
    );
  }

  const activities: ActivityLog[] = (activityData ?? []).map((row) => ({
    activity_id: row.activity_id,
    user_id: row.user_id,
    project_id: row.project_id,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    description: row.description,
    metadata:
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : null,
    created_at: row.created_at,
  }));

  /* ------------------------------------------------------------------------ */
  /* Activity authors                                                         */
  /* ------------------------------------------------------------------------ */

  const userIds = [
    ...new Set(
      activities
        .map((activity) => activity.user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  let profiles: ActivityProfile[] = [];

  if (userIds.length > 0) {
    const { data: profileData, error: authorsError } = await (await supabase)
      .from("profiles")
      .select("profile_id, first_name, last_name")
      .in("profile_id", userIds);

    if (authorsError) {
      throw new Error(
        `Não foi possível carregar os autores das actividades: ${authorsError.message}`,
      );
    }

    profiles = (profileData ?? []).map((profile) => ({
      profile_id: profile.profile_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
    }));
  }

  /* ------------------------------------------------------------------------ */
  /* Return                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    authorized: true,
    data: {
      activities,
      profiles,
      totalCount: count ?? activities.length,
    },
  };
}
