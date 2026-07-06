"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProjectSideBarProps {
  projectId: string;
}

export default function ProjectNavbar({
  projectId,
}: ProjectSideBarProps) {
  const pathname = usePathname();

  const tabMenu = [
    {
      name: "Overview",
      href: `/management/projects/${projectId}/overview`,
    },
    {
      name: "Documents",
      href: `/management/projects/${projectId}/documents`,
    },
    {
      name: "Approvals and reviews",
      href: `/management/projects/${projectId}/approvals-and-reviews`,
    },
    {
      name: "Tasks",
      href: `/management/projects/${projectId}/tasks`,
    },
    {
      name: "Phases",
      href: `/management/projects/${projectId}/phases`,
    },
    {
      name: "Team",
      href: `/management/projects/${projectId}/team`,
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="shrink-0 border-b border-gray-200 px-8">
      <ul className="flex flex-row gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabMenu.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative block whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {item.name}
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-colors ${
                    active ? "bg-gray-900" : "bg-transparent"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}