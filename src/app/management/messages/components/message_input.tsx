"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { LABELS } from "./chat_labels";

interface MessageInputProps {
  selectedChatId?: string;
}

export default function MessageInput({ selectedChatId }: MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChatId) return;

    setIsSending(true);
    try {
      // Send message to your API
      const response = await fetch(`/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChatId,
          content: messageInput,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: Show error toast/notification to user
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
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <button
          disabled={!selectedChatId}
          aria-label="Attach file"
          className="rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="flex-1 rounded-lg border border-slate-200 px-4 py-3 placeholder-slate-500 focus:border-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
        />

        <button
          onClick={handleSendMessage}
          disabled={!selectedChatId || !messageInput.trim() || isSending}
          aria-label="Send message"
          className="rounded-lg bg-slate-900 p-3 text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}