
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
        hasUnread
          ? `${chat.unreadCount} mensagens não lidas`
          : chat.lastMessage || "Sem mensagens"
      }`}
      className="group w-full px-2 py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#BD9655]"
    >
      <div
        className={`relative flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-150 ${
          hasUnread && !isSelected
            ? "border-[#D7E3ED] bg-[#EFF5FA] hover:bg-[#E7F0F7]"
            : isSelected
              ? "border-slate-200 bg-slate-100 shadow-sm"
              : "border-transparent hover:bg-slate-50 active:bg-slate-100"
        }`}
      >
        {/* Active accent */}
        {(isSelected || hasUnread) && (
          <span
            className={`absolute left-1 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full ${
              hasUnread && !isSelected
                ? "bg-[#002950]"
                : "bg-[#BD9655]"
            }`}
            aria-hidden="true"
          />
        )}

        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-150 ${
              hasUnread && !isSelected
                ? "bg-[#002950] text-white"
                : isSelected
                  ? "bg-[#002950] text-white"
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

          {hasUnread && (
            <span
              className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#BD9655]"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3
              className={`min-w-0 flex-1 truncate text-[13px] leading-5 ${
                hasUnread
                  ? "font-bold text-[#002950]"
                  : isSelected
                    ? "font-semibold text-[#002950]"
                    : "font-medium text-slate-800"
              }`}
            >
              {chat.displayName}
            </h3>

            {displayTime && (
              <time
                dateTime={chat.lastMessageAt ?? undefined}
                className={`shrink-0 text-[10px] leading-5 ${
                  hasUnread
                    ? "font-semibold text-[#002950]"
                    : "text-slate-400"
                }`}
              >
                {displayTime}
              </time>
            )}
          </div>

          <div className="mt-0.5 flex min-w-0 items-center gap-2">
            <div className="min-w-0 flex-1">
              {hasUnread ? (
                <p className="truncate text-[11px] font-semibold leading-5 text-[#002950]">
                  Nova mensagem
                </p>
              ) : (
                <p className="truncate text-xs leading-5 text-slate-400">
                  {chat.lastMessage || "Sem mensagens"}
                </p>
              )}
            </div>

            {hasUnread && (
              <span
                role="status"
                aria-label={`${chat.unreadCount} mensagens não lidas`}
                className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#002950] px-1.5 text-[10px] font-bold leading-none text-white"
              >
                {chat.unreadCount > 99
                  ? "99+"
                  : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
