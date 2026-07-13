"use client";

import { useState } from "react";
import { Grid, List } from "lucide-react";

import CreateFolderDialog from "./create_folder_dialog";
import UploadDocument from "./upload_document";

export default function DocumentToolbar({
  view,
  setViewAction,
}: {
  view: "list" | "grid";
  setViewAction: (view: "list" | "grid") => void;
}) {

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white px-4 py-2">
      <div className="flex items-center gap-2">
        <UploadDocument />
        <CreateFolderDialog />
      </div>


      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewAction("list")}
          className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition cursor-pointer ${view === "list"
            ? "bg-slate-500 text-white"
            : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          <List className="h-4 w-4" />
          List
        </button>

        <button
          onClick={() => setViewAction("grid")}
          className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition cursor-pointer ${view === "grid"
            ? "bg-slate-500 text-white"
            : "text-gray-600 hover:bg-gray-200"
            }`}
        >
          <Grid className="h-4 w-4" />
          Grid
        </button>
      </div>
    </div>
  );
}

