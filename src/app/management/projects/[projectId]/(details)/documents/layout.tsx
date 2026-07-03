"use client";

import { use, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Star,
  Folder,
  File,
  Archive,
  Trash,
  Grid,
  List,
} from "lucide-react";

import CreateFolderDialog from "./components/create_folder_dialog";

interface ProjectSidebarProps {
  projectId: string;
}

function DocumentSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  const base = `/management/projects/${projectId}/documents`;

  const menuItems = [
    { name: "Todos os documentos", href: `${base}/all-files`, icon: File },
    { name: "Recentes", href: `${base}/recents`, icon: Clock },
    { name: "Favoritos", href: `${base}/favorites`, icon: Star },
  ];

  const folderItem = {
    name: "Folders",
    href: `${base}/folders`,
    icon: Folder,
  };

  const bottomItems = [
    { name: "Archive", href: `${base}/archive`, icon: Archive },
    { name: "Trash", href: `${base}/trash-files`, icon: Trash },
  ];

  const linkClass = (href: string) =>
    `flex items-center rounded-md p-2 transition-colors ${
      isActive(href)
        ? "bg-blue-500 text-white"
        : "text-gray-800 hover:bg-gray-200"
    }`;

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-300 px-4 py-2 text-sm">
      <nav aria-label="Project documents" className="flex-1">
        <ul className="space-y-1">
          {menuItems.map(({ name, href, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={linkClass(href)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-gray-300" />

        <ul>
          <li>
            <Link href={folderItem.href} className={linkClass(folderItem.href)}>
              <folderItem.icon className="mr-2 h-4 w-4" />
              <span>{folderItem.name}</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div>
        <hr className="my-4 border-gray-300" />
        <ul className="space-y-1 pb-4">
          {bottomItems.map(({ name, href, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={linkClass(href)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default function DocumentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <div className="flex w-full overflow-hidden">
      <DocumentSidebar projectId={projectId} />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition ${
                view === "list"
                  ? "bg-slate-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>

            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition ${
                view === "grid"
                  ? "bg-slate-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <Grid className="h-4 w-4" />
              Grid
            </button>
          </div>

          <CreateFolderDialog />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          {children}
        </div>
      </main>
    </div>
  );
}