import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

export async function getOrCreateConversation(
  otherUserId: string
): Promise<string> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("User not authenticated");

  const currentUserId = user.id;

  if (currentUserId === otherUserId) {
    throw new Error("Cannot create a conversation with yourself");
  }

  // 1. Get my conversations
  const { data: myParticipants, error: myParticipantsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", currentUserId);

  if (myParticipantsError) throw myParticipantsError;

  const conversationIds = myParticipants.map((p) => p.conversation_id);

  if (conversationIds.length) {
    // 2. Fetch conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select("id, is_group")
      .in("id", conversationIds);

    if (conversationsError) throw conversationsError;

    // 3. Fetch all participants
    const { data: participants, error: participantsError } = await supabase
      .from("conversation_participants")
      .select("conversation_id, profile_id")
      .in("conversation_id", conversationIds);

    if (participantsError) throw participantsError;

    const grouped = new Map<string, string[]>();

    for (const participant of participants) {
      const list = grouped.get(participant.conversation_id) ?? [];
      list.push(participant.profile_id);
      grouped.set(participant.conversation_id, list);
    }

    for (const conversation of conversations) {
      if (conversation.is_group) continue;

      const members = grouped.get(conversation.id) ?? [];

      if (
        members.length === 2 &&
        members.includes(currentUserId) &&
        members.includes(otherUserId)
      ) {
        return conversation.id;
      }
    }
  }

  // 4. Create conversation
  const { data: conversation, error: createConversationError } = await supabase
    .from("conversations")
    .insert({ is_group: false })
    .select("id")
    .single();

  if (createConversationError) throw createConversationError;

  // 5. Add participants
  const { error: insertParticipantsError } = await supabase
    .from("conversation_participants")
    .insert([
      {
        conversation_id: conversation.id,
        profile_id: currentUserId,
      },
      {
        conversation_id: conversation.id,
        profile_id: otherUserId,
      },
    ]);

  if (insertParticipantsError) {
    await supabase
      .from("conversations")
      .delete()
      .eq("id", conversation.id);

    throw insertParticipantsError;
  }

  return conversation.id;
}


export async function getChats(conversationType: string) {

    const cookiesStore = await cookies();
    const supabase = createClient(cookiesStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User is not authenticated.");
    }

    const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("profile_id", user.id)
        .eq("conversation_type", conversationType)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data ?? [];
}