"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import { FolderItemType } from "../types";

import { usePathname } from "next/navigation";
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
}: FolderItemProps) {
  const hasChildren = folder.children && folder.children.length > 0;

  const pathname = usePathname();

  const handleClick = () => {
    onSelected(folder.href);
  };
  
  const isExpanded = (folder: FolderItemType) => {
  const folderPath = folder.href.split("?")[0];

  return (
    pathname === folderPath ||
    pathname.startsWith(`${folderPath}/`)
  );
};

  const isActive = (href: string) => {
    const path = href.split("?")[0];
    return pathname === path;
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={`
          flex w-full cursor-pointer items-center rounded-md p-2 transition-colors
          ${
            isActive(folder.href)
              ? "bg-slate-500 text-white"
              : "text-gray-800 hover:bg-gray-200"
          }
        `}
      >
        <folder.icon className="mr-2 h-4 w-4" />
        {capitalize(folder.name)}

        {hasChildren &&
          (expanded ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
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
