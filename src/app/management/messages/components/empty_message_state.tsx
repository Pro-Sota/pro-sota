"use client";

import { MessageCircle, Plus } from "lucide-react";
import { useState } from "react";

import NewConversationModal from "@/app/management/messages/components/new_message_modal";

export default function EmptyMessageState() {
    const [showNewConversationModal, setShowNewConversationModal] =
        useState(false);

    return (
        <>
            <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <MessageCircle
                        className="h-7 w-7 text-slate-400"
                        aria-hidden="true"
                    />
                </div>

                <h3 className="mt-6 text-base font-semibold text-slate-900">
                    Nenhuma conversa seleccionada
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Seleccione uma conversa na lista para começar a
                    trocar mensagens.
                </p>

                <button
                    type="button"
                    onClick={() => setShowNewConversationModal(true)}
                    className="mt-6 flex cursor-pointer items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition-colors hover:bg-[#BD9655]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2"
                >
                    <Plus
                        size={16}
                        aria-hidden="true"
                    />

                    Nova mensagem
                </button>
            </div>

            <NewConversationModal
                open={showNewConversationModal}
                onClose={() =>
                    setShowNewConversationModal(false)
                }
            />
        </>
    );
}