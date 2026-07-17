import ProjectCard from "./project_card";
import type { Project } from "../management/projects/types";

export default function ProjectGridView({ projects }: { projects: Project[] }) {

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border-collapse border-t border-gray-300 pt-4">
            {projects.map((project) => (
                <ProjectCard
                  key={project.id} project={project} />
            ))}
        </div>);

}