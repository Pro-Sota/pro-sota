
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Loader2,
  Paperclip,
  Send,
} from "lucide-react";

import { LABELS } from "./chat_labels";
import { sendMessageAction } from "@/actions/message";

interface MessageInputProps {
  conversationId: string;
}

interface OptimisticMessage {
  tempId: string;
  conversationId: string;
  content: string;
  createdAt: string;
}

interface RetryMessageDetail {
  tempId: string;
  conversationId: string;
  content: string;
}

function dispatchMessageEvent(
  name: string,
  detail: unknown,
) {
  window.dispatchEvent(
    new CustomEvent(name, { detail }),
  );
}

export default function MessageInput({
  conversationId,
}: MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(new Set<string>());
  const mounted = useRef(false);

  const transmitMessage = useCallback(
    async (
      message: OptimisticMessage,
      optimisticAlreadyDisplayed: boolean,
    ) => {
      if (inFlight.current.has(message.tempId)) {
        return;
      }

      inFlight.current.add(message.tempId);

      if (mounted.current) {
        setIsSending(true);
        setError(null);
      }

      if (optimisticAlreadyDisplayed) {
        dispatchMessageEvent("message:retrying", message);
      } else {
        // The UI can render the message before the server responds.
        dispatchMessageEvent("message:optimistic", message);
      }

      try {
        const sentMessage = await sendMessageAction(
          message.conversationId,
          message.content,
        );

        dispatchMessageEvent("message:sent", {
          tempId: message.tempId,
          conversationId: message.conversationId,
          message: sentMessage,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Não foi possível enviar a mensagem.";

        console.error("Error sending message:", err);

        dispatchMessageEvent("message:failed", {
          ...message,
          error: errorMessage,
        });

        if (mounted.current) {
          setError(errorMessage);
        }
      } finally {
        inFlight.current.delete(message.tempId);

        if (mounted.current) {
          setIsSending(inFlight.current.size > 0);
        }
      }
    },
    [],
  );

  useEffect(() => {
    mounted.current = true;

    const handleRetry = (event: Event) => {
      const detail = (
        event as CustomEvent<RetryMessageDetail>
      ).detail;

      if (
        !detail ||
        detail.conversationId !== conversationId ||
        !detail.tempId ||
        !detail.content
      ) {
        return;
      }

      void transmitMessage(
        {
          tempId: detail.tempId,
          conversationId: detail.conversationId,
          content: detail.content,
          createdAt: new Date().toISOString(),
        },
        true,
      );
    };

    window.addEventListener("message:retry", handleRetry);

    return () => {
      mounted.current = false;
      window.removeEventListener("message:retry", handleRetry);
    };
  }, [conversationId, transmitMessage]);

  const handleSendMessage = useCallback(async () => {
    const content = messageInput.trim();

    if (!content || isSending || !conversationId) {
      return;
    }

    const message: OptimisticMessage = {
      tempId: crypto.randomUUID(),
      conversationId,
      content,
      createdAt: new Date().toISOString(),
    };

    // Clear the input immediately, without waiting for the server.
    setMessageInput("");
    setError(null);

    void transmitMessage(message, false);
  }, [
    conversationId,
    isSending,
    messageInput,
    transmitMessage,
  ]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-4">
      <div className="flex items-end gap-3">
        <button
          type="button"
          aria-label="Anexar ficheiro"
          title="Anexar ficheiro"
          className="shrink-0 rounded-lg border border-[#BD9655] p-3 text-slate-600 transition-colors hover:bg-[#BD9655]/10"
        >
          <Paperclip size={17} aria-hidden="true" />
        </button>

        <input
          type="text"
          value={messageInput}
          onChange={(event) => {
            setMessageInput(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={LABELS.typeMessage}
          aria-label="Mensagem"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-1 focus:ring-[#BD9655]"
        />

        <button
          type="button"
          onClick={() => void handleSendMessage()}
          disabled={!messageInput.trim() || isSending}
          aria-label="Enviar mensagem"
          title="Enviar mensagem"
          className="shrink-0 rounded-lg bg-[#BD9655] p-3 text-white transition-colors hover:bg-[#a98248] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <Loader2
              size={17}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Send size={17} aria-hidden="true" />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          O envio falhou. Pode tentar novamente na mensagem.
        </p>
      )}
    </div>
  );
}
