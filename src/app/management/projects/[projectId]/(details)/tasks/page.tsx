import KanbanBoard from '@/app/components/kanban_board/kanban_board';
import { getTaskBoard } from '@/services/projects_server';

type TasksAndWorkflowProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function TasksAndWorkflow({
  params,
}: TasksAndWorkflowProps) {
  const { projectId } = await params;

  const board = await getTaskBoard(projectId);

  return (
    <KanbanBoard
      scope={{
        type: 'project',
        projectId
      }} initialBoard={{
        scope: {
          type: 'general',
          projectId: null
        },
        columns: [],
        tasks: []
      }}    />
  );
}