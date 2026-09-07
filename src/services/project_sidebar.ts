import { createClient } from "@/app/lib/supabase/client";
import { Database } from "@/app/lib/supabase/models";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type ProjectSidebarData = {
  project: Project;
  members: Array<{
    profile: Profile;
    role: string | null;
  }>;
  recentFile: {
    name: string;
  } | null;
};

export async function getProjectSidebarData(
  projectId: string
): Promise<ProjectSidebarData | null> {
  const supabase = createClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    console.error("Failed to fetch project:", projectError);
    return null;
  }

  const { data: members, error: membersError } = await supabase
    .from("project_members")
    .select(`
      role,
      profiles (*)
    `)
    .eq("project_id", projectId);

  if (membersError) {
    console.error("Failed to fetch project members:", membersError);
  }

  const { data: recentFile, error: fileError } = await supabase
    .from("documents")
    .select("name")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fileError) {
    console.error("Failed to fetch recent project file:", fileError);
  }

  return {
    project,
    members:
      members?.map((member) => ({
        profile: member.profiles as unknown as Profile,
        role: member.role,
      })) ?? [],
    recentFile: recentFile
      ? {
          name: recentFile.name,
        }
      : null,
  };
}