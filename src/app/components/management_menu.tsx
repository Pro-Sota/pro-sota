"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Bell,
    Folder,
    Handshake,
    HomeIcon,
    LucideIcon,
    MessageCircle,
    Settings,
    Sidebar,
    User,
    Users,
    UsersRound,
    WalletCards,
} from "lucide-react";

import LogoutButton from "../(auth)/logout/page";

type SidebarItemProps = {
    item: {
        name: string;
        href: string;
        icon: LucideIcon;
    };
    active: boolean;
    expanded: boolean;
};

type Props = {
    collapsed: boolean;
    setCollapsedAction: (value: boolean) => void;
};

const menuItems = [
    { name: "Dashboard", href: "/management", icon: HomeIcon },
    { name: "Projectos", href: "/management/projects", icon: Folder },
    { name: "Messages", href: "/management/messages", icon: MessageCircle },
    { name: "Clientes", href: "/management/clients", icon: Users },
    { name: "Sota Team", href: "/management/team", icon: UsersRound },
    { name: "Equipamentos", href: "/management/equipments", icon: WalletCards },
    { name: "Fornecedores", href: "/management/suppliers", icon: Handshake },
];

const bottomItems = [
    {
        name: "Meu perfil",
        href: "/management/profile",
        icon: User,
    },
    {
        name: "Notificações",
        href: "/management/notifications",
        icon: Bell,
    },
    { name: "Definições", href: "/management/settings", icon: Settings },

];

export default function ManagementMenu({ collapsed, setCollapsedAction }: Props) {
    const pathname = usePathname();

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
            className={`z-100 h-screen fixed bg-neutral-900 border-r overflow-y-auto border-neutral-800 flex flex-col transition-all duration-300 ${expanded ? "w-64" : "w-20"
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
                    onClick={() => setCollapsedAction(!collapsed)}
                    className="rounded-md p-2 text-gray-400 hover:bg-neutral-800 hover:text-white transition"
                >
                    <Sidebar size={18} />
                </button>
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
                <LogoutButton expanded={expanded} />
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