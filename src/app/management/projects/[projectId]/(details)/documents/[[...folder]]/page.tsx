// src/app/management/projects/[projectId]/documents/[[...folder]]/page.tsx

import { getProjectDocuments, getProjectFolders } from "@/services/documents";
import DocumentInit from "../components/page_client";

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

  const [folders, documents] = await Promise.all([
    getProjectFolders(projectId),
    getProjectDocuments(projectId),
  ]);

  return (
    <DocumentInit
      projectId={projectId}
      folder={folder}
      view={view}
      folders={folders}
      documents={documents}
    />
  );
}