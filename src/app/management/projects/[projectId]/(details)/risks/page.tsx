// src/app/management/projects/[projectId]/(details)/risks/page.tsx

import { notFound } from "next/navigation";
import { getProjectRisks } from "@/services/project_risks";
import { RiskRegister } from "./risk_register";

// Load and authorise the project using the same server-side
// access checks used by the other project detail pages.

export default async function ProjectRisksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  // Verify project access here using the existing project service.
  const risks = await getProjectRisks(projectId);

  // Add the existing project's not-found/access handling.
  if (!projectId) notFound();

  return <RiskRegister projectId={projectId} initialRisks={risks} phases={[]} members={[]} />;
}