import PhaseDetailPage from "./phase_detail";

import { getPhase } from "@/services/project_phases";

export default async function PhaseDetail({ params }: { params: Promise<{ projectId: string, phaseId: string }> }) {
  const { phaseId } = await params;
  const phase = await getPhase(phaseId);

  return (
    <PhaseDetailPage phase={phase} />
  );
}