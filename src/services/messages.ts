import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

export interface ChatSummary {
  id: string;
  conversationType: "direct" | "project";
  projectId: string | null;
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

interface ProfilePreview {
  profile_id: string;
  first_name: string | null;
  last_name: string | null;
  status: string | null;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateId(value: string, label: string) {
  if (
    !value ||
    value === "undefined" ||
    value === "null"
  ) {
    throw new Error(`${label} is required`);
  }

  if (!UUID_REGEX.test(value)) {
    throw new Error(
      `Invalid ${label.toLowerCase()} format: ${value}`,
    );
  }

  return value;
}

async function getAuthenticatedClient() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(
      `Authentication error: ${error.message}`,
    );
  }

  if (!user) {
    throw new Error("User not authenticated");
  }

  return {
    supabase,
    user,
  };
}

async function assertParticipant(
  supabase: Awaited<
    ReturnType<typeof getAuthenticatedClient>
  >["supabase"],
  conversationId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Participant verification failed: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "Not a participant in this conversation",
    );
  }
}

/**
 * Finds an existing direct conversation between the
 * authenticated user and another user, or creates one.
 *
 * The lookup intentionally avoids loading every participant
 * from every direct conversation.
 */
export async function getOrCreateConversation(
  otherUserId: string,
): Promise<string> {
  validateId(otherUserId, "User ID");

  const { supabase, user } =
    await getAuthenticatedClient();

  if (user.id === otherUserId) {
    throw new Error(
      "Cannot create a conversation with yourself",
    );
  }

  /*
   * First get only the current user's direct conversations.
   */
  const {
    data: ownConversations,
    error: ownConversationsError,
  } = await supabase
    .from("conversation_participants")
    .select(
      `
        conversation_id,
        conversations!inner(
          id,
          conversation_type
        )
      `,
    )
    .eq("profile_id", user.id)
    .eq(
      "conversations.conversation_type",
      "direct",
    );

  if (ownConversationsError) {
    throw new Error(
      `Failed to load conversations: ${ownConversationsError.message}`,
    );
  }

  const conversationIds =
    ownConversations
      ?.map(
        (conversation) =>
          conversation.conversation_id,
      )
      .filter(Boolean) ?? [];

  /*
   * If the user has direct conversations, only search
   * for the selected person inside those conversations.
   *
   * This is substantially cheaper than loading all
   * participants for every conversation.
   */
  if (conversationIds.length > 0) {
    const {
      data: matchingParticipants,
      error: matchingParticipantsError,
    } = await supabase
      .from("conversation_participants")
      .select(
        "conversation_id, profile_id",
      )
      .in(
        "conversation_id",
        conversationIds,
      )
      .in("profile_id", [
        user.id,
        otherUserId,
      ]);

    if (matchingParticipantsError) {
      throw new Error(
        `Failed to find existing conversation: ${matchingParticipantsError.message}`,
      );
    }

    const participantCounts =
      new Map<string, Set<string>>();

    for (const participant of
      matchingParticipants ?? []) {
      const members =
        participantCounts.get(
          participant.conversation_id,
        ) ?? new Set<string>();

      members.add(participant.profile_id);

      participantCounts.set(
        participant.conversation_id,
        members,
      );
    }

    for (const [
      conversationId,
      members,
    ] of participantCounts) {
      if (
        members.size === 2 &&
        members.has(user.id) &&
        members.has(otherUserId)
      ) {
        return conversationId;
      }
    }
  }

  /*
   * No existing conversation was found.
   */
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

  if (
    conversationError ||
    !conversation
  ) {
    throw new Error(
      `Failed to create conversation: ${
        conversationError?.message ??
        "Unknown error"
      }`,
    );
  }

  const { error: insertError } =
    await supabase
      .from("conversation_participants")
      .insert([
        {
          conversation_id:
            conversation.id,
          profile_id: user.id,
        },
        {
          conversation_id:
            conversation.id,
          profile_id: otherUserId,
        },
      ]);

  if (insertError) {
    await supabase
      .from("conversations")
      .delete()
      .eq(
        "id",
        conversation.id,
      );

    throw new Error(
      `Failed to add conversation participants: ${insertError.message}`,
    );
  }

  return conversation.id;
}

export interface GetChatsOptions {
  conversationType: "direct" | "project";
  limit?: number;
  cursor?: string;
}

