
/* -------------------------------------------------------------------------- */
/* Task                                                                        */
/* -------------------------------------------------------------------------- */

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TaskReviewStatus =
  | "not_submitted"
  | "in_review"
  | "changes_requested"
  | "approved";

/* -------------------------------------------------------------------------- */
/* Board scope                                                                 */
/* -------------------------------------------------------------------------- */

export type TaskScope =
  | {
    type: "general";
    projectId: null;
  }
  | {
    type: "project";
    projectId: string;
  };

/* -------------------------------------------------------------------------- */
/* Kanban column                                                               */
/* -------------------------------------------------------------------------- */

export type KanbanColumn = {
  columnId: string;
  projectId: string | null;
  name: string;
  position: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

/* -------------------------------------------------------------------------- */
/* Task member                                                                 */
/* -------------------------------------------------------------------------- */

export type TaskMember = {
  profileId: string;
  firstName: string;
  lastName: string;
  picture: string | null;
};

/* -------------------------------------------------------------------------- */
/* Task                                                                        */
/* -------------------------------------------------------------------------- */

export type Task = {
  taskId: string;
  projectId: string | null;
  createdBy: string;

  columnId: string | null;

  // Project deliverable associations
  phaseId: string | null;
  stageId: string | null;

  // Review workflow
  reviewStatus: TaskReviewStatus;

  title: string;
  description: string | null;

  priority: TaskPriority;

  startDate: string | null;
  dueDate: string | null;

  estimatedHours: number | null;
  actualHours: number | null;

  position: number;
  submittedAt: string | null,
  reviewedAt: string | null,
  reviewedBy: string | null,
  reviewNotes: string | null,

  createdAt: string;
  updatedAt: string;

  completed: boolean;

  members: TaskMember[];
};

/* -------------------------------------------------------------------------- */
/* Kanban board                                                                */
/* -------------------------------------------------------------------------- */

export type KanbanBoardData = {
  scope: TaskScope;
  columns: KanbanColumn[];
  tasks: Task[];
};

/* -------------------------------------------------------------------------- */
/* Create task                                                                 */
/* -------------------------------------------------------------------------- */

export type CreateTaskInput = {
  title: string;
  description?: string | null;

  columnId?: string | null;

  phaseId?: string | null;
  stageId?: string | null;

  memberIds?: string[];

  priority?: TaskPriority;

  startDate?: string | null;
  dueDate?: string | null;

  estimatedHours?: number | null;
};

/* -------------------------------------------------------------------------- */
/* Update task                                                                 */
/* -------------------------------------------------------------------------- */

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  actualHours?: number | null;
  completed?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Create column                                                               */
/* -------------------------------------------------------------------------- */

export type CreateColumnInput = {
  name: string;
  isCompleted?: boolean;
};


export type TaskSubmissionStatus =
  | "draft"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "changes_requested";

export type TaskSubmissionFile = {
  submissionFileId: string;
  submissionId: string;
  fileName: string;
  storagePath: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
};

export type TaskSubmission = {
  submissionId: string;
  taskId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskSubmissionStatus;
  revisionNumber: number;
  submittedBy: string;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string | null;
  files: TaskSubmissionFile[];
};

export type SubmitTaskInput = {
  taskId: string;
  notes: string;
  files: File[];
};

export type ReviewTaskInput = {
  taskId: string;
  submissionId: string;
  notes: string;
};