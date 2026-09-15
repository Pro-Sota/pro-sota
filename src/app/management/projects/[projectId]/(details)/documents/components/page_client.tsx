"use client";

import { useMemo, useState, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  Menu,
  Upload,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import DocumentGridView from "../components/document_grid";
import DocumentSidebar from "../components/document_side_bar";
import DocumentTableView from "../components/document_table";
import DocumentToolbar from "../components/document_toolbar";

import { Database } from "@/app/lib/supabase/models";
import MobileView from "./mobile_view";
import { capitalize } from "@/app/lib/library";

type Folder = Database["public"]["Tables"]["folders"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];

interface EmptyStateProps {
  type:
    | "all-files"
    | "recents"
    | "empty-folder"
    | "no-documents";
  currentView: "grid" | "list";
  folderName?: string;
  onUploadClick?: () => void;
}

interface DocumentPageClientProps {
  folders: Folder[];
  documents: Document[];
  projectId: string;
  folder: string[];
  view: "grid" | "list";
  onUpload?: () => void;
}

interface DocumentBreadcrumbProps {
  projectId: string;
  view: "grid" | "list";
  folders: Folder[];
  breadcrumbFolders: Folder[];
  isAllFiles: boolean;
  isRecents: boolean;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function normalizeSlug(value: string) {
  let normalized = value.trim();

  /*
   * Decode repeatedly because a URL can occasionally
   * arrive double encoded.
   */
  for (let i = 0; i < 2; i++) {
    try {
      const decoded = decodeURIComponent(normalized);

      if (decoded === normalized) {
        break;
      }

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

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  type,
  currentView,
  folderName,
  onUploadClick,
}: EmptyStateProps) {
  const config = {
    "all-files": {
      icon: FolderOpen,
      title: "Ainda sem ficheiros",
      description:
        "Começa por criar uma pasta ou submeter documentos para este projecto.",
      action: "Upload Documents",
      actionIcon: Upload,
    },

    recents: {
      icon: FileText,
      title: "Sem documentos recentes",
      description:
        "Documentos acessados e modificados vão aparecer aqui.",
      action: null,
      actionIcon: null,
    },

    "empty-folder": {
      icon: FolderOpen,
      title: `${folderName ?? "Esta pasta"} está vazia`,
      description:
        "Submete documentos ou cria subpastas para organizar os ficheiros.",
      action: "Upload to Folder",
      actionIcon: Upload,
    },

    "no-documents": {
      icon: FileText,
      title: "Sem documentos nesta pasta",
      description:
        "Esta pasta contém subpastas, mas não contém documentos ainda.",
      action: "Upload Documents",
      actionIcon: Upload,
    },
  }[type];

  const Icon = config.icon;
  const ActionIcon = config.actionIcon;

  return (
    <div
      className={[
        "flex w-full flex-col items-center justify-center",
        "px-6 text-center",
        currentView === "grid"
          ? "min-h-[420px]"
          : "min-h-[360px]",
      ].join(" ")}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Icon
          className="h-8 w-8 text-gray-400"
          strokeWidth={1.5}
        />
      </div>

      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
        {config.title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {config.description}
      </p>

      {config.action && (
        <button
          type="button"
          onClick={onUploadClick}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 focus:outline-none focus:ring-2 focus:ring-[#002950] focus:ring-offset-2"
        >
          {ActionIcon && (
            <ActionIcon className="h-4 w-4" />
          )}

          {config.action}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Breadcrumb                                                                  */
/* -------------------------------------------------------------------------- */

function DocumentBreadcrumb({
  projectId,
  view,
  folders,
  breadcrumbFolders,
  isAllFiles,
  isRecents,
}: DocumentBreadcrumbProps) {

  
  const router = useRouter();

  const basePath =
    `/management/projects/${projectId}/documents`;

  function navigateToFolder(folderPath: string) {
    const params = new URLSearchParams();
    params.set("view", view);

    const href = folderPath
      ? `${basePath}/${folderPath}?${params.toString()}`
      : `${basePath}?${params.toString()}`;

    router.push(href);
  }

  function getFolderPath(folder: Folder) {
    const path: Folder[] = [];

    let current: Folder | undefined = folder;

    while (current) {
      path.unshift(current);

      if (!current.parent_id) {
        break;
      }

      current = folders.find(
        (item) =>
          item.folder_id === current?.parent_id,
      );
    }

    return path
      .map((item) =>
        normalizeSlug(item.slug ?? ""),
      )
      .filter(Boolean)
      .join("/");
  }

  

  return (
    <nav
      aria-label="Localização"
      className="flex min-w-0 items-center"
    >
      {/* Desktop breadcrumb */}

      <div className="hidden min-w-0 items-center gap-1 sm:flex">
        <button
          type="button"
          onClick={() => navigateToFolder("")}
          aria-current={
            isAllFiles ? "page" : undefined
          }
          className={[
            "shrink-0 rounded-md px-2 py-1 text-sm transition-colors",
            "focus:outline-none focus-visible:ring-2",
            "focus-visible:ring-[#002950] focus-visible:ring-offset-1",
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
              breadcrumbFolders.map(
                (item, index) => {
                  const isLast =
                    index ===
                    breadcrumbFolders.length - 1;

                  const folderPath =
                    getFolderPath(item);

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
                        onClick={() =>
                          navigateToFolder(
                            folderPath,
                          )
                        }
                        aria-current={
                          isLast ? "page" : undefined
                        }
                        className={[
                          "max-w-[180px] truncate rounded-md px-2 py-1 text-sm transition-colors",
                          "focus:outline-none focus-visible:ring-2",
                          "focus-visible:ring-[#002950] focus-visible:ring-offset-1",
                          isLast
                            ? "font-semibold text-[#002950]"
                            : "text-gray-500 hover:bg-[#BD9655]/10 hover:text-[#002950]",
                        ].join(" ")}
                      >
                        {capitalize(item.name)}
                      </button>
                    </div>
                  );
                },
              )
            )}
          </>
        )}
      </div>

      {/* Mobile breadcrumb */}

      <div className="min-w-0 sm:hidden">
        <span className="block truncate text-sm font-semibold text-[#002950]">
          {isAllFiles
            ? "Todos os documentos"
            : isRecents
              ? "Recentes"
              : breadcrumbFolders[
                    breadcrumbFolders.length - 1
                  ]?.name ?? "Documentos"}
        </span>
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Main document page                                                         */
/* -------------------------------------------------------------------------- */

export default function DocumentInit({
  folders,
  documents,
  projectId,
  folder,
  view,
  onUpload,
}: DocumentPageClientProps) {

   const normalizedFolder = useMemo(() => {
    return folder.map((segment) => {
      return normalizeSlug(segment);
    });
  }, [folder]);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen
      ? "hidden"
      : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  /* ------------------------------------------------------------------------ */
  /* Special locations                                                        */
  /* ------------------------------------------------------------------------ */

  const isAllFiles =
    normalizedFolder.length === 0 ||
    (normalizedFolder.length === 1 &&
      normalizedFolder[0] === "all-files");

  const isRecents =
    normalizedFolder.length === 1 &&
    normalizedFolder[0] === "recents";

  /* ------------------------------------------------------------------------ */
  /* Resolve current folder                                                   */
  /* ------------------------------------------------------------------------ */

    const currentFolder = useMemo(() => {
    if (isAllFiles || isRecents) {
      return null;
    }

    let parentFolderId: string | null = null;
    let matchedFolder: Folder | null = null;

    for (const slug of normalizedFolder) {
      const match = folders.find((item) => {
        const databaseSlug = normalizeSlug(
          item.slug ?? item.name,
        );

        return (
          databaseSlug === slug &&
          item.parent_id === parentFolderId
        );
      });

      if (!match) {
        console.warn("Folder not found:", {
          requestedSlug: slug,
          parentFolderId,
          availableFolders: folders.map((item) => ({
            id: item.folder_id,
            name: item.name,
            slug: item.slug,
            normalizedSlug: normalizeSlug(
              item.slug ?? item.name,
            ),
            parent_id: item.parent_id,
          })),
        });

        return null;
      }

      matchedFolder = match;
      parentFolderId = match.folder_id;
    }

    return matchedFolder;
  }, [
    folders,
    normalizedFolder,
    isAllFiles,
    isRecents,
  ]);

  const isInvalidFolder =
    !isAllFiles &&
    !isRecents &&
    currentFolder === null;

  /* ------------------------------------------------------------------------ */
  /* Current folders                                                          */
  /* ------------------------------------------------------------------------ */

  const filteredFolders = useMemo(() => {
    if (isAllFiles) {
      return folders;
    }

    if (!currentFolder) {
      return [];
    }

    return folders.filter(
      (item) =>
        item.parent_id === currentFolder.folder_id,
    );
  }, [
    folders,
    isAllFiles,
    currentFolder,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Current documents                                                        */
  /* ------------------------------------------------------------------------ */

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

    if (isAllFiles) {
      return documents;
    }

    if (!currentFolder) {
      return [];
    }

    return documents.filter(
      (document) =>
        document.folder_id ===
        currentFolder.folder_id,
    );
  }, [
    documents,
    isRecents,
    isAllFiles,
    currentFolder,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Empty state                                                              */
  /* ------------------------------------------------------------------------ */

  const isEmpty =
    filteredFolders.length === 0 &&
    filteredDocuments.length === 0;

  const emptyStateType: EmptyStateProps["type"] =
    isRecents
      ? "recents"
      : isAllFiles
        ? "all-files"
        : filteredFolders.length > 0 &&
            filteredDocuments.length === 0
          ? "no-documents"
          : "empty-folder";

  /* ------------------------------------------------------------------------ */
  /* Page title                                                               */
  /* ------------------------------------------------------------------------ */

  const pageTitle = isAllFiles
    ? "Todos os documentos"
    : isRecents
      ? "Documentos recentes"
      : (currentFolder?.name ?? "Documentos");

  /* ------------------------------------------------------------------------ */
  /* Breadcrumb hierarchy                                                     */
  /* ------------------------------------------------------------------------ */

  const breadcrumbFolders = useMemo(() => {
    if (
      isAllFiles ||
      isRecents ||
      !currentFolder
    ) {
      return [];
    }

    const result: Folder[] = [];

    let current: Folder | undefined =
      currentFolder;

    while (current) {
      result.unshift(current);

      if (!current.parent_id) {
        break;
      }

      const parent = folders.find(
        (item) =>
          item.folder_id === current?.parent_id,
      );

      if (!parent) {
        console.warn(
          "Parent folder not found:",
          current.parent_id,
        );

        break;
      }

      current = parent;
    }

    return result;
  }, [
    folders,
    currentFolder,
    isAllFiles,
    isRecents,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      {/* DESKTOP SIDEBAR */}

      <aside className="hidden h-full w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <DocumentSidebar
          projectId={projectId}
          view={view}
          folders={folders}
        />
      </aside>

      {/* MOBILE SIDEBAR */}

      {sidebarOpen && (
        <MobileView
          projectId={projectId}
          view={view}
          folders={folders}
          setSidebarOpen={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />
      )}

      {/* MAIN AREA */}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}

        <header className="z-30 shrink-0 border-b border-gray-200 bg-white">
          <div className="flex min-h-14 items-center gap-3 px-3 sm:px-4">
            {/* Mobile menu */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg p-2 text-[#002950] transition-colors hover:bg-[#BD9655]/10 lg:hidden"
              aria-label="Abrir pastas"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}

            <div className="min-w-0 flex-1">
              <DocumentBreadcrumb
                projectId={projectId}
                view={view}
                folders={folders}
                breadcrumbFolders={
                  breadcrumbFolders
                }
                isAllFiles={isAllFiles}
                isRecents={isRecents}
              />
            </div>

            {/* Toolbar */}

            <div className="shrink-0">
              <DocumentToolbar view={view} />
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <section className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
            {/* PAGE HEADING */}

            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                {pageTitle}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isRecents
                  ? "Documentos acessados recentemente."
                  : isAllFiles
                    ? "Gerir e organizar os documentos do projecto."
                    : currentFolder
                      ? `Documentos e pastas dentro de ${currentFolder.name}.`
                      : "A pasta solicitada não foi encontrada."}
              </p>
            </div>

            {/* INVALID FOLDER */}

            {isInvalidFolder ? (
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex min-h-[360px] w-full flex-col items-center justify-center px-6 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                    <FolderOpen
                      className="h-8 w-8 text-gray-400"
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                    Pasta não encontrada
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    A pasta indicada no endereço não
                    existe ou deixou de estar disponível.
                  </p>
                </div>
              </div>
            ) : isEmpty ? (
              <div className="rounded-xl border border-gray-200 bg-white">
                <EmptyState
                  type={emptyStateType}
                  currentView={view}
                  folderName={
                    currentFolder?.name
                  }
                  onUploadClick={onUpload}
                />
              </div>
            ) : (
              <div className="min-w-0">
                {view === "list" ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <DocumentTableView
                      documents={
                        filteredDocuments
                      }
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