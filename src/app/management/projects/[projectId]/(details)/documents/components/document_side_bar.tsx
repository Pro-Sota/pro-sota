// DocumentSidebar.tsx

"use client";

import { useMemo, useState } from "react";
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

function createSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DocumentSidebar({
  projectId,
  view,
  folders,
}: ProjectSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const basePath = `/management/projects/${projectId}/documents`;

  const navigate = (href: string) => {
    router.push(href);
  };

  /*
   * Build the complete folder tree.
   *
   * Important:
   * Do NOT rely exclusively on folder.slug.
   * Existing database folders may have a NULL slug.
   *
   * In that case we generate a URL-safe slug from the folder name.
   */
  const folderItems = useMemo<FolderItemType[]>(() => {
    if (!folders?.length) {
      return [];
    }

    const folderSlugMap = new Map<string, string>();

    for (const folder of folders) {
      folderSlugMap.set(
        folder.folder_id,
        folder.slug?.trim() || createSlug(folder.name),
      );
    }

    const buildTree = (
      parentId: string | null,
      parentPath = "",
    ): FolderItemType[] => {
      return folders
        .filter((folder) => {
          return (folder.parent_id ?? null) === parentId;
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
          const slug =
            folderSlugMap.get(folder.folder_id) ||
            createSlug(folder.name);

          const currentPath = parentPath
            ? `${parentPath}/${slug}`
            : slug;

          return {
            id: folder.folder_id,
            name: folder.name,
            href: `${basePath}/${currentPath}?view=${view}`,
            icon: Folder,
            children: buildTree(folder.folder_id, currentPath),
          };
        });
    };

    return buildTree(null);
  }, [folders, basePath, view]);

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

  const getPath = (href: string) => {
    return href.split("?")[0].replace(/\/+$/, "") || "/";
  };

  const currentPath = getPath(pathname);

  const isActive = (href: string) => {
    const targetPath = getPath(href);

    return currentPath === targetPath;
  };


  const isFolderExpanded = (folder: FolderItemType) => {
    const folderPath = getPath(folder.href);

    if (currentPath === folderPath) {
      return true;
    }

    return currentPath.startsWith(`${folderPath}/`);
  };

  const getLinkClass = (href: string) => {
    const active = isActive(href);

    return [
      "flex w-full items-center rounded-md px-2 py-2",
      "text-sm transition-colors",
      "focus:outline-none focus-visible:ring-2",
      "focus-visible:ring-slate-400",
      active
        ? "bg-[#BD9655] text-[#002950]"
        : "text-gray-700 hover:bg-gray-100",
    ].join(" ");
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
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
                  aria-current={active ? "page" : undefined}
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