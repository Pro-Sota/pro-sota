"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Folder } from "lucide-react";

import CreateFolderDialog, {
  type FolderRow,
} from "./create_folder_dialog";

type FolderTreeProps = {
  folders: FolderRow[];
  onFoldersChange: React.Dispatch<
    React.SetStateAction<FolderRow[]>
  >;
};

type FolderTreeNodeProps = {
  folder: FolderRow;
  folders: FolderRow[];
  onFoldersChange: React.Dispatch<
    React.SetStateAction<FolderRow[]>
  >;
};

function FolderTreeNode({
  folder,
  folders,
  onFoldersChange,
}: FolderTreeNodeProps) {
  const [expanded, setExpanded] = useState(false);

  const children = useMemo(() => {
    return folders
      .filter(
        (item) =>
          item.project_id === folder.project_id &&
          item.parent_id === folder.folder_id,
      )
      .sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
  }, [folders, folder.project_id, folder.folder_id]);

  function handleCreated(newFolder: FolderRow) {
    onFoldersChange((current) => {
      if (
        current.some(
          (item) =>
            item.folder_id === newFolder.folder_id,
        )
      ) {
        return current;
      }

      return [...current, newFolder];
    });

    if (newFolder.parent_id === folder.folder_id) {
      setExpanded(true);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50">
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() =>
              setExpanded((current) => !current)
            }
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-gray-100"
            aria-label={
              expanded
                ? `Fechar ${folder.name}`
                : `Abrir ${folder.name}`
            }
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </button>
        ) : (
          <div className="h-5 w-5 shrink-0" />
        )}

        <Folder className="h-4 w-4 shrink-0 text-[#BD9655]" />

        <span className="min-w-0 flex-1 truncate text-sm text-[#002950]">
          {folder.name}
        </span>

        <CreateFolderDialog
          folders={folders}
          parentFolderId={folder.folder_id}
          onCreated={handleCreated}
        />
      </div>

      {expanded && children.length > 0 && (
        <div className="ml-7 border-l border-gray-200 pl-3">
          {children.map((child) => (
            <FolderTreeNode
              key={child.folder_id}
              folder={child}
              folders={folders}
              onFoldersChange={onFoldersChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({
  folders,
  onFoldersChange,
}: FolderTreeProps) {
  const rootFolders = useMemo(() => {
    return folders
      .filter(
        (folder) =>
          folder.parent_id === null,
      )
      .sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
  }, [folders]);

  if (rootFolders.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Nenhuma pasta criada ainda.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {rootFolders.map((folder) => (
        <FolderTreeNode
          key={folder.folder_id}
          folder={folder}
          folders={folders}
          onFoldersChange={onFoldersChange}
        />
      ))}
    </div>
  );
}