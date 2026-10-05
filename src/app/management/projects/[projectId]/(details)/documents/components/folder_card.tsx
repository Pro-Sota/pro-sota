"use client";

import { Folder as FolderIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Database } from "@/app/lib/supabase/models";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

interface FolderCardProps {
  folder: Folder;
  view: string;
}

export default function FolderCard({
  folder,
  view,
}: FolderCardProps) {
  const router = useRouter();

  const handleOpenFolder = () => {
    router.push(
      `/management/projects/${folder.project_id}/documents/${folder.folder_id}`
    );
  };

  return (
    <button
      type="button"
      onClick={handleOpenFolder}
      className="w-full text-left"
    >
      <div className="group cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
            <FolderIcon className="h-5 w-5 text-neutral-600" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-900">
              {folder.name}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}