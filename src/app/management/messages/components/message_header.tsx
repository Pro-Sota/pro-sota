"use client";

import { MoreVertical } from "lucide-react";
import { LABELS } from "./chat_labels";
import { useParams } from "next/navigation";

export default function MessageHeader() {
  const params = useParams<{ chatId?: string }>();

  const selectedChatId = params.chatId;

  return (
    <header className="flex h-[73px] items-center justify-between border-b border-[#BD9655] px-6 py-4 bg-white">
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-slate-900">
          {selectedChatId ? "Conversa Selecionada" : LABELS.noConversation}
        </h2>
        <p className="text-sm text-slate-500">
          {selectedChatId
            ? "Última atividade há 2 minutos"
            : LABELS.chooseTeamOrChat}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 shrink-0">
        <button
          className={`rounded-lg border p-2.5 transition-colors ${
            selectedChatId
              ? "border-[#BD9655] text-slate-600 hover:bg-slate-50"
              : "border-[#BD9655] text-slate-400 cursor-not-allowed"
          }`}
          disabled={!selectedChatId}
          title="Mais opções"
        >
          <MoreVertical size={17} />
        </button>
      </div>
    </header>
  );
}
