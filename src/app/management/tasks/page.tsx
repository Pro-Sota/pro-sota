import KanbanBoard from '@/app/components/kanban_board/kanban_board';
import { requireUser } from '@/app/lib/supabase/auth';
import { getTaskBoard } from '@/services/projects_server';

export default async function TasksPage() {
  const user = await requireUser();

  return <KanbanBoard scope={{
    type: 'general',
    projectId: null
  }} initialBoard={{
    scope: {
      type: 'general',
      projectId: null
    },
    columns: [],
    tasks: []
  }}  />;
}