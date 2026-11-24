"use client";

import { useOnlineUsersContext } from "@/app/hooks/online_users_context";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Check,
    CheckCheck,
    Clock3,
    Download,
    FileText,
    Loader2,
    RotateCcw,
} from "lucide-react";

import Loader from "@/app/components/loader";
import type {
    ChatSummary,
    MessageAttachment,
    MessageView,
} from "@/services/messages";
import type { ProjectSidebarData } from "@/services/project_sidebar";

import { getMessageByIdAction } from "@/actions/message";
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

type DeliveryStatus =
    | "sending"
    | "sent"
    | "delivered"
    | "read"
    | "failed";

interface OptimisticMessageDetail {
    tempId: string;
    conversationId: string;
    content: string;
    createdAt: string;
}

interface SentMessageDetail {
    tempId: string;
    conversationId: string;
    message: unknown;
}

interface FailedMessageDetail {
    tempId: string;
    conversationId: string;
    content: string;
    createdAt: string;
    error?: string;
    files?: File[];
}

interface RetryMessageDetail {
    tempId: string;
    conversationId: string;
    content: string;
    files?: File[];
}

interface ChatViewProps {
    chatId: string;
    conversation: ChatSummary;
    initialMessages: MessageView[];
    currentUserId: string;
    projectSidebarData: ProjectSidebarData | null;
}

function asRecord(
    value: unknown,
): Record<string, unknown> | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    return value as Record<string, unknown>;
}

function getPersistedMessage(
    value: unknown,
    currentUserId: string,
): MessageView | null {
    const record = asRecord(value);

    if (!record) return null;

    const id = record.id ?? record.message_id;
    const content = record.content ?? record.message;
    const senderId = record.senderId ?? record.sender_id;
    const timestamp =
        record.timestamp ??
        record.created_at ??
        record.createdAt;

    if (
        typeof id !== "string" ||
        typeof content !== "string" ||
        typeof timestamp !== "string"
    ) {
        return null;
    }

    const normalizedSenderId =
        typeof senderId === "string"
            ? senderId
            : currentUserId;

    return {
        id,
        content,
        senderId: normalizedSenderId,
        senderName:
            typeof record.senderName === "string"
                ? record.senderName
                : typeof record.sender_name === "string"
                    ? record.sender_name
                    : "Utilizador",
        timestamp,
        isOwn:
            typeof record.isOwn === "boolean"
                ? record.isOwn
                : normalizedSenderId === currentUserId,
        attachments: Array.isArray(record.attachments)
            ? record.attachments as MessageAttachment[]
            : [],
    };
}

function dispatchRetry(message: RetryMessageDetail) {
    window.dispatchEvent(
        new CustomEvent("message:retry", {
            detail: message,
        }),
    );
}

function formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "Ficheiro";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageStatus({
    status,
}: {
    status: DeliveryStatus;
}) {
    if (status === "sending") {
        return (
            <Clock3
                className="h-3.5 w-3.5 text-white/60"
                aria-label="A enviar"
            />
        );
    }

    if (status === "failed") {
        return (
            <span
                className="text-xs font-medium text-red-300"
                role="status"
            >
                Falhou
            </span>
        );
    }

    if (status === "read") {
        return (
            <CheckCheck
                className="h-4 w-4 text-sky-300"
                aria-label="Lida"
            />
        );
    }

    if (status === "delivered") {
        return (
            <CheckCheck
                className="h-4 w-4 text-white/70"
                aria-label="Entregue"
            />
        );
    }

    return (
        <Check
            className="h-4 w-4 text-white/70"
            aria-label="Enviada"
        />
    );
}

/*
 * --------------------------------------------------
 * MESSAGE ATTACHMENTS
 * --------------------------------------------------
 */

