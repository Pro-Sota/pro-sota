export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskScope =
  | { type: 'general'; projectId: null }
  | { type: 'project'; projectId: string };

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
  picture: string | null;
};

export type Task = {
  taskId: string;
  projectId: string | null;
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
  assignedTo?: string | null;
  priority?: TaskPriority;
  startDate?: string | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'columnId'>> & {
  columnId?: string | null;
  actualHours?: number | null;
  completed?: boolean;
};

export type CreateColumnInput = {
  name: string;
  isCompleted?: boolean;
};
