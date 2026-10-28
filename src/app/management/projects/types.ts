
import type { Database } from "@/app/lib/supabase/models";

/* -------------------------------------------------------------------------- */
/* Project types                                                              */
/* -------------------------------------------------------------------------- */

export type Project =
    Database["public"]["Tables"]["projects"]["Row"];

export type ProjectListItem = Project & {
    client_name: string | null;
    progress: number;
    phase_name: string | null;
    task_count: number;
    completed_task_count: number;
    member_count: number;
    member_avatars: string[];
    next_deadline: string | null;
    project_manager: {
        name: string;
    } | null;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const PROJECT_STATUSES = [
    "Em curso",
    "Em observação",
    "Concluído",
    "Em pausa",
] as const;

export const PROJECT_URGENCIES = [
    "Low",
    "Medium",
    "High",
    "Critical",
] as const;

export const PROJECT_TYPES = [
    "Residencial",
    "Comercial",
    "Industrial",
    "Institucional",
    "Uso misto",
    "Reabilitação",
    "Design de interiores",
    "Paisagismo",
    "Outro",
] as const;

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
    Residencial: "Residencial",
    Comercial: "Comercial",
    Industrial: "Industrial",
    Institucional: "Institucional",
    "Uso misto": "Uso misto",
    Reabilitação: "Reabilitação",
    "Design de interiores": "Design de interiores",
    Paisagismo: "Paisagismo",
    Outro: "Outro",
};

/* -------------------------------------------------------------------------- */
/* Derived types                                                              */
/* -------------------------------------------------------------------------- */

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectUrgency = (typeof PROJECT_URGENCIES)[number];
export type ProjectType = (typeof PROJECT_TYPES)[number];

/* -------------------------------------------------------------------------- */
/* Project payload                                                            */
/* -------------------------------------------------------------------------- */

export type ProjectPayload = {
    project_code: string;
    title: string;
    description: string | null;
    type: ProjectType | null;
    status: ProjectStatus;
    urgency: ProjectUrgency;

    client_id: string | null;

    // Location
    country: string | null;
    province: string | null;
    municipality: string;
    city: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    latitude: number | null;
    longitude: number | null;

    // Financial information
    budget: number | null;
    estimated_cost: number | null;

    // Planned dates
    start_date: string | null;
    end_date: string | null;

    // Actual dates
    actual_start_date: string | null;
    actual_end_date: string | null;

    // Additional project information
    contract_number: string | null;
    external_reference: string | null;
    completion_percentage: number;
    image: string | null;
};

export type UpdateProjectInput = ProjectPayload;

export type ActionResult =
    | { success: true }
    | { success: false; error: string };
