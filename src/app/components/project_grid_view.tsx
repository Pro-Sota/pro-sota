import { Database } from "../lib/supabase/models";
import ProjectCard from "./project_card";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export default function ProjectGridView({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 sm:py-24 text-center">
        <div className="max-w-sm">
          <p className="text-gray-500 text-sm font-medium mb-1">
            Nenhum projecto encontrado
          </p>
          <p className="text-gray-400 text-xs">
            Ajuste seus filtros ou pesquisa para ver projectos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ul
        role="list"
        aria-label="Lista de projectos em grade"
        className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 auto-rows-fr"
      >
        {projects.map((project, index) => (
          <li
            key={project.project_id}
            role="listitem"
            className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "both",
            }}
          >
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>

      {/* Grid Info - Shows on larger screens */}
      <div className="mt-6 sm:mt-8 text-center text-xs text-gray-500">
        <p>
          Mostrando {projects.length}{" "}
          {projects.length === 1 ? "projecto" : "projectos"}
        </p>
      </div>
    </div>
  );
}