import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderItemType } from "../types";

interface FolderItemProps {
  folder: FolderItemType;
}


export default function FolderItem({ folder }: FolderItemProps) {
  const pathname = usePathname();

  const hasChildren =
    folder.children && folder.children.length > 0;

  const isOpen = pathname.startsWith(folder.href);

  const Icon = folder.icon;

  const itemClass = `
    flex items-center rounded-md p-2 transition-colors
    ${
      pathname.startsWith(folder.href)
        ? "bg-slate-500 text-white"
        : "text-gray-800 hover:bg-gray-200"
    }
  `;

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={folder.href}
          className={itemClass}
        >
          <Icon className="mr-2 h-4 w-4" />
          {folder.name}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={folder.href}
        className={`
          flex w-full items-center justify-between rounded-md p-2 transition-colors
          ${
            pathname.startsWith(folder.href)
              ? "bg-slate-500 text-white"
              : "text-gray-800 hover:bg-gray-200"
          }
        `}
      >
        <div className="flex items-center">
          <Icon className="mr-2 h-4 w-4" />
          {folder.name}
        </div>

        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Link>

      {isOpen && (
        <ul className="ml-5 mt-1 space-y-1 border-l border-gray-200 pl-3">
          {folder.children?.map((child) => (
            <FolderItem
              key={child.href}
              folder={child}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
