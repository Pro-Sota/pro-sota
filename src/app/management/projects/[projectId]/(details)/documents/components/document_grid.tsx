import {FolderType, DocumentType} from "../types";
import DocumentCard from "./document_card";
import FolderCard from "./folder_card";

interface DocumentGridViewProps {
  folders: FolderType[];
  documents: DocumentType[];
}

export default function DocumentGridView({
  folders,
  documents,
}: DocumentGridViewProps) {
  if (folders.length === 0 && documents.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        No documents found.
      </div>
    );
  }

  return (
    <div className="mx-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Folders */}
      {folders.map((folder) => (
        <FolderCard
          key={folder.id}
          folder={folder}
        />
      ))}

      {/* Documents */}
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
        />
      ))}
    </div>
  );
}