"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  Clock,
  File,
  Folder,
} from "lucide-react";

import { Database } from "@/app/lib/supabase/models";
import { FolderItemType } from "../types";
import FolderItem from "./folder_item";

type Folder = Database["public"]["Tables"]["folders"]["Row"];

interface ProjectSidebarProps {
  projectId: string;
  view: string;
  folders: Folder[];
}

export default function DocumentSidebar({
  projectId,
  view,
  folders,
}: ProjectSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const base = `/management/projects/${projectId}/documents`;

  /*
   * ---------------------------------------------------------
   * Navigation
   * ---------------------------------------------------------
   */

  const handleSelect = (href: string) => {
    router.push(href);
  };

  /*
   * ---------------------------------------------------------
   * Build folder tree
   *
   * Database structure:
   *
   * Architecture
   *   ├── Estudos
   *   ├── Plantas
   *   └── Renders
   *
   * The database stores folders as a flat array and uses
   * parent_id to define the hierarchy.
   *
   * The generated URLs follow the hierarchy:
   *
   * /documents/architecture
   * /documents/architecture/estudos
   * /documents/architecture/plantas
   * ---------------------------------------------------------
   */

  const foldersItem: FolderItemType[] = useMemo(() => {
    const buildTree = (
      parentFolderId: string | null,
      parentPath = "",
    ): FolderItemType[] => {
      return folders
        .filter((folder) => folder.parent_id === parentFolderId)
        .sort((a, b) => {
          const aOrder = a.sort_order ?? 0;
          const bOrder = b.sort_order ?? 0;

          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }

          return a.name.localeCompare(b.name);
        })
        .map((folder) => {
          const currentPath = parentPath
            ? `${parentPath}/${folder.slug}`
            : folder.slug;

          return {
            id: folder.folder_id,
            name: folder.name,
            href: `${base}/${currentPath}?view=${view}`,
            icon: Folder,
            children: buildTree(
              folder.folder_id,
              currentPath ?? "",
            ),
          };
        });
    };

    return buildTree(null);
  }, [folders, base, view]);

  /*
   * ---------------------------------------------------------
   * Main document navigation
   *
   * IMPORTANT:
   *
   * "Todos os documentos" uses the base /documents route.
   *
   * We do NOT create:
   *
   * /documents/all-files
   *
   * because "all files" is the default document view.
   * ---------------------------------------------------------
   */

  const menuItems = useMemo(
    () => [
      {
        id: "all-files",
        name: "Todos os documentos",
        href: `${base}?view=${view}`,
        icon: File,
      },
      {
        id: "recents",
        name: "Recentes",
        href: `${base}/recents?view=${view}`,
        icon: Clock,
      },
    ],
    [base, view],
  );

  /*
   * ---------------------------------------------------------
   * Bottom navigation
   * ---------------------------------------------------------
   */

  const bottomItems = useMemo(
    () => [
      {
        id: "archive",
        name: "Arquivo",
        href: `${base}/archive?view=${view}`,
        icon: Archive,
      },
    ],
    [base, view],
  );

  /*
   * ---------------------------------------------------------
   * Normalize route
   *
   * Removes query parameters and trailing slashes so that:
   *
   * /documents
   * /documents/
   * /documents?view=list
   *
   * are treated consistently.
   * ---------------------------------------------------------
   */

  const normalizePath = (path: string) => {
    if (!path) {
      return "/";
    }

    const normalized = path.split("?")[0];

    if (normalized.length > 1) {
      return normalized.replace(/\/+$/, "");
    }

    return normalized;
  };

  const currentPath = normalizePath(pathname);

  /*
   * ---------------------------------------------------------
   * Active route
   *
   * Exact match only.
   *
   * This is important because:
   *
   * /documents
   *
   * must NOT become active when we are inside:
   *
   * /documents/architecture
   * ---------------------------------------------------------
   */

  const isActive = (href: string) => {
    const targetPath = normalizePath(href);

    return currentPath === targetPath;
  };

  /*
   * ---------------------------------------------------------
   * Expanded folder
   *
   * A folder is expanded when the current route is:
   *
   * /documents/architecture
   *
   * OR a child route:
   *
   * /documents/architecture/plants
   *
   * OR a deeper route:
   *
   * /documents/architecture/plants/render-01
   *
   * ---------------------------------------------------------
   */

  const isExpanded = (folder: FolderItemType) => {
    const folderPath = normalizePath(folder.href);

    return (
      currentPath === folderPath ||
      currentPath.startsWith(`${folderPath}/`)
    );
  };

  /*
   * ---------------------------------------------------------
   * Navigation button styles
   * ---------------------------------------------------------
   */

  const linkClass = (href: string) => {
    const active = isActive(href);

    return [
      "flex w-full items-center rounded-md p-2",
      "text-sm transition-colors cursor-pointer",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
      active
        ? "bg-slate-500 text-white"
        : "text-gray-800 hover:bg-gray-200",
    ].join(" ");
  };

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <aside
      className="
        flex h-full w-64 shrink-0 flex-col
        border-r border-gray-300
        bg-white
        px-4 py-2
        text-sm
      "
    >
      {/* --------------------------------------------------- */}
      {/* DOCUMENT NAVIGATION */}
      {/* --------------------------------------------------- */}

      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <p className="mb-2 shrink-0 text-xs font-semibold text-gray-500">
          Documentos
        </p>

        <ul className="shrink-0 space-y-1">
          {menuItems.map(
            ({ id, name, href, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  className={linkClass(href)}
                  onClick={() => handleSelect(href)}
                >
                  <Icon className="mr-2 h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {name}
                  </span>
                </button>
              </li>
            ),
          )}
        </ul>

        <hr className="my-4 shrink-0 border-gray-300" />

        {/* ------------------------------------------------- */}
        {/* PROJECT FOLDERS */}
        {/* ------------------------------------------------- */}

        <p className="mb-2 shrink-0 text-xs font-semibold text-gray-500">
          Pastas do projecto
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {foldersItem.length > 0 ? (
            <ul className="space-y-1">
              {foldersItem.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  expanded={isExpanded(folder)}
                  isExpanded={isExpanded}
                  onSelected={handleSelect}
                />
              ))}
            </ul>
          ) : (
            <div className="px-2 py-3 text-xs text-gray-400">
              Nenhuma pasta disponível.
            </div>
          )}
        </div>
      </nav>

      {/* --------------------------------------------------- */}
      {/* BOTTOM NAVIGATION */}
      {/* --------------------------------------------------- */}

      <div className="shrink-0">
        <hr className="my-4 border-gray-300" />

        <ul className="space-y-1 pb-2">
          {bottomItems.map(
            ({ id, name, href, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  className={linkClass(href)}
                  onClick={() => handleSelect(href)}
                >
                  <Icon className="mr-2 h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {name}
                  </span>
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
    </aside>
  );
}