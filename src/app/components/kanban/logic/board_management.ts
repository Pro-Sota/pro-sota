/**
 * Board Management Logic
 * Handles: drag and drop operations, board state, task ordering
 */

import { Task, TaskColumn, updateTask } from '@/services/project_tasks';

export interface DragData {
  type: 'task' | 'column';
  id: string;
}

export interface BoardState {
  draggedTaskId: string | null;
  dragOverColumnId: string | null;
  draggedColumnId: string | null;
}

export class BoardManagement {
  /**
   * Parse drag data from dataTransfer
   */
  static parseDragData(dataTransfer: DataTransfer): DragData | null {
    try {
      const data = dataTransfer.getData('text/plain');

      if (!data) return null;

      if (data.startsWith('task:')) {
        return {
          type: 'task',
          id: data.slice(5),
        };
      }

      if (data.startsWith('col:')) {
        return {
          type: 'column',
          id: data.slice(4),
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Start dragging a task
   */
  static setTaskDragData(
    event: React.DragEvent,
    taskId: string
  ): void {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `task:${taskId}`);

    // Custom drag image (optional)
    const dragImage = new Image();
    dragImage.src =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%23ddd" width="50" height="50"/%3E%3C/svg%3E';
    event.dataTransfer.setDragImage(dragImage, 0, 0);
  }

  /**
   * Start dragging a column
   */
  static setColumnDragData(
    event: React.DragEvent,
    columnId: string
  ): void {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `col:${columnId}`);
  }

  /**
   * Handle drag over - determine if drop is allowed
   */
  static canDropTask(
    draggedTask: Task | null,
    targetColumnId: string
  ): boolean {
    if (!draggedTask) return false;

    // Cannot drop task in same column
    if (draggedTask.columnId === targetColumnId) {
      return false;
    }

    return true;
  }

  /**
   * Reorder tasks within a column or move to different column
   */
  static async handleTaskDrop(
    draggedTaskId: string,
    targetColumnId: string,
    targetPosition: number,
    tasks: Task[],
    onSuccess: (updatedTask: Task) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const draggedTask = tasks.find(
        (task) => task.id === draggedTaskId
      );

      if (!draggedTask) {
        onError('Tarefa não encontrada.');
        return;
      }

      // Update task with new column and position
      const updatedTask = await updateTask(draggedTaskId, {
        columnId: targetColumnId,
        position: targetPosition,
      });

      onSuccess(updatedTask);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível mover a tarefa.';
      onError(message);
      console.error('Failed to drop task:', err);
    }
  }

  /**
   * Calculate drop position based on mouse coordinates
   */
  static calculateDropPosition(
    event: React.DragEvent,
    containerElement: HTMLElement | null,
    tasksInColumn: Task[]
  ): number {
    if (!containerElement) {
      return tasksInColumn.length;
    }

    const rect = containerElement.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const itemHeight = rect.height / (tasksInColumn.length || 1);
    const position = Math.floor(y / itemHeight);

    return Math.max(0, Math.min(position, tasksInColumn.length));
  }

  /**
   * Reorder tasks within the same column
   */
  static reorderTasksInColumn(
    tasks: Task[],
    columnId: string,
    draggedTaskId: string,
    targetPosition: number
  ): Task[] {
    const columnTasks = tasks.filter(
      (task) => task.columnId === columnId
    );

    const otherTasks = tasks.filter(
      (task) => task.columnId !== columnId
    );

    // Get task to move
    const taskToMove = columnTasks.find(
      (task) => task.id === draggedTaskId
    );

    if (!taskToMove) return tasks;

    // Remove from current position
    const filtered = columnTasks.filter(
      (task) => task.id !== draggedTaskId
    );

    // Insert at new position
    filtered.splice(targetPosition, 0, taskToMove);

    // Update positions
    const reordered = filtered.map((task, index) => ({
      ...task,
      position: index,
    }));

    return [...reordered, ...otherTasks];
  }

  /**
   * Reorder columns
   */
  static reorderColumns(
    columns: TaskColumn[],
    draggedColumnId: string,
    targetPosition: number
  ): TaskColumn[] {
    const filtered = columns.filter(
      (col) => col.column_id !== draggedColumnId
    );

    const columnToMove = columns.find(
      (col) => col.column_id === draggedColumnId
    );

    if (!columnToMove) return columns;

    filtered.splice(targetPosition, 0, columnToMove);

    return filtered.map((column, index) => ({
      ...column,
      position: index,
    }));
  }

  /**
   * Get visual feedback for drop zone
   */
  static getDropFeedbackClass(
    isDragOver: boolean,
    isValidTarget: boolean
  ): string {
    if (!isDragOver) return '';

    if (isValidTarget) {
      return 'ring-2 ring-blue-400 ring-inset bg-blue-50';
    }

    return 'ring-2 ring-red-400 ring-inset bg-red-50';
  }

  /**
   * Get drag feedback class
   */
  static getDragFeedbackClass(
    isDragging: boolean
  ): string {
    return isDragging ? 'opacity-50' : '';
  }

  /**
   * Validate drag operation
   */
  static validateDragOperation(
    dragData: DragData | null,
    sourceColumnId: string,
    targetColumnId: string,
    tasks: Task[]
  ): { valid: boolean; error?: string } {
    if (!dragData) {
      return { valid: false, error: 'Dados de arrasto inválidos.' };
    }

    if (dragData.type === 'task') {
      const task = tasks.find(
        (t) => t.id === dragData.id
      );

      if (!task) {
        return { valid: false, error: 'Tarefa não encontrada.' };
      }

      if (sourceColumnId === targetColumnId) {
        return {
          valid: true, // Allow reordering in same column
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get drop hint text
   */
  static getDropHintText(
    dragData: DragData | null,
    isValidTarget: boolean
  ): string {
    if (!dragData) return '';

    if (dragData.type === 'task') {
      return isValidTarget
        ? 'Soltar para mover a tarefa'
        : 'Não é possível mover aqui';
    }

    return isValidTarget
      ? 'Soltar para reordenar colunas'
      : 'Não é possível mover aqui';
  }

  /**
   * Handle drag leave with timer to prevent flickering
   */
  static createDragLeaveHandler(
    callback: () => void,
    delay: number = 100
  ): { enter: () => void; leave: () => void } {
    let timeoutId: NodeJS.Timeout | null = null;

    return {
      enter: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      },
      leave: () => {
        timeoutId = setTimeout(callback, delay);
      },
    };
  }

  /**
   * Get valid drop columns for a task
   */
  static getValidDropColumns(
    task: Task,
    columns: TaskColumn[],
    excludeArchived: boolean = true
  ): TaskColumn[] {
    return columns.filter((column) => {
      if (excludeArchived && column.is_completed) {
        return false;
      }

      return column.column_id !== task.columnId;
    });
  }

  /**
   * Export board state for persistence
   */
  static exportBoardState(
    tasks: Task[],
    columns: TaskColumn[]
  ): {
    tasks: Array<{
      id: string;
      columnId: string;
      position: number;
    }>;
    columns: Array<{
      id: string;
      position: number;
    }>;
  } {
    return {
      tasks: tasks.map((task) => ({
        id: task.id,
        columnId: task.columnId,
        position: task.position,
      })),
      columns: columns.map((column) => ({
        id: column.column_id,
        position: column.position,
      })),
    };
  }

  /**
   * Check if board has unsaved changes
   */
  static hasBoardChanges(
    previousState: ReturnType<typeof this.exportBoardState>,
    currentState: ReturnType<typeof this.exportBoardState>
  ): boolean {
    return (
      JSON.stringify(previousState) !==
      JSON.stringify(currentState)
    );
  }
}

export default BoardManagement;