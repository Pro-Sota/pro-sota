import ProjectCard from "./project_card";
import type { Project } from "../management/projects/types";

export default function ProjectGridView({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center border-t border-gray-300 pt-8 pb-4 text-sm text-gray-400">
        Nenhum projecto encontrado.
      </div>
    );
  }

  return (
    <ul
      role="list"
      aria-label="Lista de projectos"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-4 border-t border-gray-300 pt-4"
    >
      {projects.map((project) => (
        <li key={project.id} role="listitem">
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}