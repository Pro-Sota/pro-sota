
"use client";

import {
  ChevronDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ChatItem, {
  type ConversationWithDetails,
} from "./chat_item";

interface ChatSectionProps {
  title: string;
  chats: ConversationWithDetails[];
  icon: React.ReactNode;
  selectedChatId?: string;
}

interface MessageEventDetail {
  tempId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  error?: string;
  message?: {
    id?: string;
    content?: string;
    created_at?: string;
    createdAt?: string;
  };
}

export default function ChatSection({
  title,
  chats,
  icon,
  selectedChatId,
}: ChatSectionProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [localChats, setLocalChats] = useState(chats);

  const [failedMessages, setFailedMessages] = useState<
    Record<string, MessageEventDetail>
  >({});

  useEffect(() => {
    setLocalChats((current) =>
      chats.map((chat) => {
        const existing = current.find(
          (item) => item.id === chat.id,
        );

        // Preserve a locally updated preview until the server
        // provides a newer message or the parent refreshes.
        return existing?.lastMessageAt &&
          chat.lastMessageAt &&
          new Date(existing.lastMessageAt).getTime() >
            new Date(chat.lastMessageAt).getTime()
          ? { ...chat, ...existing }
          : chat;
      }),
    );
  }, [chats]);

  useEffect(() => {
    const updatePreview = (
      conversationId: string,
      content: string,
      timestamp: string,
    ) => {
      setLocalChats((current) =>
        current.map((chat) =>
          chat.id === conversationId
            ? {
                ...chat,
                lastMessage: content,
                lastMessageAt: timestamp,
              }
            : chat,
        ),
      );
    };

    const handleOptimistic = (event: Event) => {
      const detail = (
        event as CustomEvent<MessageEventDetail>
      ).detail;

      if (!detail?.conversationId || !detail.content) return;

      updatePreview(
        detail.conversationId,
        detail.content,
        detail.createdAt,
      );

      setFailedMessages((current) => {
        const next = { ...current };
        delete next[detail.conversationId];
        return next;
      });
    };

    const handleSent = (event: Event) => {
      const detail = (
        event as CustomEvent<MessageEventDetail>
      ).detail;

      if (!detail?.conversationId) return;

      const message = detail.message;
      const content = message?.content ?? "";

      if (content) {
        updatePreview(
          detail.conversationId,
          content,
          message?.created_at ??
            message?.createdAt ??
            new Date().toISOString(),
        );
      }

      setFailedMessages((current) => {
        const next = { ...current };
        delete next[detail.conversationId];
        return next;
      });
    };

    const handleFailed = (event: Event) => {
      const detail = (
        event as CustomEvent<MessageEventDetail>
      ).detail;

      if (!detail?.conversationId) return;

      setFailedMessages((current) => ({
        ...current,
        [detail.conversationId]: detail,
      }));
    };

    const handleRetrying = (event: Event) => {
      const detail = (
        event as CustomEvent<MessageEventDetail>
      ).detail;

      if (!detail?.conversationId) return;

      setFailedMessages((current) => {
        const next = { ...current };
        delete next[detail.conversationId];
        return next;
      });

      updatePreview(
        detail.conversationId,
        detail.content,
        detail.createdAt,
      );
    };

    window.addEventListener("message:optimistic", handleOptimistic);
    window.addEventListener("message:sent", handleSent);
    window.addEventListener("message:failed", handleFailed);
    window.addEventListener("message:retrying", handleRetrying);

    return () => {
      window.removeEventListener("message:optimistic", handleOptimistic);
      window.removeEventListener("message:sent", handleSent);
      window.removeEventListener("message:failed", handleFailed);
      window.removeEventListener("message:retrying", handleRetrying);
    };
  }, []);

  const unreadCount = localChats.reduce(
    (total, chat) => total + chat.unreadCount,
    0,
  );

  const handleSelectChat = useCallback(
    (chatId: string) => {
      if (chatId === selectedChatId) return;

      router.push(`/management/messages/${chatId}`);
    },
    [router, selectedChatId],
  );

  const handleRetry = (chatId: string) => {
    const failed = failedMessages[chatId];

    if (!failed) return;

    window.dispatchEvent(
      new CustomEvent("message:retry", {
        detail: {
          tempId: failed.tempId,
          conversationId: failed.conversationId,
          content: failed.content,
        },
      }),
    );
  };

  return (
    <section className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className="group flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
            aria-hidden="true"
          >
            {icon}
          </span>

          <span className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </span>

          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500">
            {localChats.length}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#002950] px-1.5 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

          <ChevronDown
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
            className={`text-slate-400 transition-transform duration-200 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="bg-slate-50/40 pb-1">
            {localChats.length > 0 ? (
              localChats.map((chat) => {
                const failed = failedMessages[chat.id];

                return (
                  <div
                    key={chat.id}
                    className="flex items-center gap-1 px-1"
                  >
                    <div className="min-w-0 flex-1">
                      <ChatItem
                        chat={chat}
                        icon={icon}
                        isSelected={chat.id === selectedChatId}
                        onSelect={handleSelectChat}
                      />
                    </div>

                    {failed && (
                      <button
                        type="button"
                        onClick={() => handleRetry(chat.id)}
                        title="Tentar enviar novamente"
                        aria-label={`Tentar enviar novamente a mensagem para ${chat.displayName}`}
                        className="mr-2 flex shrink-0 items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <RotateCcw size={13} aria-hidden="true" />
                        <span className="hidden sm:inline">Repetir</span>
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-7 text-center">
                <p className="text-xs text-slate-400">
                  Nenhuma conversa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
