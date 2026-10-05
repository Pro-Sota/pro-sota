"use client";

import { FolderKanban } from "lucide-react";

import { ProjectListItem } from "../management/projects/types";
import ProjectTableCard from "./project_table_card";

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyProjects() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
        <FolderKanban className="h-6 w-6 text-slate-400" />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        Nenhum projecto encontrado
      </p>

      <p className="mt-1 text-center text-xs text-slate-400">
        Crie um projecto para começar a acompanhar o trabalho.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Project Table View                                                         */
/* -------------------------------------------------------------------------- */

interface ProjectTableViewProps {
  projects: ProjectListItem[];
}

export default function ProjectTableView({ projects }: ProjectTableViewProps) {
  if (projects.length === 0) {
    return <EmptyProjects />;
  }

  return (
    <div className="space-y-2.5">
      {projects.map((project) => (
        <ProjectTableCard key={project.project_id} project={project} />
      ))}
    </div>
  );
}