// src/app/management/projects/[projectId]/overview/page.tsx

import { notFound } from "next/navigation";

import { getOverviewData } from "@/services/project_overview";
import OverviewClientPage from "./overview_client_view";

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
} 

export default async function ProjectOverviewPage({
  params,
}: PageProps) {
  const { projectId } = await params;

  const overview = await getOverviewData(projectId);

  if (!overview) {
    notFound();
  }

  return <OverviewClientPage data={overview} />;
}