"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ChatItem, {
  type ConversationWithDetails,
} from "./chat_item";

interface ChatSectionProps {
  title: string;
  chats: ConversationWithDetails[];
  icon: React.ReactNode;
  selectedChatId?: string;
}

export default function ChatSection({
  title,
  chats,
  icon,
  selectedChatId,
}: ChatSectionProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);

  const unreadCount = chats.reduce(
    (total, chat) => total + chat.unreadCount,
    0,
  );

  const handleSelectChat = (chatId: string) => {
    if (chatId === selectedChatId) {
      return;
    }

    router.push(`/management/messages/${chatId}`);
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
            {chats.length}
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
            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"
              }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="bg-slate-50/40 pb-1">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className="relative"
                >
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    icon={icon}
                    isSelected={chat.id === selectedChatId}
                    onSelect={handleSelectChat}
                  />
                </div>
              ))
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