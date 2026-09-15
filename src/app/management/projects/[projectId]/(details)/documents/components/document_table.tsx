"use client";

import {
  CalendarDays,
  Download,
  Eye,
  FileText,
  Folder,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { capitalize } from "@/app/lib/library";
import { Database } from "@/app/lib/supabase/models";

type FolderRow = Database["public"]["Tables"]["folders"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentTableViewProps {
  folders: FolderRow[];
  documents: DocumentRow[];
  allFolders: FolderRow[];
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

  const getFolderPath = (folder: FolderRow): string[] => {
    const path: string[] = [];

    let current: FolderRow | undefined = folder;

    while (current) {
      if (current.slug) {
        path.unshift(current.slug);
      }

      if (!current.parent_id) {
        break;
      }

      const parent = allFolders.find(
        (item) => item.folder_id === current!.parent_id,
      );

      if (!parent) {
        console.warn("Parent folder not found:", {
          folder: current.name,
          folderId: current.folder_id,
          parentId: current.parent_id,
          allFolders,
        });

        break;
      }

      current = parent;
    }

    return path;
  };

  const handleFolderClick = (folder: FolderRow) => {
    const path = getFolderPath(folder);

    router.push(`${base}/${path.join("/")}?view=${view}`);
  };

  const handlePreview = (
    event: MouseEvent<HTMLButtonElement>,
    document: DocumentRow,
  ) => {
    event.stopPropagation();
    console.log("Preview:", document.document_id);
  };

  const handleDownload = (
    event: MouseEvent<HTMLButtonElement>,
    document: DocumentRow,
  ) => {
    event.stopPropagation();
    console.log("Download:", document.document_id);
  };

  const handleMore = (
    event: MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    event.stopPropagation();
    console.log("More options:", id);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("pt-AO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isEmpty) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center rounded-2xl border border-gray-200/80 bg-white px-5 shadow-sm sm:min-h-[380px]">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
            <Folder
              className="h-7 w-7 text-gray-400"
              strokeWidth={1.6}
            />
          </div>

          <h3 className="mt-5 text-base font-semibold tracking-tight text-gray-900">
            Esta pasta está vazia
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Ainda não existem documentos ou subpastas neste local.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      {/* =========================
          DESKTOP / TABLET
      ========================== */}
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[760px] w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="border-b border-gray-200 px-5 py-3.5 text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Nome
                  </span>
                </th>

                <th className="w-32 border-b border-gray-200 px-4 py-3.5 text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Tipo
                  </span>
                </th>

                <th className="w-40 border-b border-gray-200 px-4 py-3.5 text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Criado por
                  </span>
                </th>

                <th className="w-40 border-b border-gray-200 px-4 py-3.5 text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Data
                  </span>
                </th>

                <th className="w-32 border-b border-gray-200 px-5 py-3.5 text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Acções
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* =========================
                  FOLDERS
              ========================== */}
              {folders.map((folder) => (
                <tr
                  key={`folder-${folder.folder_id}`}
                  onClick={() => handleFolderClick(folder)}
                  className="
                    group cursor-pointer
                    border-b border-gray-100
                    transition-colors duration-150
                    hover:bg-gray-50/80
                    active:bg-gray-100
                  "
                >
                  <td className="max-w-[380px] border-b border-gray-100 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div
                        className="
                          flex h-9 w-9 shrink-0 items-center justify-center
                          rounded-xl border border-gray-200
                          bg-gray-50
                          transition-colors
                          group-hover:border-gray-300
                          group-hover:bg-white
                        "
                      >
                        <Folder
                          className="h-[17px] w-[17px] text-gray-500"
                          strokeWidth={1.7}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-gray-900">
                          {capitalize(folder.name)}
                        </p>

                        <p className="mt-0.5 truncate text-[11px] text-gray-400">
                          Pasta
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="border-b border-gray-100 px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                      Pasta
                    </span>
                  </td>

                  <td className="max-w-[160px] truncate border-b border-gray-100 px-4 py-3.5 text-xs text-gray-400">
                    —
                  </td>

                  <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays
                        className="h-3.5 w-3.5 text-gray-400"
                        strokeWidth={1.7}
                      />
                      {formatDate(folder.created_at)}
                    </div>
                  </td>

                  <td className="border-b border-gray-100 px-5 py-3.5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(event) =>
                          handleMore(event, folder.folder_id)
                        }
                        aria-label={`Mais opções para ${folder.name}`}
                        className="
                          flex h-8 w-8 items-center justify-center
                          rounded-lg border border-transparent
                          text-gray-400
                          opacity-0
                          transition-all duration-150
                          hover:border-gray-200
                          hover:bg-white
                          hover:text-gray-700
                          focus:opacity-100
                          focus:outline-none
                          focus:ring-2
                          focus:ring-gray-200
                          group-hover:opacity-100
                        "
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* =========================
                  DOCUMENTS
              ========================== */}
              {documents.map((document) => (
                <tr
                  key={`document-${document.document_id}`}
                  className="
                    group
                    transition-colors duration-150
                    hover:bg-gray-50/80
                  "
                >
                  <td className="max-w-[380px] border-b border-gray-100 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div
                        className="
                          flex h-9 w-9 shrink-0 items-center justify-center
                          rounded-xl border border-gray-200
                          bg-gray-50
                          transition-colors
                          group-hover:bg-white
                        "
                      >
                        <FileText
                          className="h-[17px] w-[17px] text-gray-500"
                          strokeWidth={1.7}
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          title={document.name}
                          className="truncate text-[13px] font-semibold text-gray-900"
                        >
                          {document.name}
                        </p>

                        <p className="mt-0.5 truncate text-[11px] text-gray-400">
                          Documento
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="border-b border-gray-100 px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
                      Documento
                    </span>
                  </td>

                  <td className="max-w-[160px] truncate border-b border-gray-100 px-4 py-3.5 text-xs text-gray-400">
                    —
                  </td>

                  <td className="whitespace-nowrap border-b border-gray-100 px-4 py-3.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays
                        className="h-3.5 w-3.5 text-gray-400"
                        strokeWidth={1.7}
                      />
                      {formatDate(document.created_at)}
                    </div>
                  </td>

                  <td className="border-b border-gray-100 px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(event) =>
                          handlePreview(event, document)
                        }
                        aria-label={`Visualizar ${document.name}`}
                        className="
                          flex h-8 w-8 items-center justify-center
                          rounded-lg border border-transparent
                          text-gray-400
                          transition-all duration-150
                          hover:border-gray-200
                          hover:bg-white
                          hover:text-gray-700
                          focus:outline-none
                          focus:ring-2
                          focus:ring-gray-200
                        "
                      >
                        <Eye
                          className="h-4 w-4"
                          strokeWidth={1.7}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(event) =>
                          handleDownload(event, document)
                        }
                        aria-label={`Descarregar ${document.name}`}
                        className="
                          flex h-8 w-8 items-center justify-center
                          rounded-lg border border-transparent
                          text-gray-400
                          transition-all duration-150
                          hover:border-gray-200
                          hover:bg-white
                          hover:text-gray-700
                          focus:outline-none
                          focus:ring-2
                          focus:ring-gray-200
                        "
                      >
                        <Download
                          className="h-4 w-4"
                          strokeWidth={1.7}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(event) =>
                          handleMore(event, document.document_id)
                        }
                        aria-label={`Mais opções para ${document.name}`}
                        className="
                          flex h-8 w-8 items-center justify-center
                          rounded-lg border border-transparent
                          text-gray-400
                          transition-all duration-150
                          hover:border-gray-200
                          hover:bg-white
                          hover:text-gray-700
                          focus:outline-none
                          focus:ring-2
                          focus:ring-gray-200
                        "
                      >
                        <MoreHorizontal
                          className="h-4 w-4"
                          strokeWidth={1.7}
                        />
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
      <div className="grid gap-2.5 p-3 md:hidden">
        {/* FOLDERS */}
        {folders.map((folder) => (
          <div
            key={`folder-${folder.folder_id}`}
            onClick={() => handleFolderClick(folder)}
            className="
              group flex min-w-0 items-center gap-3
              rounded-xl border border-gray-200
              bg-white p-3
              shadow-sm
              transition-all duration-150
              active:scale-[0.99]
              active:bg-gray-50
            "
          >
            <div
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl border border-gray-200
                bg-gray-50
              "
            >
              <Folder
                className="h-[18px] w-[18px] text-gray-500"
                strokeWidth={1.7}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {capitalize(folder.name)}
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] font-medium text-gray-400">
                  Pasta
                </span>

                <span className="h-1 w-1 rounded-full bg-gray-300" />

                <span className="text-[11px] text-gray-400">
                  {formatDate(folder.created_at)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(event) =>
                handleMore(event, folder.folder_id)
              }
              aria-label={`Mais opções para ${folder.name}`}
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-lg border border-transparent
                text-gray-400
                transition
                hover:border-gray-200
                hover:bg-gray-50
                hover:text-gray-700
                focus:outline-none
                focus:ring-2
                focus:ring-gray-200
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
              bg-white
              p-3.5
              shadow-sm
              transition-colors
              hover:border-gray-300
            "
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl border border-gray-200
                  bg-gray-50
                "
              >
                <FileText
                  className="h-[18px] w-[18px] text-gray-500"
                  strokeWidth={1.7}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  title={document.name}
                  className="break-words text-sm font-semibold leading-5 text-gray-900"
                >
                  {document.name}
                </p>

                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                    Documento
                  </span>

                  {document.created_at && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-gray-300" />

                      <span className="text-[11px] text-gray-400">
                        {formatDate(document.created_at)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-1 border-t border-gray-100 pt-2.5">
              <button
                type="button"
                onClick={(event) =>
                  handlePreview(event, document)
                }
                aria-label={`Visualizar ${document.name}`}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg border border-transparent
                  text-gray-400
                  transition
                  hover:border-gray-200
                  hover:bg-gray-50
                  hover:text-gray-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-gray-200
                "
              >
                <Eye
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              </button>

              <button
                type="button"
                onClick={(event) =>
                  handleDownload(event, document)
                }
                aria-label={`Descarregar ${document.name}`}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg border border-transparent
                  text-gray-400
                  transition
                  hover:border-gray-200
                  hover:bg-gray-50
                  hover:text-gray-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-gray-200
                "
              >
                <Download
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              </button>

              <button
                type="button"
                onClick={(event) =>
                  handleMore(event, document.document_id)
                }
                aria-label={`Mais opções para ${document.name}`}
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg border border-transparent
                  text-gray-400
                  transition
                  hover:border-gray-200
                  hover:bg-gray-50
                  hover:text-gray-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-gray-200
                "
              >
                <MoreHorizontal
                  className="h-4 w-4"
                  strokeWidth={1.7}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}