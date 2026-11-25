
import { requireUser } from "@/app/lib/supabase/auth";
import { OnlineUsersProvider } from "@/app/hooks/online_users_context";
import { getChats } from "@/services/messages";

import MessageSideBar from "./components/side_bar";

interface CommunicationLayoutProps {
  children: React.ReactNode;
}

export default async function CommunicationLayout({
  children,
}: CommunicationLayoutProps) {
  const { user } = await requireUser();

  const [projectChats, directChats] = await Promise.all([
    getChats({ conversationType: "project" }),
    getChats({ conversationType: "direct" }),
  ]);

  return (
    <OnlineUsersProvider profileId={user.id}>
      <div className="flex h-dvh min-h-0 w-full overflow-hidden">
        <aside className="hidden h-full shrink-0 lg:flex">
          <MessageSideBar
            projectConversations={projectChats}
            directConversations={directChats}
            currentUserId={user.id}
          />
        </aside>

        <main className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </OnlineUsersProvider>
  );
}
