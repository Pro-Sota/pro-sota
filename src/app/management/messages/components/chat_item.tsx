"use client";

import { Database } from "@/app/lib/supabase/models";

type Conversation =
  Database["public"]["Tables"]["conversations"]["Row"];

export interface ConversationWithDetails extends Conversation {
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  unreadCount: number;
  lastMessage: string;
  updated_at:string;
}

interface ChatItemProps {
  chat: ConversationWithDetails;
  isSelected: boolean;
  onSelect: (id: string) => void;
  icon: React.ReactNode;
}

export default function ChatItem({
  chat,
  isSelected,
  onSelect,
  icon,
}: ChatItemProps) {
  const displayTime = chat.updated_at
    ? new Intl.DateTimeFormat("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(chat.updated_at))
    : "";

  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`w-full transition-all duration-200 ${
        isSelected
          ? "bg-slate-100 border-l-2 border-l-slate-900"
          : "border-l-2 border-l-transparent hover:bg-slate-50"
      }`}
      aria-current={isSelected ? "page" : undefined}
      aria-label={`${chat.displayName} - ${chat.lastMessage}`}
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
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
              aria-label="Online"
              title="Online"
            />
          )}
        </div>

        {/* Chat Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-medium text-slate-900">
              {chat.displayName}
            </h3>

            <span className="shrink-0 text-xs text-slate-400">
              {displayTime}
            </span>
          </div>

          <p className="truncate text-xs text-slate-500">
            {chat.lastMessage || "Sem mensagens"}
          </p>
        </div>

        {/* Unread Badge */}
        {chat.unreadCount > 0 && (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white"
            aria-label={`${chat.unreadCount} unread messages`}
          >
            {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}