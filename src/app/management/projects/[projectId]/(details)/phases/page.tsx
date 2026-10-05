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

    const {
        phases,
        deliverables,
        milestones,
    } = await getProjectPhaseBoard(projectId);

    return (
        <PhasesPageInner
            phases={phases}
            deliverables={deliverables}
            milestones={milestones}
        />
    );
}