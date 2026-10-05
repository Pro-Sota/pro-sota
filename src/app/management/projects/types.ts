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