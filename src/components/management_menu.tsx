"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building, CalendarCheck, FileText, Folder, HomeIcon, Icon, MessageCircle, Pencil, Settings, Users, UsersRound, WalletCards } from "lucide-react";

const menuItems = [
    { name: "Overview", href: "/management", icon:<HomeIcon /> },
    { name: "Projects", href: "/management/projects", icon: <Folder /> },
    { name: "Communication", href: "/management/communication", icon:<MessageCircle /> },
    { name: "Clients", href: "/management/clients", icon: <Users /> },
    { name: "Design and Drawing", href: "/management/design-and-drawing", Icon:<Pencil /> },
    { name: "Team", href: "/management/team", icon:<UsersRound /> },
    { name: "Tasks and Schedule", href: "/management/tasks-and-schedule", icon:<CalendarCheck /> },
    { name: "Finance", href: "/management/finances", icon:<WalletCards /> },
    { name: "Documents & Reports", href: "/management/documents-and-reports", icon: <FileText /> },
    { name: "Construction Administration", href: "/management/construction-administration", icon: <Building /> },
    { name: "Settings", href: "/management/settings", icon: <Settings /> },
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

