"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { KanbanBoardData, TaskScope } from "./types";
import KanbanHeader from "./components/kanban_header";
import KanbanColumn from "./components/kanban_column";
import AddColumn from "./components/kanban_add_column";
import TaskModal from "./components/kanban_task_modal";
import DeleteUndoToast from "./components/kanban_delete_undo_toast";
import { useKanbanState } from "./hooks/use_kanban_state";

interface KanbanBoardProps {
  scope: TaskScope;
  initialBoard: KanbanBoardData;
}

export default function KanbanBoard({
  scope,
  initialBoard,
}: KanbanBoardProps) {
  const board = useKanbanState({
    scope,
    initialBoard,
  });

  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(
    null,
  );
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(
    null,
  );
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(
    null,
  );

  function handleColumnDragStart(columnId: string) {
    setDraggedColumnId(columnId);
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

  function handleTaskDragStart(taskId: string) {
    setDraggedTaskId(taskId);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  }

  function handleColumnDrop(targetColumnId: string) {
    if (!draggedColumnId) return;

    if (draggedColumnId === targetColumnId) {
      setDraggedColumnId(null);
      setDragOverColumnId(null);
      return;
    }

    const ids = board.columns.map(
      (column) => column.columnId,
    );

    const from = ids.indexOf(draggedColumnId);
    const to = ids.indexOf(targetColumnId);

    if (from === -1 || to === -1) {
      setDraggedColumnId(null);
      setDragOverColumnId(null);
      return;
    }

    ids.splice(from, 1);
    ids.splice(to, 0, draggedColumnId);

    board.reorderColumns(ids);

    setDraggedColumnId(null);
    setDragOverColumnId(null);
  }

  function handleTaskDrop(targetColumnId: string) {
    if (!draggedTaskId) return;

    const targetTasks =
      board.tasksByColumn[targetColumnId] ?? [];

    const orderedTaskIds = [
      draggedTaskId,
      ...targetTasks
        .filter(
          (task) => task.taskId !== draggedTaskId,
        )
        .map((task) => task.taskId),
    ];

    board.moveTask(
      draggedTaskId,
      targetColumnId,
      orderedTaskIds,
    );

    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

  function handleColumnDragOver(columnId: string) {
    if (!draggedTaskId) return;

    setDragOverColumnId(columnId);
  }

  function handleDrop(columnId: string) {
    if (draggedTaskId) {
      handleTaskDrop(columnId);
      return;
    }

    if (draggedColumnId) {
      handleColumnDrop(columnId);
    }
  }

  function handleMoveTask(
    taskId: string,
    targetColumnId: string,
    orderedTaskIds: string[],
  ) {
    board.moveTask(
      taskId,
      targetColumnId,
      orderedTaskIds,
    );
  }

  return (
    <div className="box-border flex h-full min-h-0 flex-col overflow-hidden p-8">
      {/* Header */}
      <div className="shrink-0">
        <KanbanHeader
          searchQuery={board.searchQuery}
          onSearchChange={board.setSearchQuery}
        />

        {board.isPending && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Loader2
              size={13}
              className="animate-spin"
            />
            A guardar...
          </div>
        )}
      </div>

      {/* Board */}
      {board.visibleTasks.length === 0 &&
      board.searchQuery.trim() ? (
        <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            {`Sem resultados para "${board.searchQuery}"`}.
          </div>
        </div>
      ) : (
        <div className="mt-5 min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-w-max items-stretch gap-6 overflow-x-auto overflow-y-hidden pb-1">
            {board.columns.map((column) => (
              <div
                key={column.columnId}
                className="h-full shrink-0"
                onDragOver={(event) => {
                  event.preventDefault();
                  handleColumnDragOver(column.columnId);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(column.columnId);
                }}
              >
                <KanbanColumn
                  column={column}
                  tasks={
                    board.tasksByColumn[column.columnId] ?? []
                  }
                  onAddTask={board.addTask}
                  onOpenTask={board.openTask}
                  onDeleteTask={board.deleteTask}
                  onMoveTask={handleMoveTask}
                  onTaskDragStart={handleTaskDragStart}
                  onDeleteColumn={board.deleteColumn}
                  onRenameColumn={board.renameColumn}
                  onColumnDragStart={() =>
                    handleColumnDragStart(column.columnId)
                  }
                  onColumnDrop={() =>
                    handleDrop(column.columnId)
                  }
                  isDragOver={
                    draggedColumnId === column.columnId ||
                    dragOverColumnId === column.columnId
                  }
                />
              </div>
            ))}

            <div className="h-full shrink-0">
              <AddColumn onAdd={board.addColumn} />
            </div>
          </div>
        </div>
      )}

      {/* Task modal */}
      {board.selectedTask && (
        <TaskModal
          task={board.selectedTask}
          columns={board.columns}
          onClose={board.closeTask}
          onUpdate={board.updateTask}
          onDelete={board.deleteTask}
        />
      )}

      {/* Delete undo */}
      <DeleteUndoToast
        deletedTask={board.deletedTask}
        onUndo={board.undoDelete}
      />
    </div>
  );
}

export { KanbanBoard };