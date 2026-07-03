import ProjectNavbar from "@/components/project_side_bar";
import { MoveLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Project, Status } from "../../page";

const projects: Project[] = [
  {
    id: 1,
    name: "Eliada the second",
    progress: 50,
    client: "Claudio Conceicao",
    priority: "Medium",
    status: "em-curso",
    dueDate: "15 de Junho",
    location: "Luanda",
  },
  {
    id: 2,
    name: "Patriota View",
    progress: 90,
    client: "Ilda",
    priority: "High",
    status: "concluido",
    dueDate: "20 de Junho",
    location: "Benguela",
  },
  {
    id: 3,
    name: "Talatona Tower",
    client: "Eliene",
    progress: 15,
    priority: "Medium",
    status: "em-observacao",
    dueDate: "30 de Julho",
    location: "Huambo",
  },
  {
    id: 4,
    name: "Marina Bay",
    client: "Pedro Joao",
    progress: 15,
    priority: "High",
    status: "em-observacao",
    dueDate: "30 de Julho",
    location: "Huambo",
  },
  {
    id: 5,
    name: "Imgombota Chamber",
    client: "Carlos Jose",
    progress: 54,
    priority: "Low",
    status: "em-observacao",
    dueDate: "30 de Julho",
    location: "Huambo",
  },
];

const statusColor: Record<Status, string> = {
  "em-curso": "bg-blue-500",
  "concluido": "bg-green-500",
  "em-observacao": "bg-yellow-500",
};

const statusLabel: Record<Status, string> = {
  "em-curso": "Em curso",
  "concluido": "Concluído",
  "em-observacao": "Em observação",
};

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = projects.find((p) => p.id === Number(projectId));

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
        <Link
          href="/management/projects"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-black"
        >
          <MoveLeftIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Projetos</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/management/projects/${projectId}/edit`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-black"
          >
            Editar
          </Link>

          <Link
            href={`/management/projects/${projectId}/archive`}
            className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            Arquivar
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <div className="shrink-0 border-b border-gray-200 bg-white py-6">
        <div className=" max-w-4xl px-8">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                  {project.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span>{project.location}</span>
                  <span>•</span>
                  <span>{project.client}</span>
                </div>
              </div>

              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-700">
                <span
                  className={`mr-2 h-2.5 w-2.5 rounded-full ${statusColor[project.status]}`}
                />
                {statusLabel[project.status]}
              </span>
            </div>

            {/* Progress */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {project.progress}%
                </span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-gray-200"
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Deadline</span>

                <span className="font-medium text-gray-900">
                  {project.dueDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden">
        <ProjectNavbar projectId={projectId} />

        <main className="flex-1 h-full overflow-y-auto bg-white min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}