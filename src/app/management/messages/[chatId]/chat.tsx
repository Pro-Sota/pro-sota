"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import Loader from "@/app/components/loader";
import type {
    ChatSummary,
    MessageView,
} from "@/services/messages";
import type { ProjectSidebarData } from "@/services/project_sidebar";

import MessageHeader from "../components/message_header";
import MessageInput from "../components/message_input";
import ProjectSideBar from "../components/project_sidebar";

import { createClient } from "@/app/lib/supabase/client";

interface RealtimeMessage {
    id: string;
    conversation_id: string;
    content: string | null;
    sender_id: string | null;
    created_at: string | null;
}

interface ChatViewProps {
    chatId: string;
    conversation: ChatSummary;
    initialMessages: MessageView[];
    currentUserId: string;
    projectSidebarData: ProjectSidebarData | null;
}

export default function ChatView({
    chatId,
    conversation,
    initialMessages,
    currentUserId,
    projectSidebarData,
}: ChatViewProps) {
    const supabase = useMemo(
        () => createClient(),
        [],
    );

    const [messages, setMessages] =
        useState<MessageView[]>(initialMessages);

    const [error, setError] =
        useState<string | null>(null);

    const messagesEndRef =
        useRef<HTMLDivElement>(null);

    /*
     * --------------------------------------------------
     * KEEP INITIAL SERVER DATA IN SYNC
     * --------------------------------------------------
     */

    useEffect(() => {
        setMessages(initialMessages);
        setError(null);
    }, [initialMessages, chatId]);

    /*
     * --------------------------------------------------
     * REALTIME
     * --------------------------------------------------
     */

    useEffect(() => {
        let cancelled = false;

        const channel =
            supabase.channel(
                `conversation:${chatId}`,
            );

        channel.on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `conversation_id=eq.${chatId}`,
            },
            async (payload) => {
                if (cancelled) {
                    return;
                }

                const newMessage =
                    payload.new as RealtimeMessage;

                if (
                    !newMessage.id ||
                    newMessage.conversation_id !==
                    chatId
                ) {
                    return;
                }

                let senderName =
                    "Utilizador";

                if (newMessage.sender_id) {
                    const {
                        data: profile,
                        error: profileError,
                    } = await supabase
                        .from("profiles")
                        .select(
                            "first_name, last_name",
                        )
                        .eq(
                            "profile_id",
                            newMessage.sender_id,
                        )
                        .maybeSingle();

                    if (profileError) {
                        console.error(
                            "Error loading sender profile:",
                            profileError,
                        );
                    }

                    if (profile) {
                        senderName =
                            [
                                profile.first_name,
                                profile.last_name,
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .trim() ||
                            "Utilizador";
                    }
                }

                if (cancelled) {
                    return;
                }

                const realtimeMessage: MessageView =
                {
                    id: newMessage.id,
                    content:
                        newMessage.content ?? "",
                    senderId:
                        newMessage.sender_id ?? "",
                    senderName,
                    timestamp:
                        newMessage.created_at ??
                        new Date().toISOString(),
                    isOwn:
                        newMessage.sender_id ===
                        currentUserId,
                };

                setMessages((current) => {
                    if (
                        current.some(
                            (message) =>
                                message.id ===
                                realtimeMessage.id,
                        )
                    ) {
                        return current;
                    }

                    return [
                        ...current,
                        realtimeMessage,
                    ].sort(
                        (a, b) =>
                            new Date(
                                a.timestamp,
                            ).getTime() -
                            new Date(
                                b.timestamp,
                            ).getTime(),
                    );
                });
            },
        );

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                console.log(
                    "Realtime connected:",
                    chatId,
                );
            }

            if (status === "CHANNEL_ERROR") {
                console.error(
                    "Realtime channel error:",
                    chatId,
                );

                if (!cancelled) {
                    setError(
                        "A ligação em tempo real foi interrompida.",
                    );
                }
            }

            if (status === "TIMED_OUT") {
                console.error(
                    "Realtime channel timed out:",
                    chatId,
                );

                if (!cancelled) {
                    setError(
                        "A ligação em tempo real demorou demasiado tempo.",
                    );
                }
            }
        });

        return () => {
            cancelled = true;

            void supabase.removeChannel(
                channel,
            );
        };
    }, [
        chatId,
        currentUserId,
        supabase,
    ]);

    /*
     * --------------------------------------------------
     * SCROLL
     * --------------------------------------------------
     */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    /*
     * --------------------------------------------------
     * STATES
     * --------------------------------------------------
     */

    if (!conversation) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <p className="text-sm text-red-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-800"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    /*
     * --------------------------------------------------
     * CHAT
     * --------------------------------------------------
     */

   return (
    <div className="flex h-full min-h-0 w-full min-w-0">
        <section className="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
            <MessageHeader
                conversation={conversation}
            />

            <div className="min-h-0 flex-1 overflow-y-auto bg-white p-2">
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-slate-500">
                            Nenhuma mensagem nesta conversa
                        </p>
                    </div>
                ) : (
                    <MessageList
                        messages={messages}
                        messagesEndRef={messagesEndRef}
                    />
                )}
            </div>

            <MessageInput
                conversationId={chatId}
            />
        </section>

        {conversation.conversationType === "project" &&
            projectSidebarData && (
                <ProjectSideBar
                    data={projectSidebarData}
                />
            )}
    </div>
);
}

