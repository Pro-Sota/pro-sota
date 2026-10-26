import { Suspense } from "react";

import { requireUser } from "@/app/lib/supabase/auth";
import { getProjects } from "@/services/projects_server";

import ProjectsPageInner from "./projects";
import { hasAllPermissions } from "@/app/lib/permissions";

export default async function ProjectsPage() {
  const user = await requireUser();

  const isAdmin = user.userRole?.toLowerCase() === "admin";

  const projects = await getProjects({
    all: isAdmin,
  });

  const canCreateProject =  isAdmin;

  return (
    <Suspense fallback={null}>
      <ProjectsPageInner
        projects={projects ?? []}
        canCreateProject={canCreateProject}
      />
    </Suspense>
  );
}