export async function getChats(
  options: GetChatsOptions,
): Promise<ChatSummary[]> {
  const { supabase, user } =
    await getAuthenticatedClient();

  const {
    conversationType,
    limit = 20,
  } = options;

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
    participantRows
      ?.map(
        (row) => row.conversation_id,
      )
      .filter(Boolean) ?? [];

  if (ids.length === 0) {
    return [];
  }

  /*
   * Load conversations and participants in parallel.
   */
  const [
    {
      data: conversations,
      error: conversationsError,
    },
    {
      data: participants,
      error: participantsError,
    },
  ] = await Promise.all([
    supabase
      .from("conversations")
      .select(
        "id, project_id, created_at",
      )
      .in("id", ids)
      .eq(
        "conversation_type",
        conversationType,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(limit),

    supabase
      .from("conversation_participants")
      .select(
        "conversation_id, profile_id",
      )
      .in("conversation_id", ids),
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

  const conversationList =
    conversations ?? [];

  if (conversationList.length === 0) {
    return [];
  }

  const participantList =
    participants ?? [];

  const conversationIds =
    conversationList.map(
      (conversation) =>
        conversation.id,
    );

  /*
   * Load messages and profiles in parallel.
   */
  const profileIds = [
    ...new Set(
      participantList
        .map(
          (participant) =>
            participant.profile_id,
        )
        .filter(Boolean),
    ),
  ];

  const projectIds = [
    ...new Set(
      conversationList
        .map(
          (conversation) =>
            conversation.project_id,
        )
        .filter(
          (
            projectId,
          ): projectId is string =>
            Boolean(projectId),
        ),
    ),
  ];

  const [
    {
      data: messages,
      error: messagesError,
    },
    {
      data: profiles,
      error: profilesError,
    },
    {
      data: projects,
      error: projectsError,
    },
  ] = await Promise.all([
    supabase
      .from("messages")
      .select(
        "conversation_id, content, created_at",
      )
      .in(
        "conversation_id",
        conversationIds,
      )
      .order("created_at", {
        ascending: false,
      }),

    profileIds.length > 0
      ? supabase
          .from("profiles")
          .select(
            "profile_id, first_name, last_name, status",
          )
          .in(
            "profile_id",
            profileIds,
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),

    projectIds.length > 0
      ? supabase
          .from("projects")
          .select(
            "project_id, title",
          )
          .in(
            "project_id",
            projectIds,
          )
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  if (messagesError) {
    throw new Error(
      `Failed to load messages: ${messagesError.message}`,
    );
  }

  if (profilesError) {
    throw new Error(
      `Failed to load profiles: ${profilesError.message}`,
    );
  }

  if (projectsError) {
    throw new Error(
      `Failed to load projects: ${projectsError.message}`,
    );
  }

  const latestMessages =
    new Map<
      string,
      {
        content: string;
        created_at: string | null;
      }
    >();

  for (const message of messages ?? []) {
    if (
      message.conversation_id &&
      !latestMessages.has(
        message.conversation_id,
      )
    ) {
      latestMessages.set(
        message.conversation_id,
        {
          content:
            message.content ?? "",
          created_at:
            message.created_at,
        },
      );
    }
  }

  const profilesById =
    new Map<
      string,
      ProfilePreview
    >();

  for (const profile of profiles ?? []) {
    profilesById.set(
      profile.profile_id,
      profile,
    );
  }

  const projectNames =
    new Map<string, string>();

  for (const project of projects ?? []) {
    projectNames.set(
      project.project_id,
      project.title,
    );
  }

  const participantsByConversation =
    new Map<string, string[]>();

  for (const participant of participantList) {
    const list =
      participantsByConversation.get(
        participant.conversation_id,
      ) ?? [];

    list.push(
      participant.profile_id,
    );

    participantsByConversation.set(
      participant.conversation_id,
      list,
    );
  }

  return conversationList
    .map((conversation) => {
      const conversationParticipants =
        participantsByConversation.get(
          conversation.id,
        ) ?? [];

      const otherParticipantId =
        conversationParticipants.find(
          (profileId) =>
            profileId !== user.id,
        );

      const otherProfile =
        otherParticipantId
          ? profilesById.get(
              otherParticipantId,
            )
          : undefined;

      const latestMessage =
        latestMessages.get(
          conversation.id,
        );

      const firstName =
        otherProfile?.first_name?.trim() ??
        "";

      const lastName =
        otherProfile?.last_name?.trim() ??
        "";

      const otherName =
        `${firstName} ${lastName}`.trim() ||
        "Conversa direta";

      return {
        id: conversation.id,
        conversationType,
        projectId:
          conversation.project_id ??
          null,
        displayName:
          conversationType === "project"
            ? projectNames.get(
                conversation.project_id ??
                  "",
              ) ??
              "Projeto sem nome"
            : otherName,
        isOnline:
          otherProfile?.status ===
          "Active",
        unreadCount: 0,
        lastMessage:
          latestMessage?.content ??
          "",
        lastMessageAt:
          latestMessage?.created_at ??
          conversation.created_at,
      };
    })
    .sort((a, b) => {
      const dateA = a.lastMessageAt
        ? new Date(
            a.lastMessageAt,
          ).getTime()
        : 0;

      const dateB = b.lastMessageAt
        ? new Date(
            b.lastMessageAt,
          ).getTime()
        : 0;

      return dateB - dateA;
    });
}

export async function getConversation(
  conversationId: string,
): Promise<ChatSummary | null> {
  validateId(
    conversationId,
    "Conversation ID",
  );

  const { supabase, user } =
    await getAuthenticatedClient();

  /*
   * Verify access and load the conversation
   * at the same time.
   */
  const [
    {
      data: participant,
      error: participantError,
    },
    {
      data: conversation,
      error: conversationError,
    },
  ] = await Promise.all([
    supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq(
        "conversation_id",
        conversationId,
      )
      .eq("profile_id", user.id)
      .maybeSingle(),

    supabase
      .from("conversations")
      .select(
        "id, project_id, conversation_type, created_at",
      )
      .eq("id", conversationId)
      .maybeSingle(),
  ]);

  if (participantError) {
    throw new Error(
      `Failed to verify conversation access: ${participantError.message}`,
    );
  }

  if (!participant) {
    return null;
  }

  if (conversationError) {
    throw new Error(
      `Failed to load conversation: ${conversationError.message}`,
    );
  }

  if (!conversation) {
    return null;
  }

  /*
   * Participants and latest message are independent.
   */
  const [
    {
      data: participants,
      error: participantsError,
    },
    {
      data: latestMessage,
      error: latestMessageError,
    },
  ] = await Promise.all([
    supabase
      .from("conversation_participants")
      .select("profile_id")
      .eq(
        "conversation_id",
        conversationId,
      ),

    supabase
      .from("messages")
      .select(
        "content, created_at",
      )
      .eq(
        "conversation_id",
        conversationId,
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),
  ]);

  if (participantsError) {
    throw new Error(
      `Failed to load conversation participants: ${participantsError.message}`,
    );
  }

  if (latestMessageError) {
    throw new Error(
      `Failed to load latest conversation message: ${latestMessageError.message}`,
    );
  }

  const participantIds =
    participants?.map(
      (item) => item.profile_id,
    ) ?? [];

  const otherParticipantId =
    participantIds.find(
      (profileId) =>
        profileId !== user.id,
    );

  let displayName = "Conversa direta";
  let isOnline = false;

  if (
    conversation.conversation_type ===
    "project"
  ) {
    if (conversation.project_id) {
      const {
        data: project,
        error: projectError,
      } = await supabase
        .from("projects")
        .select(
          "project_id, title",
        )
        .eq(
          "project_id",
          conversation.project_id,
        )
        .maybeSingle();

      if (projectError) {
        throw new Error(
          `Failed to load conversation project: ${projectError.message}`,
        );
      }

      displayName =
        project?.title ??
        "Projeto sem nome";
    } else {
      displayName =
        "Projeto sem nome";
    }
  } else if (otherParticipantId) {
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "profile_id, first_name, last_name, status",
      )
      .eq(
        "profile_id",
        otherParticipantId,
      )
      .maybeSingle();

    if (profileError) {
      throw new Error(
        `Failed to load conversation profile: ${profileError.message}`,
      );
    }

    const firstName =
      profile?.first_name?.trim() ??
      "";

    const lastName =
      profile?.last_name?.trim() ??
      "";

    displayName =
      `${firstName} ${lastName}`.trim() ||
      "Conversa direta";

    isOnline =
      profile?.status === "Active";
  }

  return {
    id: conversation.id,
    conversationType:
      conversation.conversation_type ===
      "project"
        ? "project"
        : "direct",
    projectId:
      conversation.project_id ?? null,
    displayName,
    isOnline,
    unreadCount: 0,
    lastMessage:
      latestMessage?.content ?? "",
    lastMessageAt:
      latestMessage?.created_at ??
      conversation.created_at,
  };
}

export interface GetMessagesOptions {
  conversationId: string;
  limit?: number;
  cursor?: string;
}

export async function getMessages(
  options: GetMessagesOptions,
): Promise<MessageView[]> {
  const {
    conversationId,
    limit = 50,
    cursor,
  } = options;

  validateId(
    conversationId,
    "Conversation ID",
  );

  const safeLimit = Math.min(
    Math.max(
      Number(limit) || 50,
      1,
    ),
    100,
  );

  const { supabase, user } =
    await getAuthenticatedClient();

  /*
   * IMPORTANT:
   *
   * assertParticipant now reuses the same
   * authenticated Supabase client.
   *
   * Previously this caused another auth request.
   */
  await assertParticipant(
    supabase,
    conversationId,
    user.id,
  );

  let query = supabase
    .from("messages")
    .select(
      "id, content, sender_id, created_at",
    )
    .eq(
      "conversation_id",
      conversationId,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(safeLimit + 1);

  if (cursor) {
    query = query.lt(
      "created_at",
      cursor,
    );
  }

  const {
    data: messages,
    error,
  } = await query;

  if (error) {
    console.error(
      "GET MESSAGES SUPABASE ERROR",
      {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        conversationId,
      },
    );

    throw new Error(
      `Failed to load messages: ${error.message}`,
    );
  }

  const messageList =
    messages ?? [];

  const paginatedMessages =
    messageList.length > safeLimit
      ? messageList.slice(
          0,
          safeLimit,
        )
      : messageList;

  const senderIds = [
    ...new Set(
      paginatedMessages
        .map(
          (message) =>
            message.sender_id,
        )
        .filter(
          (
            senderId,
          ): senderId is string =>
            Boolean(senderId),
        ),
    ),
  ];

  const profilesById =
    new Map<
      string,
      Pick<
        Profile,
        "first_name" | "last_name"
      >
    >();

  if (senderIds.length > 0) {
    const {
      data: profiles,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select(
        "profile_id, first_name, last_name",
      )
      .in(
        "profile_id",
        senderIds,
      );

    if (profilesError) {
      throw new Error(
        `Failed to load sender profiles: ${profilesError.message}`,
      );
    }

    for (const profile of
      profiles ?? []) {
      profilesById.set(
        profile.profile_id,
        {
          first_name:
            profile.first_name,
          last_name:
            profile.last_name,
        },
      );
    }
  }

  return paginatedMessages
    .reverse()
    .map((message) => {
      const sender =
        message.sender_id
          ? profilesById.get(
              message.sender_id,
            )
          : undefined;

      const senderName = sender
        ? `${sender.first_name ?? ""} ${
            sender.last_name ?? ""
          }`.trim() ||
          "Utilizador desconhecido"
        : "Utilizador desconhecido";

      return {
        id: message.id,
        content:
          message.content ?? "",
        senderId:
          message.sender_id ?? "",
        senderName,
        timestamp:
          message.created_at ??
          new Date(0).toISOString(),
        isOwn:
          message.sender_id ===
          user.id,
      };
    });
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<MessageView> {
  validateId(
    conversationId,
    "Conversation ID",
  );

  const trimmedContent =
    content.trim();

  if (!trimmedContent) {
    throw new Error(
      "Message cannot be empty",
    );
  }

  if (trimmedContent.length > 4000) {
    throw new Error(
      "Message is too long",
    );
  }

  const { supabase, user } =
    await getAuthenticatedClient();

  await assertParticipant(
    supabase,
    conversationId,
    user.id,
  );

  const {
    data,
    error,
  } = await supabase
    .from("messages")
    .insert({
      conversation_id:
        conversationId,
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

  const {
    data: senderProfile,
    error: senderProfileError,
  } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name",
    )
    .eq(
      "profile_id",
      user.id,
    )
    .maybeSingle();

  if (senderProfileError) {
    throw new Error(
      `Failed to load sender profile: ${senderProfileError.message}`,
    );
  }

  const senderName =
    `${senderProfile?.first_name ?? ""} ${
      senderProfile?.last_name ?? ""
    }`.trim() ||
    "Utilizador";

  return {
    id: data.id,
    content: data.content ?? "",
    senderId:
      data.sender_id ?? user.id,
    senderName,
    timestamp:
      data.created_at ??
      new Date().toISOString(),
    isOwn: true,
  };
}

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
    .neq(
      "profile_id",
      user.id,
    )
    .order("first_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load message recipients: ${error.message}`,
    );
  }

  return (data ?? []).map(
    (profile) => ({
      profileId:
        profile.profile_id,
      name:
        `${profile.first_name ?? ""} ${
          profile.last_name ?? ""
        }`.trim() ||
        "Utilizador",
      department:
        profile.department ?? null,
      isOnline:
        profile.status === "Active",
    }),
  );
}