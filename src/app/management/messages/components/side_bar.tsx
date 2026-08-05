"use client";

import { Search, Building2, User } from "lucide-react";
import { LABELS } from "./chat_labels";
import ChatSection from "./chat_section";
import { useState } from "react";


interface props {
    projectConversations: [];
    directConversations: [];
    selectedChatId:string; 
    setSelectedChatId: (chat: string) => void;
}

export default function MessageSideBar({projectConversations, directConversations, selectedChatId, setSelectedChatId}:props) {

    return (
        <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-200 lg:flex bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 p-5 space-y-4">
          <h1 className="text-xl font-bold tracking-tight">{LABELS.messages}</h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder={LABELS.search}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900/5"
            />
          </div>
        </div>

        {/* Chat Sections */}
        <div className="flex-1 overflow-y-auto">
          <ChatSection
            title={LABELS.projectMessages}
            chats={projectConversations}
            icon={<Building2 size={18} />}
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
          />

          <ChatSection
            title={LABELS.directMessages}
            chats={directConversations}
            icon={<User size={18} />}
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>
      </aside>
    )
}