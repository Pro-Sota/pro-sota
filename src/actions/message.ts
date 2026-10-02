"use server";

import {
    getChats,
    getMessageRecipients,
    getMessages,
    getOrCreateConversation,
    sendMessage,
} from "@/services/messages";

function validateId(
    value: string,
    label: string,
) {
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
    validateId(
        conversationId,
        "Conversation ID",
    );

    return getMessages({
        conversationId,
    });
}

export async function sendMessageAction(
    conversationId: string,
    content: string,
) {
    validateId(
        conversationId,
        "Conversation ID",
    );

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