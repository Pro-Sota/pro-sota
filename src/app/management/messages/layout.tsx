import { requireUser } from "@/app/lib/supabase/auth";
import MessageSideBar from "./components/side_bar";
import { OnlineUsersProvider } from "@/app/hooks/online_users_context";
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

  const { user } = await requireUser();

  return (
    <OnlineUsersProvider profileId={user.id}>
      <div className="flex h-dvh min-h-0 w-full overflow-hidden">
        <aside className="hidden h-full shrink-0 lg:flex">
          <MessageSideBar
            projectConversations={projectChats}
            directConversations={directChats} currentUserId={user.id} />
        </aside>

        <main className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </OnlineUsersProvider>


  );
}