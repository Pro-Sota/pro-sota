import KanbanBoard from '@/app/components/kanban_board/kanban_board';
import { requireUser } from '@/app/lib/supabase/auth';
import { getTaskBoard } from '@/services/task';

export default async function TasksPage() {
  await requireUser();

  const scope = {
    type: 'general' as const,
    projectId: null,
  };

  const initialBoard = await getTaskBoard(scope);

  return (
    <KanbanBoard
      scope={scope}
      initialBoard={initialBoard}
    />
  );
}