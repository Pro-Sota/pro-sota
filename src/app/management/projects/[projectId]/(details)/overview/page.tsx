
import { notFound } from "next/navigation";

import { getOverviewData } from "@/services/project_overview";
import OverviewClientPage from "./overview_client_view";
import { requireUser } from "@/app/lib/supabase/auth";

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
  const { userRole } = await requireUser();
  const isAdmin = userRole?.toLowerCase() === "admin"

  return <OverviewClientPage data={data} isAdmin={isAdmin} />;
}
