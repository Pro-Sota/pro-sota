"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { Loader2 } from "lucide-react";

import { useToast } from "@/app/components/toast/use_toast";

import type {
  KanbanBoardData,
  TaskMember,
  TaskScope,
} from "./types";

import KanbanHeader from "./components/kanban_header";
import KanbanColumn from "./components/kanban_column";
import AddColumn from "./components/kanban_add_column";
import TaskModal from "./components/kanban_task_modal";
import DeleteUndoToast from "./components/kanban_delete_undo_toast";

import { useKanbanState } from "./hooks/use_kanban_state";

interface KanbanBoardProps {
  scope: TaskScope;
  initialBoard: KanbanBoardData;
  availableMembers: TaskMember[];
  canManageBoard?: boolean;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined"
    ? useLayoutEffect
    : useEffect;

function useFillViewportHeight<T extends HTMLElement>(
  bottomGap = 32,
  minHeight = 320,
) {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    function measure() {
      const current = ref.current;

      if (!current) {
        return;
      }

      const rect = current.getBoundingClientRect();
      const top = rect.top + window.scrollY;

      const nextHeight = Math.max(
        window.innerHeight - top - bottomGap,
        minHeight,
      );

      setHeight((previous) =>
        previous === nextHeight ? previous : nextHeight,
      );
    }

    measure();

    window.addEventListener("resize", measure);

    const header = element.previousElementSibling;

    const observer =
      header && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;

    if (header) {
      observer?.observe(header);
    }

    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [bottomGap, minHeight]);

  return { ref, height };
}

