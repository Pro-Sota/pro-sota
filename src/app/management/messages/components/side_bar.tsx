
"use client";

import {
    Search,
    Building2,
    User,
    Plus,
} from "lucide-react";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/app/lib/supabase/client";
import { useOnlineUsers } from "@/app/hooks/use_online_users";

import { LABELS } from "./chat_labels";
import ChatSection from "./chat_section";
import type { ConversationWithDetails } from "./chat_item";
import NewConversationModal from "./new_message_modal";

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

interface RealtimeMessage {
    id: string;
    conversation_id: string;
    content: string | null;
    sender_id: string | null;
    created_at: string | null;
}

interface ReceivedMessageDetail {
    messageId: string;
    conversationId: string;
    content: string;
    createdAt: string;
}

export default function MessageSideBar({
    projectConversations,
    directConversations,
    currentUserId,
}: MessageSideBarProps) {
    const params = useParams();

    const supabase = useMemo(() => createClient(), []);

    const [showNewConversationModal, setShowNewConversationModal] =
        useState(false);

    const [projectChats, setProjectChats] =
        useState(projectConversations);

    const [directChats, setDirectChats] =
        useState(directConversations);

    const { onlineUserIds } = useOnlineUsers(currentUserId);

    const chatId =
        typeof params.chatId === "string"
            ? params.chatId
            : Array.isArray(params.chatId)
                ? params.chatId[0]
                : undefined;

    /*
     * --------------------------------------------------
     * REALTIME - ALL INCOMING MESSAGES
     * --------------------------------------------------
     *
     * This subscription monitors messages across all
     * conversations accessible to the authenticated user.
     *
     * ChatSection receives message:received and updates
     * the corresponding conversation preview and unread count.
     */

    useEffect(() => {
        let cancelled = false;

        const channel = supabase
            .channel(`sidebar-messages:${currentUserId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                },
                (payload) => {
                    if (cancelled) return;

                    const message =
                        payload.new as RealtimeMessage;

                    if (
                        !message.id ||
                        !message.conversation_id ||
                        !message.sender_id ||
                        message.sender_id === currentUserId
                    ) {
                        return;
                    }

                    const detail: ReceivedMessageDetail = {
                        messageId: message.id,
                        conversationId: message.conversation_id,
                        content: message.content ?? "",
                        createdAt:
                            message.created_at ??
                            new Date().toISOString(),
                    };

                    window.dispatchEvent(
                        new CustomEvent<ReceivedMessageDetail>(
                            "message:received",
                            { detail },
                        ),
                    );
                },
            );

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                console.log(
                    "Sidebar messages realtime connected:",
                    currentUserId,
                );
            }

            if (
                status === "CHANNEL_ERROR" ||
                status === "TIMED_OUT"
            ) {
                console.error(
                    "Sidebar messages realtime error:",
                    status,
                );
            }
        });

        return () => {
            cancelled = true;
            void supabase.removeChannel(channel);
        };
    }, [supabase, currentUserId]);

    /*
     * --------------------------------------------------
     * SYNC SERVER DATA
     * --------------------------------------------------
     */

    useEffect(() => {
        setProjectChats(projectConversations);
    }, [projectConversations]);

    useEffect(() => {
        setDirectChats(directConversations);
    }, [directConversations]);

    /*
     * --------------------------------------------------
     * NEW / UPDATED DIRECT CONVERSATIONS
     * --------------------------------------------------
     */

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
                            profileId:
                                detail.userId ?? existing.profileId,
                        },
                        ...currentChats.filter(
                            (chat) => chat.id !== detail.conversationId,
                        ),
                    ];
                }

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

    /*
     * --------------------------------------------------
     * LIVE PRESENCE
     * --------------------------------------------------
     */

    const liveProjectChats = projectChats.map((chat) => ({
        ...chat,
        isOnline: false,
    }));

    const liveDirectChats = directChats.map((chat) => ({
        ...chat,
        isOnline: Boolean(
            chat.profileId &&
            onlineUserIds.has(chat.profileId),
        ),
    }));

    /*
     * --------------------------------------------------
     * RENDER
     * --------------------------------------------------
     */

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
