"use client";

import DocumentSidebar from "./components/document_side_bar";
import DocumentNav from "./components/document_nav";
import { use, useState } from "react";
import DocumentTableView from "./components/document_table";
import DocumentGridView from "./components/document_grid";
import { usePathname, useRouter } from "next/navigation";

import { folders, mockDocuments } from "./data";
import { mock } from "node:test";


export default function ProjectDocument({ params, searchParams
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ view?: "list" | "grid" }>
}) {
  const { projectId } = use(params);
  const [selected, setSelected] = useState("all-files");
  const [view, setView] = useState<"list" | "grid">("list");

  const getFolder = (folder:string) => {
    return folders.find ((f) => f.name === folder)
  }

  const getFolderDocuments = (fName:string) => {
    const folder = getFolder(fName); 
    return mockDocuments.filter((doc) => doc.folder_id === folder?.id)
  }
  
  const getFolderFolders = (folderName:string) => {
     const folderId = getFolder(folderName)?.id;
    return folders.filter((folder) => folder.parent_folder_id == folderId)
  }

  const filteredFolders = (filter:string) => {
    if(filter == "all-files") return [];
    if(filter == "recents") return [];

    return getFolderFolders(filter);
  }

  const filteredDocuments = (filter:string) => {
    if(filter == "all-files") return mockDocuments;
    if(filter == "recents") return mockDocuments;
    return getFolderDocuments(filter);
  }

  return (
    <div className="flex flex-row w-full h-full overflow-hidden">
      <DocumentSidebar projectId={projectId} selected={selected} onSelected={setSelected} />
      <main className=" flex-1 overflow-y-auto bg-white">
        <DocumentNav view={view} setViewAction={setView} />
        <div className="flex flex-1 text-center h-max w-full mt-4">
          {view === "list" && <DocumentTableView documents={filteredDocuments(selected)} folders={filteredFolders(selected)} />}
          {view === "grid" && <DocumentGridView folders={filteredFolders(selected)} documents={filteredDocuments(selected)} />}
        </div>
      </main>
    </div>
  )
}


