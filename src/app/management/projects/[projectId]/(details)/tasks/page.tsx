
import { cookies } from "next/headers";

import KanbanBoard from "@/app/components/kanban_board/kanban_board";
import { requireUser } from "@/app/lib/supabase/auth";
import { createClient } from "@/app/lib/supabase/server";

import { getTaskMembers } from "@/services/profiles";
import { getTaskBoard } from "@/services/task";

type TasksAndWorkflowProps = {
  params: Promise<{
    projectId: string;
  }>;
};

const PROJECT_MANAGER_ROLE_ID = 1;

export default async function TasksAndWorkflow({
  params,
}: TasksAndWorkflowProps) {
  const { projectId } = await params;

  const { profile, isAdmin } = await requireUser();

  const scope = {
    type: "project" as const,
    projectId,
  };

  const supabase = await createClient();

  // Admins do not need a project membership to manage the board.
  let isProjectManager = false;

  if (!isAdmin) {
    const { data: membership, error: membershipError } =
      await supabase
        .from("project_members")
        .select("role_id")
        .eq("project_id", projectId)
        .eq("profile_id", profile.profile_id)
        .maybeSingle();

    if (membershipError) {
      console.error(
        "Erro ao verificar permissões do projecto:",
        membershipError,
      );

      throw new Error(
        "Não foi possível verificar as permissões do projecto.",
      );
    }

    isProjectManager =
      membership?.role_id === PROJECT_MANAGER_ROLE_ID;
  }

  const canAssignMembers =
    isAdmin || isProjectManager;

  const canManageBoard =
    isAdmin || isProjectManager;

  const [initialBoard, availableMembers] =
    await Promise.all([
      getTaskBoard(scope),
      getTaskMembers(),
    ]);

  return (
    <KanbanBoard
      scope={scope}
      initialBoard={initialBoard}
      availableMembers={availableMembers}
      canAssignMembers={canAssignMembers}
      canManageBoard={canManageBoard}
    />
  );
}
