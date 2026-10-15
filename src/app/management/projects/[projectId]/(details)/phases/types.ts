export type DeliverableStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "cancelled";

export type Deliverable = {
  id: string;
  phase_id: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
};