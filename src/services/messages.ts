import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";

export interface ChatSummary {
  id: string;
  conversationType: "direct" | "project";
  displayName: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string | null;
}

export interface MessageView {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Recipient {
  profileId: string;
  name: string;
  department: string | null;
  isOnline: boolean;
}

async function getAuthenticatedClient() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("User not authenticated");
  return { supabase, user };
}

async function assertParticipant(conversationId: string, userId: string) {
  const { supabase } = await getAuthenticatedClient();
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Not a participant in this conversation");
}

export async function getOrCreateConversation(
  otherUserId: string,
): Promise<string> {
  const { supabase, user } = await getAuthenticatedClient();
  if (user.id === otherUserId)
    throw new Error("Cannot create a conversation with yourself");

  const { data: myParticipants, error: participantsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);
  if (participantsError) throw participantsError;

  const conversationIds = myParticipants.map(
    (participant) => participant.conversation_id,
  );
  if (conversationIds.length > 0) {
    const [
      { data: participants, error: participantsError },
      { data: conversations, error: conversationsError },
    ] = await Promise.all([
      supabase
        .from("conversation_participants")
        .select("conversation_id, profile_id")
        .in("conversation_id", conversationIds),
      supabase
        .from("conversations")
        .select("id, is_group")
        .in("id", conversationIds)
        .eq("conversation_type", "direct"),
    ]);
    if (participantsError) throw participantsError;
    if (conversationsError) throw conversationsError;

    const membersByConversation = new Map<string, string[]>();
    for (const participant of participants) {
      const members =
        membersByConversation.get(participant.conversation_id) ?? [];
      members.push(participant.profile_id);
      membersByConversation.set(participant.conversation_id, members);
    }

    const existingConversation = conversations.find((conversation) => {
      const members = membersByConversation.get(conversation.id) ?? [];
      return (
        !conversation.is_group &&
        members.length === 2 &&
        members.includes(user.id) &&
        members.includes(otherUserId)
      );
    });
    if (existingConversation) return existingConversation.id;
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({ is_group: false, conversation_type: "direct" })
    .select("id")
    .single();
  if (conversationError) throw conversationError;

  const { error: insertError } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: conversation.id, profile_id: user.id },
      { conversation_id: conversation.id, profile_id: otherUserId },
    ]);
  if (insertError) {
    await supabase.from("conversations").delete().eq("id", conversation.id);
    throw insertError;
  }

  revalidatePath("/management/messages");
  return conversation.id;
}

export async function getChats(
  conversationType: "direct" | "project",
): Promise<ChatSummary[]> {
  const { supabase, user } = await getAuthenticatedClient();
  const { data: participantRows, error: participantError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);
  if (participantError) throw participantError;

  const ids = participantRows.map((row) => row.conversation_id);
  if (!ids.length) return [];

  const [
    { data: conversations, error: conversationsError },
    { data: participants, error: participantsError },
    { data: messages, error: messagesError },
  ] = await Promise.all([
    supabase
      .from("conversations")
      .select("id, project_id, created_at")
      .in("id", ids)
      .eq("conversation_type", conversationType),
    supabase
      .from("conversation_participants")
      .select(
        "conversation_id, profile_id, profiles(profile_id, first_name, last_name, status)",
      )
      .in("conversation_id", ids),
    supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false }),
  ]);
  if (conversationsError) throw conversationsError;
  if (participantsError) throw participantsError;
  if (messagesError) throw messagesError;

  const projectIds = conversations.flatMap((conversation) =>
    conversation.project_id ? [conversation.project_id] : [],
  );
  const { data: projects, error: projectsError } = projectIds.length
    ? await supabase
        .from("projects")
        .select("project_id, title")
        .in("project_id", projectIds)
    : { data: [], error: null };
  if (projectsError) throw projectsError;

  const projectNames = new Map(
    projects.map((project) => [project.project_id, project.title]),
  );
  type Profile = {
    first_name: string;
    last_name: string;
    status: string | null;
  };
  type ParticipantWithProfile = {
    conversation_id: string;
    profile_id: string;
    profiles: Profile | Profile[] | null;
  };
  const participantsByConversation = new Map<
    string,
    ParticipantWithProfile[]
  >();
  for (const participant of participants as ParticipantWithProfile[]) {
    const list =
      participantsByConversation.get(participant.conversation_id) ?? [];
    list.push(participant);
    participantsByConversation.set(participant.conversation_id, list);
  }

  const latestMessageByConversation = new Map<
    string,
    { content: string; created_at: string | null }
  >();
  for (const message of messages) {
    if (
      message.conversation_id &&
      !latestMessageByConversation.has(message.conversation_id)
    ) {
      latestMessageByConversation.set(message.conversation_id, message);
    }
  }

  return conversations
    .map((conversation) => {
      const otherParticipant = (
        participantsByConversation.get(conversation.id) ?? []
      ).find((participant) => participant.profile_id !== user.id);
      const latestMessage = latestMessageByConversation.get(conversation.id);
      const otherProfile = Array.isArray(otherParticipant?.profiles)
        ? otherParticipant.profiles[0]
        : otherParticipant?.profiles;
      const otherName = otherProfile
        ? `${otherProfile.first_name} ${otherProfile.last_name}`.trim()
        : "Conversa direta";

      return {
        id: conversation.id,
        conversationType,
        displayName:
          conversationType === "project"
            ? (projectNames.get(conversation.project_id ?? "") ??
              "Projeto sem nome")
            : otherName,
        isOnline: otherProfile?.status === "Active",
        unreadCount: 0,
        lastMessage: latestMessage?.content ?? "",
        lastMessageAt: latestMessage?.created_at ?? conversation.created_at,
      };
    })
    .sort((a, b) =>
      (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""),
    );
}

export async function getMessages(
  conversationId: string,
): Promise<MessageView[]> {
  const { supabase, user } = await getAuthenticatedClient();
  await assertParticipant(conversationId, user.id);
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, content, sender_id, created_at, profiles!messages_sender_id_fkey(first_name, last_name)",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  return data.map((message) => {
    const profileRelation = message.profiles as unknown as
      | { first_name: string; last_name: string }
      | Array<{ first_name: string; last_name: string }>
      | null;
    const sender = Array.isArray(profileRelation)
      ? profileRelation[0]
      : profileRelation;
    return {
      id: message.id,
      content: message.content,
      senderId: message.sender_id ?? "",
      senderName: sender
        ? `${sender.first_name} ${sender.last_name}`.trim()
        : "Utilizador desconhecido",
      timestamp: message.created_at ?? new Date(0).toISOString(),
      isOwn: message.sender_id === user.id,
    };
  });
}

export async function sendMessage(conversationId: string, content: string) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message cannot be empty");
  }

  if (trimmedContent.length > 4_000) {
    throw new Error("Message is too long");
  }

  const { supabase, user } = await getAuthenticatedClient();
  await assertParticipant(conversationId, user.id);

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmedContent,
    })
    .select("id, content, sender_id, created_at")
    .single();

  if (error) throw error;

  revalidatePath("/management/messages");
  return data;
}

export async function getMessageRecipients(): Promise<Recipient[]> {
  const { supabase, user } = await getAuthenticatedClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("profile_id, first_name, last_name, department, status")
    .neq("profile_id", user.id)
    .order("first_name");

  if (error) throw error;

  return data.map((profile) => ({
    profileId: profile.profile_id,
    name: `${profile.first_name} ${profile.last_name}`.trim(),
    department: profile.department,
    isOnline: profile.status === "Active",
  }));
}
