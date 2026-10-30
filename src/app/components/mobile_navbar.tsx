
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import {
    Menu,
    X,
    Loader2,
    House,
    UserPlus,
    FolderKanban,
    SquareCheck,
    CalendarDays,
    MessageCircle,
    Handshake,
    Clock3,
    HardHat,
    UserRound,
    Bell,
    LogOut,
    FileText,
    ContactRound,
    UsersRound,
    Settings,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { createClient } from "@/app/lib/supabase/client";
import { usePermissions } from "@/app/components/permission_provider";
import { useUnreadCounts } from "@/app/hooks/use_unread_counts";

import type { Permission } from "@/app/lib/permissions/types";
import type { UnreadCounts } from "@/app/hooks/use_unread_counts";

/* ==========================================================================
   TYPES
   ========================================================================== */

type Department =
    | "architecture"
    | "engineering"
    | "commercial"
    | "other";

type NavigationAccess = {
    departments?: Department[];
    grantedDepartments?: Department[];
    adminOnly?: boolean;
};

type NavigationItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    permission?: Permission;
    access?: NavigationAccess;
    action?: "logout";
    badgeKey?: keyof UnreadCounts;
};

type NavItemProps = {
    item: NavigationItem;
    active: boolean;
    badge?: number;
    onClick?: () => void;
    logoutLoading?: boolean;
};

interface Props {
    userRole?: string | number | null;
    userDepartment?: string | null;

    // Backward compatibility with the previous prop name.
    userDeparment?: string;
}

/* ==========================================================================
   MAIN NAVIGATION
   Same items and order as ManagementMenu.tsx
   ========================================================================== */

const menuItems: NavigationItem[] = [
    {
        name: "Visão geral",
        href: "/management",
        icon: House,
        permission: "dashboard.view",
    },
    {
        name: "Leads",
        href: "/management/leads",
        icon: UserPlus,
        permission: "leads.view",
        access: {
            departments: ["commercial"],
            grantedDepartments: ["commercial"],
        },
    },
    {
        name: "Clientes",
        href: "/management/clients",
        icon: ContactRound,
        permission: "clients.view",
        access: {
            departments: ["commercial"],
        },
    },
    {
        name: "Projectos",
        href: "/management/projects",
        icon: FolderKanban,
        permission: "projects.view",
    },
    {
        name: "Briefings",
        href: "/management/project-briefing",
        icon: FileText,
        permission: "project_briefing.view",
    },
    {
        name: "Submissões",
        href: "/management/submissions",
        icon: SquareCheck,
        permission: "submissions.view",
    },
    {
        name: "Tarefas",
        href: "/management/tasks",
        icon: SquareCheck,
        permission: "tasks.view",
    },
    {
        name: "Calendário",
        href: "/management/calendar",
        icon: CalendarDays,
        permission: "calendar.view",
    },
    {
        name: "Recursos de obra",
        href: "/management/work-resources",
        icon: HardHat,
        permission: "work_resources.view",
        access: {
            departments: ["architecture", "engineering"],
        },
    },
    {
        name: "Fornecedores",
        href: "/management/suppliers",
        icon: Handshake,
        permission: "suppliers.view",
        access: {
            departments: ["engineering"],
        },
    },
    {
        name: "Mensagens",
        href: "/management/messages",
        icon: MessageCircle,
        permission: "messages.view",
        badgeKey: "messages",
    },
];

/* ==========================================================================
   BOTTOM NAVIGATION
   Same items and order as ManagementMenu.tsx
   ========================================================================== */

const bottomItems: NavigationItem[] = [
    {
        name: "Notificações",
        href: "/management/notifications",
        icon: Bell,
        permission: "notifications.view",
        badgeKey: "notifications",
    },
    {
        name: "Presença",
        href: "/management/attendance",
        icon: Clock3,
        permission: "attendance.view",
        access: {
            adminOnly: true,
        },
    },
    {
        name: "Equipa",
        href: "/management/team",
        icon: UsersRound,
        permission: "team.view",
        access: {
            adminOnly: true,
        },
    },
    {
        name: "Meu perfil",
        href: "/management/profile",
        icon: UserRound,
        permission: "profile.view",
    },
    {
        name: "Definições",
        href: "/management/settings",
        icon: Settings,
        permission: "settings.view",
        access: {
            adminOnly: true,
        },
    },
    {
        name: "Sair",
        href: "",
        icon: LogOut,
        action: "logout",
    },
];

/* ==========================================================================
   ROLE NORMALIZATION
   ========================================================================== */

function normalizeRole(value: unknown): string {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
}

function isAdminRole(value: unknown): boolean {
    const role = normalizeRole(value);

    return [
        "1",
        "admin",
        "administrator",
        "administrador",
        "superadmin",
        "super admin",
    ].includes(role);
}

/* ==========================================================================
   DEPARTMENT NORMALIZATION
   ========================================================================== */

