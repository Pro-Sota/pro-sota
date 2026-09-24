"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
    CalendarDays,
    Clock3,
    Folder,
    Handshake,
    HomeIcon,
    ListTodo,
    LucideIcon,
    MessageCircle,
    Sidebar,
    User,
    UserPlus,
    Users,
    UsersRound,
    WalletCards,
} from "lucide-react";

import LogoutButton from "../(auth)/logout/page";

type SystemRole = "Superadmin" | "Admin" | "Director" | "Utilizador";

type SidebarItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    roles: SystemRole[];
};

type SidebarItemProps = {
    item: SidebarItem;
    active: boolean;
    expanded: boolean;
};

type Props = {
    collapsed: boolean;
    setCollapsedAction: (value: boolean) => void;
    userRole?: string | null;
};

const menuItems: SidebarItem[] = [
    {
        name: "Visão geral",
        href: "/management",
        icon: HomeIcon,
        roles: [ "Admin", "Director", "Utilizador"],
    },
    {
        name: "Leads",
        href: "/management/leads",
        icon: UserPlus,
        roles: ["Admin", "Director", "Utilizador"],
    },
    {
        name: "Projectos",
        href: "/management/projects",
        icon: Folder,
        roles: [ "Admin", "Director", "Utilizador"],
    },
    {
        name: "Tarefas",
        href: "/management/tasks",
        icon: ListTodo,
        roles: [ "Admin", "Director", "Utilizador"],
    },
    {
        name: "Calendário",
        href: "/management/calendar",
        icon: CalendarDays,
        roles: [ "Admin", "Director", "Utilizador"],
    },
    {
        name: "Mensagens",
        href: "/management/messages",
        icon: MessageCircle,
        roles: ["Admin", "Director", "Utilizador"],
    },
    {
        name: "Clientes",
        href: "/management/clients",
        icon: Users,
        roles: ["Admin", "Director"],
    },
    {
        name: "Equipa",
        href: "/management/team",
        icon: UsersRound,
        roles: ["Admin", "Director"],
    },
    {
        name: "Presença",
        href: "/management/attendance",
        icon: Clock3,
        roles: [ "Admin", "Director", "Utilizador"],
    },
    {
        name: "Recursos de obra",
        href: "/management/work-resources",
        icon: WalletCards,
        roles: ["Admin", "Director", "Utilizador"],
    },
    {
        name: "Fornecedores",
        href: "/management/suppliers",
        icon: Handshake,
        roles: [ "Admin", "Director"],
    },
];

const bottomItems: SidebarItem[] = [
    {
        name: "Meu perfil",
        href: "/management/profile",
        icon: User,
        roles: ["Admin", "Director", "Utilizador"],
    },
    {
        name: "Notificações",
        href: "/management/notifications",
        icon: Bell,
        roles: ["Admin", "Director", "Utilizador"],
    },
];

function normalizeRole(role?: string | null): SystemRole {
    const normalizedRole = role?.trim().toLowerCase();

    switch (normalizedRole) {
        case "admin":
        case "administrador":
        case "administrator":
            return "Admin";

        case "director":
        case "diretor":
            return "Director";

        case "utilizador":
        case "user":
        case "employee":
        case "utilizador normal":
            return "Utilizador";

        default:
            return "Utilizador";
    }
}

function canAccessItem(item: SidebarItem, role: SystemRole) {
    return item.roles.includes(role);
}

export default function ManagementMenu({
    collapsed,
    setCollapsedAction,
    userRole,
}: Props) {
    const pathname = usePathname();

    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const role = normalizeRole(userRole);

    console.log("Role: " + role);

    const isInsideProject =
        pathname.startsWith("/management/projects/") &&
        pathname !== "/management/projects/create-project";

    const isInsideChat = pathname.startsWith("/management/messages/");

    const shouldAutoCollapse = isInsideProject || isInsideChat;

    /*
     * The sidebar remains expanded when manually opened.
     * When collapsed, it temporarily expands on hover.
     * Project and chat pages keep the main sidebar collapsed because
     * those pages have their own internal navigation.
     */
    const expanded =
        !shouldAutoCollapse && (!collapsed || hovered);

    const visibleMenuItems = menuItems.filter((item) =>
        canAccessItem(item, role),
    );

    const visibleBottomItems = bottomItems.filter((item) =>
        canAccessItem(item, role),
    );

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();

        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

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
            aria-label="Navegação principal"
            onMouseEnter={() => {
                if (collapsed && !shouldAutoCollapse) {
                    setHovered(true);
                }
            }}
            onMouseLeave={() => {
                setHovered(false);
            }}
            className={`fixed z-50 hidden h-screen flex-col overflow-y-auto border-r border-[#BD9655] bg-[#F7F7F5] transition-all duration-300 md:flex ${
                expanded ? "w-64" : "w-20"
            }`}
        >
            {/* Header */}
            <div
                className={`flex h-20 shrink-0 items-center border-b border-[#BD9655] ${
                    expanded
                        ? "justify-between px-4"
                        : "justify-center px-2"
                }`}
            >
                {expanded && (
                    <Link
                        href="/management"
                        aria-label="Ir para a visão geral"
                        className="min-w-0"
                    >
                        <Image
                            src="/images/logo.png"
                            alt="Pro-Sota"
                            width={150}
                            height={60}
                            priority
                            className="h-auto max-w-full object-contain"
                        />
                    </Link>
                )}

                <button
                    type="button"
                    onClick={() => {
                        if (!shouldAutoCollapse) {
                            setHovered(false);
                            setCollapsedAction(!collapsed);
                        }
                    }}
                    disabled={shouldAutoCollapse}
                    aria-label={
                        expanded
                            ? "Recolher menu"
                            : "Expandir menu"
                    }
                    aria-expanded={expanded}
                    className="rounded-md p-2 text-gray-400 transition hover:bg-[#BD9655] hover:text-[#002950] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Sidebar size={18} />
                </button>
            </div>

            {/* Main Menu */}
            <div className="flex-1 space-y-1 px-3 py-6">
                {visibleMenuItems.map((item) => (
                    <SidebarItem
                        key={item.href}
                        item={item}
                        active={isActiveRoute(pathname, item.href)}
                        expanded={expanded}
                    />
                ))}
            </div>

            {/* Bottom Menu */}
            <div className="shrink-0 space-y-1 border-t border-[#BD9655] px-3 py-3">
                {visibleBottomItems.map((item) => (
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
    if (href === "/management") {
        return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
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
            title={!expanded ? item.name : undefined}
            className={`group flex min-w-0 items-center rounded-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 ${
                expanded
                    ? "gap-3 px-3 py-2"
                    : "justify-center p-3"
            } ${
                active
                    ? "border-l-4 border-[#BD9655] bg-[#BD9655] font-medium text-[#002950]"
                    : "font-medium text-gray-600 hover:bg-gray-100 hover:text-[#BD9655]"
            }`}
        >
            <Icon
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 transition-colors ${
                    active
                        ? "text-current"
                        : "text-gray-600 group-hover:text-[#BD9655]"
                }`}
            />

            <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    expanded
                        ? "max-w-[180px] opacity-100"
                        : "max-w-0 opacity-0"
                }`}
            >
                {item.name}
            </span>
        </Link>
    );
}