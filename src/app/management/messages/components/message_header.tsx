"use client";

import { useState } from "react";
import {
  BellOff,
  Check,
  Info,
  MoreVertical,
  UserRound,
} from "lucide-react";

import type { ConversationWithDetails } from "./chat_item";

interface MessageHeaderProps {
  conversation: ConversationWithDetails;
}

export default function MessageHeader({
  conversation,
}: MessageHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isProject =
    conversation.conversationType === "project";

  const handleMarkAsUnread = () => {
    // TODO: implementar quando existir a action de marcar como não lida
    setIsMenuOpen(false);
  };

  const handleMute = () => {
    // TODO: implementar quando existir a action de silenciar
    setIsMenuOpen(false);
  };

  const handleInfo = () => {
    // TODO: abrir perfil ou informações do projecto
    setIsMenuOpen(false);
  };

  return (
    <header className="relative flex h-[73px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold text-slate-900">
          {conversation.displayName}
        </h2>

        <p className="text-sm text-slate-500">
          {conversation.isOnline
            ? "Online"
            : "Última actividade"}
        </p>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="Mais opções"
          title="Mais opções"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
          className={`rounded-lg border p-2.5 text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] ${
            isMenuOpen
              ? "border-slate-300 bg-slate-50"
              : "border-slate-200 hover:bg-slate-50"
          }`}
        >
          <MoreVertical
            size={17}
            aria-hidden="true"
          />
        </button>

        {isMenuOpen && (
          <div
            role="menu"
            aria-label="Opções da conversa"
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-slate-900/10"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleMarkAsUnread}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Check
                size={16}
                className="shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <span>Marcar como não lida</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleMute}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <BellOff
                size={16}
                className="shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <span>Silenciar notificações</span>
            </button>

            <div
              className="my-1 border-t border-slate-100"
              aria-hidden="true"
            />

            <button
              type="button"
              role="menuitem"
              onClick={handleInfo}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              {isProject ? (
                <Info
                  size={16}
                  className="shrink-0 text-slate-400"
                  aria-hidden="true"
                />
              ) : (
                <UserRound
                  size={16}
                  className="shrink-0 text-slate-400"
                  aria-hidden="true"
                />
              )}

              <span>
                {isProject
                  ? "Informações do projecto"
                  : "Ver perfil"}
              </span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}