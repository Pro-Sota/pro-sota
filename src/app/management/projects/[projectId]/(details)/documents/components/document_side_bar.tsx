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

type FolderRow = Database["public"]["Tables"]["folders"]["Row"];

interface ProjectSidebarProps {
  projectId: string;
  view: string;
  folders: FolderRow[];
}

export default function DocumentSidebar({
  projectId,
  view,
  folders,
}: ProjectSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const basePath = `/management/projects/${projectId}/documents`;

  /*
   * ---------------------------------------------------------
   * Navigation
   * ---------------------------------------------------------
   */

  const navigate = (href: string) => {
    router.push(href);
  };

  /*
   * ---------------------------------------------------------
   * Build folder tree
   *
   * Database:
   *
   * parent_id
   * folder_id
   * slug
   *
   * Result:
   *
   * /documents/projects
   * /documents/projects/drawings
   * /documents/projects/drawings/floor-plans
   * ---------------------------------------------------------
   */

  const folderItems = useMemo<FolderItemType[]>(() => {
    if (!folders?.length) {
      return [];
    }

    const buildTree = (
      parentId: string | null,
      parentPath: string = "",
    ): FolderItemType[] => {
      return folders
        .filter((folder) => {
          const folderParentId = folder.parent_id ?? null;
          return folderParentId === parentId;
        })
        .sort((a, b) => {
          const orderA = a.sort_order ?? 0;
          const orderB = b.sort_order ?? 0;

          if (orderA !== orderB) {
            return orderA - orderB;
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
            href: `${basePath}/${currentPath}?view=${view}`,
            icon: Folder,

            children: buildTree(
              folder.folder_id,
              currentPath ?? "",
            ),
          };
        });
    };

    return buildTree(null);
  }, [folders, basePath, view]);

  /*
   * ---------------------------------------------------------
   * Main navigation
   * ---------------------------------------------------------
   */

  const menuItems = useMemo(
    () => [
      {
        id: "all-files",
        name: "Todos os documentos",
        href: basePath,
        icon: File,
      },
      {
        id: "recents",
        name: "Recentes",
        href: `${basePath}/recents`,
        icon: Clock,
      },
    ],
    [basePath],
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
        href: `${basePath}/archive`,
        icon: Archive,
      },
    ],
    [basePath],
  );

  /*
   * ---------------------------------------------------------
   * URL helpers
   *
   * pathname from Next.js does NOT contain ?view=...
   *
   * Example:
   *
   * pathname:
   * /management/projects/123/documents
   *
   * href:
   * /management/projects/123/documents?view=list
   *
   * We therefore always compare pathname values.
   * ---------------------------------------------------------
   */

  const getPath = (href: string) => {
    return href.split("?")[0].replace(/\/+$/, "") || "/";
  };

  const currentPath = getPath(pathname);

  /*
   * ---------------------------------------------------------
   * Active navigation
   * ---------------------------------------------------------
   */

  const isActive = (href: string) => {
    const targetPath = getPath(href);

    return currentPath === targetPath;
  };

  /*
   * ---------------------------------------------------------
   * Folder expansion
   *
   * Example:
   *
   * Current:
   * /documents/design/drawings
   *
   * Parent:
   * /documents/design
   *
   * => expanded
   *
   * But:
   *
   * /documents/design-archive
   *
   * should NOT expand /documents/design.
   * ---------------------------------------------------------
   */

  const isFolderExpanded = (folder: FolderItemType) => {
    const folderPath = getPath(folder.href);

    if (currentPath === folderPath) {
      return true;
    }

    return currentPath.startsWith(`${folderPath}/`);
  };

  /*
   * ---------------------------------------------------------
   * Classes
   * ---------------------------------------------------------
   */

  const getLinkClass = (href: string) => {
    const active = isActive(href);

    return [
      "flex w-full items-center rounded-md px-2 py-2",
      "text-sm transition-colors",
      "focus:outline-none focus-visible:ring-2",
      "focus-visible:ring-slate-400",

      active
        ? "bg-slate-600 text-white"
        : "text-gray-700 hover:bg-gray-100",
    ].join(" ");
  };

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* HEADER / MAIN NAV */}
      <nav className="flex min-h-0 flex-1 flex-col px-4 py-3">

        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Documentos
        </p>

        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`${item.href}?view=${view}`)
                  }
                  className={getLinkClass(item.href)}
                >
                  <Icon className="mr-2 h-4 w-4 shrink-0" />

                  <span className="truncate">
                    {item.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="my-4 border-t border-gray-200" />

        {/* FOLDERS */}

        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Pastas do projecto
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {folderItems.length > 0 ? (
            <ul className="space-y-1">
              {folderItems.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  expanded={isFolderExpanded(folder)}
                  isExpanded={isFolderExpanded}
                  onSelected={navigate}
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

      {/* BOTTOM */}

      <div className="shrink-0 px-4">
        <div className="border-t border-gray-200 py-3">
          <ul className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${item.href}?view=${view}`)
                    }
                    className={getLinkClass(item.href)}
                  >
                    <Icon className="mr-2 h-4 w-4 shrink-0" />

                    <span className="truncate">
                      {item.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
