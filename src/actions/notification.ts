
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

type ActionResult = {
  success: boolean;
  message: string;
};

const NOTIFICATIONS_PATH = "/management/notifications";
const MESSAGES_PATH = "/management/messages";

async function getAuthenticated() {
  const supabase = await createClient(await cookies());

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

/**
 * Mark one notification as read.
 */
export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticated();

  if (!user) {
    return {
      success: false,
      message: "Sessão expirada. Inicie sessão novamente.",
    };
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("notification_id", notificationId)
    .eq("recipient_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("markNotificationReadAction:", error);

    return {
      success: false,
      message: "Não foi possível marcar como lida.",
    };
  }

  revalidatePath(NOTIFICATIONS_PATH);

  return {
    success: true,
    message: "Notificação marcada como lida.",
  };
}

/**
 * Mark all unread notifications as read.
 */
export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticated();

  if (!user) {
    return {
      success: false,
      message: "Sessão expirada. Inicie sessão novamente.",
    };
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
    console.error("markAllNotificationsReadAction:", error);

    return {
      success: false,
      message: "Não foi possível marcar tudo como lido.",
    };
  }

  revalidatePath(NOTIFICATIONS_PATH);

  return {
    success: true,
    message: "Todas as notificações foram marcadas como lidas.",
  };
}

/**
 * Mark incoming messages and conversation notifications as read.
 * The RPC must enforce that the authenticated user is a participant.
 */
export async function markConversationReadAction(
  conversationId: string
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticated();

  if (!user) {
    return {
      success: false,
      message: "Sessão expirada. Inicie sessão novamente.",
    };
  }

  const { error } = await supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId,
  });

  if (error) {
    console.error("markConversationReadAction:", error);

    return {
      success: false,
      message: "Não foi possível actualizar a conversa.",
    };
  }

  revalidatePath(NOTIFICATIONS_PATH);
  revalidatePath(MESSAGES_PATH);

  return {
    success: true,
    message: "Conversa marcada como lida.",
  };
}
