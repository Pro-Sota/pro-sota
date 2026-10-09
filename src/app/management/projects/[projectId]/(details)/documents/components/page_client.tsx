"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  FileText,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import DocumentGridView from "../components/document_grid";
import DocumentSidebar from "../components/document_side_bar";
import DocumentTableView from "../components/document_table";
import DocumentToolbar from "../components/document_toolbar";
import MobileView from "./mobile_view";

import type { Database } from "@/app/lib/supabase/models";
import { capitalize } from "@/app/lib/library";

type Folder = Database["public"]["Tables"]["folders"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentPageClientProps {
  folders: Folder[];
  documents: Document[];
  projectId: string;
  folder: string[];
  view: "grid" | "list";
}

interface DocumentBreadcrumbProps {
  projectId: string;
  view: "grid" | "list";
  folders: Folder[];
  breadcrumbFolders: Folder[];
  isAllFiles: boolean;
  isRecents: boolean;
}

function normalizeSlug(value: string): string {
  let normalized = value.trim();

  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(normalized);

      if (decoded === normalized) break;

      normalized = decoded;
    } catch {
      break;
    }
  }

  return normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFolderSlug(folder: Folder): string {
  return normalizeSlug(folder.slug?.trim() || folder.name);
}

function getFolderPath(
  folder: Folder,
  folders: Folder[],
): string {
  const path: Folder[] = [];
  const visited = new Set<string>();

  let current: Folder | undefined = folder;

  while (current) {
    if (visited.has(current.folder_id)) {
      break;
    }

    visited.add(current.folder_id);
    path.unshift(current);

    if (!current.parent_id) {
      break;
    }

    current = folders.find(
      (item) => item.folder_id === current?.parent_id,
    );
  }

  return path
    .map(getFolderSlug)
    .filter(Boolean)
    .join("/");
}

function EmptyState({
  type,
  folderName,
  onUploadClick,
}: {
  type: "all-files" | "recents" | "empty-folder" | "no-documents";
  folderName?: string;
  onUploadClick: () => void;
}) {
  const content = {
    "all-files": {
      icon: FolderOpen,
      title: "Ainda sem ficheiros",
      description:
        "Carregue documentos para começar a organizar o arquivo do projecto.",
      showUpload: true,
    },
    recents: {
      icon: FileText,
      title: "Sem documentos recentes",
      description:
        "Os documentos recentemente actualizados aparecerão aqui.",
      showUpload: false,
    },
    "empty-folder": {
      icon: FolderOpen,
      title: `${folderName ?? "Esta pasta"} está vazia`,
      description:
        "Carregue documentos ou crie subpastas para organizar os ficheiros.",
      showUpload: true,
    },
    "no-documents": {
      icon: FileText,
      title: "Sem documentos nesta pasta",
      description:
        "Esta pasta contém subpastas, mas ainda não contém documentos.",
      showUpload: true,
    },
  }[type];

  const Icon = content.icon;

  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
      </div>

      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
        {content.title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {content.description}
      </p>

      {content.showUpload && (
        <button
          type="button"
          onClick={onUploadClick}
          className="mt-6 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
        >
          Carregar documento
        </button>
      )}
    </div>
  );
}

