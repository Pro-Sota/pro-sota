"use client";

import { useState } from "react";
import {
  Loader2,
  Paperclip,
  Send,
} from "lucide-react";
import { useParams } from "next/navigation";

import { LABELS } from "./chat_labels";
import { sendMessageAction } from "@/app/actions/message";

export default function MessageInput() {
  const params =
    useParams<{
      chatId?: string | string[];
    }>();

  const selectedChatId =
    Array.isArray(params.chatId)
      ? params.chatId[0]
      : params.chatId;

  const [
    messageInput,
    setMessageInput,
  ] = useState("");

  const [
    isSending,
    setIsSending,
  ] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleSendMessage =
    async () => {
      const content =
        messageInput.trim();

      if (
        !content ||
        !selectedChatId ||
        isSending
      ) {
        return;
      }

      setIsSending(true);
      setError(null);

      try {
        const sentMessage =
          await sendMessageAction(
            selectedChatId,
            content,
          );

        /*
         * Tell ChatPage about the newly
         * created message immediately.
         */
        window.dispatchEvent(
          new CustomEvent(
            "message:sent",
            {
              detail: sentMessage,
            },
          ),
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

  return (
    <div className="border-t border-[#BD9655] bg-white p-4">
      <div className="flex items-end gap-3">
        <button
          type="button"
          disabled={!selectedChatId}
          aria-label="Anexar ficheiro"
          className="rounded-lg border border-[#BD9655] p-3 transition-colors hover:bg-[#BD9655]/50 disabled:cursor-not-allowed disabled:opacity-50"
          title={
            !selectedChatId
              ? "Selecione uma conversa primeiro"
              : "Anexar ficheiro"
          }
        >
          <Paperclip size={17} />
        </button>

        <input
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
          placeholder={
            LABELS.typeMessage
          }
          disabled={
            !selectedChatId ||
            isSending
          }
          aria-label="Mensagem"
          className="flex-1 rounded-lg border border-[#BD9955] px-4 py-3 placeholder-slate-500 focus:border-[#BD9655] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#BD9955]/50"
        />

        <button
          type="button"
          onClick={() => {
            void handleSendMessage();
          }}
          disabled={
            !selectedChatId ||
            !messageInput.trim() ||
            isSending
          }
          aria-label="Enviar mensagem"
          className="rounded-lg bg-[#BD9655] p-3 text-[#00950] transition-colors hover:bg-[#BD9655] disabled:cursor-not-allowed disabled:bg-[#BD9655]/50"
        >
          {isSending ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Send size={17} />
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