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
    return mockDocuments.filter((doc) => doc.folder_id === folder)
  }

  const filteredFolders = (filter:string) => {
    if(filter == "all-files") return folders;
    if(filter == "recents") return folders;
    if(filter == "favorites") return folders;

    return folders.filter((folder) => folder.name == selected)
  }

  const filteredDocuments = (filter:string) => {
    if(filter == "all-files") return mockDocuments;
    if(filter == "recents") return mockDocuments;
    if(filter == "favorites") return mockDocuments;
    return mockDocuments.filter((doc) => doc.folder_id);
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


