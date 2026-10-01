"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import type { MessageView } from "@/services/messages";

import MessageBubble from "./message_bubble";
import MessageDateDivider from "./message_date_divider";
import {
  getDateKey,
} from "./utils/message_date";

interface Props {
  messages: MessageView[];
}

export default function ChatMessages({
  messages,
}: Props) {
  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto bg-white p-2">
      <div className="space-y-2">
        {messages.map((message, index) => {
          const previousMessage =
            messages[index - 1];

          const currentDateKey =
            getDateKey(message.timestamp);

          const previousDateKey =
            previousMessage
              ? getDateKey(
                  previousMessage.timestamp,
                )
              : null;

          const showDateDivider =
            currentDateKey !==
            previousDateKey;

          return (
            <div key={message.id}>
              {showDateDivider && (
                <MessageDateDivider
                  timestamp={message.timestamp}
                />
              )}

              <MessageBubble
                message={message}
              />
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}