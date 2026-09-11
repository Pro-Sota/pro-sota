"use client";

import { Search, Building2, User } from "lucide-react";
import { useParams } from "next/navigation";

import { LABELS } from "./chat_labels";
import ChatSection from "./chat_section";
import type { ConversationWithDetails } from "./chat_item";

interface MessageSideBarProps {
  projectConversations: ConversationWithDetails[];
  directConversations: ConversationWithDetails[];
}

export default function MessageSideBar({
  projectConversations,
  directConversations,
}: MessageSideBarProps) {
  const params = useParams<{ chatId?: string | string[] }>();

  const selectedChatId = Array.isArray(params.chatId)
    ? params.chatId[0]
    : params.chatId;

  return (
    <aside className="hidden h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden border-r border-[#BD9655] bg-white lg:flex">
      {/* Header */}
      <header className="shrink-0 space-y-4 border-b border-[#BD9655] p-5">
        <h1 className="text-xl font-bold tracking-tight text-[#181818]">
          {LABELS.messages}
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BD9655]"
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder={LABELS.search}
            aria-label={LABELS.search}
            className="w-full rounded-lg border border-[#BD9655] bg-gray py-2.5 pl-10 pr-4 text-sm text-[#737373] outline-none transition placeholder:text-[#737373] focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900/5"
          />
        </div>
      </header>

      {/* Chat Sections */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatSection
          title={LABELS.projectMessages}
          chats={projectConversations}
          icon={<Building2 size={18} />}
          selectedChatId={selectedChatId}
        />

        <ChatSection
          title={LABELS.directMessages}
          chats={directConversations}
          icon={<User size={18} />}
          selectedChatId={selectedChatId}
        />
      </div>
    </aside>
  );
}
