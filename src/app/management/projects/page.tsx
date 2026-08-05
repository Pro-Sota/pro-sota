import { getProjects } from "@/services/projects_server";
import ProjectsPageInner from "./projects";
import {Suspense} from "react";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Suspense fallback={null}>
      <ProjectsPageInner projects={projects}/>
    </Suspense>
  );
}