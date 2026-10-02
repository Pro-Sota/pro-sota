"use client";

import { useState } from "react";
import {
  Loader2,
  Paperclip,
  Send,
} from "lucide-react";

import { LABELS } from "./chat_labels";
import { sendMessageAction } from "@/actions/message";

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({
  conversationId,
}: MessageInputProps) {
  const [messageInput, setMessageInput] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSendMessage = async () => {
    const content = messageInput.trim();

    if (
      !content ||
      !conversationId ||
      isSending
    ) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const sentMessage =
        await sendMessageAction(
          conversationId,
          content,
        );

      /*
       * Immediately notify the active chat.
       *
       * The realtime subscription will also
       * receive the INSERT event, so the chat
       * component must deduplicate by message ID.
       */
      window.dispatchEvent(
        new CustomEvent("message:sent", {
          detail: sentMessage,
        }),
      );

      setMessageInput("");
    } catch (err) {
      console.error(
        "Error sending message:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível enviar a mensagem",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void handleSendMessage();
    }
  };

  const canSend =
    Boolean(messageInput.trim()) &&
    !isSending;

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <button
          type="button"
          aria-label="Anexar ficheiro"
          title="Anexar ficheiro"
          className="shrink-0 rounded-lg border border-[#BD9655] p-3 text-slate-600 transition-colors hover:bg-[#BD9655]/10"
        >
          <Paperclip
            size={17}
            aria-hidden="true"
          />
        </button>

        <input
          type="text"
          value={messageInput}
          onChange={(event) => {
            setMessageInput(
              event.target.value,
            );

            if (error) {
              setError(null);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={LABELS.typeMessage}
          disabled={isSending}
          aria-label="Mensagem"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-1 focus:ring-[#BD9655] disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <button
          type="button"
          onClick={() => {
            void handleSendMessage();
          }}
          disabled={!canSend}
          aria-label="Enviar mensagem"
          title="Enviar mensagem"
          className="shrink-0 rounded-lg bg-[#BD9655] p-3 text-white transition-colors hover:bg-[#a98248] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <Loader2
              size={17}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Send
              size={17}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {error && (
        <p
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}