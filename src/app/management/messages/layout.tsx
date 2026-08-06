import Loader from "@/app/components/loader";
import MessageSideBar from "./components/side_bar";
import MessageHeader from "./components/message_header";
import ProjectSideBar from "./components/project_side_bar";
import MessageInput from "./components/message_input";
import { getChats } from "@/services/messages";

interface CommunicationLayoutProps {
  children: React.ReactNode;
  params: {
    selectChatId?: string;
  };
}

export default async function CommunicationLayout({
  children,
  params,
}: CommunicationLayoutProps) {
  const selectedChatId = params.selectChatId;

  const projectConversations = await getChats("project");
  const directConversations = await getChats("direct");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-slate-900">
      <MessageSideBar
        projectConversations={projectConversations}
        directConversations={directConversations}
        selectedChatId={selectedChatId || ""}
      />

      <main className="flex flex-1 flex-col min-w-0">
        <MessageHeader selectedChatId={selectedChatId || ""} />

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {children}
        </div>

        <MessageInput selectedChatId={selectedChatId} />
      </main>

      <ProjectSideBar selectedChatId={selectedChatId || ""} />
    </div>
  );
}