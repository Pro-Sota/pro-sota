
import {
  TaskColumn,
  Task,
  createTaskColumn,
  renameTaskColumn,
  deleteTaskColumn,
  reorderTaskColumns,
} from "@/services/project_tasks";

export interface CreateColumnInput {
  projectId: string | null;
  title: string;
  position?: number;
}

export interface ColumnManagementState {
  columns: TaskColumn[];
  editingColumnId: string | null;
  columnTitleInput: string;
  listInput: string;
  isAddingList: boolean;
}

export class ColumnManagement {
  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  static async createColumn(
    input: CreateColumnInput,
    existingColumns: TaskColumn[],
    onSuccess: (column: TaskColumn) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    try {
      const title = input.title.trim();

      if (!title) {
        onError("O nome da coluna é obrigatório.");
        return;
      }

      const duplicate = existingColumns.some(
        (column) =>
          column.title.trim().toLowerCase() ===
          title.toLowerCase(),
      );

      if (duplicate) {
        onError("Já existe uma coluna com esse nome.");
        return;
      }

      const position =
        input.position ??
        existingColumns.length;

      const newColumn = await createTaskColumn(
        input.projectId,
        title,
        position,
      );

      onSuccess(newColumn);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar a coluna.";

      console.error(
        "ColumnManagement.createColumn:",
        error,
      );

      onError(message);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Rename                                                                   */
  /* ------------------------------------------------------------------------ */

  static async updateColumnName(
    columnId: string,
    newName: string,
    existingColumns: TaskColumn[],
    onSuccess: (column: TaskColumn) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    try {
      if (!columnId) {
        onError("O ID da coluna é obrigatório.");
        return;
      }

      const title = newName.trim();

      if (!title) {
        onError("O nome da coluna é obrigatório.");
        return;
      }

      const oldColumn =
        existingColumns.find(
          (column) => column.id === columnId,
        );

      if (!oldColumn) {
        onError("Coluna não encontrada.");
        return;
      }

      if (
        oldColumn.title
          .trim()
          .toLowerCase() === title.toLowerCase()
      ) {
        onSuccess(oldColumn);
        return;
      }

      const duplicate =
        existingColumns.some(
          (column) =>
            column.id !== columnId &&
            column.title
              .trim()
              .toLowerCase() ===
              title.toLowerCase(),
        );

      if (duplicate) {
        onError("Já existe uma coluna com esse nome.");
        return;
      }

      const updatedColumn =
        await renameTaskColumn(
          columnId,
          title,
        );

      onSuccess(updatedColumn);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível renomear a coluna.";

      console.error(
        "ColumnManagement.updateColumnName:",
        error,
      );

      onError(message);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  static async deleteColumn(
    columnId: string,
    tasks: Task[],
    existingColumns: TaskColumn[],
    onSuccess: () => void,
    onError: (error: string) => void,
  ): Promise<void> {
    try {
      if (!columnId) {
        onError("O ID da coluna é obrigatório.");
        return;
      }

      const column =
        existingColumns.find(
          (item) => item.id === columnId,
        );

      if (!column) {
        onError("Coluna não encontrada.");
        return;
      }

      const columnTasks =
        tasks.filter(
          (task) =>
            task.columnId === columnId,
        );

      /*
       * Do not allow deleting a column that still contains tasks.
       *
       * This avoids leaving tasks without a visible list because the
       * application no longer has a "Sem lista" column.
       */
      if (columnTasks.length > 0) {
        onError(
          `Esta coluna contém ${columnTasks.length} tarefa(s). Mova as tarefas para outra lista antes de eliminar a coluna.`,
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Tem a certeza de que pretende eliminar a lista "${column.title}"?`,
        );

      if (!confirmed) {
        return;
      }

      await deleteTaskColumn(
        column.projectId ?? "",
        columnId,
      );

      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível eliminar a coluna.";

      console.error(
        "ColumnManagement.deleteColumn:",
        error,
      );

      onError(message);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Reorder                                                                  */
  /* ------------------------------------------------------------------------ */

  static async reorderColumns(
    projectId: string | null,
    orderedColumnIds: string[],
    isGlobal: boolean = false,
    onSuccess: () => void,
    onError: (error: string) => void,
  ): Promise<void> {
    try {
      if (
        !Array.isArray(
          orderedColumnIds,
        )
      ) {
        onError(
          "A ordem das colunas é inválida.",
        );

        return;
      }

      if (
        orderedColumnIds.length ===
        0
      ) {
        onSuccess();
        return;
      }

      /*
       * Global board:
       *
       * The current service can reorder the supplied column IDs directly.
       *
       * Project board:
       * projectId is retained so callers can continue using this helper,
       * but the service performs the actual updates using column IDs.
       */
      await reorderTaskColumns(
        projectId,
        orderedColumnIds,
      );

      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível reordenar as colunas.";

      console.error(
        "ColumnManagement.reorderColumns:",
        error,
      );

      onError(message);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Lookup                                                                   */
  /* ------------------------------------------------------------------------ */

  static getColumnById(
    columnId: string,
    columns: TaskColumn[],
  ): TaskColumn | undefined {
    return columns.find(
      (column) =>
        column.id === columnId,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Project columns                                                          */
  /* ------------------------------------------------------------------------ */

  static getProjectColumns(
    columns: TaskColumn[],
  ): TaskColumn[] {
    return columns.filter(
      (column) =>
        Boolean(column.projectId),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* General columns                                                          */
  /* ------------------------------------------------------------------------ */

  static getGeneralColumns(
    columns: TaskColumn[],
  ): TaskColumn[] {
    return columns.filter(
      (column) =>
        !column.projectId,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Active columns                                                           */
  /* ------------------------------------------------------------------------ */

  static getActiveColumns(
    columns: TaskColumn[],
  ): TaskColumn[] {
    return columns;
  }

  /* ------------------------------------------------------------------------ */
  /* Task count                                                               */
  /* ------------------------------------------------------------------------ */

  static getColumnWithTaskCount(
    column: TaskColumn,
    tasks: Task[],
  ): TaskColumn & {
    taskCount: number;
  } {
    const taskCount =
      tasks.filter(
        (task) =>
          task.columnId ===
          column.id,
      ).length;

    return {
      ...column,
      taskCount,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Validate order                                                           */
  /* ------------------------------------------------------------------------ */

  static validateColumnOrder(
    columnIds: string[],
    existingColumns: TaskColumn[],
  ): boolean {
    if (
      columnIds.length !==
      existingColumns.length
    ) {
      return false;
    }

    const existingIds =
      new Set(
        existingColumns.map(
          (column) =>
            column.id,
        ),
      );

    if (
      new Set(columnIds).size !==
      columnIds.length
    ) {
      return false;
    }

    return columnIds.every(
      (id) =>
        existingIds.has(id),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Task movement                                                            */
  /* ------------------------------------------------------------------------ */

  static getTargetColumnsForTask(
    currentColumnId: string | null,
    columns: TaskColumn[],
  ): TaskColumn[] {
    return columns.filter(
      (column) =>
        column.id !==
        currentColumnId,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Column display                                                           */
  /* ------------------------------------------------------------------------ */

  static getColumnDisplayName(
    column: TaskColumn,
  ): string {
    if (
      column.projectId &&
      column.projectName
    ) {
      return `${column.title} — ${column.projectName}`;
    }

    return column.title;
  }

  /* ------------------------------------------------------------------------ */
  /* Check whether column belongs to project                                 */
  /* ------------------------------------------------------------------------ */

  static isProjectColumn(
    column: TaskColumn,
  ): boolean {
    return Boolean(
      column.projectId,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Check whether column is general                                          */
  /* ------------------------------------------------------------------------ */

  static isGeneralColumn(
    column: TaskColumn,
  ): boolean {
    return !column.projectId;
  }
}

export default ColumnManagement;
