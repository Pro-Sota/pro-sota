"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Overview", href: "/management" },
    { name: "Projects", href: "/management/projects" },
    { name: "Communication", href: "/management/communication" },
    { name: "Clients", href: "/management/clients" },
    { name: "Design and Drawing", href: "/management/design-and-drawing" },
    { name: "Team", href: "/management/team" },
    { name: "Tasks and Schedule", href: "/management/tasks-and-schedule" },
    { name: "Finance", href: "/management/finances" },
    { name: "Documents & Reports", href: "/management/documents-and-reports" },
    { name: "Construction Administration", href: "/management/construction-administration" },
    { name: "Settings", href: "/management/settings" },
];

export default function ManagementMenu() {
    const pathname = usePathname();
    
    return (
        <nav className="fixed bg-neutral-700 text-white px-4 w-[250px] flex flex-col items-start min-h-screen">
            <div className="flex justify-start items-start mb-4 mt-2 w-full">
                <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={100}
                    height={100}
                    className="w-full h-auto"
                    loading="eager"
                    priority
                    quality={100}
                />
            </div>

            <ul className="flex flex-col  w-full">
                {menuItems.map((item) => {
                    const isActive =
                        item.href === "/management"
                            ? pathname === "/management"
                            : pathname.startsWith(item.href);

                    return (
                        <li
                            key={item.href}
                            className={`text-sm pl-2 transition-colors rounded-md ${
                                isActive
                                    ? "bg-gray-800"
                                    : ""
                            }`}
                        >
                            <Link
                                href={item.href}
                                className="block py-2 hover:text-gray-300"
                            >
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

