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
        { name: "Timeline and milestone", href: `/management/projects/${projectId}/timeline-and-milestone` },
        { name: "Drawings and models", href: `/management/projects/${projectId}/drawings-and-models` },
        { name: "Approvals and reviews", href: `/management/projects/${projectId}/approvals-and-reviews` },
        { name: "Risk and issues", href: `/management/projects/${projectId}/risk-and-issues` },
        { name: "Tasks and workflow", href: `/management/projects/${projectId}/tasks-and-workflow` },
        { name: "Budget and financial", href: `/management/projects/${projectId}/budget-and-financial` },
        { name: "Phases", href: `/management/projects/${projectId}/phases` },
        { name: "Team", href: `/management/projects/${projectId}/team` },
        { name: "Site information", href: `/management/projects/${projectId}/site-information` }
    ]

    return (
        <div className="flex">
            <aside className="w-64 border-r p-4">
                <ul className="">
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
            </aside>
        </div>
    );
}