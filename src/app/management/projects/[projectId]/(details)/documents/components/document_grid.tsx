import { FolderType, DocumentType } from "../types";
import DocumentCard from "./document_card";
import EmptyFolder from "./empty_folder";
import FolderCard from "./folder_card";

interface DocumentGridViewProps {
  folders: FolderType[];
  documents: DocumentType[];
}

export default function DocumentGridView({
  folders,
  documents,
}: DocumentGridViewProps) {
  const isEmpty = folders.length === 0 && documents.length === 0;

  if (isEmpty) {
    return <div className="flex h-full w-full flex-col">
      <EmptyFolder /> {/* flex-1 fills the rest */}
    </div>
  }

  return (
    <div className="mx-4">
      <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}

        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}