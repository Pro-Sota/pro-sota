"use client";

import NewConversationModal from "@/app/components/new_message_modal";
import EmptyMessageState from "./components/empty_message_state";
import { useState } from "react";

export default function CommunicationPage() {
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  function handleNewMessage() {
    setShowNewConversationModal(!showNewConversationModal);
  }

  return (
    <>
      <EmptyMessageState onNewMessage={handleNewMessage} />
      <NewConversationModal
        open={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
      />
    </>
  );



}