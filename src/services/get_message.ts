import { createClient } from "@/app/lib/supabase/client";
import { MessageView } from "./messages";

export async function getMessage(
  messageId: string,
): Promise<MessageView | null> {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      sender_id,
      created_at,
      profiles:sender_id (
        first_name,
        last_name
      )
    `)
    .eq("id", messageId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const profile = Array.isArray(data.profiles)
    ? data.profiles[0]
    : data.profiles;

  const senderName =
    `${profile?.first_name ?? ""} ${
      profile?.last_name ?? ""
    }`.trim() || "Utilizador";

  return {
    id: data.id,
    content: data.content ?? "",
    senderId: data.sender_id ?? "",
    senderName,
    timestamp:
      data.created_at ??
      new Date().toISOString(),
    isOwn: false,
  };
}