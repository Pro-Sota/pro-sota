import { FolderOpen } from "lucide-react";
import { LABELS } from "./chat_labels";


export default function EmptyProjectInfo() {

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