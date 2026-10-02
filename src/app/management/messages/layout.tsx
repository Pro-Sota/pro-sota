import MessageSideBar from "./components/side_bar";

import { getChats } from "@/services/messages";

interface CommunicationLayoutProps {
  children: React.ReactNode;
}

export default async function CommunicationLayout({
  children,
}: CommunicationLayoutProps) {
  const [projectChats, directChats] = await Promise.all([
    getChats({ conversationType: "project" }),
    getChats({ conversationType: "direct" }),
  ]);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden">
      <aside className="h-full shrink-0 overflow-hidden border-r border-slate-200">
        <MessageSideBar
          projectConversations={projectChats}
          directConversations={directChats}
        />
      </aside>

      <main className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}