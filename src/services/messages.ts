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

interface Profile {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
  department?: string | null;
  status?: string | null;
}

async function getAuthenticatedClient() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Authentication error: ${error.message}`);
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  return { supabase, user };
}

async function assertParticipant(
  conversationId: string,
  userId: string,
) {
  const { supabase } = await getAuthenticatedClient();

  const { data, error } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Participant verification failed: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error("Not a participant in this conversation");
  }
}

/**
 * Creates a direct conversation if one does not already exist.
 */
export async function getOrCreateConversation(
  otherUserId: string,
): Promise<string> {
  const { supabase, user } = await getAuthenticatedClient();

  if (user.id === otherUserId) {
    throw new Error("Cannot create a conversation with yourself");
  }

  // Find all conversations where the current user participates.
  const {
    data: myParticipants,
    error: participantsError,
  } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);

  if (participantsError) {
    throw new Error(
      `Failed to load conversations: ${participantsError.message}`,
    );
  }

  const conversationIds =
    myParticipants?.map(
      (participant) => participant.conversation_id,
    ) ?? [];

  // Check whether a direct conversation already exists.
  if (conversationIds.length > 0) {
    const [
      { data: participants, error: allParticipantsError },
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

    if (allParticipantsError) {
      throw new Error(
        `Failed to load conversation participants: ${allParticipantsError.message}`,
      );
    }

    if (conversationsError) {
      throw new Error(
        `Failed to load conversations: ${conversationsError.message}`,
      );
    }

    const membersByConversation = new Map<string, string[]>();

    for (const participant of participants ?? []) {
      const members =
        membersByConversation.get(participant.conversation_id) ?? [];

      members.push(participant.profile_id);

      membersByConversation.set(
        participant.conversation_id,
        members,
      );
    }

    const existingConversation = (conversations ?? []).find(
      (conversation) => {
        const members =
          membersByConversation.get(conversation.id) ?? [];

        return (
          !conversation.is_group &&
          members.length === 2 &&
          members.includes(user.id) &&
          members.includes(otherUserId)
        );
      },
    );

    if (existingConversation) {
      return existingConversation.id;
    }
  }

  // Create the conversation.
  const {
    data: conversation,
    error: conversationError,
  } = await supabase
    .from("conversations")
    .insert({
      is_group: false,
      conversation_type: "direct",
    })
    .select("id")
    .single();

  if (conversationError || !conversation) {
    throw new Error(
      `Failed to create conversation: ${
        conversationError?.message ?? "Unknown error"
      }`,
    );
  }

  // Add both users as participants.
  const { error: insertError } = await supabase
    .from("conversation_participants")
    .insert([
      {
        conversation_id: conversation.id,
        profile_id: user.id,
      },
      {
        conversation_id: conversation.id,
        profile_id: otherUserId,
      },
    ]);

  if (insertError) {
    // Roll back conversation when participants cannot be created.
    await supabase
      .from("conversations")
      .delete()
      .eq("id", conversation.id);

    throw new Error(
      `Failed to add conversation participants: ${insertError.message}`,
    );
  }

  revalidatePath("/management/messages");

  return conversation.id;
}

/**
 * Loads conversations for the current authenticated user.
 *
 * This intentionally avoids Supabase nested profile relationships.
 */
export async function getChats(
  conversationType: "direct" | "project",
): Promise<ChatSummary[]> {
  const { supabase, user } = await getAuthenticatedClient();

  // 1. Find conversations where the user participates.
  const {
    data: participantRows,
    error: participantError,
  } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);

  if (participantError) {
    throw new Error(
      `Failed to load user conversations: ${participantError.message}`,
    );
  }

  const ids =
    participantRows?.map((row) => row.conversation_id) ?? [];

  if (!ids.length) {
    return [];
  }

  // 2. Load conversations, participants and messages independently.
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
      .select("conversation_id, profile_id")
      .in("conversation_id", ids),

    supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false }),
  ]);

  if (conversationsError) {
    throw new Error(
      `Failed to load conversations: ${conversationsError.message}`,
    );
  }

  if (participantsError) {
    throw new Error(
      `Failed to load participants: ${participantsError.message}`,
    );
  }

  if (messagesError) {
    throw new Error(
      `Failed to load messages: ${messagesError.message}`,
    );
  }

  const conversationList = conversations ?? [];
  const participantList = participants ?? [];
  const messageList = messages ?? [];

  // 3. Collect profile IDs.
  const profileIds = [
    ...new Set(
      participantList
        .map((participant) => participant.profile_id)
        .filter(Boolean),
    ),
  ];

  // 4. Load profiles independently.
  const profilesById = new Map<string, Profile>();

  if (profileIds.length > 0) {
    const {
      data: profiles,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select(
        "profile_id, first_name, last_name, department, status",
      )
      .in("profile_id", profileIds);

    if (profilesError) {
      throw new Error(
        `Failed to load profiles: ${profilesError.message}`,
      );
    }

    for (const profile of profiles ?? []) {
      profilesById.set(profile.profile_id, profile);
    }
  }

  // 5. Load project names when necessary.
  const projectIds = conversationList.flatMap((conversation) =>
    conversation.project_id
      ? [conversation.project_id]
      : [],
  );

  const projectNames = new Map<string, string>();

  if (projectIds.length > 0) {
    const {
      data: projects,
      error: projectsError,
    } = await supabase
      .from("projects")
      .select("project_id, title")
      .in("project_id", projectIds);

    if (projectsError) {
      throw new Error(
        `Failed to load projects: ${projectsError.message}`,
      );
    }

    for (const project of projects ?? []) {
      projectNames.set(
        project.project_id,
        project.title,
      );
    }
  }

  // 6. Group participants by conversation.
  const participantsByConversation = new Map<
    string,
    string[]
  >();

  for (const participant of participantList) {
    const list =
      participantsByConversation.get(
        participant.conversation_id,
      ) ?? [];

    list.push(participant.profile_id);

    participantsByConversation.set(
      participant.conversation_id,
      list,
    );
  }

  // 7. Find latest message for each conversation.
  const latestMessageByConversation = new Map<
    string,
    {
      content: string;
      created_at: string | null;
    }
  >();

  for (const message of messageList) {
    if (
      message.conversation_id &&
      !latestMessageByConversation.has(
        message.conversation_id,
      )
    ) {
      latestMessageByConversation.set(
        message.conversation_id,
        {
          content: message.content,
          created_at: message.created_at,
        },
      );
    }
  }

  // 8. Build final chat summaries.
  return conversationList
    .map((conversation) => {
      const conversationParticipants =
        participantsByConversation.get(conversation.id) ?? [];

      const otherParticipantId =
        conversationParticipants.find(
          (profileId) => profileId !== user.id,
        );

      const otherProfile = otherParticipantId
        ? profilesById.get(otherParticipantId)
        : undefined;

      const latestMessage =
        latestMessageByConversation.get(conversation.id);

      const firstName =
        otherProfile?.first_name?.trim() ?? "";

      const lastName =
        otherProfile?.last_name?.trim() ?? "";

      const otherName =
        `${firstName} ${lastName}`.trim() ||
        "Conversa direta";

      return {
        id: conversation.id,
        conversationType,
        displayName:
          conversationType === "project"
            ? projectNames.get(
                conversation.project_id ?? "",
              ) ?? "Projeto sem nome"
            : otherName,
        isOnline:
          otherProfile?.status === "Active",
        unreadCount: 0,
        lastMessage:
          latestMessage?.content ?? "",
        lastMessageAt:
          latestMessage?.created_at ??
          conversation.created_at,
      };
    })
    .sort((a, b) =>
      (b.lastMessageAt ?? "").localeCompare(
        a.lastMessageAt ?? "",
      ),
    );
}

/**
 * Loads messages for one conversation.
 *
 * Profile information is loaded separately instead of using
 * profiles!messages_sender_id_fkey.
 */
export async function getMessages(
  conversationId: string,
): Promise<MessageView[]> {
  const { supabase, user } =
    await getAuthenticatedClient();

  await assertParticipant(
    conversationId,
    user.id,
  );

  const {
    data: messages,
    error,
  } = await supabase
    .from("messages")
    .select(
      "id, content, sender_id, created_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load messages: ${error.message}`,
    );
  }

  const messageList = messages ?? [];

  // Collect sender IDs.
  const senderIds = [
    ...new Set(
      messageList
        .map((message) => message.sender_id)
        .filter(Boolean),
    ),
  ];

  // Load sender profiles separately.
  const profilesById = new Map<string, Profile>();

  if (senderIds.length > 0) {
    const {
      data: profiles,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select(
        "profile_id, first_name, last_name, department, status",
      )
      .in("profile_id", senderIds);

    if (profilesError) {
      throw new Error(
        `Failed to load sender profiles: ${profilesError.message}`,
      );
    }

    for (const profile of profiles ?? []) {
      profilesById.set(
        profile.profile_id,
        profile,
      );
    }
  }

  return messageList.map((message) => {
    const sender = message.sender_id
      ? profilesById.get(message.sender_id)
      : undefined;

    const senderName = sender
      ? `${sender.first_name ?? ""} ${
          sender.last_name ?? ""
        }`.trim()
      : "Utilizador desconhecido";

    return {
      id: message.id,
      content: message.content,
      senderId: message.sender_id ?? "",
      senderName,
      timestamp:
        message.created_at ??
        new Date(0).toISOString(),
      isOwn:
        message.sender_id === user.id,
    };
  });
}

