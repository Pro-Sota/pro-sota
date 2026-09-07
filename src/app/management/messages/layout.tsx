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
  const [projectConversations, directConversations] = await Promise.all([
    getChats("project"),
    getChats("direct"),
  ]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-slate-900">
      <MessageSideBar
        projectConversations={projectConversations}
        directConversations={directConversations}
      />
      <main className="flex min-w-0 flex-1 flex-col border border-[#BD9655]">
        <MessageHeader />

        <div className="min-h-0 flex-1 overflow-y-auto bg-white p-6">
          {children}
        </div>

        <MessageInput />
      </main>
      <ProjectSideBar />
    </div>
  );
}