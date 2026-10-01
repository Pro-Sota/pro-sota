import { getProjects } from "@/services/projects_server";
import ProjectsPageInner from "./projects";
import {Suspense} from "react";
import { requireUser } from "@/app/lib/supabase/auth";
import { getAllProjects } from "@/services/projects";

export default async function ProjectsPage() {
  const user = await requireUser();
  const allProjects = await getAllProjects();
  const userProjects =  await getProjects();
  const projects = user.profile?.role_id === 1 ? allProjects : userProjects;

  return (
    <Suspense fallback={null}>
      <ProjectsPageInner projects={projects ?? []}/>
    </Suspense>
  );
}