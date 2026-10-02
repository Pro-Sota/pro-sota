import { MessageCircle, Plus } from "lucide-react";

import { LABELS } from "./chat_labels";

interface EmptyMessageStateProps {
    onNewMessage: () => void;
}

export default function EmptyMessageState({
    onNewMessage,
}: EmptyMessageStateProps) {
    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <MessageCircle
                    className="h-7 w-7 text-slate-400"
                    aria-hidden="true"
                />
            </div>

            <h3 className="mt-6 text-base font-semibold text-slate-900">
                {LABELS.noMessages}
            </h3>

            <p className="mt-2 max-w-xs text-sm text-slate-500">
                {LABELS.startConversation}
            </p>

            <button
                type="button"
                onClick={onNewMessage}
                className="mt-6 flex cursor-pointer items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition-colors hover:bg-[#BD9655]/90"
            >
                <Plus
                    size={16}
                    aria-hidden="true"
                />

                {LABELS.newMessage}
            </button>
        </div>
    );
}