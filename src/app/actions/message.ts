"use server";

import {
  getChats,
  getMessageRecipients,
  getMessages,
  getOrCreateConversation,
  sendMessage,
} from "@/services/messages";

export async function createConversationAction(
  otherUserId: string,
) {
  if (
    !otherUserId ||
    otherUserId === "undefined" ||
    otherUserId === "null"
  ) {
    throw new Error(
      "User ID is required",
    );
  }

  return getOrCreateConversation(
    otherUserId,
  );
}

export async function getChatsAction(
  conversationType:
    | "direct"
    | "project",
) {
  return getChats({
    conversationType,
  });
}

export async function getMessagesAction(
  conversationId: string,
) {
  if (
    !conversationId ||
    conversationId === "undefined" ||
    conversationId === "null"
  ) {
    throw new Error(
      `Invalid conversation ID passed to getMessagesAction: ${String(
        conversationId,
      )}`,
    );
  }

  return getMessages({
    conversationId,
  });
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
) {
  if (
    !conversationId ||
    conversationId === "undefined" ||
    conversationId === "null"
  ) {
    throw new Error(
      "Conversation ID is required",
    );
  }

  if (!content?.trim()) {
    throw new Error(
      "Message content is required",
    );
  }

  return sendMessage(
    conversationId,
    content.trim(),
  );
}

export async function getMessageRecipientsAction() {
  return getMessageRecipients();
}