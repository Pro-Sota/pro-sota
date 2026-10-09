
"use client";

import DocumentCard from "./document_card";
import EmptyFolder from "./empty_folder";
import FolderCard from "./folder_card";

import type { Database } from "@/app/lib/supabase/models";

type Folder = Database["public"]["Tables"]["folders"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentGridViewProps {
  folders: Folder[];
  allFolders?: Folder[];
  documents: Document[];
  view: "grid" | "list";
  projectId: string;
}

export default function DocumentGridView({
  folders,
  allFolders = folders,
  documents,
  view,
  projectId,
}: DocumentGridViewProps) {
  if (folders.length === 0 && documents.length === 0) {
    return (
      <div className="flex h-full w-full flex-col">
        <EmptyFolder />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="grid auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {folders.map((folder) => (
          <FolderCard
            key={folder.folder_id}
            folder={folder}
            folders={allFolders}
            view={view}
            projectId={projectId}
          />
        ))}

        {documents.map((document) => (
          <DocumentCard
            key={document.document_id}
            document={document}
          />
        ))}
      </div>
    </div>
  );
}
