
import {
  getProjectDocuments,
  getProjectFolders,
} from "@/services/documents";

import DocumentInit from "../projects/[projectId]/(details)/documents/components/page_client";

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
  const [{ projectId, folder = [] }, { view = "list" }] =
    await Promise.all([params, searchParams]);

  const [folders, documents] = await Promise.all([
    getProjectFolders(projectId),
    getProjectDocuments(projectId),
  ]);

 return (
  <main className="flex h-full min-h-0 w-full flex-1 flex-col">
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <DocumentInit
        projectId={projectId}
        folder={folder}
        view={view}
        folders={folders}
        documents={documents}
      />
    </div>
  </main>
);
}
