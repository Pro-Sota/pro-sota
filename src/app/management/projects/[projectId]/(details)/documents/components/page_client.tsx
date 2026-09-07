"use client";

import { useMemo, useState, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  Menu,
  X,
  Upload,
  ChevronRight,
} from "lucide-react";

import DocumentGridView from "../components/document_grid";
import DocumentSidebar from "../components/document_side_bar";
import DocumentTableView from "../components/document_table";
import DocumentToolbar from "../components/document_toolbar";

import { Database } from "@/app/lib/supabase/models";
import MobileView from "./mobile_view";

type Folder = Database["public"]["Tables"]["folders"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];

interface EmptyStateProps {
  type: "all-files" | "recents" | "empty-folder" | "no-documents";
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
  onUpload?: () => void; // ✅ FIX #5: Accept upload handler from parent
}

/**
 * EmptyState Component
 * Displays contextual empty states based on view type
 */
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
      description: "Documentos acessados e modificados vão aparecer aqui.",
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
        currentView === "grid" ? "min-h-[420px]" : "min-h-[360px]",
      ].join(" ")}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
      </div>

      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
        {config.title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        {config.description}
      </p>

      {/* ✅ FIX #5: Add onClick handler to upload button */}
      {config.action && (
        <button
          type="button"
          onClick={onUploadClick}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          {ActionIcon && <ActionIcon className="h-4 w-4" />}

          {config.action}
        </button>
      )}
    </div>
  );
}

export default function DocumentPageClient({
  folders,
  documents,
  projectId,
  folder,
  view,
  onUpload,
}: DocumentPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  /*
   * URL structure:
   *
   * /documents
   * -> folder = []
   *
   * /documents/architecture
   * -> folder = ["architecture"]
   *
   * /documents/architecture/plants
   * -> folder = ["architecture", "plants"]
   *
   * /documents/recents
   * -> folder = ["recents"]
   */

  const isAllFiles = folder.length === 0;

  const isRecents = folder.length === 1 && folder[0] === "recents";

  /**
   * Resolves the current folder from the URL path.
   * Walks through the folder hierarchy to find the matching folder.
   * Returns null if the path is invalid or folder doesn't exist.
   */
  const currentFolder = useMemo(() => {
    if (isAllFiles || isRecents || folder.length === 0) {
      return null;
    }

    let parentFolderId: string | null = null;
    let matchedFolder: Folder | null = null;

    for (const slug of folder) {
      const match = folders.find((item) => {
        return item.slug === slug && item.parent_id === parentFolderId;
      });

      if (!match) {
        console.warn("Folder not found:", {
          slug,
          parentFolderId,
          availableFolders: folders.map((item) => ({
            id: item.folder_id,
            name: item.name,
            slug: item.slug,
            parent_id: item.parent_id,
          })),
        });

        return null;
      }

      matchedFolder = match;
      parentFolderId = match.folder_id;
    }

    return matchedFolder;
  }, [folders, folder, isAllFiles, isRecents]);

  /*
   * If the URL contains a folder path but that
   * folder cannot be resolved, the path is invalid.
   */
  const isInvalidFolder = !isAllFiles && !isRecents && currentFolder === null;

  /*
   * Folders shown in the current location.
   *
   * All Files:
   * -> show root folders
   *
   * Inside a folder:
   * -> show only direct children
   */
  const filteredFolders = useMemo(() => {
    if (isAllFiles) {
      return folders.filter((item) => item.parent_id === null);
    }

    if (!currentFolder) {
      return [];
    }

    return folders.filter((item) => item.parent_id === currentFolder.folder_id);
  }, [folders, isAllFiles, currentFolder]);

  /*
   * Documents shown in the current location.
   */
  const filteredDocuments = useMemo(() => {
    /*
     * Recent documents - sort by update time
     */
    if (isRecents) {
      return [...documents]
        .sort((a, b) => {
          const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;

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

    /*
     * Documents belonging directly to
     * the current folder.
     */

    return documents.filter(
      (document) => document.folder_id === currentFolder.folder_id,
    );
  }, [documents, isRecents, isAllFiles, currentFolder]);

  /*
   * Does the current view contain anything?
   */

  const isEmpty =
    filteredFolders.length === 0 && filteredDocuments.length === 0;

  /*
   * Determine which empty state to display.
   */

  const emptyStateType: EmptyStateProps["type"] = isRecents
    ? "recents"
    : isAllFiles
      ? "all-files"
      : filteredFolders.length > 0 && filteredDocuments.length === 0
        ? "no-documents"
        : "empty-folder";

  /*
   * Page title.
   */
  const pageTitle = isAllFiles
    ? "Todos os documentos"
    : isRecents
      ? "Documentos recentes"
      : (currentFolder?.name ?? "Documentos");

  const breadcrumbFolders = useMemo(() => {
    if (isAllFiles || isRecents || !currentFolder) {
      return [];
    }

    const result: Folder[] = [];
    let current: Folder | undefined = currentFolder;

    while (current) {
      result.unshift(current);

      if (!current.parent_id) {
        break;
      }

      const parent = folders.find(
        (item) => item.folder_id === current?.parent_id,
      );

      if (!parent) {
        console.warn("Parent folder not found in hierarchy:", {
          folderName: current.name,
          parentId: current.parent_id,
        });
        break;
      }

      current = parent;
    }

    return result;
  }, [folders, currentFolder, isAllFiles, isRecents]);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      {/* DESKTOP SIDEBAR */}

      <aside className="hidden h-full w-64 shrink-0 border-r border-gray-200 bg-white lg:block xl:w-64">
        <DocumentSidebar projectId={projectId} view={view} folders={folders} />
      </aside>

      {/* MOBILE SIDEBAR */}

      {sidebarOpen && (
        <MobileView
          projectId={projectId}
          view={view}
          folders={folders}
          setSidebarOpen={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* MAIN AREA */}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* TOP TOOLBAR */}
        <header className="z-30 shrink-0 border-b border-gray-200 bg-white">
          <div className="flex min-h-14 items-center gap-3">
            {/* Mobile Menu */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="ml-2 shrink-0 rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label="Open folders"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Location */}

            <div className="ml-2 flex min-w-0 flex-1 items-center gap-2">
              <div className="hidden min-w-0 items-center gap-2 text-sm text-gray-500 sm:flex">
                <span className="shrink-0">Documentos</span>
                {!isAllFiles && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                )}

                {!isAllFiles && !isRecents && (
                  <>
                    {breadcrumbFolders.map((item, index) => (
                      <div
                        key={`breadcrumb-${item.folder_id}-${index}`}
                        className="flex min-w-0 items-center gap-2"
                      >
                        {index > 0 && (
                          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                        )}

                        <span className="max-w-[150px] truncate">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {isRecents && <span>Recentes</span>}
              </div>

              <h1 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                {pageTitle}
              </h1>
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
            {/* Page heading */}

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
                    A pasta indicada no endereço não existe ou deixou de estar
                    disponível.
                  </p>
                </div>
              </div>
            ) : isEmpty ? (
              <div className="rounded-xl border border-gray-200 bg-white">
                <EmptyState
                  type={emptyStateType}
                  currentView={view}
                  folderName={currentFolder?.name}
                  onUploadClick={onUpload}
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
