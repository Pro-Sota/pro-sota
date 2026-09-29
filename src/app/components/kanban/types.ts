import type { Task, TaskColumn, TaskBoard } from "@/services/project_tasks";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type KanbanColumn = Omit<TaskColumn, "projectName"> & {
  projectName?: string | null;
};

export type ProjectMember = {
  profileId: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  picture?: string | null;
};

export type TaskMember = {
  profileId: string;
  name: string;
  picture?: string | null;
  jobTitle?: string | null;
};

export type KanbanTask = Task & {
  completed?: boolean;
  startDate?: string | null;
  assignedMembers?: TaskMember[];
};

export type KanbanBoardProps = {
  projectId?: string | null;
  initialBoard: TaskBoard;
  projectMembers?: ProjectMember[];
  currentUserProfileId?: string | null;
};

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

export type TaskCardProps = {
  task: KanbanTask;
  onSelect: () => void;
  onDelete: () => void;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
};

export type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

export type ToastContainerProps = {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
};

export type MemberAvatarProps = {
  member: {
    profileId: string;
    name: string;
    picture?: string | null;
  };
  size?: "small" | "medium";
};