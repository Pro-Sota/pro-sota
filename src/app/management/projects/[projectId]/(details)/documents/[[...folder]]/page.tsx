import { getProjectDocuments, getProjectFolders } from "@/services/documents";
import DocumentPageClient from "../components/page_client";

interface PageProps {
  params: Promise<{
    projectId: string;
    folder?: string[];
  }>;
  searchParams: Promise<{
    view?: "grid" | "list";
  }>;
}

export default async function DocumentsPage({
  params,
  searchParams,
}: PageProps) {
  const { projectId, folder = [] } = await params;
  const { view = "list" } = await searchParams;

  const folders = await getProjectFolders(projectId);
  const documents = await getProjectDocuments(projectId);

  return (
    <DocumentPageClient
      projectId={projectId}
      folder={folder}
      view={view}
      folders={folders}
      documents={documents}
    />
  );
}