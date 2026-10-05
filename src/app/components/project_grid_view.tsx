import { Database } from "../lib/supabase/models";
import { ProjectListItem } from "../management/projects/types";
import ProjectGridCard from "./project_grid_card";


export default function ProjectGridView({
  projects,
}: {
  projects: ProjectListItem[];
}) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-center sm:py-24">
        <div className="max-w-sm">
          <p className="mb-1 text-sm font-medium text-gray-500">
            Nenhum projecto encontrado
          </p>
          <p className="text-xs text-gray-400">
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
        className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
      >
        {projects.map((project, index) => (
          <li
            key={project.project_id}
            role="listitem"
            className="flex min-w-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: "both",
            }}
          >
            <div className="flex min-w-0 w-full h-full">
              <ProjectGridCard project={project} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center text-xs text-gray-500 sm:mt-8">
        <p>
          Mostrando {projects.length}{" "}
          {projects.length === 1 ? "projecto" : "projectos"}
        </p>
      </div>
    </div>
  );
}