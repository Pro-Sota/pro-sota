import { Database } from "@/app/lib/supabase/models";

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

export const PROJECT_STATUSES = [
  "Em curso",
  "Em observação",
  "Concluído",
  "Em pausa",
] as const;

export const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Institutional",
  "Mixed Use",
  "Renovation",
  "Interior Design",
  "Landscape",
  "Other",
] as const;

export const PROJECT_URGENCIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectUrgency = (typeof PROJECT_URGENCIES)[number];

export type ProjectPayload = {
    project_code: string;
    title: string;
    description: string | null;
    type: string | null;
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
    reference_point:string | null;
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
export type ActionResult = { success: true } | { success: false; error: string };