"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Loader from "@/app/components/loader";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatPageParams {
  selectChatId?: string;
}

export default function ChatPage() {
  const params = useParams();
  const selectChatId = params?.selectChatId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages for the selected chat
  useEffect(() => {
    if (!selectChatId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/chats/${selectChatId}/messages`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load messages"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectChatId]);

  // No chat selected
  if (!selectChatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">
            Selecione uma conversa para começar
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-sm">
            Nenhuma mensagem nesta conversa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
              message.isOwn
                ? "bg-slate-900 text-white rounded-br-none"
                : "bg-slate-200 text-slate-900 rounded-bl-none"
            }`}
          >
            {/* Sender name for received messages */}
            {!message.isOwn && (
              <p className="text-xs font-semibold mb-1 opacity-75">
                {message.senderName}
              </p>
            )}

            {/* Message content */}
            <p className="text-sm break-words">{message.content}</p>

            {/* Timestamp */}
            <p
              className={`text-xs mt-1 ${
                message.isOwn
                  ? "text-slate-300"
                  : "text-slate-600"
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}