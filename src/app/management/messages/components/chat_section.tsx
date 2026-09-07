"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import ChatItem from "./chat_item";
import { ConversationWithDetails } from "./chat_item";
import { useRouter } from "next/navigation";

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
    router.push(`/management/messages/${chatId}`);
  };

  return (
    <section className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-600">{icon}</span>

          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {chats.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600">
              {unreadCount}
            </span>
          )}

          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${
              isExpanded ? "" : "-rotate-90"
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="bg-slate-50/50">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                icon={icon}
                isSelected={chat.id === selectedChatId}
                onSelect={handleSelectChat}
              />
            ))
          ) : (
            <div className="px-4 py-6 text-center text-xs text-slate-500">
              Nenhuma conversa para exibir
            </div>
          )}
        </div>
      )}
    </section>
  );
}
