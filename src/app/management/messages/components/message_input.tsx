"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { LABELS } from "./chat_labels";
import { useParams, useRouter } from "next/navigation";
import { sendMessageAction } from "@/app/actions/message";

export default function MessageInput() {
  const params = useParams<{ chatId?: string }>();
    const selectedChatId = params.chatId;
  const router = useRouter();
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;

    setIsSending(true);
    setError(null);
    try {
      await sendMessageAction(selectedChatId, messageInput);
      setMessageInput("");
      window.dispatchEvent(new Event("messages:updated"));
      router.refresh();
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error instanceof Error ? error.message : "Não foi possível enviar a mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-[#BD9655] bg-white p-4">
      <div className="flex items-end gap-3">
        <button
          disabled={!selectedChatId}
          aria-label="Attach file"
          className="rounded-lg border border-[#BD9655] p-3 transition-colors hover:bg-[#BD9655]/50 disabled:cursor-not-allowed disabled:opacity-50"
          title={!selectedChatId ? "Select a chat first" : "Attach file"}
        >
          <Paperclip size={17} />
        </button>

        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={LABELS.typeMessage}
          disabled={!selectedChatId || isSending}
          aria-label="Message input"
          className="flex-1 rounded-lg border border-[#BD9955] px-4 py-3 placeholder-slate-500 focus:border-[#BD9955] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#BD9955]/50"
        />

        <button
          onClick={handleSendMessage}
          disabled={!selectedChatId || !messageInput.trim() || isSending}
          aria-label="Send message"
          className="rounded-lg bg-[#BD9655] p-3 text-[#00950] transition-colors hover:bg-[#BD9655] disabled:cursor-not-allowed disabled:bg-[#BD9655]/50"
        >
          <Send size={17} />
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
