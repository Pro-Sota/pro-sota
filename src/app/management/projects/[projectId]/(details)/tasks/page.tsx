import KanbanBoard from '@/app/components/kanban_board/kanban_board';
import { requireUser } from '@/app/lib/supabase/auth';
import { getTaskMembers } from '@/services/profiles';
import { getTaskBoard } from '@/services/task';

type TasksAndWorkflowProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function TasksAndWorkflow({
  params,
}: TasksAndWorkflowProps) {

  const { projectId } = await params;

  await requireUser();

  const scope = {
    type: 'project' as const,
    projectId: projectId,
  };

    const [initialBoard, availableMembers] = await Promise.all([getTaskBoard(scope), getTaskMembers()]);
  
  return (
    <KanbanBoard
      scope={scope} initialBoard={initialBoard} availableMembers={availableMembers} />
  );
}