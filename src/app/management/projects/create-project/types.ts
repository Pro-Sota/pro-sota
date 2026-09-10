import { Database } from "@/app/lib/supabase/models";

export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type TeamMember = Database["public"]["Tables"]["profiles"]["Row"];
export type SelectableTeamMember = TeamMember & { isCustom?: boolean };
export type ProjectFormState = ProjectInsert & {
  teamMembers: SelectableTeamMember[];
};

export interface DurationInfo {
  invalid: boolean;
  totalDays?: number;
  label?: string;
}

export interface FormError {
  field: string;
  message: string;
}

export const INITIAL_PROJECT: ProjectFormState = {
  budget: null,
  created_at: null,
  created_by: null,
  description: "",
  end_date: null,
  estimated_cost: null,
  location: null,
  project_code: "",
  start_date: null,
  title: "",
  type: null,
  updated_at: null,
  urgency: null,
  address_line_1: null,
  address_line_2: null,
  province:null,
  city: null,
  country: null,
  latitude: null,
  longitude: null,
  municipality: "",
  state_province: null,
  client_id: null,
  teamMembers: [],
};

export const REQUIRED_FOR_PROGRESS = [
  "title",
  "type",
  "municipality",
  "address_line_1",
  "start_date",
  "end_date",
  "project_code",
] as const;

export const PROJECT_TYPES = [
  "Residencial",
  "Comercial",
  "Industrial",
  "Interior Design",
  "Planeamento Urbano",
  "Renovação",
] as const;

export const DESCRIPTION_MAX = 500;

export const INPUT_STYLE =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1B3A5C] focus:ring-2 focus:ring-[#1B3A5C]/10";

export const BREADCRUMB_ITEMS = [
  { label: "Dashboard", href: "/management" },
  { label: "Projectos", href: "/management/projects" },
  { label: "Novo Projecto" },
];