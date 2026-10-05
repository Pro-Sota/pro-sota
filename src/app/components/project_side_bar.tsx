"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProjectNavbarProps {
  projectId: string;
}

export default function ProjectNavbar({
  projectId,
}: ProjectNavbarProps) {
  const pathname = usePathname();

  const basePath = `/management/projects/${projectId}`;

  const tabMenu = [
    {
      name: "Overview",
      href: `${basePath}/overview`,
    },
    {
      name: "Fases",
      href: `${basePath}/phases`,
    },
    {
      name: "Tarefas",
      href: `${basePath}/tasks`,
    },
    {
      name: "Documentos",
      href: `${basePath}/documents?view=list`,
      matchPath: `${basePath}/documents`,
    },
    {
      name: "Aprovações e Comentários",
      href: `${basePath}/approvals-and-reviews`,
    },
    {
      name: "Equipa",
      href: `${basePath}/team`,
    },
  ];

  const isActive = (item: (typeof tabMenu)[number]) => {
    const pathToMatch = item.matchPath ?? item.href.split("?")[0];

    return (
      pathname === pathToMatch ||
      pathname.startsWith(`${pathToMatch}/`)
    );
  };

  return (
    <nav
      aria-label="Navegação do projecto"
      className="shrink-0 border-b border-gray-200 bg-white px-4"
    >
      <ul
        className="
          flex flex-row gap-2 overflow-x-auto
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {tabMenu.map((item) => {
          const active = isActive(item);

          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative block whitespace-nowrap px-3 py-3",
                  "text-sm font-medium transition-colors",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[#002950]",
                  "focus-visible:ring-offset-2",
                  active
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900",
                ].join(" ")}
              >
                {item.name}

                <span
                  aria-hidden="true"
                  className={[
                    "absolute inset-x-0 -bottom-px h-0.5 rounded-full",
                    "transition-colors",
                    active ? "bg-gray-900" : "bg-transparent",
                  ].join(" ")}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}