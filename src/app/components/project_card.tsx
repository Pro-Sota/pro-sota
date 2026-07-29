"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Project, Status } from "../management/projects/types";

const statusLabels: Record<Status, string> = {
  "em-curso": "Em curso",
  concluido: "Concluído",
  "em-observacao": "Em observação",
};

export default function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();

  const goToProject = () => {
    router.push(`/management/projects/${project.id}`);
  };

  return (
    <div
      onClick={goToProject}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToProject();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`Ver detalhes do projecto ${project.name}`}
      className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-800"
    >
      <Image
        src={"/images/arch.jpg"}
        alt={`Imagem do projecto ${project.name}`}
        width={400}
        height={300}
        className="object-cover w-full h-48"
      />
      <div className="p-4 text-sm text-gray-600">
        <h2 className="text-lg text-gray-900 font-semibold line-clamp-1">
          {project.name}
        </h2>
        <div className="flex justify-between items-center">
          <p>Estado: {statusLabels[project.status]}</p>
          <p>Progresso: {project.progress}%</p>
        </div>
        <p>Cliente: {project.client || "—"}</p>
        <p>Localização: {project.location || "—"}</p>
      </div>
    </div>
  );
}