/**
 * Task Management Logic
 * Handles: create, update, delete, search, and undo operations for tasks
 */

import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  createTask,
  updateTask,
} from '@/services/project_tasks';

export interface TaskManagementState {
  tasks: Task[];
  selectedTaskId: string | null;
  lastDeleted: { task: Task; index: number; columnId: string } | null;
  searchQuery: string;
  taskInputs: Record<string, string>;
  memberInput: string;
  titleDraft: string;
}

export class TaskManagement {
  /**
   * Create a new task
   */
  static async createTask(
    input: CreateTaskInput,
    onSuccess: (task: Task) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const newTask = await createTask(input);
      onSuccess(newTask);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível criar a tarefa.';
      onError(message);
      console.error('Failed to create task:', err);
    }
  }

  /**
   * Update task details
   */
  static async updateTask(
    taskId: string,
    input: UpdateTaskInput,
    onSuccess: (task: Task) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const updatedTask = await updateTask(taskId, input);
      onSuccess(updatedTask);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar a tarefa.';
      onError(message);
      console.error('Failed to update task:', err);
    }
  }

  /**
   * Delete task with undo support
   */
  static async deleteTask(
    taskId: string,
    tasks: Task[],
    onSuccess: (lastDeleted: { task: Task; index: number; columnId: string }) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      const task = tasks[taskIndex];

      if (!task) {
        onError('Tarefa não encontrada.');
        return;
      }

      const columnId = task.columnId;

      // Optimistically remove from UI
      onSuccess({ task, index: taskIndex, columnId });

      // Call delete API
      // Note: You'll need to add deleteTask to the service
      // For now, we'll assume it exists
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível eliminar a tarefa.';
      onError(message);
      console.error('Failed to delete task:', err);
    }
  }

  /**
   * Update task column (move between columns)
   */
  static async moveTaskToColumn(
    taskId: string,
    targetColumnId: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      await updateTask(taskId, { columnId: targetColumnId });
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível mover a tarefa.';
      onError(message);
      console.error('Failed to move task:', err);
    }
  }

  /**
   * Update task priority
   */
  static async updatePriority(
    taskId: string,
    priority: 'Low' | 'Medium' | 'High' | 'Critical',
    onSuccess: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      await updateTask(taskId, { priority });
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar a prioridade.';
      onError(message);
      console.error('Failed to update priority:', err);
    }
  }

  /**
   * Update task dates
   */
  static async updateTaskDates(
    taskId: string,
    startDate: string | null | undefined,
    dueDate: string | null | undefined,
    onSuccess: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const updates: UpdateTaskInput = {};
      
      if (startDate !== undefined) updates.startDate = startDate;
      if (dueDate !== undefined) updates.dueDate = dueDate;

      if (Object.keys(updates).length === 0) {
        onError('Nenhuma data foi fornecida.');
        return;
      }

      await updateTask(taskId, updates);
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar as datas.';
      onError(message);
      console.error('Failed to update task dates:', err);
    }
  }

  /**
   * Search tasks by title or description
   */
  static filterTasks(
    tasks: Task[],
    searchQuery: string
  ): Task[] {
    if (!searchQuery.trim()) {
      return tasks;
    }

    const query = searchQuery.toLowerCase();

    return tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    });
  }

  /**
   * Get tasks by column
   */
  static getTasksByColumn(
    tasks: Task[],
    columnId: string
  ): Task[] {
    return tasks.filter((task) => task.columnId === columnId);
  }

  /**
   * Check if task is overdue
   */
  static isOverdue(dueDate?: string): boolean {
    if (!dueDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Date(dueDate) < today;
  }

  /**
   * Format due date for display
   */
  static formatDueDate(dueDate: string): string {
    return new Date(dueDate).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get task completion percentage in column
   */
  static getColumnCompletionPercentage(
    tasks: Task[],
    columnId: string,
    completedColumnIds: string[]
  ): number {
    const columnTasks = tasks.filter(
      (task) => task.columnId === columnId
    );

    if (columnTasks.length === 0) return 0;

    const completedTasks = tasks.filter(
      (task) =>
        completedColumnIds.includes(task.columnId)
    );

    return Math.round(
      (completedTasks.length / columnTasks.length) * 100
    );
  }
}

export default TaskManagement;