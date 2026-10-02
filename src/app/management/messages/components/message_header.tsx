"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    ArrowLeft,
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
    const router = useRouter();

    const [isMenuOpen, setIsMenuOpen] =
        useState(false);

    const isProject =
        conversation.conversationType === "project";

    const handleBack = () => {
        router.push("/management/messages");
    };

    const handleMarkAsUnread = () => {
        setIsMenuOpen(false);

        // TODO: implementar estado de leitura
    };

    const handleMute = () => {
        setIsMenuOpen(false);

        // TODO: implementar notificações
    };

    const handleInfo = () => {
        setIsMenuOpen(false);

        if (
            isProject &&
            conversation.projectId
        ) {
            router.push(
                `/management/projects/${conversation.projectId}`,
            );
        }
    };

    return (
        <header className="relative flex h-[64px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 sm:h-[73px] sm:px-6">
            <div className="flex min-w-0 flex-1 items-center">
                <button
                    type="button"
                    onClick={handleBack}
                    aria-label="Voltar para as mensagens"
                    className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] lg:hidden"
                >
                    <ArrowLeft
                        size={19}
                        aria-hidden="true"
                    />
                </button>

                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                        {conversation.displayName}
                    </h2>

                    <p className="truncate text-xs text-slate-500 sm:text-sm">
                        {conversation.isOnline
                            ? "Online"
                            : "Última actividade"}
                    </p>
                </div>
            </div>

            <div className="relative ml-3 shrink-0">
                <button
                    type="button"
                    aria-label="Mais opções"
                    title="Mais opções"
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    onClick={() =>
                        setIsMenuOpen(
                            (current) => !current,
                        )
                    }
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
                            onClick={
                                handleMarkAsUnread
                            }
                            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <Check
                                size={16}
                                className="shrink-0 text-slate-400"
                                aria-hidden="true"
                            />

                            <span>
                                Marcar como não lida
                            </span>
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

                            <span>
                                Silenciar notificações
                            </span>
                        </button>

                        <div
                            className="my-1 border-t border-slate-100"
                            aria-hidden="true"
                        />

                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleInfo}
                            disabled={
                                !isProject ||
                                !conversation.projectId
                            }
                            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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