function MessageAttachments({
    attachments,
    isOwn,
}: {
    attachments: MessageAttachment[];
    isOwn: boolean;
}) {
    if (!attachments.length) return null;

    return (
        <div className="mt-2 space-y-2">
            {attachments.map((attachment) => {
                const isImage =
                    attachment.mimeType.startsWith("image/");

                if (isImage) {
                    return (
                        <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block max-w-full overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                            aria-label={`Abrir imagem ${attachment.fileName}`}
                        >
                            <img
                                src={attachment.url}
                                alt={attachment.fileName}
                                loading="lazy"
                                className="max-h-72 max-w-full rounded-lg object-contain transition-opacity group-hover:opacity-90"
                            />

                            <span
                                className={`mt-1 block truncate text-[11px] ${
                                    isOwn
                                        ? "text-white/65"
                                        : "text-slate-500"
                                }`}
                            >
                                {attachment.fileName}
                            </span>
                        </a>
                    );
                }

                return (
                    <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 transition-colors ${
                            isOwn
                                ? "border-white/15 bg-white/10 hover:bg-white/15"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                    >
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                isOwn
                                    ? "bg-white/10 text-white"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            <FileText
                                size={19}
                                aria-hidden="true"
                            />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span
                                className={`block truncate text-xs font-medium ${
                                    isOwn
                                        ? "text-white"
                                        : "text-slate-800"
                                }`}
                            >
                                {attachment.fileName}
                            </span>

                            <span
                                className={`mt-0.5 block text-[11px] ${
                                    isOwn
                                        ? "text-white/60"
                                        : "text-slate-500"
                                }`}
                            >
                                {formatFileSize(attachment.fileSize)}
                            </span>
                        </span>

                        <Download
                            size={16}
                            className={`shrink-0 ${
                                isOwn
                                    ? "text-white/70"
                                    : "text-slate-500"
                            }`}
                            aria-hidden="true"
                        />
                    </a>
                );
            })}
        </div>
    );
}

/*
 * --------------------------------------------------
 * CHAT VIEW
 * --------------------------------------------------
 */

export default function ChatView({
    chatId,
    conversation,
    initialMessages,
    currentUserId,
    projectSidebarData,
}: ChatViewProps) {
    const supabase = useMemo(() => createClient(), []);

    const [messages, setMessages] =
        useState<MessageView[]>(initialMessages);

    const [deliveryStatuses, setDeliveryStatuses] =
        useState<Record<string, DeliveryStatus>>({});

    const [failedMessages, setFailedMessages] =
        useState<Record<string, FailedMessageDetail>>({});

    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { isOnline } = useOnlineUsersContext();

    const liveConversation = useMemo(
        () => ({
            ...conversation,
            isOnline: isOnline(conversation.profileId),
        }),
        [conversation, isOnline],
    );

    /*
     * --------------------------------------------------
     * MESSAGE HELPERS
     * --------------------------------------------------
     */

    const addOrReplaceMessage = useCallback(
        (message: MessageView) => {
            setMessages((current) => {
                const existingIndex = current.findIndex(
                    (item) => item.id === message.id,
                );

                if (existingIndex !== -1) {
                    const next = [...current];

                    next[existingIndex] = {
                        ...next[existingIndex],
                        ...message,
                        attachments:
                            message.attachments?.length
                                ? message.attachments
                                : next[existingIndex].attachments ?? [],
                    };

                    return next.sort(
                        (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime(),
                    );
                }

                return [...current, message].sort(
                    (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime(),
                );
            });
        },
        [],
    );

    /*
     * --------------------------------------------------
     * OPTIMISTIC MESSAGE
     * --------------------------------------------------
     */

    const handleOptimistic = useCallback(
        (event: Event) => {
            const detail = (
                event as CustomEvent<OptimisticMessageDetail>
            ).detail;

            if (!detail || detail.conversationId !== chatId) {
                return;
            }

            const optimisticMessage: MessageView = {
                id: detail.tempId,
                content: detail.content,
                senderId: currentUserId,
                senderName: "Eu",
                timestamp: detail.createdAt,
                isOwn: true,
                attachments: [],
            };

            setDeliveryStatuses((current) => ({
                ...current,
                [detail.tempId]: "sending",
            }));

            setFailedMessages((current) => {
                const next = { ...current };
                delete next[detail.tempId];
                return next;
            });

            setError(null);
            addOrReplaceMessage(optimisticMessage);
        },
        [addOrReplaceMessage, chatId, currentUserId],
    );

    /*
     * --------------------------------------------------
     * MESSAGE SENT
     * --------------------------------------------------
     */

    const handleSent = useCallback(
        (event: Event) => {
            const detail = (
                event as CustomEvent<SentMessageDetail>
            ).detail;

            if (!detail || detail.conversationId !== chatId) {
                return;
            }

            const persisted = getPersistedMessage(
                detail.message,
                currentUserId,
            );

            if (!persisted) {
                console.error(
                    "The send action returned an unsupported message shape.",
                    detail.message,
                );
                return;
            }

            setMessages((current) => {
                const withoutTemporary = current.filter(
                    (message) => message.id !== detail.tempId,
                );

                const existingIndex = withoutTemporary.findIndex(
                    (message) => message.id === persisted.id,
                );

                if (existingIndex !== -1) {
                    const next = [...withoutTemporary];

                    next[existingIndex] = {
                        ...next[existingIndex],
                        ...persisted,
                        attachments:
                            persisted.attachments?.length
                                ? persisted.attachments
                                : next[existingIndex].attachments ?? [],
                    };

                    return next.sort(
                        (a, b) =>
                            new Date(a.timestamp).getTime() -
                            new Date(b.timestamp).getTime(),
                    );
                }

                return [...withoutTemporary, persisted].sort(
                    (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime(),
                );
            });

            setDeliveryStatuses((current) => {
                const next = { ...current };

                delete next[detail.tempId];
                next[persisted.id] = "sent";

                return next;
            });

            setFailedMessages((current) => {
                const next = { ...current };
                delete next[detail.tempId];
                return next;
            });
        },
        [chatId, currentUserId],
    );

    /*
     * --------------------------------------------------
     * MESSAGE FAILED
     * --------------------------------------------------
     */

    const handleFailed = useCallback(
        (event: Event) => {
            const detail = (
                event as CustomEvent<FailedMessageDetail>
            ).detail;

            if (!detail || detail.conversationId !== chatId) {
                return;
            }

            setDeliveryStatuses((current) => ({
                ...current,
                [detail.tempId]: "failed",
            }));

            setFailedMessages((current) => ({
                ...current,
                [detail.tempId]: detail,
            }));
        },
        [chatId],
    );

    /*
     * --------------------------------------------------
     * RETRY STARTED
     * --------------------------------------------------
     */

    const handleRetrying = useCallback(
        (event: Event) => {
            const detail = (
                event as CustomEvent<RetryMessageDetail>
            ).detail;

            if (!detail || detail.conversationId !== chatId) {
                return;
            }

            setDeliveryStatuses((current) => ({
                ...current,
                [detail.tempId]: "sending",
            }));

            setFailedMessages((current) => {
                const next = { ...current };
                delete next[detail.tempId];
                return next;
            });

            setError(null);
        },
        [chatId],
    );

    /*
     * --------------------------------------------------
     * MESSAGE EVENTS
     * --------------------------------------------------
     */

    useEffect(() => {
        window.addEventListener(
            "message:optimistic",
            handleOptimistic,
        );

        window.addEventListener(
            "message:sent",
            handleSent,
        );

        window.addEventListener(
            "message:failed",
            handleFailed,
        );

        window.addEventListener(
            "message:retrying",
            handleRetrying,
        );

        return () => {
            window.removeEventListener(
                "message:optimistic",
                handleOptimistic,
            );

            window.removeEventListener(
                "message:sent",
                handleSent,
            );

            window.removeEventListener(
                "message:failed",
                handleFailed,
            );

            window.removeEventListener(
                "message:retrying",
                handleRetrying,
            );
        };
    }, [
        handleOptimistic,
        handleSent,
        handleFailed,
        handleRetrying,
    ]);

    /*
     * --------------------------------------------------
     * INITIAL SERVER DATA
     * --------------------------------------------------
     */

    useEffect(() => {
        setMessages(initialMessages);
        setDeliveryStatuses({});
        setFailedMessages({});
        setError(null);
    }, [chatId]);

    useEffect(() => {
        setMessages((current) => {
            const merged = new Map<string, MessageView>();

            for (const message of current) {
                merged.set(message.id, message);
            }

            for (const message of initialMessages) {
                const existing = merged.get(message.id);

                merged.set(message.id, {
                    ...existing,
                    ...message,
                    attachments:
                        message.attachments?.length
                            ? message.attachments
                            : existing?.attachments ?? [],
                });
            }

            return Array.from(merged.values()).sort(
                (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime(),
            );
        });
    }, [initialMessages]);

    /*
     * --------------------------------------------------
     * REALTIME
     * --------------------------------------------------
     */

    useEffect(() => {
        let cancelled = false;

        const channel = supabase
            .channel(`conversation:${chatId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${chatId}`,
                },
                async (payload) => {
                    if (cancelled) return;

                    const newMessage =
                        payload.new as RealtimeMessage;

                    if (
                        !newMessage.id ||
                        newMessage.conversation_id !== chatId
                    ) {
                        return;
                    }

                    /*
                     * Fetch the complete message from the server.
                     * This also retrieves its signed attachment URLs.
                     */
                    try {
                        const fullMessage =
                            await getMessageByIdAction(newMessage.id);

                        if (cancelled) return;

                        const hydratedMessage = getPersistedMessage(
                            fullMessage,
                            currentUserId,
                        );

                        if (hydratedMessage) {
                            addOrReplaceMessage(hydratedMessage);

                            if (hydratedMessage.isOwn) {
                                setDeliveryStatuses((current) => ({
                                    ...current,
                                    [hydratedMessage.id]:
                                        current[hydratedMessage.id] === "read" ||
                                        current[hydratedMessage.id] === "delivered"
                                            ? current[hydratedMessage.id]
                                            : "sent",
                                }));
                            }

                            return;
                        }
                    } catch (fetchError) {
                        console.error(
                            "Error loading complete realtime message:",
                            fetchError,
                        );
                    }

                    /*
                     * Fallback if the server action fails.
                     * The message remains visible, but attachments
                     * will be loaded when the conversation refreshes.
                     */
                    if (cancelled) return;

                    let senderName = "Utilizador";

                    if (newMessage.sender_id) {
                        const {
                            data: profile,
                            error: profileError,
                        } = await supabase
                            .from("profiles")
                            .select("first_name, last_name")
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
                            senderName = [
                                profile.first_name,
                                profile.last_name,
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .trim() || "Utilizador";
                        }
                    }

                    if (cancelled) return;

                    const realtimeMessage: MessageView = {
                        id: newMessage.id,
                        content: newMessage.content ?? "",
                        senderId: newMessage.sender_id ?? "",
                        senderName,
                        timestamp:
                            newMessage.created_at ??
                            new Date().toISOString(),
                        isOwn:
                            newMessage.sender_id === currentUserId,
                        attachments: [],
                    };

                    addOrReplaceMessage(realtimeMessage);

                    if (realtimeMessage.isOwn) {
                        setDeliveryStatuses((current) => ({
                            ...current,
                            [realtimeMessage.id]:
                                current[realtimeMessage.id] === "read" ||
                                current[realtimeMessage.id] === "delivered"
                                    ? current[realtimeMessage.id]
                                    : "sent",
                        }));
                    }
                },
            );

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                if (!cancelled) setError(null);

                console.log("Realtime connected:", chatId);
            }

            if (
                status === "CHANNEL_ERROR" ||
                status === "TIMED_OUT"
            ) {
                console.error(
                    "Realtime connection problem:",
                    chatId,
                    status,
                );

                if (!cancelled) {
                    setError(
                        "A ligação em tempo real está indisponível. As mensagens enviadas podem continuar visíveis.",
                    );
                }
            }
        });

        return () => {
            cancelled = true;
            void supabase.removeChannel(channel);
        };
    }, [
        chatId,
        currentUserId,
        supabase,
        addOrReplaceMessage,
    ]);

    /*
     * --------------------------------------------------
     * RETRY
     * --------------------------------------------------
     */

    const handleRetry = useCallback(
        (tempId: string) => {
            const failed = failedMessages[tempId];

            if (!failed) return;

            dispatchRetry({
                tempId: failed.tempId,
                conversationId: failed.conversationId,
                content: failed.content,
                files: failed.files ?? [],
            });
        },
        [failedMessages],
    );

    /*
     * --------------------------------------------------
     * SCROLL TO LATEST MESSAGE
     * --------------------------------------------------
     */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
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

    /*
     * --------------------------------------------------
     * CHAT
     * --------------------------------------------------
     */

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 overflow-hidden bg-white">
            <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
                <div className="shrink-0">
                    <MessageHeader conversation={liveConversation} />
                </div>

                {error && (
                    <div
                        role="status"
                        className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800"
                    >
                        {error}
                    </div>
                )}

                <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-white px-3 py-3 sm:px-6 sm:py-6">
                    {messages.length === 0 ? (
                        <div className="flex min-h-full items-center justify-center">
                            <p className="text-center text-sm text-slate-500">
                                Nenhuma mensagem nesta conversa
                            </p>
                        </div>
                    ) : (
                        <MessageList
                            messages={messages}
                            messagesEndRef={messagesEndRef}
                            deliveryStatuses={deliveryStatuses}
                            failedMessages={failedMessages}
                            onRetry={handleRetry}
                        />
                    )}
                </main>

                <div className="shrink-0 border-t border-slate-200 bg-white">
                    <MessageInput conversationId={chatId} />
                </div>
            </section>

            {conversation.conversationType === "project" &&
                projectSidebarData && (
                    <aside className="hidden h-full min-h-0 shrink-0 lg:flex">
                        <ProjectSideBar data={projectSidebarData} />
                    </aside>
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
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    deliveryStatuses: Record<string, DeliveryStatus>;
    failedMessages: Record<string, FailedMessageDetail>;
    onRetry: (tempId: string) => void;
}

function MessageList({
    messages,
    messagesEndRef,
    deliveryStatuses,
    failedMessages,
    onRetry,
}: MessageListProps) {
    const getDateKey = (value: string | Date) => {
        const date =
            value instanceof Date
                ? value
                : new Date(value);

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");
    };

    const formatDateDivider = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();

        const todayKey = getDateKey(now);

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayKey = getDateKey(yesterday);
        const messageDateKey = getDateKey(timestamp);

        if (messageDateKey === todayKey) return "Hoje";
        if (messageDateKey === yesterdayKey) return "Ontem";

        return date.toLocaleDateString("pt-AO", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-4">
            {messages.map((message, index) => {
                const previousMessage = messages[index - 1];

                const showDateDivider =
                    getDateKey(message.timestamp) !==
                    (previousMessage
                        ? getDateKey(previousMessage.timestamp)
                        : null);

                const status = deliveryStatuses[message.id];
                const failed = failedMessages[message.id];

                const attachments = message.attachments ?? [];

                const hasContent =
                    message.content.trim().length > 0;

                return (
                    <div key={message.id}>
                        {showDateDivider && (
                            <div className="my-6 flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-200" />

                                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                                    {formatDateDivider(message.timestamp)}
                                </span>

                                <div className="h-px flex-1 bg-slate-200" />
                            </div>
                        )}

                        <div
                            className={`flex ${
                                message.isOwn
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div className="flex max-w-[90%] items-end gap-2 sm:max-w-[85%]">
                                <div
                                    className={`min-w-0 max-w-full rounded-lg px-4 py-2 sm:max-w-xs lg:max-w-md xl:max-w-lg ${
                                        message.isOwn
                                            ? "rounded-br-none bg-[#002950] text-white"
                                            : "rounded-bl-none bg-[#F1F5F9] text-slate-900"
                                    } ${
                                        status === "failed"
                                            ? "ring-1 ring-red-400"
                                            : ""
                                    }`}
                                >
                                    {!message.isOwn && (
                                        <p className="mb-1 text-xs font-semibold opacity-75">
                                            {message.senderName}
                                        </p>
                                    )}

                                    {hasContent && (
                                        <p className="break-words whitespace-pre-wrap text-sm">
                                            {message.content}
                                        </p>
                                    )}

                                    <MessageAttachments
                                        attachments={attachments}
                                        isOwn={message.isOwn}
                                    />

                                    <div
                                        className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                                            message.isOwn
                                                ? "text-slate-300"
                                                : "text-slate-600"
                                        }`}
                                    >
                                        <span>
                                            {new Date(
                                                message.timestamp,
                                            ).toLocaleTimeString("pt-AO", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>

                                        {message.isOwn && status && (
                                            <MessageStatus status={status} />
                                        )}
                                    </div>
                                </div>

                                {failed && (
                                    <button
                                        type="button"
                                        onClick={() => onRetry(message.id)}
                                        title="Tentar enviar novamente"
                                        aria-label="Tentar enviar novamente esta mensagem"
                                        className="mb-1 flex shrink-0 items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                    >
                                        <RotateCcw
                                            size={14}
                                            aria-hidden="true"
                                        />

                                        <span className="hidden sm:inline">
                                            Repetir
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            <div ref={messagesEndRef} />
        </div>
    );
}