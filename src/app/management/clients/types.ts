import type { Database } from "@/app/lib/supabase/models";

export type ClientRow =
  Database["public"]["Tables"]["clients"]["Row"];

export type ClientType =
  | "Individual"
  | "Company"
  | "Government";

export type ClientStatus =
  | "Active"
  | "Inactive"
  | "Prospective";

export type PreferredContactMethod =
  | "Email"
  | "Phone"
  | "WhatsApp";

export type ClientOption = {
  client_id: string;
  label: string;
};

export type ClientWithProjectCount = ClientRow & {
  projectCount: number;
};

export type ClientProject = {
  project_id: string;
  project_code: string | null;
  title: string | null;
  status: string | null;
  municipality: string | null;
};

export type ClientDetails = ClientRow & {
  projects: ClientProject[];
};