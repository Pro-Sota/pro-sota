"use client";

import {
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { FolderItemType } from "../types";
import { capitalize } from "@/app/lib/library";

interface FolderItemProps {
  folder: FolderItemType;
  expanded: boolean;
  onSelected: (href: string) => void;
  isExpanded: (folder: FolderItemType) => boolean;
}

export default function FolderItem({
  folder,
  expanded,
  onSelected,
  isExpanded,
}: FolderItemProps) {
  const pathname = usePathname();

  const hasChildren =
    folder.children && folder.children.length > 0;

  /*
   * Remove query parameters.
   *
   * Example:
   *
   * /documents/drawings?view=list
   *
   * becomes:
   *
   * /documents/drawings
   */
  const folderPath = folder.href
    .split("?")[0]
    .replace(/\/+$/, "");

  const currentPath = pathname
    .replace(/\/+$/, "");

  const active = currentPath === folderPath;

  const handleClick = () => {
    onSelected(folder.href);
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={[
          "flex w-full items-center rounded-md px-2 py-2",
          "cursor-pointer transition-colors",
          "focus:outline-none focus-visible:ring-2",
          "focus-visible:ring-slate-400",

          active
            ? "bg-[#BD9655] text-[#002950]"
            : "text-gray-800 hover:bg-gray-100",
        ].join(" ")}
      >
        <folder.icon className="mr-2 h-4 w-4 shrink-0" />

        <span className="truncate">
          {capitalize(folder.name)}
        </span>

        {hasChildren && (
          expanded ? (
            <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4 shrink-0" />
          )
        )}
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
