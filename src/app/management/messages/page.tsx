import { getChats } from "@/services/messages";

import CommunicationMobile from "./components/mobile_view";
import EmptyMessageState from "./components/empty_message_state";

export default async function CommunicationPage() {
    const [projectConversations, directConversations] =
        await Promise.all([
            getChats({
                conversationType: "project",
            }),
            getChats({
                conversationType: "direct",
            }),
        ]);

    const hasConversations =
        projectConversations.length > 0 ||
        directConversations.length > 0;

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-1">
            {/* Desktop */}
            <div className="hidden h-full min-h-0 w-full min-w-0 flex-1 lg:flex">
                <EmptyMessageState />
            </div>

            {/* Mobile */}
            <div className="flex h-full min-h-0 w-full min-w-0 flex-1 lg:hidden">
                {hasConversations ? (
                    <CommunicationMobile
                        projectConversations={projectConversations}
                        directConversations={directConversations}
                    />
                ) : (
                    <EmptyMessageState />
                )}
            </div>
        </div>
    );
}