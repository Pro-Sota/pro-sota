"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getMessagesAction } from "@/actions/message";
import type { MessageView } from "@/services/messages";

export function useChatMessages(
  chatId: string | undefined,
) {
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getMessagesAction(chatId);
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Falha ao carregar as mensagens",
      );
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!chatId) return;

    const handleSentMessage = (event: Event) => {
      const message =
        (event as CustomEvent<MessageView>).detail;

      if (!message) return;

      setMessages((current) => {
        if (
          current.some(
            (item) => item.id === message.id,
          )
        ) {
          return current;
        }

        return sortMessages([
          ...current,
          message,
        ]);
      });
    };

    window.addEventListener(
      "message:sent",
      handleSentMessage,
    );

    return () => {
      window.removeEventListener(
        "message:sent",
        handleSentMessage,
      );
    };
  }, [chatId]);

  return {
    messages,
    setMessages,
    loading,
    error,
    retry: loadMessages,
  };
}

function sortMessages(
  messages: MessageView[],
) {
  return [...messages].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime(),
  );
}