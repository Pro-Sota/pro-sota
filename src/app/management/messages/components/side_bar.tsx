"use client";

import {
    Search,
    Building2,
    User,
    Plus,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { LABELS } from "./chat_labels";
import ChatSection from "./chat_section";
import type { ConversationWithDetails } from "./chat_item";
import NewConversationModal from "./new_message_modal";
import { useOnlineUsers } from "@/app/hooks/use_online_users";

interface MessageSideBarProps {
    projectConversations: ConversationWithDetails[];
    directConversations: ConversationWithDetails[];
    currentUserId: string;
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
    currentUserId,
}: MessageSideBarProps) {
    const params = useParams();

    const [showNewConversationModal, setShowNewConversationModal] =
        useState(false);

    const chatId =
        typeof params.chatId === "string"
            ? params.chatId
            : Array.isArray(params.chatId)
                ? params.chatId[0]
                : undefined;

    const [projectChats, setProjectChats] =
        useState(projectConversations);

    const [directChats, setDirectChats] =
        useState(directConversations);

    const { onlineUserIds } = useOnlineUsers(currentUserId);

    useEffect(() => {
        setProjectChats(projectConversations);
    }, [projectConversations]);

    useEffect(() => {
        setDirectChats(directConversations);
    }, [directConversations]);

    useEffect(() => {
        const handleMessagesUpdated = (event: Event) => {
            const detail = (
                event as CustomEvent<MessagesUpdatedDetail>
            ).detail;

            if (!detail?.conversationId || !detail?.name) {
                return;
            }

            setDirectChats((currentChats) => {
                const existing = currentChats.find(
                    (chat) => chat.id === detail.conversationId,
                );

                if (existing) {
                    return [
                        {
                            ...existing,
                            displayName: detail.name,
                        },
                        ...currentChats.filter(
                            (chat) => chat.id !== detail.conversationId,
                        ),
                    ];
                }

                // A newly created conversation should ideally provide
                // the other participant's profileId in this event.
                const newChat: ConversationWithDetails = {
                    id: detail.conversationId,
                    conversationType: "direct",
                    projectId: null,
                    displayName: detail.name,
                    isOnline: false,
                    unreadCount: 0,
                    lastMessage: "",
                    lastMessageAt: null,
                    profileId: detail.userId ?? null,
                };

                return [newChat, ...currentChats];
            });
        };

        window.addEventListener("messages:updated", handleMessagesUpdated);

        return () => {
            window.removeEventListener(
                "messages:updated",
                handleMessagesUpdated,
            );
        };
    }, []);

    // Derive online status from live Presence, not profiles.status.
    const liveProjectChats = projectChats.map((chat) => ({
        ...chat,
        isOnline: false,
    }));

    const liveDirectChats = directChats.map((chat) => ({
        ...chat,
        isOnline: Boolean(
            chat.profileId && onlineUserIds.has(chat.profileId),
        ),
    }));

    return (
        <aside className="hidden h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white lg:flex">
            <header className="shrink-0 space-y-4 border-b border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl font-bold tracking-tight text-[#181818]">
                        {LABELS.messages}
                    </h1>

                    <button
                        type="button"
                        onClick={() => setShowNewConversationModal(true)}
                        aria-label="Nova conversa"
                        title="Nova conversa"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002950] text-white transition-colors hover:bg-[#003968] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2"
                    >
                        <Plus size={19} strokeWidth={2} />
                    </button>
                </div>

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
                    chats={liveProjectChats}
                    icon={<Building2 size={17} />}
                    selectedChatId={chatId}
                />

                <ChatSection
                    title={LABELS.directMessages}
                    chats={liveDirectChats}
                    icon={<User size={17} />}
                    selectedChatId={chatId}
                />
            </div>

            <NewConversationModal
                open={showNewConversationModal}
                onClose={() => setShowNewConversationModal(false)}
            />
        </aside>
    );
}