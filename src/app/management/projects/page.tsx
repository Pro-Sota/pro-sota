import { Suspense } from "react";

import { requireUser } from "@/app/lib/supabase/auth";
import { getProjects } from "@/services/projects_server";

import ProjectsPageInner from "./projects";

export default async function ProjectsPage() {
  const user = await requireUser();

  const projects = await getProjects({
    all: (user.userRole === "admin"),
  });

  return (
    <Suspense fallback={null}>
      <ProjectsPageInner
        projects={projects ?? []}
      />
    </Suspense>
  );
}