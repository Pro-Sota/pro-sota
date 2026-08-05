
interface Chat {
    id: string;
    isOnline: boolean;
    name: string;
    time: string;
    last: string;
    unread: number;
}

interface props {
     chat: Chat;
  isSelected: boolean;
  onSelect: (id: string) => void;
  icon: React.ReactNode;
}

export default function ChatItem({ chat, isSelected, onSelect, icon }: props){

  return (
    <button
      onClick={() => onSelect(chat.id)}
      className={`w-full transition-all duration-200 ${isSelected
        ? "bg-slate-100 border-l-2 border-l-slate-900"
        : "border-l-2 border-l-transparent hover:bg-slate-50"
        }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${isSelected ? "bg-slate-900" : "bg-slate-200"
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