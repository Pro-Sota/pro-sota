"use client";

import {
  ChevronDown,
  ChevronRight,
  Folder,
} from "lucide-react";
import { usePathname } from "next/navigation";

import type { FolderItemType } from "../types";
import { capitalize } from "@/app/lib/library";

interface FolderItemProps {
  folder: FolderItemType;
  expanded: boolean;
  onSelected: (href: string) => void;
  isExpanded: (folder: FolderItemType) => boolean;
}

function normalizePath(path: string) {
  const cleanPath =
    path
      .split("?")[0]
      .replace(/\/+/g, "/")
      .replace(/\/+$/, "") || "/";

  try {
    return decodeURIComponent(cleanPath);
  } catch {
    return cleanPath;
  }
}

export default function FolderItem({
  folder,
  expanded,
  onSelected,
  isExpanded,
}: FolderItemProps) {
  const pathname = usePathname();

  const Icon = folder.icon ?? Folder;
  const hasChildren = (folder.children?.length ?? 0) > 0;

  const folderPath = normalizePath(folder.href);
  const currentPath = normalizePath(pathname);

  const active = currentPath === folderPath;

  function handleClick() {
    onSelected(folder.href);
  }

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        aria-current={active ? "page" : undefined}
        aria-expanded={hasChildren ? expanded : undefined}
        className={[
          "flex w-full items-center rounded-md px-2 py-2",
          "cursor-pointer text-sm transition-colors",
          "focus:outline-none focus-visible:ring-2",
          "focus-visible:ring-slate-400",
          active
            ? "bg-[#BD9655] text-[#002950]"
            : "text-gray-800 hover:bg-gray-100",
        ].join(" ")}
      >
        <Icon
          className="mr-2 h-4 w-4 shrink-0"
          aria-hidden="true"
        />

        <span className="truncate">
          {capitalize(folder.name)}
        </span>

        {hasChildren &&
          (expanded ? (
            <ChevronDown
              className="ml-auto h-4 w-4 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <ChevronRight
              className="ml-auto h-4 w-4 shrink-0"
              aria-hidden="true"
            />
          ))}
      </button>

      {expanded && hasChildren && (
        <ul className="ml-4 space-y-1">
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              expanded={isExpanded(child)}
              isExpanded={isExpanded}
              onSelected={onSelected}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
