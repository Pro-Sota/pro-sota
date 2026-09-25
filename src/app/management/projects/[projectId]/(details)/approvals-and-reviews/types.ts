import { AlertCircle, CheckCircle2, Clock, Eye, FileText, XCircle, Zap } from "lucide-react";

export type IconProps = {
  size?: number;
  className?: string;
};

export type KanbanColumn = {
  id: SubmissionStatus;
  title: string;
  icon: React.ComponentType<IconProps>;
  bgColor: string;
  textColor: string;
  badgeColor: string;
};

export type SubmissionStatus = "draft" |
  "pending" |
  "under_review" |
  "approved" |
  "rejected" |
  "changes_requested"
export type SubmissionType = "design" | "technical" | "client_approval";

export interface Submission {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  type: SubmissionType;
  status: SubmissionStatus;
  submitted_by: string;
  submitted_date: string;
  due_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}


export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "pending",
    title: "Em Revisão",
    icon: Clock,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "changes_requested",
    title: "Mudanças",
    icon: AlertCircle,
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "approved",
    title: "Aprovado",
    icon: CheckCircle2,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "rejected",
    title: "Rejeitado",
    icon: XCircle,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    badgeColor: "bg-red-100 text-red-700",
  },
];

export const TYPE_ICONS: Record<SubmissionType, React.ComponentType<{ size?: number }>> = {
  design: FileText,
  technical: Zap,
  client_approval: Eye,
};

export const TYPE_LABELS: Record<SubmissionType, string> = {
  design: "Design",
  technical: "Técnico",
  client_approval: "Cliente",
};

