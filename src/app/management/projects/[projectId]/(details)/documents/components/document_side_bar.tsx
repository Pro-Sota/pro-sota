"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Clock,
  File,
  Archive,
  Folder,
  DraftingCompass,
  HardHat,
  Building2,
  FileCheck,
  ChartColumn,
} from "lucide-react";

import { FolderItemType } from "../types";
import FolderItem from "./folder_item";
import { useMemo } from "react";
interface ProjectSidebarProps {
  projectId: string;
  view: string;
}


export default function DocumentSidebar({
  projectId,
  view,
}: ProjectSidebarProps) {

  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (href: string) => {
    router.push(href);
  };

  const base = `/management/projects/${projectId}/documents`;

  const getHref = (path: string) => {
    return `${base}/${path}?view=${view}`;
  };

  const menuItems = useMemo(() => [
    {
      id: "all-files",
      name: "Todos os documentos",
      href: getHref("all-files"),
      icon: File,
    },
    {
      id: "recents",
      name: "Recentes",
      href: getHref("recents"),
      icon: Clock,
    }
  ], [projectId, view]);


  const foldersItem: FolderItemType[] = useMemo(() => [
    {
      id: "architecture",
      name: "Arquitectura",
      href: `${base}/architecture?view=${view}`,
      icon: DraftingCompass,
      children: [
        {
          id: "studies",
          name: "Estudos",
          href: `${base}/architecture/studies?view=${view}`,
          icon: Folder,
        },
        {
          id: "plants",
          name: "Plantas",
          href: `${base}/architecture/plants?view=${view}`,
          icon: Folder,
        },
        {
          id: "renders",
          name: "Renders",
          href: `${base}/architecture/renders?view=${view}`,
          icon: Folder,
        },
      ],
    },
    {
      id: "engineering",
      name: "Engenharia",
      href: `${base}/engineering?view=${view}`,
      icon: Building2,
      children: [
        {
          id: "memory-calculation",
          name: "Memória de Cálculo",
          href:
            `${base}/engineering/memory-calculation?view=${view}`,
          icon: Folder,

        },
        {
          id: "plants",
          name: "Plantas",
          href:
            `${base}/engineering/plants?view=${view}`,
          icon: Folder,
        },
      ],
    },
    {
      id: "construction",
      name: "Construção",
      href: `${base}/construction?view=${view}`,
      icon: HardHat,
      children: [
        {
          id: "chronogram",
          name: "Cronograma",
          href:
            `${base}/construction/chronogram?view=${view}`,
          icon: Folder,
        },
        {
          id: "work-plan",
          name: "Plano de obra",
          href:
            `${base}/construction/work-plan?view=${view}`,
          icon: Folder,
        },
        {
          id: "daily-work-report",
          name: "Relatório diário de obra",
          href:
            `${base}/construction/daily-work-report?view=${view}`,
          icon: Folder,
        },
        {
          id: "photographic-report",
          name: "Relatório Fotográfico",
          href:
            `${base}/construction/photographic-report?view=${view}`,
          icon: Folder,
        },
        {
          id: "requisition",
          name: "Requisição",
          href:
            `${base}/construction/requisition?view=${view}`,
          icon: Folder,
        },
      ],
    },
    {
      id: "inspection",
      name: "Fiscalização",
      href: `${base}/inspection?view=${view}`,
      icon: FileCheck,
      children: [],
    },
    {
      id: "budget",
      name: "Orçamento",
      href: `${base}/budget?view=${view}`,
      icon: ChartColumn,
      children: [],
    },
  ], [projectId, view]);

  const bottomItems = useMemo(() => [
    {
      id: "archive",
      name: "Archive",
      href: `${base}/archive?view=${view}`,
      icon: Archive,
    },
  ], [projectId, view]);

  const linkClass = (href: string, id: string) => `
  flex w-full items-center rounded-md p-2 transition-colors cursor-pointer
  ${isActive(href)
      ? "bg-slate-500 text-white"
      : "text-gray-800 hover:bg-gray-200"
    }
`;



  const isExpanded = (folder: FolderItemType) => {
    const folderPath = folder.href.split("?")[0];
    return pathname.startsWith(folderPath);
  };

  const isActive = (href: string) => {
    const path = href.split("?")[0];

    return pathname === path;
  };

  

  return (
    <aside
      className="
        flex h-full w-64 flex-shrink-0 flex-col
        border-r border-gray-300
        px-4 py-2 text-sm bg-white
      "
    >
      <nav className="flex-1">
        <p className="mb-2 text-xs font-semibold text-gray-500">
          Documentos
        </p>

        <ul className="space-y-1">
          {menuItems.map(
            ({ id, name, href, icon: Icon }) => (
              <li key={href}>
                <button
                  className={linkClass(href, id)}
                  onClick={() => handleSelect(href)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {name}
                </button>
              </li>
            ))}
        </ul>

        <hr className="my-4 border-gray-300" />

        <p className="mb-2 text-xs font-semibold text-gray-500">
          Pastas do projecto
        </p>

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
      </nav>

      <div>
        <hr className="my-4 border-gray-300" />

        <ul className="space-y-1 pb-2">
          {bottomItems.map(({ id, name, href, icon: Icon }) => (
            <li key={id}>
              <button
                className={linkClass(href, id)}
                onClick={() => handleSelect(href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}