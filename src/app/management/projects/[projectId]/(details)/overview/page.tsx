
import { notFound } from "next/navigation";

import { getOverviewData } from "@/services/project_overview";
import { requireUser } from "@/app/lib/supabase/auth";
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

  // Fetch overview data and authenticate concurrently.
  const [data, { userRole }] = await Promise.all([
    getOverviewData(projectId),
    requireUser(),
  ]);

  if (!data) {
    notFound();
  }

  const isAdmin = userRole?.toLowerCase() === "admin";

  return <OverviewClientPage data={data} isAdmin={isAdmin} />;
}
