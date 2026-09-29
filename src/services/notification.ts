// services/notifications.ts

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type NotificationType =
  | "revision"
  | "deadline"
  | "approval"
  | "document"
  | string;

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  project: string;
  description: string | null;
  time: string;
  unread: boolean;
  created_at: string;
  action_url: string | null;
};

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export async function getNotifications(): Promise<Notification[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  /* ------------------------------------------------------------------------ */
  /* Auth                                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  /* ------------------------------------------------------------------------ */
  /* Notifications                                                             */
  /* ------------------------------------------------------------------------ */

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
        notification_id,
        type,
        title,
        description,
        is_read,
        created_at,
        action_url,
        projects (
          project_id,
          title
        )
      `,
    )
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  /* ------------------------------------------------------------------------ */
  /* Transform                                                                */
  /* ------------------------------------------------------------------------ */

  return (data ?? []).map((notification) => {
    const project = Array.isArray(notification.projects)
      ? notification.projects[0]
      : notification.projects;

    return {
      id: notification.notification_id,
      type: notification.type,
      title: notification.title,
      project: project?.title ?? "Actividade geral",
      description: notification.description ?? null,
      time: new Date(notification.created_at).toLocaleString("pt-AO", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      unread: !notification.is_read,
      created_at: notification.created_at,
      action_url: notification.action_url ?? null,
    };
  });
}