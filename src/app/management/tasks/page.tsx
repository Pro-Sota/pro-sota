import KanbanBoard from '@/app/components/kanban/kanban_board';
import { requireUser } from '@/app/lib/supabase/auth';
import { getTaskBoard } from '@/services/projects_server';

export default async function TasksPage() {
  const board = await getTaskBoard();
  const user = await requireUser();

  return <KanbanBoard initialBoard={board} currentUserProfileId={user.user.id}/>;
}