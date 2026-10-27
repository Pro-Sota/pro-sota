import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export type NotificationType =
  | "revision"
  | "deadline"
  | "approval"
  | "document"
  | "task"
  | "project"
  | "message"
  | "mention"
  | "system";

/** Shape expected by NotificationClientPage. */
export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  project: string;
  description: string;
  time: string;
  unread: boolean;
  created_at: string;
  action_url: string | null;
};

type Row = {
  notification_id: string;
  type: NotificationType;
  title: string;
  description: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  // ASSUMPTION: projects has a `name` column. Change it here if not.
  projects: { title: string | null } | { title: string | null }[] | null;
};

const rtf = new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" });

function formatRelativeTime(iso: string): string {
  const diffSeconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);

  if (abs < 60) return "agora mesmo";
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSeconds / 86400), "day");

  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function projectName(projects: Row["projects"]): string {
  const project = Array.isArray(projects) ? projects[0] : projects;
  return project?.title ?? "";
}

/** Latest notifications for the logged-in user, expired ones excluded. */
export async function getNotifications(limit = 100): Promise<NotificationItem[]> {
  const supabase = await createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("getNotifications: profile lookup failed", {
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
    });

    return [];
  }

  if (!profile) {
    console.error("getNotifications: no profile found for authenticated user");
    return [];
  }

  const safeLimit = Number.isFinite(limit)
    ? Math.min(100, Math.max(1, Math.floor(limit)))
    : 100;

  const { data, error } = await supabase
    .from("notifications")
    .select(`
    notification_id,
    type,
    title,
    description,
    action_url,
    is_read,
    created_at,
    projects!notifications_project_id_fkey (
      title
    )
  `)
    .eq("recipient_id", profile.profile_id)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("getNotifications: database query failed", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });

    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.notification_id,
    type: row.type,
    title: row.title,
    project: projectName(row.projects),
    description: row.description,
    time: formatRelativeTime(row.created_at),
    unread: !row.is_read,
    created_at: row.created_at,
    action_url: row.action_url,
  }));
}