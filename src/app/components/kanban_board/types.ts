export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TaskScope =
  | {
      type: "general";
      projectId: null;
    }
  | {
      type: "project";
      projectId: string;
    };

export type KanbanColumn = {
  columnId: string;
  projectId: string | null;
  name: string;
  position: number;
  isCompleted: boolean;
};

export type TaskMember = {
  profileId: string;
  firstName: string;
  lastName: string;
};

export type Task = {
  taskId: string;

  /**
   * Null for general/personal tasks.
   * Set for project tasks.
   */
  projectId: string | null;

  /**
   * User who created the task.
   *
   * This is NOT an assignment.
   * The creator does not automatically become a task member.
   */
  createdBy: string;

  columnId: string | null;

  title: string;
  description: string | null;

  priority: TaskPriority;

  startDate: string | null;
  dueDate: string | null;

  estimatedHours: number | null;
  actualHours: number | null;

  position: number;

  createdAt: string;
  updatedAt: string;

  completed: boolean;

  /**
   * Users explicitly assigned to the task.
   *
   * The creator may or may not be included here.
   */
  members: TaskMember[];
};

export type KanbanBoardData = {
  scope: TaskScope;
  columns: KanbanColumn[];
  tasks: Task[];
};

export type CreateTaskInput = {
  title: string;
  description?: string | null;

  columnId?: string | null;

  /**
   * Explicitly assigned users.
   *
   * Do not automatically add the authenticated user here.
   */
  memberIds?: string[];

  priority?: TaskPriority;

  startDate?: string | null;
  dueDate?: string | null;

  estimatedHours?: number | null;
};

export type UpdateTaskInput = Partial<
  Omit<CreateTaskInput, "columnId">
> & {
  columnId?: string | null;
  actualHours?: number | null;
  completed?: boolean;
};

export type CreateColumnInput = {
  name: string;
  isCompleted?: boolean;
};