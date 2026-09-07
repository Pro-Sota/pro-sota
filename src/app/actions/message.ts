"use server";

import {
  getChats,
  getMessageRecipients,
  getMessages,
  getOrCreateConversation,
  sendMessage,
} from "@/services/messages";

export async function createConversationAction(otherUserId: string) {
  if (!otherUserId) throw new Error("User ID is required");
  return getOrCreateConversation(otherUserId);
}

export async function getChatsAction(conversationType: "direct" | "project") {
  return getChats(conversationType);
}

export async function getMessagesAction(conversationId: string) {
  if (!conversationId) throw new Error("Conversation ID is required");
  return getMessages(conversationId);
}

export async function sendMessageAction(conversationId: string, content: string) {
  if (!conversationId) throw new Error("Conversation ID is required");
  return sendMessage(conversationId, content);
}

export async function getMessageRecipientsAction() {
  return getMessageRecipients();
}