import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function getProjectFolders(projectId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch project folders:", error);
    throw new Error("Failed to fetch project folders");
  }

  return data ?? [];
}

export async function getProjectDocuments(projectId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to fetch project documents:", error);
    throw new Error("Failed to fetch project documents");
  }

  return data ?? [];
}
