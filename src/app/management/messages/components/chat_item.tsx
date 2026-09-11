import type { ChatSummary } from "@/services/messages";

export type ConversationWithDetails = ChatSummary;

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
  const displayTime = chat.lastMessageAt
    ? new Intl.DateTimeFormat("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(chat.lastMessageAt))
    : "";

  const hasUnread = chat.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(chat.id)}
      aria-current={isSelected ? "page" : undefined}
      aria-label={`${chat.displayName} - ${
        chat.lastMessage || "Sem mensagens"
      }`}
      className={`group w-full px-2 py-1 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400 ${
        isSelected
          ? "bg-slate-100"
          : "hover:bg-slate-50 active:bg-slate-100"
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl px-3 py-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 ${
              isSelected
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700 group-hover:shadow-sm"
            }`}
          >
            {icon}
          </div>

          {chat.isOnline && (
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
              role="img"
              aria-label="Online"
              title="Online"
            />
          )}
        </div>

        {/* Chat information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`min-w-0 flex-1 truncate text-sm ${
                hasUnread
                  ? "font-semibold text-slate-950"
                  : "font-medium text-slate-800"
              }`}
            >
              {chat.displayName}
            </h3>

            {displayTime && (
              <time
                dateTime={chat.lastMessageAt ?? undefined}
                className={`shrink-0 text-[11px] ${
                  hasUnread
                    ? "font-medium text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {displayTime}
              </time>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <p
              className={`min-w-0 flex-1 truncate text-xs ${
                hasUnread
                  ? "font-medium text-slate-600"
                  : "text-slate-400"
              }`}
            >
              {chat.lastMessage || "Sem mensagens"}
            </p>

            {hasUnread && (
              <span
                className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold leading-none text-white"
                role="status"
                aria-label={`${chat.unreadCount} mensagens não lidas`}
              >
                {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}