function DocumentBreadcrumb({
  projectId,
  view,
  folders,
  breadcrumbFolders,
  isAllFiles,
  isRecents,
}: DocumentBreadcrumbProps) {
  const router = useRouter();
  const basePath = `/management/projects/${projectId}/documents`;

  const navigateToFolder = useCallback(
    (folderPath: string) => {
      const params = new URLSearchParams({ view });

      const href = folderPath
        ? `${basePath}/${folderPath}?${params.toString()}`
        : `${basePath}?${params.toString()}`;

      router.push(href);
    },
    [basePath, router, view],
  );

  return (
    <nav aria-label="Localização" className="flex min-w-0 items-center">
      <div className="hidden min-w-0 items-center gap-1 sm:flex">
        <button
          type="button"
          onClick={() => navigateToFolder("")}
          aria-current={isAllFiles ? "page" : undefined}
          className={[
            "shrink-0 rounded-md px-2 py-1 text-sm transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]",
            isAllFiles
              ? "font-semibold text-[#002950]"
              : "text-gray-500 hover:bg-[#BD9655]/10 hover:text-[#002950]",
          ].join(" ")}
        >
          Documentos
        </button>

        {!isAllFiles && (
          <>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />

            {isRecents ? (
              <span className="truncate px-2 py-1 text-sm font-semibold text-[#002950]">
                Recentes
              </span>
            ) : (
              breadcrumbFolders.map((item, index) => {
                const isLast = index === breadcrumbFolders.length - 1;
                const path = getFolderPath(item, folders);

                return (
                  <div
                    key={item.folder_id}
                    className="flex min-w-0 items-center gap-1"
                  >
                    {index > 0 && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    )}

                    <button
                      type="button"
                      onClick={() => navigateToFolder(path)}
                      aria-current={isLast ? "page" : undefined}
                      className={[
                        "max-w-[180px] truncate rounded-md px-2 py-1 text-sm",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]",
                        isLast
                          ? "font-semibold text-[#002950]"
                          : "text-gray-500 hover:bg-[#BD9655]/10 hover:text-[#002950]",
                      ].join(" ")}
                    >
                      {capitalize(item.name)}
                    </button>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <div className="min-w-0 sm:hidden">
        <span className="block truncate text-sm font-semibold text-[#002950]">
          {isAllFiles
            ? "Todos os documentos"
            : isRecents
              ? "Recentes"
              : breadcrumbFolders[breadcrumbFolders.length - 1]?.name ??
                "Documentos"}
        </span>
      </div>
    </nav>
  );
}

export default function DocumentInit({
  folders,
  documents,
  projectId,
  folder,
  view,
}: DocumentPageClientProps) {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const normalizedFolder = useMemo(
    () => folder.map(normalizeSlug),
    [folder],
  );

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const isAllFiles =
    normalizedFolder.length === 0 ||
    (normalizedFolder.length === 1 &&
      normalizedFolder[0] === "all-files");

  const isRecents =
    normalizedFolder.length === 1 &&
    normalizedFolder[0] === "recents";

  const currentFolder = useMemo(() => {
    if (isAllFiles || isRecents) return null;

    let parentFolderId: string | null = null;
    let matchedFolder: Folder | null = null;

    for (const slug of normalizedFolder) {
      const match = folders.find(
        (item) =>
          getFolderSlug(item) === slug &&
          item.parent_id === parentFolderId,
      );

      if (!match) return null;

      matchedFolder = match;
      parentFolderId = match.folder_id;
    }

    return matchedFolder;
  }, [folders, normalizedFolder, isAllFiles, isRecents]);

  const isInvalidFolder =
    !isAllFiles && !isRecents && currentFolder === null;

  const filteredFolders = useMemo(() => {
    if (isAllFiles) {
      return folders.filter((item) => item.parent_id === null);
    }

    if (!currentFolder) return [];

    return folders.filter(
      (item) => item.parent_id === currentFolder.folder_id,
    );
  }, [folders, isAllFiles, currentFolder]);

  const filteredDocuments = useMemo(() => {
    if (isRecents) {
      return [...documents]
        .sort((a, b) => {
          const aDate = a.updated_at
            ? new Date(a.updated_at).getTime()
            : 0;
          const bDate = b.updated_at
            ? new Date(b.updated_at).getTime()
            : 0;

          return bDate - aDate;
        })
        .slice(0, 10);
    }

    if (isAllFiles) return documents;
    if (!currentFolder) return [];

    return documents.filter(
      (item) => item.folder_id === currentFolder.folder_id,
    );
  }, [documents, isRecents, isAllFiles, currentFolder]);

  const breadcrumbFolders = useMemo(() => {
    if (isAllFiles || isRecents || !currentFolder) return [];

    const result: Folder[] = [];
    const visited = new Set<string>();
    let current: Folder | undefined = currentFolder;

    while (current && !visited.has(current.folder_id)) {
      visited.add(current.folder_id);
      result.unshift(current);

      if (!current.parent_id) break;

      current = folders.find(
        (item) => item.folder_id === current?.parent_id,
      );
    }

    return result;
  }, [folders, currentFolder, isAllFiles, isRecents]);

  const pageTitle = isAllFiles
    ? "Todos os documentos"
    : isRecents
      ? "Documentos recentes"
      : currentFolder?.name ?? "Documentos";

  const isEmpty =
    filteredFolders.length === 0 && filteredDocuments.length === 0;

  const emptyStateType = isRecents
    ? "recents"
    : isAllFiles
      ? "all-files"
      : filteredFolders.length > 0
        ? "no-documents"
        : "empty-folder";

  const refreshDocuments = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <aside className="hidden h-full w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <DocumentSidebar
          projectId={projectId}
          view={view}
          folders={folders}
        />
      </aside>

      {sidebarOpen && (
        <MobileView
          projectId={projectId}
          view={view}
          folders={folders}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 shrink-0 border-b border-gray-200 bg-white">
          <div className="flex min-h-14 items-center gap-3 px-3 sm:px-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir pastas"
              aria-expanded={sidebarOpen}
              className="shrink-0 rounded-lg p-2 text-[#002950] transition-colors hover:bg-[#BD9655]/10 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
              <DocumentBreadcrumb
                projectId={projectId}
                view={view}
                folders={folders}
                breadcrumbFolders={breadcrumbFolders}
                isAllFiles={isAllFiles}
                isRecents={isRecents}
              />
            </div>

            <div className="shrink-0">
              <DocumentToolbar
                folders={folders}
                view={view}
                projectId={projectId}
                onChanged={refreshDocuments}
              />
            </div>
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                {pageTitle}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isRecents
                  ? "Documentos actualizados recentemente."
                  : isAllFiles
                    ? "Gerir e organizar os documentos do projecto."
                    : currentFolder
                      ? `Documentos e subpastas de ${currentFolder.name}.`
                      : "A pasta solicitada não foi encontrada."}
              </p>
            </div>

            {isInvalidFolder ? (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                  <FolderOpen className="mb-5 h-10 w-10 text-gray-400" />

                  <h3 className="text-base font-semibold text-gray-900">
                    Pasta não encontrada
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    A pasta indicada no endereço não existe ou deixou de
                    estar disponível.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push(
                      `/management/projects/${projectId}/documents?view=${view}`,
                    )}
                    className="mt-5 rounded-md bg-[#002950] px-4 py-2 text-sm font-medium text-white hover:bg-[#002950]/90"
                  >
                    Voltar aos documentos
                  </button>
                </div>
              </div>
            ) : isEmpty ? (
              <div className="rounded-xl border border-gray-200 bg-white">
                <EmptyState
                  type={emptyStateType}
                  folderName={currentFolder?.name}
                  onUploadClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("pro-sota:open-document-upload"),
                    );
                  }}
                />
              </div>
            ) : (
              <div className="min-w-0">
                {view === "list" ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <DocumentTableView
                      documents={filteredDocuments}
                      folders={filteredFolders}
                      allFolders={folders}
                      view={view}
                      projectId={projectId}
                    />
                  </div>
                ) : (
                  <DocumentGridView
                    folders={filteredFolders}
                    documents={filteredDocuments}
                    view={view}
                    projectId={projectId}
                    allFolders={folders}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}