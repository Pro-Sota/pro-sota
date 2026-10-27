// src/services/notifications.ts


import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  project: string;
  project_id: string | null;
  task_id: string | null;
  description: string | null;
  time: string;
  unread: boolean;
  created_at: string;
  action_url: string | null;
  metadata: Record<string, unknown>;
};

export type CreateNotificationInput = {
  recipient_id: string;
  type: NotificationType;
  title: string;
  description: string;
  project_id?: string | null;
  task_id?: string | null;
  action_url?: string | null;
  metadata?: Record<string, unknown>;
  expires_at?: string | null;
};

export type GetNotificationsOptions = {
  limit?: number;
  unreadOnly?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Supabase helper                                                            */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

/* -------------------------------------------------------------------------- */
/* Get notifications                                                          */
/* -------------------------------------------------------------------------- */

export async function getNotifications(
  options: GetNotificationsOptions = {},
): Promise<Notification[]> {
  const { supabase, user } = await getSupabase();

  if (!user) return [];

  const limit = Math.min(
    100,
    Math.max(1, Math.floor(options.limit ?? 50)),
  );

  let query = supabase
    .from("notifications")
    .select(`
      notification_id,
      project_id,
      task_id,
      type,
      title,
      description,
      is_read,
      created_at,
      action_url,
      metadata,
      expires_at,
      projects (
        project_code
      )
    `)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (options.unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Não foi possível carregar as notificações.");
  }

  return (data ?? []).map((notification) => {
    const project = Array.isArray(notification.projects)
      ? notification.projects[0]
      : notification.projects;

    return {
      id: notification.notification_id,
      type: notification.type as NotificationType,
      title: notification.title,
      project: project?.project_code ?? "Actividade geral",
      project_id: notification.project_id,
      task_id: notification.task_id,
      description: notification.description,
      time: new Date(notification.created_at).toLocaleString("pt-AO", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Luanda",
      }),
      unread: !notification.is_read,
      created_at: notification.created_at,
      action_url: notification.action_url,
      metadata:
        (notification.metadata as Record<string, unknown> | null) ?? {},
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Unread count                                                               */
/* -------------------------------------------------------------------------- */

export async function getUnreadNotificationCount(): Promise<number> {
  const { supabase, user } = await getSupabase();

  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("notification_id", {
      count: "exact",
      head: true,
    })
    .eq("recipient_id", user.id)
    .eq("is_read", false)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  if (error) {
    console.error("Error fetching unread notification count:", error);
    throw new Error("Não foi possível carregar as notificações.");
  }

  return count ?? 0;
}

/* -------------------------------------------------------------------------- */
/* Mark notification as read                                                  */
/* -------------------------------------------------------------------------- */

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  if (!notificationId) {
    throw new Error("notificationId is required.");
  }

  const { supabase, user } = await getSupabase();

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("notification_id", notificationId)
    .eq("recipient_id", user.id);

  if (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Não foi possível actualizar a notificação.");
  }
}

/* -------------------------------------------------------------------------- */
/* Mark all notifications as read                                             */
/* -------------------------------------------------------------------------- */

export async function markAllNotificationsAsRead(): Promise<void> {
  const { supabase, user } = await getSupabase();

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Não foi possível actualizar as notificações.");
  }
}

/* -------------------------------------------------------------------------- */
/* Create notification                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Use only from trusted server-side code after validating the caller's
 * permissions and the recipient's access to the related project/task.
 *
 * Do not expose this function directly to untrusted client input.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  if (!input.recipient_id) {
    throw new Error("recipient_id is required.");
  }

  if (!input.title.trim() || !input.description.trim()) {
    throw new Error("O título e a descrição são obrigatórios.");
  }

  const { supabase, user } = await getSupabase();

  if (!user) {
    throw new Error("Utilizador não autenticado.");
  }

  // Prevent this helper from being used to notify arbitrary users.
  // Extend this check through authorised server workflows when notifying
  // other team members.
  if (input.recipient_id !== user.id) {
    throw new Error(
      "Não está autorizado a criar notificações para outro utilizador.",
    );
  }

  const { error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: input.recipient_id,
      project_id: input.project_id ?? null,
      task_id: input.task_id ?? null,
      type: input.type,
      title: input.title.trim(),
      description: input.description.trim(),
      action_url: input.action_url ?? null,
      metadata: input.metadata ?? {},
      expires_at: input.expires_at ?? null,
    });

  if (error) {
    console.error("Error creating notification:", error);
    throw new Error("Não foi possível criar a notificação.");
  }
}