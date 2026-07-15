"use client";

import { FolderType, DocumentType } from "../types";
import DocumentCard from "./document_card";
import EmptyFolder from "./empty_folder";
import FolderCard from "./folder_card";

interface DocumentGridViewProps {
  folders: FolderType[];
  documents: DocumentType[];
  view: string;
}

export default function DocumentGridView({
  folders,
  documents,
  view
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
    <div className="mx-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {folders.map((folder) => (
          <div key={folder.id} className="h-64 w-64">
            <FolderCard folder={folder} view={view} />
          </div>
        ))}

        {documents.map((doc) => (
          <div key={doc.id} className="h-64 w-64">
            <DocumentCard document={doc} />
          </div>
        ))}
      </div>
    </div>
  );
}