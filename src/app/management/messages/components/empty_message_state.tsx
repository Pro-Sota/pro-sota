import { MessageCircle, Plus } from "lucide-react";

import { LABELS } from "./chat_labels";

export default function EmptyMessageState({ onNewMessage }: { onNewMessage: (show: boolean) => void }) {

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

            <button
                onClick={() => onNewMessage(true)}
                className="mt-6 flex items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] hover:bg-[#BD9655]/90 transition-colors cursor-pointer">
                <Plus size={16} />
                {LABELS.newMessage}
            </button>
        </div>);
}