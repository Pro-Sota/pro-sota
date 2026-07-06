"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Star,
  Folder,
  File,
  Archive,
  Trash,
} from "lucide-react";


interface ProjectSidebarProps {
  projectId: string;
}

export default function DocumentSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  const base = `/management/projects/${projectId}/documents`;

  const menuItems = [
    { name: "Todos os documentos", href: `${base}/all-files`, icon: File },
    { name: "Recentes", href: `${base}/recents`, icon: Clock },
    { name: "Favoritos", href: `${base}/favorites`, icon: Star },
  ];

  const foldersItem = [
    {
      name:"Architecture",
      href: `${base}/architecture`,
      icon: Folder
    },
    {
      name:"Construction",
      href: `${base}/construction`,
      icon: Folder
    },
    {
      name:"Engineering",
      href: `${base}/engineering`,
      icon: Folder
    }
  ]

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
            {foldersItem.map(({ name, href, icon: Icon }) => (
              <Link key={name} href={href} className={linkClass(href)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{name}</span>
              </Link>
            ))}
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
