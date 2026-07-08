"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import { FolderItemType } from "../types";

interface FolderItemProps {
  folder: FolderItemType;
  selected: string;
  expanded: boolean;
  onToggle: () => void;
  onSelected: (value: string, href: string) => void;
}

export default function FolderItem({
  folder,
  selected,
  expanded,
  onToggle,
  onSelected,
}: FolderItemProps) {
  const hasChildren =
    folder.children && folder.children.length > 0;

const handleClick = () => {
  onSelected(folder.id, folder.href);

  if (hasChildren) {
    onToggle();
  }
};

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={`
          flex w-full cursor-pointer items-center rounded-md p-2 transition-colors
          ${
            selected === folder.id
              ? "bg-slate-500 text-white"
              : "text-gray-800 hover:bg-gray-200"
          }
        `}
      >
        {hasChildren &&
          (expanded ? (
            <ChevronDown className="mr-1 h-4 w-4" />
          ) : (
            <ChevronRight className="mr-1 h-4 w-4" />
          ))}

        <folder.icon className="mr-2 h-4 w-4" />

        {folder.name}
      </button>

      {expanded && hasChildren && (
        <ul className="ml-4 space-y-1">
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              selected={selected}
              expanded={false}
              onToggle={() => {}}
              onSelected={onSelected}
            />
          ))}
        </ul>
      )}
    </li>
  );
}