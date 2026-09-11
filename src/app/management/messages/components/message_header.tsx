"use client";

import { MoreVertical } from "lucide-react";
import { useParams } from "next/navigation";

import { LABELS } from "./chat_labels";
import type { ConversationWithDetails } from "./chat_item";

interface MessageHeaderProps {
  conversations: ConversationWithDetails[];
}

export default function MessageHeader({
  conversations,
}: MessageHeaderProps) {
  const params = useParams<{
    chatId?: string | string[];
  }>();

  const selectedChatId = Array.isArray(params.chatId)
    ? params.chatId[0]
    : params.chatId;

  const selectedConversation = selectedChatId
    ? conversations.find(
        (conversation) => conversation.id === selectedChatId,
      )
    : undefined;

  const displayName =
    selectedConversation?.displayName || "Conversa Selecionada";

  return (
    <header className="flex h-[73px] items-center justify-between border-b border-[#BD9655] bg-white px-6 py-4">
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold text-slate-900">
          {selectedChatId
            ? displayName
            : LABELS.noConversation}
        </h2>

        <p className="text-sm text-slate-500">
          {selectedChatId
            ? selectedConversation?.isOnline
              ? "Online"
              : "Última atividade há 2 minutos"
            : LABELS.chooseTeamOrChat}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={!selectedChatId}
          aria-label="Mais opções"
          title="Mais opções"
          className={`rounded-lg border p-2.5 transition-colors ${
            selectedChatId
              ? "border-[#BD9655] text-slate-600 hover:bg-slate-50"
              : "cursor-not-allowed border-[#BD9655] text-slate-400"
          }`}
        >
          <MoreVertical
            size={17}
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}