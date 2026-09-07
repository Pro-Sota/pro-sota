import { getProjectPhases } from "@/services/phases";
import PhasesPageInner from "./phases_inner";
import { Database } from "@/app/lib/supabase/models";


type Phase = Database["public"]["Tables"]["phases"]["Row"];

export default async function PhaseDetail({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const phases: Phase[] = (await getProjectPhases(projectId)) ?? [];

  return (
    <PhasesPageInner phases = {phases} />
  );
}