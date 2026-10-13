
import { notFound } from "next/navigation";

import { getOverviewData } from "@/services/project_overview";
import OverviewClientPage from "./overview_client_view";

interface OverviewPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function OverviewPage({
  params,
}: OverviewPageProps) {
  const { projectId } = await params;

  const data = await getOverviewData(projectId);

  if (!data) {
    notFound();
  }

  return <OverviewClientPage data={data} />;
}
