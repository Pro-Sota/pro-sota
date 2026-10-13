import KanbanBoard from "@/app/components/kanban_board/kanban_board";
import { requireUser } from "@/app/lib/supabase/auth";
import type { TaskScope, TaskMember } from "@/app/components/kanban_board/types";
import { getTaskMembers } from "@/services/profiles";
import { getTaskBoard } from "@/services/task";

export default async function TasksPage() {
  await requireUser();

  const scope: TaskScope = {
    projectId: null,
    type: "general",
  };

  const [initialBoard, availableMembers]: [
    Awaited<ReturnType<typeof getTaskBoard>>,
    TaskMember[],
  ] = await Promise.all([
    getTaskBoard(scope),
    getTaskMembers(),
  ]);

  return (
    <KanbanBoard
      scope={scope}
      initialBoard={initialBoard}
      availableMembers={availableMembers}
    />
  );
}