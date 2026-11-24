
import { getProjectActivity } from "@/services/project_activity";

import ProjectActivityClient from "./project_activity";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectActivityPage({ params }: Props) {
  const { projectId } = await params;

  const result = await getProjectActivity(projectId);

  if (result.status === "unauthenticated") {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-6 text-sm text-neutral-600">
        A sessão expirou. Inicie sessão novamente para consultar as actividades.
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <p className="text-sm font-medium text-neutral-900">
          Não foi possível carregar as actividades
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          {result.message}
        </p>
      </div>
    );
  }

  return (
    <ProjectActivityClient
      projectId={projectId}
      initialData={result.data}
    />
  );
}
