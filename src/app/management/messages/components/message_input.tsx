
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
  X,
  FileText,
} from "lucide-react";

import { LABELS } from "./chat_labels";
import {
  sendMessageAction,
  sendMessageWithAttachmentsAction,
} from "@/actions/message";

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

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(new Set<string>());
  const mounted = useRef(false);

  const addAttachments = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const incoming = Array.from(selectedFiles);

      setError(null);

      setAttachments((current) => {
        const next = [...current];

        for (const file of incoming) {
          if (!ALLOWED_TYPES.has(file.type)) {
            setError(`Formato não permitido: ${file.name}`);
            continue;
          }

          if (file.size <= 0 || file.size > MAX_ATTACHMENT_SIZE) {
            setError(`${file.name} deve ter menos de 10 MB.`);
            continue;
          }

          if (next.some(
            (item) =>
              item.name === file.name &&
              item.size === file.size &&
              item.lastModified === file.lastModified,
          )) {
            continue;
          }

          if (next.length >= MAX_ATTACHMENTS) {
            setError("Pode anexar no máximo 5 ficheiros.");
            break;
          }

          next.push(file);
        }

        return next;
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
  );

  const removeAttachment = useCallback((index: number) => {
    setAttachments((current) =>
      current.filter((_, i) => i !== index),
    );
  }, []);

  const transmitMessage = useCallback(
    async (
      message: OptimisticMessage,
      optimisticAlreadyDisplayed: boolean,
      files: File[] = [],
    ) => {
      if (inFlight.current.has(message.tempId)) return;

      inFlight.current.add(message.tempId);

      if (mounted.current) {
        setIsSending(true);
        setError(null);
      }

      if (optimisticAlreadyDisplayed) {
        dispatchMessageEvent("message:retrying", message);
      } else {
        dispatchMessageEvent("message:optimistic", message);
      }

      try {
        let sentMessage;

        if (files.length > 0) {
          const formData = new FormData();

          formData.append(
            "conversationId",
            message.conversationId,
          );

          formData.append("content", message.content);

          for (const file of files) {
            formData.append("files", file);
          }

          sentMessage =
            await sendMessageWithAttachmentsAction(formData);
        } else {
          sentMessage = await sendMessageAction(
            message.conversationId,
            message.content,
          );
        }

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

    if (
      (!content && attachments.length === 0) ||
      isSending ||
      !conversationId
    ) {
      return;
    }

    const message: OptimisticMessage = {
      tempId: crypto.randomUUID(),
      conversationId,
      content,
      createdAt: new Date().toISOString(),
    };

    const filesToSend = [...attachments];

    setMessageInput("");
    setAttachments([]);
    setError(null);

    void transmitMessage(
      message,
      false,
      filesToSend,
    );
  }, [
    attachments,
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
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}`}
              className="flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <FileText
                size={16}
                className="shrink-0 text-slate-500"
              />

              <div className="min-w-0">
                <p className="max-w-48 truncate text-xs font-medium text-slate-700">
                  {file.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeAttachment(index)}
                disabled={isSending}
                aria-label={`Remover ${file.name}`}
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx"
        className="hidden"
        onChange={(event) =>
          addAttachments(event.target.files)
        }
      />

      <div className="flex items-end gap-3">
        <button
          type="button"
          aria-label="Anexar ficheiro"
          title="Anexar ficheiro"
          disabled={isSending}
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-lg border border-[#BD9655] p-3 text-slate-600 transition-colors hover:bg-[#BD9655]/10 disabled:opacity-50"
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
          maxLength={4000}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#BD9655] focus:ring-1 focus:ring-[#BD9655]"
        />

        <button
          type="button"
          onClick={() => void handleSendMessage()}
          disabled={
            (!messageInput.trim() && attachments.length === 0) ||
            isSending
          }
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
          {error}
        </p>
      )}

      <p className="mt-2 text-[10px] text-slate-400">
        Até 5 ficheiros · 10 MB por ficheiro
      </p>
    </div>
  );
}
