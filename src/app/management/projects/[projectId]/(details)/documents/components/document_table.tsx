"use client";

import { Download, Eye, FileText, Folder, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { capitalize } from "@/app/lib/library";

import { Database } from "@/app/lib/supabase/models";

type Folder = Database["public"]["Tables"]["folders"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
interface DocumentTableViewProps {
  folders: Folder[];
  documents: Document[];
  allFolders: Folder[];
  view: "grid" | "list";
  projectId: string;
}

export default function DocumentTableView({
  folders,
  documents,
  allFolders,
  view,
  projectId,
}: DocumentTableViewProps) {

  const router = useRouter();

  const isEmpty = folders.length === 0 && documents.length === 0;
  const base = `/management/projects/${projectId}/documents`;

  const getFolderPath = (folder: Folder): string[] => {
    const path: string[] = [];

    let current: Folder | undefined = folder;

    while (current) {
      path.unshift(current.slug || "");

      if (!current.parent_id) {
        break;
      }

      current = allFolders.find((item) => item.folder_id === current?.parent_id);
    }

    return path;
  };

  const handleFolderClick = (folder: Folder) => {
    const path = getFolderPath(folder);

    router.push(`${base}/${path.join("/")}?view=${view}`);
  };

  const handlePreview = (
    event: MouseEvent<HTMLButtonElement>,
    document: Document,
  ) => {
    event.stopPropagation();
    console.log("Preview:", document.document_id);
  };

  const handleDownload = (
    event: MouseEvent<HTMLButtonElement>,
    document: Document,
  ) => {
    event.stopPropagation();
    console.log("Download:", document.document_id);
  };

  const handleMore = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    console.log("More options:", id);
  };

  if (isEmpty) {
    return (
      <div className="flex min-h-[280px] w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 sm:min-h-[360px] sm:px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 sm:h-16 sm:w-16">
            <FileText
              className="h-7 w-7 text-gray-400 sm:h-8 sm:w-8"
              strokeWidth={1.5}
            />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900 sm:text-base">
            Nenhum documento encontrado
          </h3>

          <p className="mx-auto mt-1.5 max-w-xs text-xs leading-5 text-gray-500 sm:text-sm">
            Esta pasta ainda não possui documentos ou subpastas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-10 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* =========================
          DESKTOP / TABLET
      ========================== */}
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[700px] w-full border-separate text-sm">
            <thead className="border-b border-gray-200 bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Nome
                </th>
                <th className="w-28 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Tipo
                </th>
                <th className="w-40 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Criado por
                </th>
                <th className="w-36 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Data
                </th>
                <th className="w-28 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Acções
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* FOLDERS */}
              {folders.map((folder) => (
                <tr
                  key={`folder-${folder.folder_id}`}
                  onClick={() => handleFolderClick(folder)}
                  className="group cursor-pointer transition-colors hover:bg-gray-50 active:bg-gray-100"
                >
                  <td className="max-w-[320px] px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                        <Folder
                          className="h-4 w-4 text-yellow-500"
                          strokeWidth={1.8}
                        />
                      </div>

                      <span className="min-w-0 truncate font-medium text-gray-900">
                        {capitalize(folder.name)}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-gray-600">
                    <span className="text-xs">Pasta</span>
                  </td>

                  <td className="max-w-[160px] truncate px-4 py-3.5 text-gray-600">
                    {"-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                    {folder.created_at?.split("T")[0] ?? "-"}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(event) => handleMore(event, folder.folder_id)}
                        aria-label={`Mais opções para ${folder.name}`}
                        className="
                          rounded-lg p-1.5 text-gray-400
                          transition
                          hover:bg-gray-100 hover:text-gray-700
                          focus:outline-none focus:ring-2 focus:ring-gray-300
                          opacity-0 group-hover:opacity-100
                          focus:opacity-100
                        "
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* DOCUMENTS */}
              {documents.map((document) => (
                <tr
                  key={`document-${document.document_id}`}
                  className="group transition-colors hover:bg-gray-50"
                >
                  <td className="max-w-[320px] px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <FileText
                          className="h-4 w-4 text-gray-500"
                          strokeWidth={1.8}
                        />
                      </div>

                      <p className="min-w-0 truncate font-medium text-gray-900">
                        {document.name}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="inline-flex max-w-[110px] truncate rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {"Documento"}
                    </span>
                  </td>

                  <td className="max-w-[160px] truncate px-4 py-3.5 text-gray-600">
                    {"-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-gray-600">
                    {document.created_at?.split("T")[0] ?? "-"}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(event) => handlePreview(event, document)}
                        aria-label={`Visualizar ${document.name}`}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(event) => handleDownload(event, document)}
                        aria-label={`Descarregar ${document.name}`}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(event) =>
                          handleMore(event, document.document_id)
                        }
                        aria-label={`Mais opções para ${document.name}`}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          MOBILE
      ========================== */}
      <div className="grid gap-2.5 p-2.5 sm:gap-3 sm:p-3 md:hidden">
        {/* FOLDERS */}
        {folders.map((folder) => (
          <div
            key={`folder-${folder.folder_id}`}
            onClick={() => handleFolderClick(folder)}
            className="
              flex min-w-0 items-center gap-3
              rounded-xl border border-gray-200
              bg-white p-3
              transition-colors
              active:bg-gray-50
            "
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-50">
              <Folder className="h-5 w-5 text-yellow-500" strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {capitalize(folder.name)}
              </p>

              <p className="mt-0.5 text-xs text-gray-500">Pasta</p>
            </div>

            <button
              type="button"
              onClick={(event) => handleMore(event, folder.folder_id)}
              aria-label={`Mais opções para ${folder.name}`}
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-lg text-gray-400
                transition
                hover:bg-gray-100 hover:text-gray-700
                focus:outline-none focus:ring-2 focus:ring-gray-300
              "
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* DOCUMENTS */}
        {documents.map((document) => (
          <div
            key={`document-${document.document_id}`}
            className="
              min-w-0 rounded-xl
              border border-gray-200
              bg-white p-3
              sm:p-4
            "
          >
            {/* Header */}
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <FileText className="h-5 w-5 text-gray-500" strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  title={document.name}
                  className="break-words text-sm font-medium leading-5 text-gray-900 sm:text-[15px]"
                >
                  {document.name}
                </p>

                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                  <span className="max-w-full truncate rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    {"Documento"}
                  </span>
                </div>

                {document.created_at && (
                  <p className="mt-1 text-xs text-gray-400">
                    {document.created_at}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center justify-end gap-1 border-t border-gray-100 pt-2.5">
              <button
                type="button"
                onClick={(event) => handlePreview(event, document)}
                aria-label={`Visualizar ${document.name}`}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg text-gray-400
                  transition
                  hover:bg-gray-100 hover:text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                "
              >
                <Eye className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(event) => handleDownload(event, document)}
                aria-label={`Descarregar ${document.name}`}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg text-gray-400
                  transition
                  hover:bg-gray-100 hover:text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                "
              >
                <Download className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={(event) => handleMore(event, document.document_id)}
                aria-label={`Mais opções para ${document.name}`}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg text-gray-400
                  transition
                  hover:bg-gray-100 hover:text-gray-700
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                "
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
