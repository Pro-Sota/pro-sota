"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";

import Loader from "@/app/components/loader";
import {
  getMessagesAction,
} from "@/app/actions/message";
import type {
  MessageView,
} from "@/services/messages";
import {
  createClient,
} from "@/app/lib/supabase/client";

interface RealtimeMessage {
  id: string;
  conversation_id: string;
  content: string | null;
  sender_id: string | null;
  created_at: string | null;
}

export default function ChatPage() {
  const params =
    useParams<{
      chatId?: string | string[];
    }>();

  const selectedChatId =
    Array.isArray(params.chatId)
      ? params.chatId[0]
      : params.chatId;

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const [
    messages,
    setMessages,
  ] = useState<MessageView[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const currentUserIdRef =
    useRef<string | null>(null);

  /*
   * --------------------------------------------------
   * GET CURRENT USER
   * --------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser =
      async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            console.error(
              "Error getting current user:",
              userError,
            );
            return;
          }

          if (mounted) {
            currentUserIdRef.current =
              user?.id ?? null;
          }
        } catch (err) {
          console.error(
            "Unexpected authentication error:",
            err,
          );
        }
      };

    void loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /*
   * --------------------------------------------------
   * SCROLL TO BOTTOM
   * --------------------------------------------------
   */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * --------------------------------------------------
   * LOAD EXISTING MESSAGES
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchMessages =
      async () => {
        setLoading(true);
        setError(null);

        try {
          const data =
            await getMessagesAction(
              selectedChatId,
            );

          if (!cancelled) {
            setMessages(data);
          }
        } catch (err) {
          console.error(
            "Error fetching messages:",
            err,
          );

          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : "Falha ao carregar as mensagens",
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedChatId]);

  /*
   * --------------------------------------------------
   * RECEIVE MESSAGE SENT FROM THIS BROWSER
   * --------------------------------------------------
   *
   * MessageInput dispatches:
   *
   * window.dispatchEvent(
   *   new CustomEvent("message:sent", {
   *     detail: sentMessage,
   *   }),
   * );
   *
   */

  useEffect(() => {
    if (!selectedChatId) {
      return;
    }

    const handleSentMessage =
      (event: Event) => {
        const customEvent =
          event as CustomEvent<MessageView>;

        const message =
          customEvent.detail;

        if (!message) {
          return;
        }

        setMessages(
          (current) => {
            /*
             * Prevent duplicates.
             */
            if (
              current.some(
                (item) =>
                  item.id ===
                  message.id,
              )
            ) {
              return current;
            }

            return [
              ...current,
              message,
            ].sort(
              (a, b) =>
                new Date(
                  a.timestamp,
                ).getTime() -
                new Date(
                  b.timestamp,
                ).getTime(),
            );
          },
        );
      };

    window.addEventListener(
      "message:sent",
      handleSentMessage,
    );

    return () => {
      window.removeEventListener(
        "message:sent",
        handleSentMessage,
      );
    };
  }, [selectedChatId]);

  /*
   * --------------------------------------------------
   * SUPABASE REALTIME
   * --------------------------------------------------
   *
   * IMPORTANT:
   *
   * 1. Create channel
   * 2. Add .on(...)
   * 3. Call .subscribe()
   *
   * NEVER call .subscribe() before .on().
   */

  useEffect(() => {
    if (!selectedChatId) {
      return;
    }

    let cancelled = false;

    const channel =
      supabase.channel(
        `conversation:${selectedChatId}`,
      );

    /*
     * Add the realtime listener BEFORE subscribe().
     */
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedChatId}`,
      },
      async (payload) => {
        if (cancelled) {
          return;
        }

        const newMessage =
          payload.new as RealtimeMessage;

        if (!newMessage.id) {
          return;
        }

        /*
         * Check whether this message is
         * already displayed.
         *
         * We cannot reliably read React state
         * here because the callback can be
         * long-lived, so use the functional
         * state update below.
         */

        let messageAlreadyExists =
          false;

        setMessages(
          (current) => {
            messageAlreadyExists =
              current.some(
                (message) =>
                  message.id ===
                  newMessage.id,
              );

            return current;
          },
        );

        if (messageAlreadyExists) {
          return;
        }

        /*
         * Get sender profile.
         */
        let senderName =
          "Utilizador";

        if (
          newMessage.sender_id
        ) {
          const {
            data: profile,
            error:
              profileError,
          } =
            await supabase
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
              `${profile.first_name ?? ""} ${
                profile.last_name ?? ""
              }`.trim() ||
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
              newMessage.content ??
              "",

            senderId:
              newMessage.sender_id ??
              "",

            senderName,

            timestamp:
              newMessage.created_at ??
              new Date().toISOString(),

            isOwn:
              newMessage.sender_id ===
              currentUserIdRef.current,
          };

        /*
         * Add the realtime message.
         */
        setMessages(
          (current) => {
            /*
             * Check again because the
             * async profile query above may
             * have taken some time.
             */
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
          },
        );
      },
    );

    /*
     * Subscribe ONLY AFTER .on().
     */
    channel.subscribe(
      (status) => {
        if (
          status === "SUBSCRIBED"
        ) {
          console.log(
            "Realtime connected:",
            selectedChatId,
          );
        }

        if (
          status ===
          "CHANNEL_ERROR"
        ) {
          console.error(
            "Realtime channel error:",
            selectedChatId,
          );
        }

        if (
          status === "TIMED_OUT"
        ) {
          console.error(
            "Realtime channel timed out:",
            selectedChatId,
          );
        }
      },
    );

    /*
     * Cleanup when changing conversation
     * or leaving the page.
     */
    return () => {
      cancelled = true;

      void supabase.removeChannel(
        channel,
      );
    };
  }, [
    selectedChatId,
    supabase,
  ]);

  /*
   * --------------------------------------------------
   * NO CONVERSATION SELECTED
   * --------------------------------------------------
   */

  if (!selectedChatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">
            Selecione uma conversa para começar
          </p>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (loading) {
    return <Loader />;
  }

  /*
   * --------------------------------------------------
   * ERROR
   * --------------------------------------------------
   */

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
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * EMPTY CONVERSATION
   * --------------------------------------------------
   */

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Nenhuma mensagem nesta conversa
          </p>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * MESSAGES
   * --------------------------------------------------
   */

  return (
    <div className="space-y-4 bg-[#F7F7F5]">
      {messages.map(
        (message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isOwn
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md xl:max-w-lg ${
                message.isOwn
                  ? "rounded-br-none bg-slate-900 text-white"
                  : "rounded-bl-none bg-slate-200 text-slate-900"
              }`}
            >
              {!message.isOwn && (
                <p className="mb-1 text-xs font-semibold opacity-75">
                  {message.senderName}
                </p>
              )}

              <p className="break-words text-sm">
                {message.content}
              </p>

              <p
                className={`mt-1 text-xs ${
                  message.isOwn
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                {new Date(
                  message.timestamp,
                ).toLocaleTimeString(
                  "pt-BR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            </div>
          </div>
        ),
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}