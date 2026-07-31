import { redirect } from "next/navigation";
import { FolderOpen, FileText, FolderPlus, Upload } from "lucide-react";

import DocumentGridView from "../components/document_grid";
import DocumentSidebar from "../components/document_side_bar";
import DocumentTableView from "../components/document_table";
import DocumentToolbar from "../components/document_toolbar";

import { folders, mockDocuments } from "../data";
import { Database } from "@/app/lib/supabase/models";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

type PageProps = {
    params: Promise<{
        projectId: string;
        folder?: string[];
    }>;
    searchParams: Promise<{
        view?: string;
    }>;
};

// Empty State Component
interface EmptyStateProps {
    type: "all-files" | "recents" | "empty-folder" | "no-documents";
    currentView: "grid" | "list";
    folderName?: string;
}

function EmptyState({ type, currentView, folderName }: EmptyStateProps) {
    const emptyStateConfig = {
        "all-files": {
            icon: FolderOpen,
            title: "No files yet",
            description: "Start by creating a folder or uploading documents",
            action: "Upload Documents",
            actionIcon: Upload,
        },
        "recents": {
            icon: FileText,
            title: "No recent documents",
            description: "Documents you access will appear here",
            action: null,
            actionIcon: null,
        },
        "empty-folder": {
            icon: FolderOpen,
            title: `${folderName} is empty`,
            description: "Add documents or subfolders to get started",
            action: "Upload to Folder",
            actionIcon: Upload,
        },
        "no-documents": {
            icon: FileText,
            title: "No documents in this folder",
            description: "Try creating a subfolder or uploading files",
            action: "Upload Documents",
            actionIcon: Upload,
        },
    };

    const config = emptyStateConfig[type];
    const Icon = config.icon;
    const ActionIcon = config.actionIcon;

    return (
        <div
            className={`flex flex-col items-center justify-center gap-4 ${currentView === "grid"
                ? "min-h-[500px]"
                : "min-h-[400px]"
                }`}
        >
            <div className="rounded-lg bg-gray-100 p-6">
                <Icon className="h-12 w-12 text-gray-400" strokeWidth={1.5} />
            </div>

            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    {config.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    {config.description}
                </p>
            </div>

            {config.action && (
                <button className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                    {ActionIcon && <ActionIcon className="h-4 w-4" />}
                    {config.action}
                </button>
            )}
        </div>
    );
}

export default async function DocumentPage({
    params,
    searchParams,
}: PageProps) {
    const [{ projectId, folder }, { view }] = await Promise.all([
        params,
        searchParams,
    ]);

    if (!folder?.length) {
        redirect(
            `/management/projects/${projectId}/documents/all-files?view=${view ?? "list"
            }`
        );
    }

    const currentView = view === "grid" ? "grid" : "list";

    // Current route
    const selected = folder.join("/");

    // "all-files" is a virtual folder
    const isAllFiles = selected === "all-files";
    const isRecents = selected === "recents";

    // Lookup by slug/path (replace with DB lookup later)
    const currentFolder =
        isAllFiles || isRecents
            ? null
            : folders.find((folder) => folder.path.replace(/^\//, "") === selected) ??
            null;

    // Child folders
    const filteredFolders = isAllFiles
        ? folders.filter((folder) => folder.parent_folder_id === "null")
        : currentFolder
            ? folders.filter(
                (folder) => folder.parent_folder_id === currentFolder.id
            )
            : [];

    // Documents
    const filteredDocuments = isAllFiles
        ? mockDocuments
        : currentFolder
            ? mockDocuments.filter(
                (document) => document.folder_id === currentFolder.id
            )
            : [];

    // Check if content is empty
    const isEmpty = filteredFolders.length === 0 && filteredDocuments.length === 0;
    const hasOnlyFolders = filteredFolders.length > 0 && filteredDocuments.length === 0;
    const hasOnlyDocuments = filteredFolders.length === 0 && filteredDocuments.length > 0;

    // Determine empty state type
    let emptyStateType: "all-files" | "recents" | "empty-folder" | "no-documents" = "all-files";
    if (isRecents) {
        emptyStateType = "recents";
    } else if (currentFolder && isEmpty) {
        emptyStateType = "empty-folder";
    } else if (currentFolder && hasOnlyFolders) {
        emptyStateType = "no-documents";
    }

    return (
        <div className="flex h-full w-full overflow-hidden">
            <DocumentSidebar
                projectId={projectId}
                view={currentView}
            />

            <main className="flex-1 overflow-y-auto bg-gray-50">
                <DocumentToolbar view={currentView} />

                <div className="mt-4 flex h-max w-full flex-1 px-4">
                    {isEmpty ? (
                        <div className="w-full">
                            <EmptyState
                                type={emptyStateType}
                                currentView={currentView}
                                folderName={currentFolder?.name}
                            />
                        </div>
                    ) : (
                        <>
                            {currentView === "list" ? (
                                <DocumentTableView
                                    documents={filteredDocuments}
                                    folders={filteredFolders}
                                    view={currentView}
                                    projectId={projectId}
                                />
                            ) : (
                                <DocumentGridView
                                    folders={filteredFolders}
                                    documents={filteredDocuments}
                                    view={currentView}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}