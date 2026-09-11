import MessageSideBar from "./components/side_bar";
import MessageHeader from "./components/message_header";
import MessageInput from "./components/message_input";
import ProjectSideBar from "./components/project_sidebar";

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

  const allConversations = [...projectChats, ...directChats];

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden">
      {/* Left sidebar */}
      <aside className="flex h-full min-h-0 shrink-0 flex-col overflow-hidden">
        <MessageSideBar
          projectConversations={projectChats}
          directConversations={directChats}
        />
      </aside>

      {/* Main chat */}
      <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0">
          <MessageHeader conversations={allConversations} />
        </div>

        {/* Chat page */}
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
        </main>

        {/* Input */}
        <div className="shrink-0">
          <MessageInput />
        </div>
      </section>

      {/* Right sidebar */}
      <aside className="flex h-full min-h-0 shrink-0 flex-col overflow-hidden">
        <ProjectSideBar />
      </aside>
    </div>
  );
}
