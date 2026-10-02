"use client";

import { useState } from "react";

import NewConversationModal from "@/app/management/messages/components/new_message_modal";
import EmptyMessageState from "./components/empty_message_state";

export default function CommunicationPage() {
    const [showNewConversationModal, setShowNewConversationModal] =
        useState(false);

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1">
            <EmptyMessageState
                onNewMessage={() => setShowNewConversationModal(true)}
            />

            <NewConversationModal
                open={showNewConversationModal}
                onClose={() => setShowNewConversationModal(false)}
            />
        </div>
    );
}