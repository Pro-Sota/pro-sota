"use client";

import { Download, EyeIcon, FileText, Folder } from "lucide-react";
import { FolderType, DocumentType } from "../types";
import { capitalize, removeCharacters } from "@/app/lib/library";
import EmptyFolder from "./empty_folder";
import { useRouter } from "next/navigation";
import { use } from "react";


interface DocumentTableViewProps {
  folders: FolderType[];
  documents: DocumentType[];
  view: string;
  projectId: string;
}

export default function DocumentTableView({
  folders,
  documents,
  view,
  projectId,
}: DocumentTableViewProps) {

  const router = useRouter();

  const base = `/management/projects/${projectId}/documents`;

  const isEmpty = folders.length === 0 && documents.length === 0;

console.log("Documents available: " + 
  documents.map(d => ({
    name: d.name,
    category: d.category,
  }))
);

  if (isEmpty) {
    return <div className="flex h-full w-full flex-col">
      <EmptyFolder />
    </div>
  }


  return (
    <div className="mx-4 w-full overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <th className="w-[45%] px-4 py-3">Nome</th>
            <th className="w-[15%] px-4 py-3">Tipo</th>
            <th className="w-[15%] px-4 py-3">Criado por</th>
            <th className="w-[15%] px-4 py-3">Data de criação</th>
            <th className="px-4 py-3 text-right">
              <span className="sr-only">Acções</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 w-full">
          {/* Folders */}
          {folders.map((folder) => (
            
            <tr key={folder.id} className="transition-colors cursor-pointer hover:bg-gray-50"
              onClick={() =>
                router.push(`${base}${folder.path}?view=${view}`)
              }
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <Folder className="h-4 w-4 shrink-0 text-yellow-500" />
                  <span className="truncate">
                    {capitalize(folder.name)}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3">
                Pasta
              </td>

              <td className="px-4 py-3 text-gray-600">
                {folder.createdBy ?? "-"}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {folder.createdAt ?? "-"}
              </td>

              <td className="px-4 py-3">
                ...
              </td>
            </tr>

          ))}

          {/* Documents */}
          {documents.map((doc) => (
            <tr
              key={`document-${doc.id}`}
              className="transition-colors hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="truncate">{doc.name}</span>
                </div>
              </td>

              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {doc.category}
                </span>
              </td>

              <td className="px-4 py-3 text-gray-600">
                {doc.createdBy}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {doc.uploadedAt}
              </td>

              <td className="px-4 py-3 flex justify-left">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Descarregar ${doc.name}`}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label={`Mais opções para ${doc.name}`}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
