import { useRouter } from "next/navigation";
import type { Project, Status } from "../management/projects/types";

const priorityLabels: Record<Project["priority"], string> = {
  Low: "Baixa",
  Medium: "Média",
  High: "Alta",
};

const statusLabels: Record<Status, string> = {
  "em-curso": "Em curso",
  concluido: "Concluído",
  "em-observacao": "Em observação",
};

export default function ProjectTableView({ projects }: { projects: Project[] }) {
  const router = useRouter();

  const priorityColor = (priority: Project["priority"]) => {
    switch (priority) {
      case "Low":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "High":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const statusColor = (status: Status) => {
    switch (status) {
      case "em-curso":
        return "bg-blue-500";
      case "concluido":
        return "bg-green-500";
      case "em-observacao":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const goToProject = (id: number) => {
    router.push(`/management/projects/${id}`);
  };

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center border-t border-gray-300 pt-8 pb-4 text-sm text-gray-400">
        Nenhum projecto encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="table-fixed w-full border-collapse border-t border-gray-300"
        aria-label="Tabela de projectos"
      >
        <caption className="sr-only">Lista de projectos com progresso, prioridade, estado, data de entrega e localização</caption>
        <thead className="h-12">
          <tr className="text-left text-sm font-semibold">
            <th className="w-1/4 pl-2">Nome do Projecto</th>
            <th className="w-1/6">Progresso</th>
            <th className="w-1/6">Prioridade</th>
            <th className="w-1/6">Estado</th>
            <th className="w-1/6">Data de Entrega</th>
            <th className="w-1/6">Localização</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const progress = Math.min(100, Math.max(0, project.progress));

            return (
              <tr
                key={project.id}
                tabIndex={0}
                role="link"
                aria-label={`Ver detalhes do projecto ${project.name}`}
                onClick={() => goToProject(project.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goToProject(project.id);
                  }
                }}
                className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none h-20"
              >
                <td className="border-b border-gray-200 py-2 pl-2">
                  <div className="text-sm font-semibold">{project.name}</div>
                </td>
                <td className="border-b border-gray-200 py-2">
                  <div className="w-[80%] h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{progress}%</span>
                </td>
                <td className="border-b border-gray-200 py-2">
                  <div className="flex items-center">
                    <div
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${priorityColor(project.priority)} me-2`}
                    />
                    {priorityLabels[project.priority]}
                  </div>
                </td>
                <td className="border-b border-gray-200 py-2">
                  <div className="flex items-center">
                    <div
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${statusColor(project.status)} me-2`}
                    />
                    {statusLabels[project.status]}
                  </div>
                </td>
                <td className="border-b border-gray-200 py-2">{project.dueDate}</td>
                <td className="border-b border-gray-200 py-2">{project.location}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}