export default function KanbanBoard({
  scope,
  initialBoard,
  availableMembers,
  canManageBoard = true,
}: KanbanBoardProps) {
  const board = useKanbanState({
    scope,
    initialBoard,
  });

  const { success, error } = useToast();

  const {
    ref: boardAreaRef,
    height: boardHeight,
  } = useFillViewportHeight<HTMLDivElement>(32);

  const [draggedColumnId, setDraggedColumnId] =
    useState<string | null>(null);

  const [draggedTaskId, setDraggedTaskId] =
    useState<string | null>(null);

  const [dragOverColumnId, setDragOverColumnId] =
    useState<string | null>(null);

  const isDragging =
    Boolean(draggedColumnId) || Boolean(draggedTaskId);

  const hasSearch = Boolean(board.searchQuery?.trim());

  const visibleTaskCount = board.visibleTasks.length;

  const totalTaskCount = board.columns.reduce(
    (total, column) =>
      total +
      (board.tasksByColumn[column.columnId]?.length ?? 0),
    0,
  );

  /**
   * Shows success only after the action's Promise resolves.
   * Failed actions display an error instead.
   */
  async function runBoardAction(
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<void> {
    try {
      await action();
      success(successMessage);
    } catch (caughtError) {
      error(
        caughtError instanceof Error
          ? caughtError.message
          : "A operação não foi concluída.",
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Column actions                                                         */
  /* ---------------------------------------------------------------------- */

  function handleAddColumn(
    ...args: Parameters<typeof board.addColumn>
  ) {
    if (!canManageBoard) {
      return;
    }

    return runBoardAction(
      () => board.addColumn(...args),
      "Coluna criada com sucesso.",
    );
  }

  function handleDeleteColumn(
    ...args: Parameters<typeof board.deleteColumn>
  ) {
    if (!canManageBoard) {
      return;
    }

    return runBoardAction(
      () => board.deleteColumn(...args),
      "Coluna eliminada com sucesso.",
    );
  }

  function handleRenameColumn(
    ...args: Parameters<typeof board.renameColumn>
  ) {
    if (!canManageBoard) {
      return;
    }

    return runBoardAction(
      () => board.renameColumn(...args),
      "Coluna actualizada com sucesso.",
    );
  }

  function handleReorderColumns(ids: string[]) {
    if (!canManageBoard) {
      return;
    }

    return runBoardAction(
      () => board.reorderColumns(ids),
      "Ordem das colunas actualizada.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Task actions                                                           */
  /* ---------------------------------------------------------------------- */

  function handleAddTask(
    ...args: Parameters<typeof board.addTask>
  ) {
    if (!canManageBoard) {
      return;
    }

    return runBoardAction(
      () => board.addTask(...args),
      "Tarefa criada com sucesso.",
    );
  }

  function handleDeleteTask(
    ...args: Parameters<typeof board.deleteTask>
  ) {
    if (!canManageBoard) {
      return;
    }

    return runBoardAction(
      () => board.deleteTask(...args),
      "Tarefa eliminada com sucesso.",
    );
  }

  function handleUpdateTask(
    ...args: Parameters<typeof board.updateTask>
  ) {
    return runBoardAction( 
      () => board.updateTask(...args),
      "Tarefa actualizada com sucesso.",
    );
  }

  function handleMoveTask(
    taskId: string,
    targetColumnId: string,
    orderedTaskIds: string[],
  ) {
    if (!canManageBoard) {
      return;
    }

    return runBoardAction(
      () =>
        board.moveTask(
          taskId,
          targetColumnId,
          orderedTaskIds,
        ),
      "Tarefa movida com sucesso.",
    );
  }

  function handleUndoDelete() {
    return runBoardAction(
      async () => board.undoDelete(),
      "Eliminação anulada com sucesso.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Drag and drop                                                          */
  /* ---------------------------------------------------------------------- */

  function clearDragState() {
    setDraggedColumnId(null);
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

  function handleColumnDragStart(columnId: string) {
    if (!canManageBoard) {
      return;
    }

    setDraggedColumnId(columnId);
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

  function handleTaskDragStart(taskId: string) {
    if (!canManageBoard) {
      return;
    }

    setDraggedTaskId(taskId);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  }

  function handleColumnDragOver(columnId: string) {
    if (
      !canManageBoard ||
      (!draggedColumnId && !draggedTaskId)
    ) {
      return;
    }

    setDragOverColumnId(columnId);
  }

  function handleColumnDrop(targetColumnId: string) {
    if (!canManageBoard) {
      clearDragState();
      return;
    }

    if (!draggedColumnId) {
      return;
    }

    if (draggedColumnId === targetColumnId) {
      clearDragState();
      return;
    }

    const ids = board.columns.map(
      (column) => column.columnId,
    );

    const from = ids.indexOf(draggedColumnId);
    const to = ids.indexOf(targetColumnId);

    if (from === -1 || to === -1) {
      clearDragState();
      return;
    }

    ids.splice(from, 1);
    ids.splice(to, 0, draggedColumnId);

    void handleReorderColumns(ids);
    clearDragState();
  }

  function handleTaskDrop(targetColumnId: string) {
    if (!canManageBoard) {
      clearDragState();
      return;
    }

    if (!draggedTaskId) {
      return;
    }

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

    void handleMoveTask(
      draggedTaskId,
      targetColumnId,
      orderedTaskIds,
    );

    clearDragState();
  }

  function handleDrop(columnId: string) {
    if (!canManageBoard) {
      clearDragState();
      return;
    }

    if (draggedTaskId) {
      handleTaskDrop(columnId);
      return;
    }

    if (draggedColumnId) {
      handleColumnDrop(columnId);
    }
  }

  function handleDragEnd() {
    clearDragState();
  }

  const boardAreaStyle: CSSProperties = {
    height: boardHeight
      ? `${boardHeight}px`
      : "calc(100dvh - 14rem)",
  };

  return (
    <div className="box-border flex h-full min-h-0 flex-col overflow-hidden p-8">
      {/* Header */}
      <div className="shrink-0">
        <KanbanHeader
          searchQuery={board.searchQuery}
          onSearchChange={board.setSearchQuery}
        />

        <div className="mt-3 flex min-h-7 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {board.isPending && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2
                  size={13}
                  className="animate-spin"
                />
                <span>A guardar...</span>
              </div>
            )}

            {!board.isPending && totalTaskCount > 0 && (
              <span className="text-xs text-slate-400">
                {hasSearch
                  ? `${visibleTaskCount} de ${totalTaskCount} tarefas`
                  : `${totalTaskCount} ${
                      totalTaskCount === 1
                        ? "tarefa"
                        : "tarefas"
                    }`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search empty state */}
      {board.visibleTasks.length === 0 && hasSearch ? (
        <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <h3 className="text-sm font-semibold text-slate-700">
              Nenhuma tarefa encontrada
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sem resultados para{" "}
              <span className="font-medium text-slate-700">
                &quot;{board.searchQuery}&quot;
              </span>
              .
            </p>
          </div>
        </div>
      ) : (
        /* Kanban board */
        <div
          ref={boardAreaRef}
          style={boardAreaStyle}
          className="mt-5 min-w-0 flex-none"
        >
          <div
            className={[
              "flex h-full items-stretch gap-6 overflow-x-auto",
              "overflow-y-hidden overscroll-x-contain pb-3",
              "[scrollbar-color:#cbd5e1_transparent]",
              "[scrollbar-width:thin]",
              "[&::-webkit-scrollbar]:h-2",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:bg-slate-300",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              isDragging ? "select-none" : "",
            ].join(" ")}
            onDragEnd={handleDragEnd}
          >
            {board.columns.map((column) => {
              const columnTasks =
                board.tasksByColumn[column.columnId] ?? [];

              const isColumnDragOver =
                dragOverColumnId === column.columnId;

              const isDraggingThisColumn =
                draggedColumnId === column.columnId;

              return (
                <div
                  key={column.columnId}
                  className={[
                    "h-full shrink-0 transition-opacity",
                    isDraggingThisColumn
                      ? "opacity-50"
                      : "opacity-100",
                    isColumnDragOver ? "rounded-2xl" : "",
                  ].join(" ")}
                  onDragOver={(event) => {
                    event.preventDefault();

                    if (!canManageBoard) {
                      return;
                    }

                    event.dataTransfer.dropEffect = "move";
                    handleColumnDragOver(column.columnId);
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault();

                    if (!canManageBoard) {
                      return;
                    }

                    if (draggedColumnId || draggedTaskId) {
                      setDragOverColumnId(column.columnId);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();

                    if (!canManageBoard) {
                      clearDragState();
                      return;
                    }

                    handleDrop(column.columnId);
                  }}
                >
                  <KanbanColumn
                    column={column}
                    tasks={columnTasks}
                    onAddTask={
                      canManageBoard
                        ? handleAddTask
                        : undefined
                    }
                    onOpenTask={board.openTask}
                    onDeleteTask={
                      canManageBoard
                        ? handleDeleteTask
                        : undefined
                    }
                    onMoveTask={
                      canManageBoard
                        ? handleMoveTask
                        : undefined
                    }
                    onTaskDragStart={
                      canManageBoard
                        ? handleTaskDragStart
                        : undefined
                    }
                    onDeleteColumn={
                      canManageBoard
                        ? handleDeleteColumn
                        : undefined
                    }
                    onRenameColumn={
                      canManageBoard
                        ? handleRenameColumn
                        : undefined
                    }
                    onColumnDragStart={
                      canManageBoard
                        ? () =>
                            handleColumnDragStart(
                              column.columnId,
                            )
                        : undefined
                    }
                    onColumnDrop={
                      canManageBoard
                        ? () => handleDrop(column.columnId)
                        : undefined
                    }
                    isDragOver={
                      canManageBoard &&
                      (draggedColumnId === column.columnId ||
                        dragOverColumnId === column.columnId)
                    }
                  />
                </div>
              );
            })}

            {/* Add column */}
            {canManageBoard && (
              <div className="h-full shrink-0">
                <AddColumn onAdd={handleAddColumn} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task modal */}
      {board.selectedTask && (
        <TaskModal
          task={board.selectedTask}
          columns={board.columns}
          onClose={board.closeTask}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          availableMembers={availableMembers}
        />
      )}

      {/* Delete undo */}
      <DeleteUndoToast
        deletedTask={board.deletedTask}
        onUndo={handleUndoDelete}
      />
    </div>
  );
}

export { KanbanBoard };