
"use server";

import {
  getChats,
  getMessageRecipients,
  getMessages,
  getOrCreateConversation,
  sendMessage,
  getMessageById,
  sendMessageWithAttachments,
} from "@/services/messages";


function validateId(value: string, label: string) {
  if (
    !value ||
    value === "undefined" ||
    value === "null"
  ) {
    throw new Error(`${label} is required`);
  }

  return value;
}

export async function createConversationAction(
  otherUserId: string,
) {
  validateId(otherUserId, "User ID");
  return getOrCreateConversation(otherUserId);
}

export async function getChatsAction(
  conversationType: "direct" | "project",
) {
  return getChats({ conversationType });
}

export async function getMessagesAction(
  conversationId: string,
) {
  validateId(conversationId, "Conversation ID");
  return getMessages({ conversationId });
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
) {
  validateId(conversationId, "Conversation ID");

  if (!content?.trim()) {
    throw new Error("Message content is required");
  }

  return sendMessage(conversationId, content.trim());
}

export async function sendMessageWithAttachmentsAction(
  formData: FormData,
) {
  const conversationId = String(
    formData.get("conversationId") ?? "",
  );

  const content = String(
    formData.get("content") ?? "",
  );

  validateId(conversationId, "Conversation ID");

  const files = formData
    .getAll("files")
    .filter(
      (entry): entry is File =>
        typeof entry !== "string" &&
        entry instanceof File &&
        entry.size > 0,
    );

  if (!content.trim() && files.length === 0) {
    throw new Error(
      "Escreva uma mensagem ou seleccione um ficheiro.",
    );
  }

  return sendMessageWithAttachments(
    conversationId,
    content,
    files,
  );
}

export async function getMessageRecipientsAction() {
  return getMessageRecipients();
}


export async function getMessageByIdAction(
  messageId: string,
) {
  return getMessageById(messageId);
}