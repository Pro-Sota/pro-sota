// services/notification_actions.ts

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export type CreateNotificationInput = {
  recipient_id: string;
  type: "revision" | "deadline" | "approval" | "document";
  title: string;
  description?: string | null;
  action_url?: string | null;
  project_id?: string | null;
};

export async function createNotification(
  input: CreateNotificationInput,
) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: input.recipient_id,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      action_url: input.action_url ?? null,
      project_id: input.project_id ?? null,
      is_read: false,
    })
    .select(
      `
        notification_id,
        recipient_id,
        type,
        title,
        description,
        is_read,
        created_at,
        action_url,
        project_id
      `,
    )
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    throw new Error("Não foi possível criar a notificação.");
  }

  return data;
}