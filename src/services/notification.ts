// services/notifications.ts

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function getNotifications() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select(`
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
    `)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return (data ?? []).map((notification) => ({
    id: notification.notification_id,
    type: notification.type,
    title: notification.title,
    project:
      notification.projects?.title ?? "Actividade geral",
    description: notification.description,
    time: new Date(notification.created_at).toLocaleString("pt-AO"),
    unread: !notification.is_read,
    created_at: notification.created_at,
    action_url: notification.action_url,
  }));
}