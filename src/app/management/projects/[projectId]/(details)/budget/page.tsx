import { getBudgetPageData } from "@/services/budget";
import BudgetPageClient from "./budget";

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function BudgetPage({
  params,
}: PageProps) {
  const { projectId } = await params;

  const data = await getBudgetPageData(projectId);

  return (
    <BudgetPageClient
      projectId={projectId}
      data={data}
    />
  );
}