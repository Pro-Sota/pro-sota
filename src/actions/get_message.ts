"use server";

import {
  getMessages,
} from "@/services/messages";

export async function getMessageAction(
  messageId: string,
) {
  return getMessages(messageId);
}