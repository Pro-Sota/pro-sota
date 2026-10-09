"use client";

import { Folder as FolderIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import type { Database } from "@/app/lib/supabase/models";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

interface FolderCardProps {
  folder: Folder;
  folders: Folder[];
  view: "grid" | "list";
  projectId: string | null;
}

function getFolderPath(folder: Folder, folders: Folder[]): string[] {
  const path: string[] = [];
  const visited = new Set<string>();
  let current: Folder | undefined = folder;

  while (current && !visited.has(current.folder_id)) {
    visited.add(current.folder_id);
    path.unshift(current.slug || current.folder_id);

    current = current.parent_id
      ? folders.find((item) => item.folder_id === current?.parent_id)
      : undefined;
  }

  return path;
}

export default function FolderCard({
  folder,
  folders,
  view,
  projectId,
}: FolderCardProps) {
  const router = useRouter();

  function handleOpenFolder() {
    const ownerProjectId = folder.project_id || projectId;

    if (!ownerProjectId) return;

    const path = getFolderPath(folder, folders);
    const base = `/management/projects/${ownerProjectId}/documents`;

    router.push(
      `${base}/${path.map(encodeURIComponent).join("/")}?view=${view}`,
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpenFolder}
      aria-label={`Abrir pasta ${folder.name}`}
      className="group flex min-h-28 w-full items-center gap-3 rounded-xl border border-[#E8E5DE] bg-white p-4 text-left transition hover:border-[#BD9655] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BD9655]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F7F3EA] text-[#BD9655]">
        <FolderIcon size={23} strokeWidth={1.7} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[#002950]">
          {folder.name}
        </span>

        <span className="mt-1 block text-xs text-neutral-500">
          Pasta
        </span>
      </span>
    </button>
  );
}
