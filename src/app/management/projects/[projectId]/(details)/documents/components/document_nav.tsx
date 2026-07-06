"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Grid, List } from "lucide-react";

import CreateFolderDialog from "./create_folder_dialog";

export default function DocumentNav() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const view = searchParams.get("view") === "grid" ? "grid" : "list";

  const setView = (newView: "list" | "grid") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);

    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white px-4 py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition cursor-pointer ${
            view === "list"
              ? "bg-slate-500 text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <List className="h-4 w-4" />
          List
        </button>

        <button
          onClick={() => setView("grid")}
          className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition cursor-pointer ${
            view === "grid"
              ? "bg-slate-500 text-white"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Grid className="h-4 w-4" />
          Grid
        </button>
      </div>

      <CreateFolderDialog />
    </div>
  );
}