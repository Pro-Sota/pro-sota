import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { getPhase } from "@/services/project_phases";
import { PhaseForm } from "../../phase_form";

export default async function Page({
  params,
}: {
  params: Promise<{
    projectId: string;
    phaseId: string;
  }>;
}) {
  const { projectId, phaseId } = await params;

  const phase = await getPhase(phaseId);

  if (phase.project_id !== projectId) {
    notFound();
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-5">
          <Link
            href={`/management/projects/${projectId}/phases`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às fases
          </Link>
        </div>

        <PhaseForm
          projectId={projectId}
          phase={phase}
        />
      </div>
    </div>
  );
}