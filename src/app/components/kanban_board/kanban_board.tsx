"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Loader2, Plus } from "lucide-react";

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

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Calculates the available viewport height for the Kanban board.
 *
 * The board starts below the header and fills the remaining viewport.
 * This keeps page scrolling disabled while allowing:
 * - horizontal scrolling for columns
 * - vertical scrolling inside individual columns
 */
function useFillViewportHeight<T extends HTMLElement>(
  bottomGap = 32,
  minHeight = 320,
) {
  const ref = useRef<T>(null);
  const [height, setHeight] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;

    if (!element) return;

    function measure() {
      const current = ref.current;

      if (!current) return;

      const rect = current.getBoundingClientRect();
      const top = rect.top + window.scrollY;

      const nextHeight = Math.max(
        window.innerHeight - top - bottomGap,
        minHeight,
      );

      setHeight(nextHeight);
    }

    measure();

    window.addEventListener("resize", measure);

    /*
     * The header can change height while the board is mounted,
     * for example when "A guardar..." appears.
     */
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

  return {
    ref,
    height,
  };
}

export default function KanbanBoard({
  scope,
  initialBoard,
}: KanbanBoardProps) {
  const board = useKanbanState({
    scope,
    initialBoard,
  });

  const {
    ref: boardAreaRef,
    height: boardHeight,
  } = useFillViewportHeight<HTMLDivElement>(32);

  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(
    null,
  );

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(
    null,
  );

  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(
    null,
  );

  /**
   * Whether the user is currently dragging anything.
   */
  const isDragging =
    Boolean(draggedColumnId) || Boolean(draggedTaskId);

  /**
   * Whether the board currently has an active search.
   */
  const hasSearch =
    Boolean(board.searchQuery?.trim());

  /**
   * Total number of tasks currently visible on the board.
   */
  const visibleTaskCount = board.visibleTasks.length;

  /**
   * Total number of tasks on the board before search filtering.
   */
  const totalTaskCount = board.columns.reduce(
    (total, column) =>
      total + (board.tasksByColumn[column.columnId]?.length ?? 0),
    0,
  );

  function clearDragState() {
    setDraggedColumnId(null);
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }

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

  function handleColumnDragOver(columnId: string) {
    if (!draggedColumnId && !draggedTaskId) {
      return;
    }

    setDragOverColumnId(columnId);
  }

  function handleColumnDrop(targetColumnId: string) {
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

    board.reorderColumns(ids);

    clearDragState();
  }

  function handleTaskDrop(targetColumnId: string) {
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

    board.moveTask(
      draggedTaskId,
      targetColumnId,
      orderedTaskIds,
    );

    clearDragState();
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

  function handleDragEnd() {
    clearDragState();
  }

  /**
   * Creates a task in the first available column.
   *
   * We intentionally do not call a new hook API here.
   * `board.addTask` remains the existing source of truth.
   */
  function handleAddTask() {
    const firstColumn = board.columns[0];

    if (!firstColumn) {
      return;
    }

    board.addTask(firstColumn.columnId, "Nova tarefa");
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

      {/* Board */}
      {board.columns.length === 0 ? (
        <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Plus size={18} />
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              Ainda não existem colunas
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Crie uma coluna para começar a organizar as
              tarefas.
            </p>

            <div className="mt-5">
              <AddColumn onAdd={board.addColumn} />
            </div>
          </div>
        </div>
      ) : board.visibleTasks.length === 0 && hasSearch ? (
        <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <h3 className="text-sm font-semibold text-slate-700">
              Nenhuma tarefa encontrada
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sem resultados para{" "}
              <span className="font-medium text-slate-700">
                `{board.searchQuery}`
              </span>
              .
            </p>
          </div>
        </div>
      ) : totalTaskCount === 0 ? (
        <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <h3 className="text-sm font-semibold text-slate-800">
              Ainda não existem tarefas
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Crie a primeira tarefa para começar a
              organizar o trabalho.
            </p>

            <button
              type="button"
              onClick={handleAddTask}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003b70]"
            >
              <Plus size={16} />
              Nova tarefa
            </button>
          </div>
        </div>
      ) : (
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
              isDragging
                ? "select-none"
                : "",
            ].join(" ")}
            onDragEnd={handleDragEnd}
          >
            {board.columns.map((column) => {
              const columnTasks =
                board.tasksByColumn[
                  column.columnId
                ] ?? [];

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
                    isColumnDragOver
                      ? "rounded-2xl"
                      : "",
                  ].join(" ")}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect =
                      draggedColumnId
                        ? "move"
                        : "move";

                    handleColumnDragOver(
                      column.columnId,
                    );
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault();

                    if (
                      draggedColumnId ||
                      draggedTaskId
                    ) {
                      setDragOverColumnId(
                        column.columnId,
                      );
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDrop(column.columnId);
                  }}
                >
                  <KanbanColumn
                    column={column}
                    tasks={columnTasks}
                    onAddTask={board.addTask}
                    onOpenTask={board.openTask}
                    onDeleteTask={board.deleteTask}
                    onMoveTask={handleMoveTask}
                    onTaskDragStart={
                      handleTaskDragStart
                    }
                    onDeleteColumn={
                      board.deleteColumn
                    }
                    onRenameColumn={
                      board.renameColumn
                    }
                    onColumnDragStart={() =>
                      handleColumnDragStart(
                        column.columnId,
                      )
                    }
                    onColumnDrop={() =>
                      handleDrop(
                        column.columnId,
                      )
                    }
                    isDragOver={
                      draggedColumnId ===
                        column.columnId ||
                      dragOverColumnId ===
                        column.columnId
                    }
                  />
                </div>
              );
            })}

            {/* Add column */}
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