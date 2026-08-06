"use server";

import {
    getOrCreateConversation,
    getChats,
} from "@/services/messages";

/**
 * Server action to create or retrieve a 1-to-1 conversation.
 */
export async function createConversationAction(
    otherUserId: string
): Promise<string> {
    if (!otherUserId) {
        throw new Error("User ID is required");
    }

    return await getOrCreateConversation(otherUserId);
}

/**
 * Server action to fetch conversations by type.
 */
export async function getChatsAction(
    conversationType: string
) {
    if (!conversationType) {
        throw new Error("Conversation type is required");
    }

    return await getChats(conversationType);
}