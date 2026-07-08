import { FolderType, DocumentType } from "../types";
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
  const isEmpty = folders.length === 0 && documents.length === 0;

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-10 text-center">
        <p className="text-sm font-medium text-gray-900">
          Nenhum documento encontrado
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Tente pesquisar por outro termo.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 overflow-x-auto">
      <div className="grid grid-flow-col auto-cols-[240px] gap-6">
        {folders.map(folder => (
          <FolderCard key={folder.id} folder={folder} />
        ))}

        {documents.map(doc => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}