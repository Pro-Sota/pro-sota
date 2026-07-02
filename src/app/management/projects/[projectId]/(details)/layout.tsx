"use client";

import ProjectSideBar from "@/components/project_side_bar";
import { MoveLeftIcon } from "lucide-react";
import { use } from "react";
import { Project, Status } from "../../page";
import Link from "next/link";

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
    client: "Carlos Jose",
    priority: "High",
    status: "concluido",
    dueDate: "20 de Junho",
    location: "Benguela",
  },
  {
    id: 3,
    name: "Talatona Tower",
    client: "Pedro",
    progress: 15,
    priority: "Low",
    status: "em-observacao",
    dueDate: "30 de Julho",
    location: "Huambo",
  },
];

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

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

  const project = projects.find((p) => p.id === Number(projectId));

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center text-black">
        <p>Projeto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-x-hidden">
      {/* NAV */}
      <nav className="flex h-[45px] items-center justify-between border-b border-gray-200 px-8 shrink-0">
        <Link
          href="/management/projects"
          className="text-black flex flex-row gap-2 items-center cursor-pointer"
        >
          <MoveLeftIcon className="w-4 h-4" />
          <p className="text-sm hover:underline underline-offset-4">
            Projectos
          </p>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href={`/management/projects/${projectId}/edit`}
            className="text-sm text-black hover:underline"
          >
            Editar
          </Link>

          <Link
            href={`/management/projects/${projectId}/archive`}
            className="text-sm text-black hover:underline"
          >
            Arquivar
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <div className="py-2 border-b border-gray-200 shrink-0">
        <div className="px-8 mt-4 max-w-3xl text-black space-y-2">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-xl font-semibold">{project.name}</h1>

            <div className="flex items-center text-sm">
              <div
                className={`h-2.5 w-2.5 rounded-full ${statusColor[project.status]} me-2`}
              />
              {statusLabel[project.status]}
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Location: {project.location}
            <span className="mx-2">•</span>
            Client: {project.client}
          </p>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <div className="flex-1 h-5 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-800 transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <span className="text-sm font-medium">
                {project.progress}%
              </span>
            </div>

            <p className="text-sm font-semibold">
              Deadline: {project.dueDate}
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* SIDEBAR */}
        <div className="">
          <ProjectSideBar projectId={projectId} />
        </div>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto bg-white pt-4 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}