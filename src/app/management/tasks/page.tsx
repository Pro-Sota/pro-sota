import KanbanBoard from '@/app/components/kanban_board/kanban_board';
import { TaskMember } from '@/app/components/kanban_board/types';
import { requireUser } from '@/app/lib/supabase/auth';
import { getTaskMembers } from '@/services/profiles';
import { getTaskBoard } from '@/services/task';

export default async function TasksPage() {
  await requireUser();

  const scope = {
    type: 'general' as const,
    projectId: null,
  };

  const [initialBoard, availableMembers] = await Promise.all([getTaskBoard(scope), getTaskMembers()]);

  console.log("Profiles: ", availableMembers)

  return (
    <KanbanBoard
      scope={scope}
      initialBoard={initialBoard}
      availableMembers={availableMembers}
    />
  );
}