import {
    FileCheck2,
    FileClock,
    FileX2,
    Files,
} from "lucide-react";

export type SubmissionStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "changes_requested";

export type SubmissionType =
    | "design"
    | "technical"
    | "client_approval";

export type Submission = {
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
};

export const KANBAN_COLUMNS = [
    {
        id: "pending" as SubmissionStatus,
        title: "Pendentes",
        icon: FileClock,
        textColor: "text-amber-600",
    },
    {
        id: "changes_requested" as SubmissionStatus,
        title: "Alterações solicitadas",
        icon: Files,
        textColor: "text-orange-600",
    },
    {
        id: "approved" as SubmissionStatus,
        title: "Aprovadas",
        icon: FileCheck2,
        textColor: "text-emerald-600",
    },
    {
        id: "rejected" as SubmissionStatus,
        title: "Rejeitadas",
        icon: FileX2,
        textColor: "text-red-600",
    },
];