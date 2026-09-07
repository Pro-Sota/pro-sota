"use client";

import { Search, Building2, User } from "lucide-react";
import { LABELS } from "./chat_labels";
import ChatSection from "./chat_section";
import { ConversationWithDetails } from "./chat_item";
import { useParams } from "next/navigation";

interface MessageSideBarProps {
  projectConversations: ConversationWithDetails[];
  directConversations: ConversationWithDetails[];
  selectedChatId?: string;
}

export default function MessageSideBar({
  projectConversations,
  directConversations,
}: MessageSideBarProps) {

    const params = useParams<{ chatId?: string }>();

  const selectedChatId = params.chatId;
  
  return (
    <aside className="hidden w-80 shrink-0 flex-col border-r border-[#BD9655] bg-white lg:flex">
      {/* Header */}
      <header className="space-y-4 border-b border-[#BD9655] p-5">
        <h1 className="text-xl text-[#181818] font-bold tracking-tight">
          {LABELS.messages}
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BD9655]"
          />

          <input
            placeholder={LABELS.search}
            className="w-full rounded-lg border border-[#BD9655] bg-gray py-2.5 pl-10 pr-4 text-sm outline-none transition text-[#7373739] placeholder:text-[#7373739] focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900/5"
          />
        </div>
      </header>

      {/* Chat Sections */}
      <div className="flex-1 overflow-y-auto">
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