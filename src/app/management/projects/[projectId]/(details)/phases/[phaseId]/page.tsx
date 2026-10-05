import PhaseDetailPage from "./phase_detail";
import { getPhaseDetail } from "@/services/project_phases";

export default async function PhaseDetail({
  params,
}: {
  params: Promise<{
    projectId: string;
    phaseId: string;
  }>;
}) {
  const { projectId, phaseId } = await params;

  const {
    phase,
    project,
    milestones,
    deliverables,
  } = await getPhaseDetail(projectId, phaseId);

  return (
    <PhaseDetailPage
      phase={phase}
      project={project}
      milestones={milestones}
      deliverables={deliverables}
    />
  );
}