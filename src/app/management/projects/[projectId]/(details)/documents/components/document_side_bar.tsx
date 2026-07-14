"use client";

import { useRouter } from "next/navigation";
import {
  Clock,
  Star,
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
import { useState } from "react";
interface ProjectSidebarProps {
  projectId: string;
  onSelected: (value: string) => void;
  selected: string;
}


export default function DocumentSidebar({
  projectId,
  selected,
  onSelected,
}: ProjectSidebarProps) {

  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);

const handleFolderToggle = (id: string) => {
  setExpandedFolder((prev) => (prev === id ? prev : id));
};

  const handleFolderSelect = (id: string, href: string) => {
    onSelected(id);
    window.history.replaceState({}, "", href);
  };

  const handleSelect = (id: string, href: string) => {
    onSelected(id);
    window.history.replaceState({}, "", href);
  }

  const base = `/management/projects/${projectId}/documents`;

  const menuItems = [
    {
      id: "all-files",
      name: "Todos os documentos",
      href: `${base}/all-files`,
      onSelect: () => onSelected("all-files"),
      icon: File,
    },
    {
      id: "recents",
      name: "Recentes",
      href: `${base}/recents`,
      onSelect: () => onSelected("recent"),
      icon: Clock,
    }
  ];

  const foldersItem: FolderItemType[] = [
    {
      id: "architecture",
      name: "Arquitectura",
      href: `${base}/architecture`,
      onSelect: () => onSelected("architecture"),
      icon: DraftingCompass,
      children: [
        {
          id: "studies",
          name: "Estudos",
          href: `${base}/architecture/studies`,
          onSelect: () => onSelected("studies"),
          icon: Folder,
        },
        {
          id: "plants",
          name: "Plantas",
          href: `${base}/architecture/plants`,
          onSelect: () => onSelected("plants"),
          icon: Folder,
        },
        {
          id: "renders",
          name: "Renders",
          href: `${base}/architecture/renders`,
          onSelect: () => onSelected("renders"),
          icon: Folder,
        },
      ],
    },
    {
      id: "engineering",
      name: "Engenharia",
      href: `${base}/engineering`,
      icon: Building2,
      onSelect: () => onSelected("engineering"),
      children: [
        {
          id: "memory-calculation",
          name: "Memória de Cálculo",
          href:
            `${base}/engineering/calculation-memory`,
          icon: Folder,
          onSelect: () => onSelected("calculation-memory"),

        },
        {
          id: "plants",
          name: "Plantas",
          href:
            `${base}/engineering/plants`,
          onSelect: () => onSelected("plants"),

          icon: Folder,
        },
      ],
    },
    {
      id: "construction",
      name: "Construção",
      href: `${base}/construction`,
      icon: HardHat,
      onSelect: () => onSelected("construction"),
      children: [
        {
          id: "chronogram",
          name: "Cronograma",
          href:
            `${base}/construction/chronogram`,
          onSelect: () => onSelected("chronogram"),

          icon: Folder,
        },
        {
          id: "work-plan",
          name: "Plano de obra",
          href:
            `${base}/construction/work-plan`,
          onSelect: () => onSelected("work-plan"),
          icon: Folder,
        },
        {
          id: "daily-work-report",
          name: "Relatório diário de obra",
          href:
            `${base}/construction/daily-work-report`,
          onSelect: () => onSelected("daily-work-report"),
          icon: Folder,
        },
        {
          id: "photographic-report",
          name: "Relatório Fotográfico",
          href:
            `${base}/construction/photographic-report`,
          onSelect: () => onSelected("photographic-report"),
          icon: Folder,
        },
        {
          id: "requisition",
          name: "Requisição",
          href:
            `${base}/construction/requisition`,
          onSelect: () => onSelected("requisition"),
          icon: Folder,
        },
      ],
    },
    {
      id: "inspection",
      name: "Fiscalização",
      href: `${base}/inspection`,
      icon: FileCheck,
      onSelect: () => onSelected("inspection"),
      children: [],
    },
    {
      id: "budget",
      name: "Orçamento",
      href: `${base}/budget`,
      icon: ChartColumn,
      onSelect: () => onSelected("budget"),
      children: [],
    },
  ];

  const bottomItems = [
    {
      id: "archive",
      name: "Archive",
      href: `${base}/archive`,
      onSelect: () => onSelected("archive"),
      icon: Archive,
    },
  ];

  const linkClass = (id: string, href: string) => `
  flex items-center rounded-md p-2 transition-colors cursor-pointer
  ${selected === id
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
          Documentos
        </p>

        <ul className="space-y-1">
          {menuItems.map(
            ({ id, name, href, icon: Icon }) => (
              <li key={href}>
                <button
                  className={linkClass(id, href)}
                  onClick={() => handleSelect(id, href)}
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
          <ul className="space-y-1">
            {foldersItem.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                selected={selected}
                expanded={expandedFolder === folder.id}
                onToggle={() => handleFolderToggle(folder.id)}
                onSelected={handleFolderSelect}
              />
            ))}
          </ul>
        </ul>
      </nav>

      <div>
        <hr className="my-4 border-gray-300" />

        <ul className="space-y-1 pb-2">
          {bottomItems.map(({ id, name, href, icon: Icon }) => (
            <li key={id}>
              <button
                className={linkClass(id, href)}
                onClick={() => handleSelect(id, href)}
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