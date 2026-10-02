"use client";

import { Building2, Plus, User } from "lucide-react";
import { useState } from "react";

import NewConversationModal from "@/app/management/messages/components/new_message_modal";
import type { ChatSummary } from "@/services/messages";

import ChatSection from "./chat_section";

interface CommunicationMobileProps {
    projectConversations: ChatSummary[];
    directConversations: ChatSummary[];
}

export default function CommunicationMobile({
    projectConversations,
    directConversations,
}: CommunicationMobileProps) {
    const [
        showNewConversationModal,
        setShowNewConversationModal,
    ] = useState(false);

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col bg-white lg:hidden">
            <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-slate-200 px-4">
                <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                    Mensagens
                </h1>

                <button
                    type="button"
                    onClick={() =>
                        setShowNewConversationModal(true)
                    }
                    aria-label="Nova mensagem"
                    title="Nova mensagem"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#BD9655] text-[#002950] transition-colors hover:bg-[#BD9655]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655] focus-visible:ring-offset-2"
                >
                    <Plus
                        size={18}
                        aria-hidden="true"
                    />
                </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <ChatSection
                    title="Mensagens de Projectos"
                    chats={projectConversations}
                    icon={<Building2 size={17} />}
                />

                <ChatSection
                    title="Mensagens Directas"
                    chats={directConversations}
                    icon={<User size={17} />}
                />
            </div>

            <NewConversationModal
                open={showNewConversationModal}
                onClose={() =>
                    setShowNewConversationModal(false)
                }
            />
        </div>
    );
}