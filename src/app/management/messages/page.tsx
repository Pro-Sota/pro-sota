"use client";

import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Building2,
  Users,
  Calendar,
  FolderOpen,
  User,
  ChevronDown,
  MessageCircle,
  Plus,
} from "lucide-react";

import { useState } from "react";

const projectConversations: Chat[] = [];
const directConversations: Chat[] = [];
const messages: Message[] = [];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Chat {
  id: string;
  isOnline: boolean;
  name: string;
  time: string;
  last: string;
  unread: number;
}

interface Message {
  id: string;
  isMine: boolean;
  sender: string;
  text: string;
  time: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LABELS = {
  messages: "Mensagens",
  search: "Pesquisar...",
  projectMessages: "Mensagens de Projeto",
  directMessages: "Mensagens Diretas",
  noConversation: "Nenhuma conversa selecionada",
  chooseTeamOrChat: "Escolha uma equipa ou conversa para começar",
  noMessages: "Nenhuma mensagem ainda",
  startConversation: "Inicie uma conversa com a equipa deste projeto.",
  typeMessage: "Escreva uma mensagem...",
  projectInfo: "Informações do Projeto",
  status: "Estado",
  construction: "Em construção",
  deadline: "Prazo",
  team: "Equipa",
  members: "membros",
  recentFiles: "Ficheiros Recentes",
  noProjectSelected: "Nenhum projeto selecionado",
  selectConversation: "Selecione uma conversa para visualizar os detalhes do projeto.",
  newMessage: "Nova mensagem",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Count total unread messages in a conversation list
 */
function countUnreadMessages(chats: Chat[]): number {
  return chats.reduce((sum, chat) => sum + chat.unread, 0);
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Chat Item Component
 */
interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: (id: string) => void;
  icon: React.ReactNode;
}

function ChatItem({ chat, isSelected, onSelect, icon }: ChatItemProps) {
  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`w-full transition-all duration-200 ${
        isSelected
          ? "bg-slate-100 border-l-2 border-l-slate-900"
          : "border-l-2 border-l-transparent hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              isSelected ? "bg-slate-900" : "bg-slate-200"
            }`}
          >
            <div className={isSelected ? "text-white" : "text-slate-600"}>
              {icon}
            </div>
          </div>

          {chat.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="truncate text-sm font-medium text-slate-900">
              {chat.name}
            </h3>
            <span className="shrink-0 text-xs text-slate-400">
              {chat.time}
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">
            {chat.last}
          </p>
        </div>

        {/* Unread Badge */}
        {chat.unread > 0 && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
            {chat.unread > 9 ? "9+" : chat.unread}
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Collapsible Chat Section
 */
interface ChatSectionProps {
  title: string;
  chats: Chat[];
  icon: React.ReactNode;
  onSelectChat: (id: string) => void;
  selectedChatId: string;
}

function ChatSection({
  title,
  chats,
  icon,
  onSelectChat,
  selectedChatId,
}: ChatSectionProps) {

  const [isExpanded, setIsExpanded] = useState(true);
  const unreadCount = countUnreadMessages(chats);
  
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-600 shrink-0">{icon}</span>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <span className="ml-auto mr-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {chats.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${
              isExpanded ? "" : "-rotate-90"
            }`}
          />
        </div>
      </button>

      {/* Chat List */}
      {isExpanded && chats.length > 0 && (
        <div className="bg-slate-50/50">
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === selectedChatId}
              onSelect={onSelectChat}
              icon={icon}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {isExpanded && chats.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-slate-500">
            Nenhuma conversa para exibir
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Empty Message State
 */
function EmptyMessageState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <MessageCircle className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="mt-6 text-base font-semibold text-slate-900">
        {LABELS.noMessages}
      </h3>

      <p className="mt-2 max-w-xs text-sm text-slate-500">
        {LABELS.startConversation}
      </p>

      <button className="mt-6 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
        <Plus size={16} />
        {LABELS.newMessage}
      </button>
    </div>
  );
}

/**
 * Empty Project Info State
 */
function EmptyProjectInfo() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <FolderOpen className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {LABELS.noProjectSelected}
      </h3>

      <p className="mt-2 max-w-xs text-sm text-slate-500">
        {LABELS.selectConversation}
      </p>
    </div>
  );
}

/**
 * Project Info Card
 */
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200">
        <div className="text-slate-600">{icon}</div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CommunicationPage() {
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle message sending logic here
      setMessageInput("");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-slate-900">
      {/* ========== SIDEBAR - LEFT ========== */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-200 lg:flex bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 p-5 space-y-4">
          <h1 className="text-xl font-bold tracking-tight">{LABELS.messages}</h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder={LABELS.search}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-900/5"
            />
          </div>
        </div>

        {/* Chat Sections */}
        <div className="flex-1 overflow-y-auto">
          <ChatSection
            title={LABELS.projectMessages}
            chats={projectConversations}
            icon={<Building2 size={18} />}
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
          />

          <ChatSection
            title={LABELS.directMessages}
            chats={directConversations}
            icon={<User size={18} />}
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>
      </aside>

      {/* ========== MAIN CHAT AREA ========== */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Header */}
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
              className={`rounded-lg border p-2.5 transition-colors ${
                selectedChatId
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                  : "border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              disabled={!selectedChatId}
              title="Chamada"
            >
              <Phone size={17} />
            </button>
            <button
              className={`rounded-lg border p-2.5 transition-colors ${
                selectedChatId
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                  : "border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              disabled={!selectedChatId}
              title="Vídeo"
            >
              <Video size={17} />
            </button>
            <button
              className={`rounded-lg border p-2.5 transition-colors ${
                selectedChatId
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

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {messages.length === 0 ? (
            <EmptyMessageState />
          ) : (
            <div className="space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 animation-fade-in ${
                      message.isMine
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
                      className={`mt-2 text-right text-xs ${
                        message.isMine ? "text-slate-300" : "text-slate-400"
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
              className={`shrink-0 rounded-lg p-3 text-white transition ${
                selectedChatId
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
      </main>

      {/* ========== SIDEBAR - RIGHT (Project Info) ========== */}
      <aside className="hidden w-80 shrink-0 flex-col border-l border-slate-200 xl:flex bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">{LABELS.projectInfo}</h2>
        </div>

        {/* Content */}
        {selectedChatId ? (
          <div className="space-y-4 overflow-y-auto flex-1 p-6">
            <InfoCard
              icon={<Building2 size={16} />}
              label={LABELS.status}
              value={LABELS.construction}
            />

            <InfoCard
              icon={<Calendar size={16} />}
              label={LABELS.deadline}
              value="12 de outubro de 2026"
            />

            <InfoCard
              icon={<Users size={16} />}
              label={LABELS.team}
              value={`8 ${LABELS.members}`}
            />

            <InfoCard
              icon={<FolderOpen size={16} />}
              label={LABELS.recentFiles}
              value="FloorPlan_V5.pdf"
            />

            {/* Divider */}
            <div className="h-px bg-slate-200 my-4" />

            {/* Team Members Section */}
            <div>
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Membros da Equipa
              </h3>
              <div className="space-y-2">
                {[
                  { name: "João Silva", role: "Arquiteto" },
                  { name: "Maria Santos", role: "Engenheiro" },
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xs font-semibold text-white">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyProjectInfo />
        )}
      </aside>
    </div>
  );
}