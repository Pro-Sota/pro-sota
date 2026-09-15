"use client";
import DocumentCard from "./document_card";
import EmptyFolder from "./empty_folder";
import FolderCard from "./folder_card";

import { Database } from "@/app/lib/supabase/models";

type Folder = Database["public"]["Tables"]["folders"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentGridViewProps {
  folders: Folder[];
  documents: Document[];
  view: string;
}

export default function DocumentGridView({
  folders,
  documents,
  view,
}: DocumentGridViewProps) {
  const isEmpty = folders.length === 0 && documents.length === 0;

  if (isEmpty) {
    return (
      <div className="flex h-full w-full flex-col">
        <EmptyFolder />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 auto-rows-min">
        {folders.map((folder) => (
          <div key={folder.folder_id}>
            <FolderCard folder={folder} view={view} />
          </div>
        ))}

        {documents.map((doc) => (
          <div key={doc.document_id}>
            <DocumentCard document={doc} />
          </div>
        ))}
      </div>
    </div>
  );
}