function normalizeDepartment(value: unknown): Department {
    if (typeof value !== "string") {
        return "other";
    }

    const normalized = value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

    switch (normalized) {
        case "arquitectura":
        case "arquitetura":
        case "architecture":
            return "architecture";

        case "engenharia":
        case "engineering":
            return "engineering";

        case "comercial":
        case "commercial":
        case "dc":
            return "commercial";

        default:
            return "other";
    }
}

/* ==========================================================================
   ROLE-BASED NAVIGATION ACCESS
   Same logic as ManagementMenu.tsx
   ========================================================================== */

function canSeeNavigationItem(
    item: NavigationItem,
    can: (permission: Permission) => boolean,
    isAdmin: boolean,
    department: Department,
): boolean {
    // Admin and Superadmin bypass all menu restrictions.
    if (isAdmin) {
        return true;
    }

    const access = item.access;

    // Administrative sections are restricted to Admin.
    if (access?.adminOnly) {
        return false;
    }

    // Enforce department restrictions.
    if (
        access?.departments &&
        !access.departments.includes(department)
    ) {
        return false;
    }

    // Explicit department grants bypass permission checks.
    if (access?.grantedDepartments?.includes(department)) {
        return true;
    }

    // All other items require their configured permission.
    if (item.permission && !can(item.permission)) {
        return false;
    }

    return true;
}

/* ==========================================================================
   MOBILE NAVBAR
   ========================================================================== */

