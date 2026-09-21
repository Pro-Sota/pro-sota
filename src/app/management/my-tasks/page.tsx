import KanbanBoard from '@/app/components/kanban/kanban_board';
import { getTaskBoard } from '@/services/projects_server';

export default async function TasksPage() {
  const board = await getTaskBoard();

  return <KanbanBoard initialBoard={board} />;
}