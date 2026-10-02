'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { KanbanBoardData, TaskScope } from './types';
import KanbanHeader from './components/kanban_header';
import KanbanColumn from './components/kanban_column';
import AddColumn from './components/kanban_add_column';
import TaskModal from './components/kanban_task_modal';
import DeleteUndoToast from './components/kanban_delete_undo_toast';
import { useKanbanState } from './hooks/use_kanban_state';

export default function KanbanBoard({ scope, initialBoard }: { scope: TaskScope; initialBoard: KanbanBoardData }) {
  const board = useKanbanState({ scope, initialBoard });
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  function handleColumnDrop(targetColumnId: string) {
    if (!draggedColumnId || draggedColumnId === targetColumnId) {
      setDraggedColumnId(null);
      return;
    }

    const ids = board.columns.map((column) => column.columnId);
    const from = ids.indexOf(draggedColumnId);
    const to = ids.indexOf(targetColumnId);
    if (from === -1 || to === -1) return;

    ids.splice(from, 1);
    ids.splice(to, 0, draggedColumnId);
    board.reorderColumns(ids);
    setDraggedColumnId(null);
  }

  function handleTaskDrop(targetColumnId: string) {
    if (!draggedTaskId) return;
    const targetTasks = board.tasksByColumn[targetColumnId] ?? [];
    const ordered = [draggedTaskId, ...targetTasks.filter((task) => task.taskId !== draggedTaskId).map((task) => task.taskId)];
    board.moveTask(draggedTaskId, targetColumnId, ordered);
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

  return (
    <div className="min-h-full p-8">
      <KanbanHeader searchQuery={board.searchQuery} onSearchChange={board.setSearchQuery} />

      {board.isPending && <div className="mb-3 flex items-center gap-2 text-xs text-slate-400"><Loader2 size={13} className="animate-spin" /> A guardar...</div>}

      {board.visibleTasks.length === 0 && board.searchQuery.trim() ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">Sem resultados para "{board.searchQuery}".</div>
      ) : (
        <div className="flex items-start gap-6 overflow-x-auto pb-6">
          {board.columns.map((column) => (
            <div key={column.columnId}>
              <div onDragOver={() => { if (draggedTaskId) setDragOverColumnId(column.columnId); }}><KanbanColumn
                column={column}
                tasks={board.tasksByColumn[column.columnId] ?? []}
                onAddTask={board.addTask}
                onOpenTask={board.openTask}
                onDeleteTask={board.deleteTask}
                onMoveTask={(taskId, targetColumnId) => {
                  const targetTasks = board.tasksByColumn[targetColumnId] ?? [];
                  const ordered = [taskId, ...targetTasks.filter((task) => task.taskId !== taskId).map((task) => task.taskId)];
                  board.moveTask(taskId, targetColumnId, ordered);
                }}
                onTaskDragStart={(taskId) => setDraggedTaskId(taskId)}
                onDeleteColumn={board.deleteColumn}
                onRenameColumn={board.renameColumn}
                onColumnDragStart={() => setDraggedColumnId(column.columnId)}
                onColumnDrop={() => {
                  if (draggedTaskId) handleTaskDrop(column.columnId);
                  else handleColumnDrop(column.columnId);
                }}
                isDragOver={draggedColumnId === column.columnId || dragOverColumnId === column.columnId}
              />
              </div>
            </div>
          ))}
          <AddColumn onAdd={board.addColumn} />
        </div>
      )}

      {board.selectedTask && (
        <TaskModal
          task={board.selectedTask}
          columns={board.columns}
          onClose={board.closeTask}
          onUpdate={board.updateTask}
          onDelete={board.deleteTask}
        />
      )}

      <DeleteUndoToast deletedTask={board.deletedTask} onUndo={board.undoDelete} />
    </div>
  );
}

export { KanbanBoard };
