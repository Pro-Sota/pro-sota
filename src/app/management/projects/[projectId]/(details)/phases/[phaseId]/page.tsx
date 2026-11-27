import { getPhaseDetail } from "@/services/project_phases";
import PhaseDetailPage from "./phase_detail";

export default async function Page({
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
    stages,
    tasks,
    milestones,
  } = await getPhaseDetail(projectId, phaseId);

  return (
    <PhaseDetailPage
      phase={phase}
      project={project}
      stages={stages}
      tasks={tasks}
      milestones={milestones}
    />
  );
}