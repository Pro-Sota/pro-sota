"use client";

import { Search, Building2, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LABELS } from "./chat_labels";
import ChatSection from "./chat_section";
import type { ConversationWithDetails } from "./chat_item";

interface MessageSideBarProps {
  projectConversations: ConversationWithDetails[];
  directConversations: ConversationWithDetails[];
}

interface MessagesUpdatedDetail {
  conversationId: string;
  userId?: string;
  name: string;
  department?: string | null;
  isOnline: boolean;
}

export default function MessageSideBar({
  projectConversations,
  directConversations,
}: MessageSideBarProps) {
  const params = useParams();

  const chatId =
    typeof params.chatId === "string"
      ? params.chatId
      : Array.isArray(params.chatId)
        ? params.chatId[0]
        : undefined;

  const [projectChats, setProjectChats] = useState(
    projectConversations,
  );

  const [directChats, setDirectChats] = useState(
    directConversations,
  );

  useEffect(() => {
    setProjectChats(projectConversations);
  }, [projectConversations]);

  useEffect(() => {
    setDirectChats(directConversations);
  }, [directConversations]);

  useEffect(() => {
    const handleMessagesUpdated = (event: Event) => {
      const customEvent =
        event as CustomEvent<MessagesUpdatedDetail>;

      const detail = customEvent.detail;

      if (!detail?.conversationId || !detail?.name) {
        return;
      }

      const newChat: ConversationWithDetails = {
        id: detail.conversationId,
        conversationType: "direct",
        projectId: null,
        displayName: detail.name,
        isOnline: detail.isOnline,
        unreadCount: 0,
        lastMessage: "",
        lastMessageAt: null,
      };

      setDirectChats((currentChats) => {
        const existingIndex = currentChats.findIndex(
          (chat) => chat.id === detail.conversationId,
        );

        if (existingIndex === -1) {
          return [newChat, ...currentChats];
        }

        const updatedChats = [...currentChats];

        const existingChat = updatedChats.splice(
          existingIndex,
          1,
        )[0];

        return [
          {
            ...existingChat,
            displayName: detail.name,
            isOnline: detail.isOnline,
          },
          ...updatedChats,
        ];
      });
    };

    window.addEventListener(
      "messages:updated",
      handleMessagesUpdated,
    );

    return () => {
      window.removeEventListener(
        "messages:updated",
        handleMessagesUpdated,
      );
    };
  }, []);

  return (
    <aside className="hidden h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white lg:flex">
      <header className="shrink-0 space-y-4 border-b border-slate-200 p-5">
        <h1 className="text-xl font-bold tracking-tight text-[#181818]">
          {LABELS.messages}
        </h1>

        <div className="relative">
          <Search
            size={16}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            placeholder={LABELS.search}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#BD9655] focus:bg-white focus:ring-1 focus:ring-[#BD9655]"
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatSection
          title={LABELS.projectMessages}
          chats={projectChats}
          icon={<Building2 size={17} />}
          selectedChatId={chatId}
        />

        <ChatSection
          title={LABELS.directMessages}
          chats={directChats}
          icon={<User size={17} />}
          selectedChatId={chatId}
        />
      </div>
    </aside>
  );
}