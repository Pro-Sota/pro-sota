import { createClient } from "@/app/lib/supabase/client";

export type SubmissionStatus = "pending" | "approved" | "rejected" | "changes_requested";
export type SubmissionType = "design" | "technical" | "client_approval";

export interface Submission {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  type: SubmissionType;
  status: SubmissionStatus;
  submitted_by_user_id: string;
  submitted_by_name: string;
  submitted_date: string;
  due_date: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const supabase = createClient();

/**
 * Fetch all submissions for a project (ADMIN ONLY)
 */
export async function fetchAllProjectSubmissions(projectId: string): Promise<Submission[]> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("project_id", projectId)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching submissions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching submissions:", error);
    return [];
  }
}

/**
 * Fetch submissions submitted by current user
 */
export async function fetchMySubmissions(projectId: string, userId: string): Promise<Submission[]> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("project_id", projectId)
      .eq("submitted_by_user_id", userId)
      .order("submitted_date", { ascending: false });

    if (error) {
      console.error("Error fetching user submissions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching user submissions:", error);
    return [];
  }
}

export async function createSubmission(
  submission: Omit<Submission, "id" | "created_at" | "updated_at">
): Promise<Submission | null> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .insert([submission])
      .select()
      .single();

    if (error) {
      console.error("Error creating submission:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating submission:", error);
    return null;
  }
}

export async function updateSubmission(
  id: string,
  updates: Partial<Submission>
): Promise<Submission | null> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating submission:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error updating submission:", error);
    return null;
  }
}

export async function deleteSubmission(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("submissions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting submission:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting submission:", error);
    return false;
  }
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  notes?: string
): Promise<Submission | null> {
  return updateSubmission(id, { status, admin_notes: notes });
}