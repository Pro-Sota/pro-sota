"use client";

import Loader from "@/app/components/loader";
import NewConversationModal from "@/app/components/new_message_modal";
import {
  Send,
  Paperclip,
} from "lucide-react";

import { LABELS } from "./components/chat_labels";

import { useEffect, useState } from "react";
import EmptyMessageState from "./components/empty_message_state";
import MessageSideBar from "./components/side_bar";
import MessageHeader from "./components/message_header";
import ProjectSideBar from "./components/project_side_bar";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Message {
  id: string;
  isMine: boolean;
  sender: string;
  text: string;
  time: string;
}

export default function CommunicationPage() {
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const messages: Message[] = [];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle message sending logic here
      setMessageInput("");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-slate-900">
      {/* ========== SIDEBAR - LEFT ========== */}
      <MessageSideBar projectConversations={[]} directConversations={[]} selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} />

      {/* ========== MAIN CHAT AREA ========== */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <MessageHeader selectedChatId={""} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {messages.length === 0 ? (
            <EmptyMessageState onNewMessage={setShowNewConversationModal} />
          ) : (
            <div className="space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMine ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 animation-fade-in ${message.isMine
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-900"
                      }`}
                  >
                    {!message.isMine && (
                      <p className="mb-1.5 text-xs font-semibold text-slate-500">
                        {message.sender}
                      </p>
                    )}

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>

                    <p
                      className={`mt-2 text-right text-xs ${message.isMine ? "text-slate-300" : "text-slate-400"
                        }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Composer */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex items-end gap-3">
            <button
              className="shrink-0 rounded-lg border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50 hover:border-slate-300"
              title="Anexar arquivo"
              disabled={!selectedChatId}
            >
              <Paperclip size={17} />
            </button>

            <input
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-500 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900/5"
              placeholder={LABELS.typeMessage}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!selectedChatId}
            />

            <button
              className={`shrink-0 rounded-lg p-3 text-white transition ${selectedChatId
                ? "bg-slate-900 hover:bg-slate-800 active:bg-slate-950"
                : "bg-slate-400 cursor-not-allowed"
                }`}
              onClick={handleSendMessage}
              disabled={!selectedChatId}
              title="Enviar"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
        <NewConversationModal open={showNewConversationModal} onClose={() => setShowNewConversationModal(false)} />

      </main>

      {/* ========== SIDEBAR - RIGHT (Project Info) ========== */}
      <ProjectSideBar selectedChatId={selectedChatId} />

    </div>
  );
}