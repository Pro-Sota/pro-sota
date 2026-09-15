// src/services/documents.ts

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export async function getProjectFolders(projectId: string) {
   const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getProjectFolders error:", error);
    throw new Error(`Failed to load project folders: ${error.message}`);
  }

  return data ?? [];
}

export async function getProjectDocuments(projectId: string) {
  const cookiesStore = await cookies();
  const supabase = await createClient(cookiesStore);

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getProjectDocuments error:", error);
    throw new Error(`Failed to load project documents: ${error.message}`);
  }

  return data ?? [];
}