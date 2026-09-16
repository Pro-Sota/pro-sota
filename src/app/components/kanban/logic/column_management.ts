/**
 * Column Management Logic
 * Handles: create, update, delete, and reorder operations for task columns
 */

import {
  TaskColumn,
  Task,
  CreateTaskColumnInput,
  UpdateTaskColumnInput,
  createTaskColumn,
  updateTaskColumn,
  deleteTaskColumn,
  reorderTaskColumns,
  reorderGlobalTaskColumns,
} from '@/services/project_tasks';

export interface ColumnManagementState {
  columns: TaskColumn[];
  editingColumnId: string | null;
  columnTitleInput: string;
  listInput: string;
  isAddingList: boolean;
}

export class ColumnManagement {
  /**
   * Create a new column
   */
  static async createColumn(
    input: CreateTaskColumnInput,
    existingColumns: TaskColumn[],
    onSuccess: (column: TaskColumn) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const title = input.name.trim();

      if (!title) {
        onError('O nome da coluna é obrigatório.');
        return;
      }

      // Check for duplicate column names
      if (
        existingColumns.some(
          (column) =>
            column.name.toLowerCase() === title.toLowerCase()
        )
      ) {
        onError('Já existe uma coluna com esse nome.');
        return;
      }

      // Set position to last
      const positionedInput: CreateTaskColumnInput = {
        ...input,
        name: title,
        position: input.position ?? existingColumns.length,
      };

      const newColumn = await createTaskColumn(positionedInput);
      onSuccess(newColumn);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível criar a coluna.';
      onError(message);
      console.error('Failed to create column:', err);
    }
  }

  /**
   * Update column name
   */
  static async updateColumnName(
    columnId: string,
    newName: string,
    existingColumns: TaskColumn[],
    onSuccess: (column: TaskColumn) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const title = newName.trim();

      if (!title) {
        onError('O nome da coluna é obrigatório.');
        return;
      }

      const oldColumn = existingColumns.find(
        (column) => column.column_id === columnId
      );

      if (!oldColumn) {
        onError('Coluna não encontrada.');
        return;
      }

      // Skip if name hasn't changed
      if (
        oldColumn.name.toLowerCase() === title.toLowerCase()
      ) {
        onSuccess(oldColumn);
        return;
      }

      // Check for duplicate names (excluding current column)
      if (
        existingColumns.some(
          (column) =>
            column.column_id !== columnId &&
            column.name.toLowerCase() === title.toLowerCase()
        )
      ) {
        onError('Já existe uma coluna com esse nome.');
        return;
      }

      const updatedColumn = await updateTaskColumn(
        columnId,
        { name: title }
      );

      onSuccess(updatedColumn);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível renomear a coluna.';
      onError(message);
      console.error('Failed to rename column:', err);
    }
  }

  /**
   * Delete column with task migration
   */
  static async deleteColumn(
    columnId: string,
    tasks: Task[],
    existingColumns: TaskColumn[],
    onSuccess: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const columnTasks = tasks.filter(
        (task) => task.columnId === columnId
      );

      // If column has tasks, find target column
      if (columnTasks.length > 0) {
        const targetColumn = existingColumns.find(
          (column) => column.column_id !== columnId
        );

        if (!targetColumn) {
          onError(
            'Não é possível eliminar a única coluna que contém tarefas.'
          );
          return;
        }

        // Confirm with user
        const confirmed = window.confirm(
          `Esta coluna contém ${columnTasks.length} tarefa(s). As tarefas serão movidas para "${targetColumn.name}". Continuar?`
        );

        if (!confirmed) {
          return;
        }

        // Delete with task migration
        await deleteTaskColumn(
          columnId,
          targetColumn.column_id
        );
      } else {
        // Delete empty column
        await deleteTaskColumn(columnId);
      }

      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível eliminar a coluna.';
      onError(message);
      console.error('Failed to delete column:', err);
    }
  }

  /**
   * Reorder columns for a project
   */
  static async reorderColumns(
    projectId: string,
    orderedColumnIds: string[],
    isGlobal: boolean = false,
    onSuccess: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      if (isGlobal) {
        await reorderGlobalTaskColumns(orderedColumnIds);
      } else {
        await reorderTaskColumns(projectId, orderedColumnIds);
      }

      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível reordenar as colunas.';
      onError(message);
      console.error('Failed to reorder columns:', err);
    }
  }

  /**
   * Mark column as completed/archive
   */
  static async updateColumnStatus(
    columnId: string,
    isCompleted: boolean,
    onSuccess: (column: TaskColumn) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const updatedColumn = await updateTaskColumn(
        columnId,
        { isCompleted }
      );

      onSuccess(updatedColumn);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar o status da coluna.';
      onError(message);
      console.error('Failed to update column status:', err);
    }
  }

  /**
   * Get column by ID
   */
  static getColumnById(
    columnId: string,
    columns: TaskColumn[]
  ): TaskColumn | undefined {
    return columns.find((col) => col.column_id === columnId);
  }

  /**
   * Get all completed columns
   */
  static getCompletedColumns(
    columns: TaskColumn[]
  ): TaskColumn[] {
    return columns.filter((col) => col.is_completed === true);
  }

  /**
   * Get all active columns
   */
  static getActiveColumns(
    columns: TaskColumn[]
  ): TaskColumn[] {
    return columns.filter((col) => col.is_completed === false);
  }

  /**
   * Get column with task count
   */
  static getColumnWithTaskCount(
    column: TaskColumn,
    tasks: Task[]
  ): TaskColumn & { taskCount: number } {
    const taskCount = tasks.filter(
      (task) => task.columnId === column.column_id
    ).length;

    return {
      ...column,
      taskCount,
    };
  }

  /**
   * Validate column order
   */
  static validateColumnOrder(
    columnIds: string[],
    existingColumns: TaskColumn[]
  ): boolean {
    if (columnIds.length !== existingColumns.length) {
      return false;
    }

    const existingIds = new Set(
      existingColumns.map((col) => col.column_id)
    );

    return columnIds.every((id) => existingIds.has(id));
  }

  /**
   * Get available target columns for task movement
   */
  static getTargetColumnsForTask(
    currentColumnId: string,
    columns: TaskColumn[]
  ): TaskColumn[] {
    return columns.filter(
      (col) => col.column_id !== currentColumnId
    );
  }
}

export default ColumnManagement;