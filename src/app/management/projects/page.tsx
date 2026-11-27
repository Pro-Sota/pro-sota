
import { requireUser } from "@/app/lib/supabase/auth";
import { getProjects } from "@/services/projects_server";

import ProjectsPageInner from "./projects";

export default async function ProjectsPage() {
  const user = await requireUser();

  const isAdmin = user.userRole?.toLowerCase() === "admin";

  const projects = await getProjects({
    all: isAdmin,
  });

  return (
    <ProjectsPageInner
      projects={projects ?? []}
      canCreateProject={isAdmin}
    />
  );
}
