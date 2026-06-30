"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectSideBar({
    projectId,
}: {
    projectId: string
}) {
    const pathname = usePathname();

    const tabMenu = [
        { name: "Overview", href: `/management/projects/${projectId}/overview` },
        { name: "Documents", href: `/management/projects/${projectId}/documents` },
        { name: "Architecture", href: `/management/projects/${projectId}/architecture` },
        { name: "Construction", href: `/management/projects/${projectId}/construction` },
        { name: "Engineering", href: `/management/projects/${projectId}/engineering` },
        { name: "Fiscalization", href: `/management/projects/${projectId}/fiscalization` },
        { name: "Approvals and reviews", href: `/management/projects/${projectId}/approvals-and-reviews` },
        { name: "Tasks", href: `/management/projects/${projectId}/tasks` },
        { name: "Phases", href: `/management/projects/${projectId}/phases` },
        { name: "Team", href: `/management/projects/${projectId}/team` },
    ]

    return (
        <div className="flex py-2 px-8 border-b border-gray-200 ">
            <ul className="flex flex-row space-x-2">
                {tabMenu.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={
                                    pathname === item.href
                                        ? "block rounded bg-gray-600 p-2 text-white text-sm"
                                        : "block rounded hover:bg-gray-200 p-2 text-sm text-black "
                                }
                            >
                                {item.name}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}