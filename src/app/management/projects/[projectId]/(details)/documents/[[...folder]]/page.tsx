import { redirect } from "next/navigation";
import DocumentGridView from "../components/document_grid";
import DocumentSidebar from "../components/document_side_bar";
import DocumentTableView from "../components/document_table";
import DocumentToolbar from "../components/document_toolbar";

import { folders, mockDocuments } from "../data";


export default async function DocumentPage({ params, searchParams }
    : {
        params: Promise<{ projectId: string, folder?: string[] }>
        searchParams: Promise<{ view?: string }>
    }) {
        
    const { projectId, folder } = await params;
    const { view } = await searchParams;

    if (!folder) {
        redirect(
            `/management/projects/${projectId}/documents/all-files?view=${view ?? "list"}`
        );
    }

    const currentView = view === "grid" ? "grid" : "list";

    const getFolder = (path: string) => {
        return folders.find((f) => f.path.replace(/^\//, "") === path);
    };

    const selected = folder?.join("/") ?? "all-files";

    const currentFolder =
        selected === "all-files" || selected === "recents"
            ? null
            : getFolder(selected);


    const filteredFolders =
        selected === "all-files"
            ? folders.filter((f) => f.parent_folder_id === "null")
            : currentFolder
                ? folders.filter(
                    (f) => f.parent_folder_id === currentFolder.id
                )
                : [];


    const filteredDocuments =
        selected === "all-files"
            ? mockDocuments
            : currentFolder
                ? mockDocuments.filter(
                    (d) => d.folder_id === currentFolder.id
                )
                : [];
    return (
        <div className="flex flex-row w-full h-full overflow-hidden">
            <DocumentSidebar projectId={projectId} view={currentView} />
            <main className=" flex-1 overflow-y-auto bg-gray-50">
                <DocumentToolbar view={currentView} />
                <div className="flex flex-1 text-center h-max w-full mt-4">
                    {currentView === "list" && <DocumentTableView documents={filteredDocuments} folders={filteredFolders} view={currentView} projectId={projectId} />}
                    {currentView === "grid" && <DocumentGridView folders={filteredFolders} documents={filteredDocuments} view={currentView} />}
                </div>
            </main>
        </div>
    );
}