export default function MobileNavbar({
    userRole,
    userDepartment,
    userDeparment,
}: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const { can } = usePermissions();
    const unread = useUnreadCounts();

    const [isOpen, setIsOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // Role ID 1, Admin and Superadmin.
    const isAdmin = isAdminRole(userRole);

    // Support both the corrected and previous department prop.
    const departmentValue = userDepartment ?? userDeparment;

    const normalizedDepartment: Department = isAdmin
        ? "other"
        : normalizeDepartment(departmentValue);

    /* ------------------------------------------------------------------
       FILTER NAVIGATION
       ------------------------------------------------------------------ */

    const visibleMenuItems = menuItems.filter((item) =>
        canSeeNavigationItem(
            item,
            can,
            isAdmin,
            normalizedDepartment,
        ),
    );

    const visibleBottomItems = bottomItems.filter((item) => {
        if (item.action === "logout") {
            return true;
        }

        return canSeeNavigationItem(
            item,
            can,
            isAdmin,
            normalizedDepartment,
        );
    });

    /* ------------------------------------------------------------------
       ACTIVE ROUTE
       ------------------------------------------------------------------ */

    const isActiveRoute = (href: string) => {
        if (!href) {
            return false;
        }

        if (href === "/management") {
            return pathname === href;
        }

        return (
            pathname === href ||
            pathname.startsWith(`${href}/`)
        );
    };

    /* ------------------------------------------------------------------
       CLOSE MENU
       ------------------------------------------------------------------ */

    const handleNavClick = () => {
        setIsOpen(false);
    };

    /* ------------------------------------------------------------------
       LOGOUT
       ------------------------------------------------------------------ */

    const handleLogout = async () => {
        if (logoutLoading) {
            return;
        }

        setLogoutLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error("Logout failed:", error);
                setLogoutLoading(false);
                return;
            }

            setIsOpen(false);

            router.replace("/");
            router.refresh();
        } catch (error) {
            console.error("Unexpected logout error:", error);
            setLogoutLoading(false);
        }
    };

    /* ------------------------------------------------------------------
       RENDER
       ------------------------------------------------------------------ */

    return (
        <>
            <nav
                aria-label="Navegação principal"
                className="fixed inset-x-0 top-0 z-50 border-b border-[#BD9655] bg-[#F7F7F5] md:hidden"
            >
                {/* HEADER */}

                <div className="flex h-20 items-center justify-between border-b border-[#BD9655] px-4">
                    <Link
                        href="/management"
                        onClick={handleNavClick}
                        aria-label="Ir para a visão geral"
                        className="min-w-0"
                    >
                        <Image
                            src="/images/logo.png"
                            alt="Pro-Sota"
                            width={150}
                            height={60}
                            priority
                            className="h-auto w-[125px] max-w-full object-contain"
                        />
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsOpen((open) => !open)}
                        aria-label={
                            isOpen
                                ? "Fechar menu"
                                : "Abrir menu"
                        }
                        aria-expanded={isOpen}
                        aria-controls="mobile-navigation"
                        className={[
                            "flex h-10 w-10 shrink-0 items-center justify-center",
                            "rounded-md text-gray-400",
                            "transition-colors duration-150",
                            "hover:bg-[#BD9655]",
                            "hover:text-[#002950]",
                            "focus-visible:outline-none",
                            "focus-visible:ring-2",
                            "focus-visible:ring-[#002950]",
                            "focus-visible:ring-offset-2",
                        ].join(" ")}
                    >
                        {isOpen ? (
                            <X
                                aria-hidden="true"
                                className="h-[18px] w-[18px]"
                                strokeWidth={1.8}
                            />
                        ) : (
                            <Menu
                                aria-hidden="true"
                                className="h-[18px] w-[18px]"
                                strokeWidth={1.8}
                            />
                        )}
                    </button>
                </div>

                {/* MOBILE MENU */}

                {isOpen && (
                    <div
                        id="mobile-navigation"
                        className={[
                            "max-h-[calc(100dvh-5rem)]",
                            "overflow-y-auto overscroll-contain",
                            "bg-[#F7F7F5]",
                            "px-3 py-5",
                        ].join(" ")}
                    >
                        {/* MAIN MENU */}

                        <div className="space-y-1">
                            {visibleMenuItems.map((item) => (
                                <MobileNavItem
                                    key={item.href}
                                    item={item}
                                    active={isActiveRoute(item.href)}
                                    badge={
                                        item.badgeKey
                                            ? unread[item.badgeKey]
                                            : 0
                                    }
                                    onClick={handleNavClick}
                                />
                            ))}
                        </div>

                        {/* BOTTOM MENU */}

                        <div className="mt-3 border-t border-[#BD9655] pt-3">
                            <div className="space-y-1">
                                {visibleBottomItems.map((item) => (
                                    <MobileNavItem
                                        key={
                                            item.action === "logout"
                                                ? "logout"
                                                : item.href
                                        }
                                        item={item}
                                        active={isActiveRoute(item.href)}
                                        badge={
                                            item.badgeKey
                                                ? unread[item.badgeKey]
                                                : 0
                                        }
                                        onClick={
                                            item.action === "logout"
                                                ? handleLogout
                                                : handleNavClick
                                        }
                                        logoutLoading={
                                            item.action === "logout"
                                                ? logoutLoading
                                                : false
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* SPACER */}

            <div className="h-20 md:hidden" />
        </>
    );
}

/* ==========================================================================
   MOBILE NAVIGATION ITEM
   ========================================================================== */

function formatBadge(count: number): string {
    return count > 99 ? "99+" : String(count);
}

function MobileNavItem({
    item,
    active,
    badge = 0,
    onClick,
    logoutLoading = false,
}: NavItemProps) {
    const Icon = item.icon;

    const label =
        item.action === "logout" && logoutLoading
            ? "A sair..."
            : item.name;

    const unreadLabel =
        badge > 0
            ? `${label}, ${badge} ${
                  badge === 1 ? "não lida" : "não lidas"
              }`
            : label;

    const itemClasses = [
        "group relative flex w-full min-w-0",
        "h-10 items-center gap-3 rounded-md",
        "px-3",
        "text-sm font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-[#002950]",
        "focus-visible:ring-offset-2",
    ].join(" ");

    /* LOGOUT BUTTON */

    if (item.action === "logout") {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={logoutLoading}
                aria-label={label}
                className={[
                    itemClasses,
                    "text-gray-600",
                    "hover:bg-gray-100",
                    "hover:text-[#BD9655]",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-60",
                ].join(" ")}
            >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {logoutLoading ? (
                        <Loader2
                            aria-hidden="true"
                            className="h-[18px] w-[18px] shrink-0 animate-spin"
                            strokeWidth={1.8}
                        />
                    ) : (
                        <Icon
                            aria-hidden="true"
                            className="h-[18px] w-[18px] shrink-0"
                            strokeWidth={1.8}
                        />
                    )}
                </span>

                <span className="min-w-0 overflow-hidden whitespace-nowrap">
                    {label}
                </span>
            </button>
        );
    }

    /* NORMAL NAVIGATION LINK */

    return (
        <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={unreadLabel}
            onClick={onClick}
            className={[
                itemClasses,
                active
                    ? [
                          "border-l-[3px]",
                          "border-[#BD9655]",
                          "bg-[#BD9655]",
                          "text-[#002950]",
                          "pl-[9px]",
                      ].join(" ")
                    : [
                          "text-gray-600",
                          "hover:bg-gray-100",
                          "hover:text-[#BD9655]",
                      ].join(" "),
            ].join(" ")}
        >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <Icon
                    aria-hidden="true"
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.8}
                />
            </span>

            <span className="min-w-0 overflow-hidden whitespace-nowrap">
                {item.name}
            </span>

            {badge > 0 && (
                <span
                    aria-hidden="true"
                    className={[
                        "ml-auto flex h-[18px] min-w-[18px]",
                        "shrink-0 items-center justify-center",
                        "rounded-full bg-[#002950] px-1.5",
                        "text-[10px] font-semibold leading-none text-white",
                    ].join(" ")}
                >
                    {formatBadge(badge)}
                </span>
            )}
        </Link>
    );
}
