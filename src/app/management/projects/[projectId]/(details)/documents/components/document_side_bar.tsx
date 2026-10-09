"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Archive, Clock, File, Folder } from "lucide-react";

import type { Database } from "@/app/lib/supabase/models";
import type { FolderItemType } from "../types";
import FolderItem from "./folder_item";

type FolderRow = Database["public"]["Tables"]["folders"]["Row"];

interface DocumentSidebarProps {
  projectId: string;
  view: "grid" | "list";
  folders: FolderRow[];
}

function createSlug(value: string): string {
  return value
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
}: DocumentSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const basePath = `/management/projects/${projectId}/documents`;

  const folderItems = useMemo<FolderItemType[]>(() => {
    const buildTree = (
      parentId: string | null,
      parentPath = "",
    ): FolderItemType[] =>
      folders
        .filter((folder) => (folder.parent_id ?? null) === parentId)
        .sort((a, b) => {
          const orderDifference =
            (a.sort_order ?? 0) - (b.sort_order ?? 0);

          return orderDifference || a.name.localeCompare(b.name);
        })
        .map((folder) => {
          const slug = folder.slug?.trim() || createSlug(folder.name);
          const path = parentPath ? `${parentPath}/${slug}` : slug;

          return {
            id: folder.folder_id,
            name: folder.name,
            href: `${basePath}/${path}?view=${view}`,
            icon: Folder,
            children: buildTree(folder.folder_id, path),
          };
        });

    return buildTree(null);
  }, [folders, basePath, view]);

  const menuItems = useMemo(
    () => [
      {
        id: "all-files",
        name: "Todos os documentos",
        href: `${basePath}?view=${view}`,
        icon: File,
      },
      {
        id: "recents",
        name: "Recentes",
        href: `${basePath}/recents?view=${view}`,
        icon: Clock,
      },
    ],
    [basePath, view],
  );

  const bottomItems = useMemo(
    () => [
      {
        id: "archive",
        name: "Arquivo",
        href: `${basePath}/archive?view=${view}`,
        icon: Archive,
      },
    ],
    [basePath, view],
  );

  function normalizePath(value: string) {
    return value.split("?")[0].replace(/\/+$/, "") || "/";
  }

  const currentPath = normalizePath(pathname);

  function isActive(href: string) {
    return currentPath === normalizePath(href);
  }

  function isFolderExpanded(item: FolderItemType) {
    const target = normalizePath(item.href);

    return (
      currentPath === target ||
      currentPath.startsWith(`${target}/`)
    );
  }

  function linkClass(href: string) {
    return [
      "flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
      isActive(href)
        ? "bg-[#BD9655] text-[#002950]"
        : "text-gray-700 hover:bg-gray-100",
    ].join(" ");
  }

  function navigate(href: string) {
    router.push(href);
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <nav className="flex min-h-0 flex-1 flex-col px-4 py-3">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Documentos
        </p>

        <ul className="space-y-1">
          {menuItems.map(({ id, name, href, icon: Icon }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => navigate(href)}
                className={linkClass(href)}
                aria-current={isActive(href) ? "page" : undefined}
              >
                <Icon
                  className="mr-2 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{name}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-gray-200" />

        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Pastas do projecto
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {folderItems.length > 0 ? (
            <ul className="space-y-1">
              {folderItems.map((item) => (
                <FolderItem
                  key={item.id}
                  folder={item}
                  expanded={isFolderExpanded(item)}
                  isExpanded={isFolderExpanded}
                  onSelected={navigate}
                />
              ))}
            </ul>
          ) : (
            <p className="px-2 py-3 text-xs text-gray-400">
              Nenhuma pasta disponível.
            </p>
          )}
        </div>
      </nav>

      <div className="shrink-0 px-4">
        <div className="border-t border-gray-200 py-3">
          <ul className="space-y-1">
            {bottomItems.map(({ id, name, href, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => navigate(href)}
                  className={linkClass(href)}
                  aria-current={isActive(href) ? "page" : undefined}
                >
                  <Icon
                    className="mr-2 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
