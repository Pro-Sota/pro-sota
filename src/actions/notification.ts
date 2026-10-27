"use server";

import { revalidatePath } from "next/cache";

// ASSUMPTION: server-side Supabase helper lives next to your client one.
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

type ActionResult = { success: boolean; message: string };

const NOTIFICATIONS_PATH = "/management/notifications";

async function getAuthenticated() {
  const supabase = await createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

/** Marks one notification as read (read_at is filled by a DB trigger). */
export async function markNotificationReadAction(
  notificationId: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticated();

  if (!user) {
    return { success: false, message: "Sessão expirada. Inicie sessão novamente." };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("notification_id", notificationId)
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("markNotificationReadAction:", error);
    return { success: false, message: "Não foi possível marcar como lida." };
  }

  revalidatePath(NOTIFICATIONS_PATH);
  return { success: true, message: "Notificação marcada como lida." };
}

/** Marks every unread notification of the current user as read. */
export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticated();

  if (!user) {
    return { success: false, message: "Sessão expirada. Inicie sessão novamente." };
  }

  const { error } = await supabase.rpc("mark_notifications_read", {
    p_type: null,
  });

  if (error) {
    console.error("markAllNotificationsReadAction:", error);
    return { success: false, message: "Não foi possível marcar tudo como lido." };
  }

  revalidatePath(NOTIFICATIONS_PATH);
  return { success: true, message: "Todas as notificações foram marcadas como lidas." };
}

/**
 * Call when a conversation is opened: marks its incoming messages as read
 * (messages.read_at) and clears its message notifications.
 */
export async function markConversationReadAction(
  conversationId: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticated();

  if (!user) {
    return { success: false, message: "Sessão expirada. Inicie sessão novamente." };
  }

  const { error } = await supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId,
  });

  if (error) {
    console.error("markConversationReadAction:", error);
    return { success: false, message: "Não foi possível actualizar a conversa." };
  }

  return { success: true, message: "Conversa marcada como lida." };
}