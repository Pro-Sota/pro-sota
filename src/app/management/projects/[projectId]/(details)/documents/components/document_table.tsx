"use client";

import {
  CalendarDays,
  Download,
  Eye,
  FileText,
  Folder,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/app/lib/supabase/client";
import type { Database } from "@/app/lib/supabase/models";

type FolderRow = Database["public"]["Tables"]["folders"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentTableViewProps {
  folders: FolderRow[];
  documents: DocumentRow[];
  allFolders: FolderRow[];
  view: "grid" | "list";
  projectId: string;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function DocumentTableView({
  folders,
  documents,
  allFolders,
  view,
  projectId,
}: DocumentTableViewProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const basePath = `/management/projects/${projectId}/documents`;

  function getFolderPath(folder: FolderRow) {
    const segments: string[] = [];
    const visited = new Set<string>();
    let current: FolderRow | undefined = folder;

    while (current && !visited.has(current.folder_id)) {
      visited.add(current.folder_id);
      segments.unshift(
        current.slug ||
          current.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
      );

      current = current.parent_id
        ? allFolders.find(
            (item) => item.folder_id === current?.parent_id,
          )
        : undefined;
    }

    return segments;
  }

  function openFolder(folder: FolderRow) {
    const path = getFolderPath(folder);

    router.push(
      `${basePath}/${path.map(encodeURIComponent).join("/")}?view=${view}`,
    );
  }

  async function getSignedUrl(
    document: DocumentRow,
    download: boolean,
  ) {
    const supabase = createClient();

    const { data, error: storageError } = await supabase.storage
      .from("documents")
      .createSignedUrl(
        document.file_path,
        60,
        download ? { download: document.name } : undefined,
      );

    if (storageError || !data?.signedUrl) {
      throw new Error(
        storageError?.message ??
          "Não foi possível aceder ao documento.",
      );
    }

    return data.signedUrl;
  }

  async function handlePreview(document: DocumentRow) {
    setError(null);
    setBusyId(document.document_id);

    try {
      const url = await getSignedUrl(document, false);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError(`Não foi possível abrir "${document.name}".`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownload(document: DocumentRow) {
    setError(null);
    setBusyId(document.document_id);

    try {
      const url = await getSignedUrl(document, true);
      window.location.assign(url);
    } catch {
      setError(`Não foi possível descarregar "${document.name}".`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="w-full">
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Versão</th>
              <th className="px-4 py-3">Actualizado em</th>
              <th className="px-4 py-3 text-right">Acções</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {folders.map((folder) => (
              <tr
                key={folder.folder_id}
                onClick={() => openFolder(folder)}
                className="cursor-pointer transition hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Folder
                      size={18}
                      className="shrink-0 text-[#BD9655]"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-900">
                      {folder.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">Pasta</td>
                <td className="px-4 py-3 text-gray-500">—</td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(folder.created_at)}
                </td>
                <td className="px-4 py-3 text-right text-gray-400">
                  <MoreHorizontal
                    size={18}
                    className="ml-auto"
                    aria-hidden="true"
                  />
                </td>
              </tr>
            ))}

            {documents.map((document) => {
              const isBusy = busyId === document.document_id;

              return (
                <tr
                  key={document.document_id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText
                        size={18}
                        className="shrink-0 text-[#002950]"
                        aria-hidden="true"
                      />
                      <span
                        className="truncate font-medium text-gray-900"
                        title={document.name}
                      >
                        {document.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {document.name.includes(".")
                      ? document.name.split(".").pop()?.toUpperCase()
                      : "Ficheiro"}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    v{document.version ?? 1}
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap text-gray-500">
                      <CalendarDays
                        size={14}
                        aria-hidden="true"
                      />
                      {formatDate(document.updated_at)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreview(document)}
                        disabled={isBusy}
                        aria-label={`Abrir ${document.name}`}
                        title="Abrir documento"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#002950] disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(document)}
                        disabled={isBusy}
                        aria-label={`Descarregar ${document.name}`}
                        title="Descarregar documento"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#002950] disabled:opacity-50"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {folders.length === 0 && documents.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  Esta pasta ainda não contém documentos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
