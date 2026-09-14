"use client";

import { useState, useEffect } from "react";
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
    { name: "Visão geral", href: "/management", icon: HomeIcon },
    { name: "Projectos", href: "/management/projects", icon: Folder },
    { name: "Mensagens", href: "/management/messages", icon: MessageCircle },
    { name: "Clientes", href: "/management/clients", icon: Users },
    { name: "Equipa Sota", href: "/management/team", icon: UsersRound },
    {
        name: "Recursos de obra",
        href: "/management/work-resources",
        icon: WalletCards,
    },
    {
        name: "Fornecedores",
        href: "/management/suppliers",
        icon: Handshake,
    },
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
];

export default function ManagementMenu({
    collapsed,
    setCollapsedAction,
}: Props) {
    const pathname = usePathname();

    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    /*
     * A project page and a chat page have their own internal sidebar.
     * Keep the main management sidebar collapsed while inside them.
     */
    const isInsideProject =
        pathname.startsWith("/management/projects/") &&
        pathname !== "/management/projects/create-project";

    const isInsideChat =
        pathname.startsWith("/management/messages/");

    const shouldAutoCollapse = isInsideProject || isInsideChat;

    const expanded =
        !collapsed && !shouldAutoCollapse
            ? true
            : !collapsed && !shouldAutoCollapse
                ? true
                : hovered && !shouldAutoCollapse;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();

        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    /*
     * Automatically collapse the main sidebar when entering
     * a project or chat that has its own sidebar.
     */
    useEffect(() => {
        if (shouldAutoCollapse) {
            setCollapsedAction(true);
            setHovered(false);
        }
    }, [shouldAutoCollapse, setCollapsedAction]);

    if (isMobile) {
        return null;
    }

    return (
        <nav
            onMouseEnter={() => {
                if (collapsed && !shouldAutoCollapse) {
                    setHovered(true);
                }
            }}
            onMouseLeave={() => setHovered(false)}
            className={`hidden z-100 h-screen fixed border-r overflow-y-auto bg-[#F7F7F5] border-[#BD9655] flex-col transition-all duration-300 md:flex ${
                expanded ? "w-64" : "w-20"
            }`}
        >
            {/* Header */}
            <div
                className={`h-20 border-b border-[#BD9655] flex items-center ${
                    expanded
                        ? "justify-between px-4"
                        : "justify-center"
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
                    onClick={() => {
                        if (!shouldAutoCollapse) {
                            setCollapsedAction(!collapsed);
                        }
                    }}
                    aria-label={
                        expanded
                            ? "Recolher menu"
                            : "Expandir menu"
                    }
                    className="rounded-md p-2 text-gray-400 hover:bg-[#BD9655] hover:text-[#002950] transition"
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
                        active={isActiveRoute(pathname, item.href)}
                        expanded={expanded}
                    />
                ))}
            </div>

            {/* Bottom */}
            <div className="border-t border-[#BD9655] px-3 py-3 space-y-1">
                {bottomItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        item={item}
                        active={isActiveRoute(pathname, item.href)}
                        expanded={expanded}
                    />
                ))}

                <LogoutButton />
            </div>
        </nav>
    );
}

function isActiveRoute(pathname: string, href: string) {
    return href === "/management"
        ? pathname === href
        : pathname.startsWith(href);
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
            className={`group flex items-center rounded-md transition-all duration-300 ${
                expanded
                    ? "px-3 py-2 gap-3"
                    : "justify-center p-3"
            } ${
                active
                    ? "bg-[#BD9655] border-l-4 border-yellow text-[#002950] font-medium"
                    : "text-gray-600 hover:text-[#BD9655] font-medium"
            }`}
        >
            <Icon
                className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    active
                        ? "text-current"
                        : "text-gray-600 group-hover:text-[#BD9655]"
                }`}
            />

            <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    expanded
                        ? "opacity-100 max-w-[180px]"
                        : "opacity-0 max-w-0"
                }`}
            >
                {item.name}
            </span>
        </Link>
    );
}