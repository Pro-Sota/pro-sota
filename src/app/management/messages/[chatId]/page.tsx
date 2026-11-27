import { notFound } from "next/navigation";

import ChatView from "./chat";

import {
  getConversation,
  getMessages,
} from "@/services/messages";

import {
  getProjectSidebarData,
} from "@/services/project_sidebar";

import {
  createClient,
} from "@/app/lib/supabase/server";

import {
  cookies,
} from "next/headers";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function ChatPage({
  params,
}: ChatPageProps) {
  const { chatId } = await params;

  const conversation =
    await getConversation(chatId);

  if (!conversation) {
    notFound();
  }

  const supabase = createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) {
    notFound();
  }

  const [
    messages,
    projectSidebarData,
  ] = await Promise.all([
    getMessages({
      conversationId: chatId,
    }),

    conversation.conversationType ===
      "project" &&
      conversation.projectId
      ? getProjectSidebarData(
        conversation.projectId,
      )
      : Promise.resolve(null),
  ]);

  return (
    <ChatView
      chatId={chatId}
      conversation={conversation}
      initialMessages={messages}
      currentUserId={user.id}
      projectSidebarData={
        projectSidebarData
      }
    />
  );
}