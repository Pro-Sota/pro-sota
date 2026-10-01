"use client";

import { useParams } from "next/navigation";

import Loader from "@/app/components/loader";

import ChatEmptyState from "./chat_empty_state";
import ChatErrorState from "./chat_error_state";
import ChatMessages from "./chat_messages";
import { useChatMessages } from "./hooks/use_chat_messages";
import { useMessageRealtime } from "./hooks/use_message_realtime";

export default function ChatPage() {
  const params = useParams<{
    chatId?: string | string[];
  }>();

  const chatId = Array.isArray(params.chatId)
    ? params.chatId[0]
    : params.chatId;

  const {
    messages,
    setMessages,
    loading,
    error,
    retry,
  } = useChatMessages(chatId);

  useMessageRealtime({
    chatId,
    setMessages,
  });

  if (!chatId) {
    return <ChatEmptyState message="Selecione uma conversa para começar" />;
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ChatErrorState
        message={error}
        onRetry={retry}
      />
    );
  }

  if (messages.length === 0) {
    return (
      <ChatEmptyState message="Nenhuma mensagem nesta conversa" />
    );
  }

  return <ChatMessages messages={messages} />;
}