/*
 * --------------------------------------------------
 * MESSAGE LIST
 * --------------------------------------------------
 */

interface MessageListProps {
    messages: MessageView[];
    messagesEndRef: React.RefObject<
        HTMLDivElement | null
    >;
}

function MessageList({
    messages,
    messagesEndRef,
}: MessageListProps) {
    const getDateKey = (
        timestamp: string,
    ) => {
        const date = new Date(timestamp);

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(
                2,
                "0",
            ),
            String(date.getDate()).padStart(
                2,
                "0",
            ),
        ].join("-");
    };

    const formatDateDivider = (
        timestamp: string,
    ) => {
        const date = new Date(timestamp);
        const now = new Date();

        const todayKey =
            getDateKey(now.toISOString());

        const yesterday =
            new Date(now);

        yesterday.setDate(
            yesterday.getDate() - 1,
        );

        const yesterdayKey =
            getDateKey(
                yesterday.toISOString(),
            );

        const messageDateKey =
            getDateKey(timestamp);

        if (
            messageDateKey ===
            todayKey
        ) {
            return "Hoje";
        }

        if (
            messageDateKey ===
            yesterdayKey
        ) {
            return "Ontem";
        }

        return date.toLocaleDateString(
            "pt-AO",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
            },
        );
    };

    return (
        <div className="space-y-4">
            {messages.map(
                (message, index) => {
                    const previousMessage =
                        messages[index - 1];

                    const currentDateKey =
                        getDateKey(
                            message.timestamp,
                        );

                    const previousDateKey =
                        previousMessage
                            ? getDateKey(
                                previousMessage.timestamp,
                            )
                            : null;

                    const showDateDivider =
                        currentDateKey !==
                        previousDateKey;

                    return (
                        <div key={message.id}>
                            {showDateDivider && (
                                <div className="my-6 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-slate-200" />

                                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                                        {formatDateDivider(
                                            message.timestamp,
                                        )}
                                    </span>

                                    <div className="h-px flex-1 bg-slate-200" />
                                </div>
                            )}

                            <div
                                className={`flex ${message.isOwn
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md xl:max-w-lg ${message.isOwn
                                            ? "rounded-br-none bg-[#002950] text-white"
                                            : "rounded-bl-none bg-[#F1F5F9] text-slate-900"
                                        }`}
                                >
                                    {!message.isOwn && (
                                        <p className="mb-1 text-xs font-semibold opacity-75">
                                            {
                                                message.senderName
                                            }
                                        </p>
                                    )}

                                    <p className="break-words text-sm">
                                        {
                                            message.content
                                        }
                                    </p>

                                    <p
                                        className={`mt-1 text-xs ${message.isOwn
                                                ? "text-slate-300"
                                                : "text-slate-600"
                                            }`}
                                    >
                                        {new Date(
                                            message.timestamp,
                                        ).toLocaleTimeString(
                                            "pt-AO",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            },
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                },
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}