import { ChevronDown } from "lucide-react";
import { useState } from "react";
import ChatItem from "./chat_item";

interface Chat {
    id: string;
    isOnline: boolean;
    name: string;
    time: string;
    last: string;
    unread: number;
}

interface props {
    title: string;
    chats: Chat[];
    icon: React.ReactNode;
    onSelectChat: (id: string) => void;
    selectedChatId: string;
}
export default function ChatSection({
    title,
    chats,
    icon,
    onSelectChat,
    selectedChatId,
}: props) {


    function countUnreadMessages(chats: Chat[]): number {
        return chats.reduce((sum, chat) => sum + chat.unread, 0);
    }

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
                        className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"
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
