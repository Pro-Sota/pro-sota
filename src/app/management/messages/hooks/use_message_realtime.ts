"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  getMessageAction,
} from "@/actions/message";

import type { MessageView } from "@/services/messages";

import {
  createClient,
} from "@/app/lib/supabase/client";

interface RealtimeMessage {
  id: string;
  conversation_id: string;
}

interface Props {
  chatId: string | undefined;
  setMessages: React.Dispatch<
    React.SetStateAction<MessageView[]>
  >;
}

export function useMessageRealtime({
  chatId,
  setMessages,
}: Props) {
  const supabaseRef = useRef<ReturnType<
    typeof createClient
  > | null>(null);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    const supabase =
      supabaseRef.current ??
      createClient();

    supabaseRef.current = supabase;

    let cancelled = false;

    const channel = supabase.channel(
      `conversation:${chatId}`,
    );

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${chatId}`,
      },
      async (payload) => {
        if (cancelled) {
          return;
        }

        const newMessage =
          payload.new as RealtimeMessage;

        if (!newMessage.id) {
          return;
        }

        try {
          const message =
            await getMessageAction(
              newMessage.id,
            );

          if (!message || cancelled) {
            return;
          }

          setMessages((current) => {
            if (
              current.some(
                (item) =>
                  item.id === message.id,
              )
            ) {
              return current;
            }

            return sortMessages([
              ...current,
              message,
            ]);
          });
        } catch (error) {
          console.error(
            "Error loading realtime message:",
            error,
          );
        }
      },
    );

    void channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(
          "Realtime connected:",
          chatId,
        );
      }

      if (status === "CHANNEL_ERROR") {
        console.error(
          "Realtime channel error:",
          chatId,
        );
      }

      if (status === "TIMED_OUT") {
        console.error(
          "Realtime channel timed out:",
          chatId,
        );
      }
    });

    return () => {
      cancelled = true;

      void supabase.removeChannel(
        channel,
      );
    };
  }, [chatId, setMessages]);
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