/**
 * Sends a message.
 */
export async function sendMessage(
  conversationId: string,
  content: string,
) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message cannot be empty");
  }

  if (trimmedContent.length > 4_000) {
    throw new Error("Message is too long");
  }

  const { supabase, user } =
    await getAuthenticatedClient();

  await assertParticipant(
    conversationId,
    user.id,
  );

  const {
    data,
    error,
  } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmedContent,
    })
    .select(
      "id, content, sender_id, created_at",
    )
    .single();

  if (error) {
    throw new Error(
      `Failed to send message: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Message was inserted but no data was returned",
    );
  }

  revalidatePath("/management/messages");

  return data;
}

/**
 * Loads users that can receive a direct message.
 */
export async function getMessageRecipients(): Promise<
  Recipient[]
> {
  const { supabase, user } =
    await getAuthenticatedClient();

  const {
    data,
    error,
  } = await supabase
    .from("profiles")
    .select(
      "profile_id, first_name, last_name, department, status",
    )
    .neq("profile_id", user.id)
    .order("first_name");

  if (error) {
    throw new Error(
      `Failed to load message recipients: ${error.message}`,
    );
  }

  return (data ?? []).map((profile) => ({
    profileId: profile.profile_id,
    name: `${profile.first_name ?? ""} ${
      profile.last_name ?? ""
    }`.trim() || "Utilizador",
    department: profile.department ?? null,
    isOnline:
      profile.status === "Active",
  }));
}
