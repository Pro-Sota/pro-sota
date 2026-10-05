"use client";

import { Folder as FolderIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Database } from "@/app/lib/supabase/models";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

interface FolderCardProps {
  folder: Folder;
  folders: Folder[];
  view: string;
  projectId: string;
}

function getFolderPath(
  folder: Folder,
  folders: Folder[],
): string[] {
  const path: string[] = [];
  const visited = new Set<string>();

  let current: Folder | undefined = folder;

  while (current) {
    // Prevent an accidental circular parent relationship
    if (visited.has(current.folder_id)) {
      console.warn(
        "Circular folder hierarchy detected:",
        current.folder_id,
      );
      break;
    }

    visited.add(current.folder_id);

    if (current.slug) {
      path.unshift(current.slug);
    } else {
      // Fallback in case an older folder doesn't have a slug
      path.unshift(
        current.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }

    if (!current.parent_id) {
      break;
    }

    const parent = folders.find(
      (item) => item.folder_id === current?.parent_id,
    );

    if (!parent) {
      console.warn("Parent folder not found:", {
        folder: current.name,
        folderId: current.folder_id,
        parentId: current.parent_id,
      });

      break;
    }

    current = parent;
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

  const base = `/management/projects/${projectId}/documents`;

  function handleOpenFolder() {
    const path = getFolderPath(folder, folders);

    if (path.length === 0) {
      return;
    }

    const encodedPath = path
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    router.push(`${base}/${encodedPath}?view=${view}`);
  }

  return (
    <button
      type="button"
      onClick={handleOpenFolder}
      className="w-full text-left"
    >
      <div className="group cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#BD9655]/10">
            <FolderIcon className="h-5 w-5 text-[#BD9655]" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#002950]">
              {folder.name}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}