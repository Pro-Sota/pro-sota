"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Star,
  File,
  Archive,
  Folder,
  DraftingCompass,
  HardHat,
  Building2,
  ChevronRight,
  ChevronDown,
  FileCheck,
  ChartColumn,
} from "lucide-react";

import { FolderItemType } from "../types";
import FolderItem from "./folder_item";

interface ProjectSidebarProps {
  projectId: string;
}

export default function DocumentSidebar({
  projectId,
}: ProjectSidebarProps) {
  const pathname = usePathname();
  
  const base =
    `/management/projects/${projectId}/documents`;


  const menuItems = [
    {
      name: "Todos os documentos",
      href: `${base}/all-files`,
      icon: File,
    },
    {
      name: "Recentes",
      href: `${base}/recents`,
      icon: Clock,
    },
    {
      name: "Favoritos",
      href: `${base}/favorites`,
      icon: Star,
    },
  ];


  const foldersItem: FolderItemType[] = [
    {
      name: "Arquitectura",
      href: `${base}/architecture`,
      icon: DraftingCompass,
      children: [
        {
          name: "Estudos",
          href: `${base}/architecture/studies`,
          icon: Folder,
        },
        {
          name: "Plantas",
          href: `${base}/architecture/plants`,
          icon: Folder,
        },
        {
          name: "Renders",
          href: `${base}/architecture/renders`,
          icon: Folder,
        },
      ],
    },

    {
      name: "Engenharia",
      href: `${base}/engineering`,
      icon: Building2,
      children: [
        {
          name: "Memória de Cálculo",
          href:
            `${base}/engineering/calculation-memory`,
          icon: Folder,
        },
        {
          name: "Plantas",
          href:
            `${base}/engineering/plants`,
          icon: Folder,
        },
      ],
    },


    {
      name: "Construção",
      href: `${base}/construction`,
      icon: HardHat,
      children: [
        {
          name: "Cronograma",
          href:
            `${base}/construction/chronogram`,
          icon: Folder,
        },
        {
          name: "Plano de obra",
          href:
            `${base}/construction/work-plan`,
          icon: Folder,
        },
        {
          name: "Relatório diário de obra",
          href:
            `${base}/construction/daily-work-report`,
          icon: Folder,
        },
        {
          name: "Relatório Fotográfico",
          href:
            `${base}/construction/photographic-report`,
          icon: Folder,
        },
        {
          name: "Requisição",
          href:
            `${base}/construction/requisition`,
          icon: Folder,
        },
      ],
    },


    {
      name: "Fiscalização",
      href: `${base}/inspection`,
      icon: FileCheck,
      children: [],
    },


    {
      name: "Orçamento",
      href: `${base}/budget`,
      icon: ChartColumn,
      children: [],
    },
  ];

  const bottomItems = [
    {
      name: "Archive",
      href: `${base}/archive`,
      icon: Archive,
    },
  ];

  const linkClass = (href: string) => `
    flex items-center rounded-md p-2 transition-colors
    ${
      pathname.startsWith(href)
        ? "bg-slate-500 text-white"
        : "text-gray-800 hover:bg-gray-200"
    }
  `;

  return (
    <aside
      className="
        flex h-full w-64 flex-shrink-0 flex-col
        border-r border-gray-300
        px-4 py-2 text-sm
      "
    >
      <nav className="flex-1">
        <p className="mb-2 text-xs font-semibold text-gray-500">
          DOCUMENTS
        </p>

        <ul className="space-y-1">
          {menuItems.map(
            ({ name, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={linkClass(href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {name}
                </Link>
              </li>
            )
          )}
        </ul>

        <hr className="my-4 border-gray-300" />

        <p className="mb-2 text-xs font-semibold text-gray-500">
          Pastas do projecto
        </p>

        <ul className="space-y-1">
          {foldersItem.map((folder) => (
            <FolderItem
              key={folder.href}
              folder={folder}
            />
          ))}
        </ul>
      </nav>

      <div>
        <hr className="my-4 border-gray-300" />
        <ul className="space-y-1 pb-2">
          {bottomItems.map(
            ({ name, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={linkClass(href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {name}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </aside>
  );
}