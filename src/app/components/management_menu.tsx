"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Bell,
    CalendarCheck,
    Folder,
    Handshake,
    HomeIcon,
    LogOut,
    LucideIcon,
    MessageCircle,
    Settings,
    Sidebar,
    User,
    Users,
    UsersRound,
    WalletCards,
} from "lucide-react";

type SidebarItemProps = {
    item: {
        name: string;
        href: string;
        icon: LucideIcon;
    };
    active: boolean;
    expanded: boolean;
};

const topItems = [
    {
        name: "Meu perfil",
        href: "/management/profile",
        icon: User,
    },
    {
        name: "Minhas tarefas",
        href: "/management/my-tasks",
        icon: CalendarCheck,
    },
    {
        name: "Notificações",
        href: "/management/notifications",
        icon: Bell,
    },
];

const menuItems = [
    { name: "Overview", href: "/management", icon: HomeIcon },
    { name: "Projectos", href: "/management/projects", icon: Folder },
    { name: "Messages", href: "/management/messages", icon: MessageCircle },
    { name: "Clientes", href: "/management/clients", icon: Users },
    { name: "Sota Team", href: "/management/team", icon: UsersRound },
    { name: "Finanças", href: "/management/finances", icon: WalletCards },
    { name: "Fornecedores", href: "/management/suppliers", icon: Handshake },
];

const bottomItems = [
    { name: "Definições", href: "/management/settings", icon: Settings },
    { name: "Logout", href: "/management/log-out", icon: LogOut },
];

export default function ManagementMenu() {
    const pathname = usePathname();

    const [collapsed, setCollapsed] = useState(false);
    const [hovered, setHovered] = useState(false);

    // Sidebar expands if it's not collapsed OR when hovering while collapsed
    const expanded = !collapsed || hovered;

    const isActiveRoute = (href: string) =>
        href === "/management"
            ? pathname === href
            : pathname.startsWith(href);

    return (
        <nav
            onMouseEnter={() => collapsed && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col transition-all duration-300 ${expanded ? "w-64" : "w-20"
                }`}
        >
            {/* Header */}
            <div
                className={`h-20 border-b border-neutral-800 flex items-center ${expanded ? "justify-between px-4" : "justify-center"
                    }`}
            >
                {expanded && (
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={150}
                        height={60}
                        priority
                    />
                )}

                <button
                    onClick={() => setCollapsed((prev) => !prev)}
                    className="rounded-md p-2 text-gray-400 hover:bg-neutral-800 hover:text-white transition"
                >
                    <Sidebar size={18} />
                </button>
            </div>

            {/* Personal */}
            <div className="px-3 py-4 border-b border-neutral-800">
                {expanded && (
                    <p className="text-xs uppercase text-neutral-500 px-3 mb-2">
                        Personal
                    </p>
                )}

                <div className="space-y-1">
                    {topItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            item={item}
                            active={isActiveRoute(item.href)}
                            expanded={expanded}
                        />
                    ))}
                </div>
            </div>

            {/* Main Menu */}
            <div className="flex-1 px-3 py-6 space-y-1">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        item={item}
                        active={isActiveRoute(item.href)}
                        expanded={expanded}
                    />
                ))}
            </div>

            {/* Bottom */}
            <div className="border-t border-neutral-800 px-3 py-3 space-y-1">
                {bottomItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        item={item}
                        active={isActiveRoute(item.href)}
                        expanded={expanded}
                    />
                ))}
            </div>
        </nav>
    );
}

function SidebarItem({
    item,
    active,
    expanded,
}: SidebarItemProps) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center rounded-md transition-all duration-300 ${expanded ? "px-3 py-2 gap-3" : "justify-center p-3"
                } ${active
                    ? "bg-neutral-800 text-white border-l-4 border-yellow-500"
                    : "text-gray-300 hover:bg-neutral-800 hover:text-white"
                }`}
        >
            <Icon
                className={`h-5 w-5 flex-shrink-0 ${active ? "text-yellow-500" : "text-gray-400"
                    }`}
            />

            <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${expanded
                    ? "opacity-100 max-w-[180px]"
                    : "opacity-0 max-w-0"
                    }`}
            >
                {item.name}
            </span>
        </Link>
    );
}