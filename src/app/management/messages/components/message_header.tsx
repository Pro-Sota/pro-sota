import { Phone, Video, MoreVertical } from "lucide-react";
import { LABELS } from "./chat_labels";


interface props {
    selectedChatId:string
}

export default function MessageHeader({selectedChatId} : props) {
    return (
         <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
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
              className={`rounded-lg border p-2.5 transition-colors ${selectedChatId
                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                : "border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              disabled={!selectedChatId}
              title="Chamada"
            >
              <Phone size={17} />
            </button>
            <button
              className={`rounded-lg border p-2.5 transition-colors ${selectedChatId
                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                : "border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              disabled={!selectedChatId}
              title="Vídeo"
            >
              <Video size={17} />
            </button>
            <button
              className={`rounded-lg border p-2.5 transition-colors ${selectedChatId
                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                : "border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              disabled={!selectedChatId}
              title="Mais opções"
            >
              <MoreVertical size={17} />
            </button>
          </div>
        </header>
    )
}