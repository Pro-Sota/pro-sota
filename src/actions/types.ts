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
    description: string | null;

    type: SubmissionType;
    status: SubmissionStatus;

    submitted_by: string;
    submitted_by_name: string;

    submitted_at: string | null;
    due_date: string | null;

    reviewed_by: string | null;
    reviewed_at: string | null;

    notes: string | null;
    revision_number: number;

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

import type {
    ResourceCondition,
    ResourceOperationalStatus,
    ResourceType,
} from "@/services/resources";

export type ResourceStockInput = {
    unit: string | null;
    current_quantity: number;
    minimum_quantity: number;
    average_unit_cost: number;
    warehouse_id: string | null;
    supplier_id: string | null;
    batch_number: string | null;
    expiry_date: string | null;
};

export type ResourceFormInput = {
    resource_code: string;
    name: string;
    resource_type: ResourceType;

    category: string | null;
    brand: string | null;
    model: string | null;
    serial_number: string | null;

    condition_status: ResourceCondition;
    operational_status: ResourceOperationalStatus;

    acquisition_date: string | null;
    replacement_value: number | null;
    notes: string | null;

    stock: ResourceStockInput | null;
};