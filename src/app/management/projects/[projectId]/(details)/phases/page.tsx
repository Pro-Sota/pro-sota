import { getProjectPhaseBoard } from "@/services/project_phases";
import PhasesPageInner from "./phases_inner";

export default async function PhasesPage({
  params,
}: {
  params: Promise<{
    projectId: string;
  }>;
}) {
  const { projectId } = await params;

  const { phases, steps, deliverables } = await getProjectPhaseBoard(projectId);

  return (
    <PhasesPageInner
      phases={phases}
      steps={steps}
      deliverables={deliverables}
    />
  );
}
