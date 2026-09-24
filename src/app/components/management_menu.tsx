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

type SystemRole =
    | "Superadmin"
    | "Admin"
    | "Director"
    | "Utilizador";

type Department =
    | "DC"
    | "Administração"
    | "DE"
    | "DA"
    | "DIT"
    | "HR"
    | "Design de Interiores"
    | "Paisagismo"
    | "Finanças"
    | "Recursos Humanos"
    | "Procurement"
    | "Marketing & Comunicação"
    | "TI / Sistemas";

type SidebarItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    roles?: SystemRole[];
    departments?: Department[];
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
    userDepartment?: string | null;
};

/*
 * ============================================================
 * MAIN NAVIGATION
 * ============================================================
 *
 * Access model:
 *
 * - Superadmin:
 *   Everything.
 *
 * - Admin / Director:
 *   Management areas explicitly allowed by the item.
 *
 * - Utilizador:
 *   Access depends on the department when an item has
 *   a department restriction.
 *
 * IMPORTANT:
 * A department restriction automatically allows normal
 * "Utilizador" users from that department.
 */

const menuItems: SidebarItem[] = [
    {
        name: "Visão geral",
        href: "/management",
        icon: HomeIcon,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
    },

    /*
     * LEADS
     *
     * DC users can see Leads.
     *
     * Admin and Director can also see Leads.
     *
     * Superadmin sees everything.
     */
    {
        name: "Leads",
        href: "/management/leads",
        icon: UserPlus,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
        departments: ["DC"],
    },

    /*
     * PROJECTS
     *
     * Normal users:
     * - Administração
     * - DPT
     *
     * Admin / Director / Superadmin:
     * allowed.
     */
    {
        name: "Projectos",
        href: "/management/projects",
        icon: Folder,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
        departments: [
            "Administração",
            "DE", "DA"
        ],
    },

    /*
     * TASKS
     *
     * Normal users:
     * - Administração
     * - DPT
     *
     * Admin / Director / Superadmin:
     * allowed.
     */
    {
        name: "Tarefas",
        href: "/management/tasks",
        icon: ListTodo,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
    },

    /*
     * CALENDAR
     *
     * Everyone.
     */
    {
        name: "Calendário",
        href: "/management/calendar",
        icon: CalendarDays,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
    },

    /*
     * MESSAGES
     *
     * Everyone.
     */
    {
        name: "Mensagens",
        href: "/management/messages",
        icon: MessageCircle,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
    },

    /*
     * CLIENTS
     *
     * DC users.
     *
     * Admin / Director / Superadmin.
     */
    {
        name: "Clientes",
        href: "/management/clients",
        icon: Users,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
        departments: ["DC"],
    },

    /*
     * TEAM
     *
     * Management roles only.
     */
    {
        name: "Equipa",
        href: "/management/team",
        icon: UsersRound,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
        ],
    },

    /*
     * ATTENDANCE
     *
     * Everyone.
     */
    {
        name: "Presença",
        href: "/management/attendance",
        icon: Clock3,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
        departments:["HR"]
    },

    /*
     * WORK RESOURCES
     *
     * Everyone.
     */
    {
        name: "Recursos de obra",
        href: "/management/work-resources",
        icon: WalletCards,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
        departments:["HR", "DE"]
    },

    /*
     * SUPPLIERS
     *
     * Management roles only.
     */
    {
        name: "Fornecedores",
        href: "/management/suppliers",
        icon: Handshake,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
        ],

    },
];

/*
 * ============================================================
 * BOTTOM NAVIGATION
 * ============================================================
 */

const bottomItems: SidebarItem[] = [
    {
        name: "Meu perfil",
        href: "/management/profile",
        icon: User,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
    },
    {
        name: "Notificações",
        href: "/management/notifications",
        icon: Bell,
        roles: [
            "Superadmin",
            "Admin",
            "Director",
            "Utilizador",
        ],
    },
];

/*
 * ============================================================
 * ROLE NORMALIZATION
 * ============================================================
 */

function normalizeRole(
    role?: string | null,
): SystemRole {
    if (!role) {
        return "Utilizador";
    }

    const normalizedRole = role
        .trim()
        .toLowerCase();

    switch (normalizedRole) {
        case "superadmin":
        case "super admin":
        case "super_administrator":
        case "super administrator":
            return "Superadmin";

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

/*
 * ============================================================
 * DEPARTMENT NORMALIZATION
 * ============================================================
 *
 * This handles the actual department values as well as
 * common alternative values that might exist in Supabase.
 */

function normalizeDepartment(
    department?: string | null,
): Department | null {
    if (!department) {
        return null;
    }

    const normalizedDepartment = department
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    switch (normalizedDepartment) {
        /*
         * DC
         */
        case "dc":
        case "d.c.":
        case "comercial":
        case "commercial":
        case "business development":
        case "desenvolvimento de negócio":
        case "desenvolvimento de negocio":
            return "DC";

        /*
         * Administração
         */
        case "administração":
        case "administracao":
        case "administration":
        case "admin":
            return "Administração";

        /*
         * DE
         */
        case "de":
            return "DE";

        /*
         * DA
         */
        case "da":
            return "DA";

        /*
         * DIT
         */
        case "dit":
            return "DIT";

        /*
         * HR
         */
        case "hr":
        case "rh":
            return "HR";

        /*
         * Design de Interiores
         */
        case "design de interiores":
        case "interiores":
        case "interior design":
            return "Design de Interiores";

        /*
         * Paisagismo
         */
        case "paisagismo":
        case "landscape":
        case "landscape design":
            return "Paisagismo";

        /*
         * Finanças
         */
        case "finanças":
        case "financas":
        case "finance":
        case "finances":
            return "Finanças";

        /*
         * Recursos Humanos
         */
        case "recursos humanos":
        case "recursos humanos (dhr)":
        case "human resources":
            return "Recursos Humanos";

        /*
         * Procurement
         */
        case "procurement":
        case "compras":
            return "Procurement";

        /*
         * Marketing & Comunicação
         */
        case "marketing":
        case "marketing & comunicação":
        case "marketing and communication":
        case "marketing & communication":
        case "comunicação":
        case "comunicacao":
            return "Marketing & Comunicação";

        /*
         * TI / Sistemas
         */
        case "ti":
        case "it":
        case "ti / sistemas":
        case "ti/sistemas":
        case "it / systems":
        case "it/systems":
        case "sistemas":
            return "TI / Sistemas";

        default:
            return null;
    }
}

/*
 * ============================================================
 * ACCESS CONTROL
 * ============================================================
 */

function canAccessItem(
    item: SidebarItem,
    role: SystemRole,
    department: Department | null,
): boolean {
    /*
     * Superadmin can see everything.
     */
    if (role === "Superadmin") {
        return true;
    }

    /*
     * If this item has a department restriction,
     * department determines access for normal users.
     */
    if (item.departments?.length) {
        /*
         * Admin and Director can access department-
         * restricted areas.
         */
        if (
            role === "Admin" ||
            role === "Director"
        ) {
            return true;
        }

        /*
         * Normal user must belong to an allowed
         * department.
         */
        if (role === "Utilizador") {
            return (
                department !== null &&
                item.departments.includes(
                    department,
                )
            );
        }

        return false;
    }

    /*
     * Items without department restrictions use
     * the role restriction.
     */
    if (item.roles?.length) {
        return item.roles.includes(role);
    }

    /*
     * If an item has neither restriction, allow it.
     */
    return true;
}

export default function ManagementMenu({
    collapsed,
    setCollapsedAction,
    userRole,
    userDepartment,
}: Props) {
    const pathname = usePathname();

    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const role = normalizeRole(userRole);
    const department =
        normalizeDepartment(userDepartment);

    /*
     * Project pages have their own internal navigation.
     */
    const isInsideProject =
        pathname.startsWith(
            "/management/projects/",
        ) &&
        pathname !==
            "/management/projects/create-project";

    /*
     * Chat pages have their own navigation.
     */
    const isInsideChat =
        pathname.startsWith(
            "/management/messages/",
        );

    const shouldAutoCollapse =
        isInsideProject || isInsideChat;

    const expanded =
        !shouldAutoCollapse &&
        (!collapsed || hovered);

    /*
     * Filter main navigation.
     */
    const visibleMenuItems =
        menuItems.filter((item) =>
            canAccessItem(
                item,
                role,
                department,
            ),
        );

    /*
     * Filter bottom navigation.
     */
    const visibleBottomItems =
        bottomItems.filter((item) =>
            canAccessItem(
                item,
                role,
                department,
            ),
        );

    /*
     * Mobile detection.
     */
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(
                window.innerWidth < 768,
            );
        };

        checkMobile();

        window.addEventListener(
            "resize",
            checkMobile,
        );

        return () => {
            window.removeEventListener(
                "resize",
                checkMobile,
            );
        };
    }, []);

    /*
     * Automatically collapse inside projects/chats.
     */
    useEffect(() => {
        if (shouldAutoCollapse) {
            setCollapsedAction(true);
            setHovered(false);
        }
    }, [
        shouldAutoCollapse,
        setCollapsedAction,
    ]);

    /*
     * Desktop sidebar only.
     */
    if (isMobile) {
        return null;
    }

    return (
        <nav
            aria-label="Navegação principal"
            onMouseEnter={() => {
                if (
                    collapsed &&
                    !shouldAutoCollapse
                ) {
                    setHovered(true);
                }
            }}
            onMouseLeave={() => {
                setHovered(false);
            }}
            className={`fixed z-50 hidden h-screen flex-col overflow-y-auto border-r border-[#BD9655] bg-[#F7F7F5] transition-all duration-300 md:flex ${
                expanded
                    ? "w-64"
                    : "w-20"
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
                        if (
                            !shouldAutoCollapse
                        ) {
                            setHovered(false);

                            setCollapsedAction(
                                !collapsed,
                            );
                        }
                    }}
                    disabled={
                        shouldAutoCollapse
                    }
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
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-6">
                {visibleMenuItems.map(
                    (item) => (
                        <SidebarItem
                            key={item.href}
                            item={item}
                            active={isActiveRoute(
                                pathname,
                                item.href,
                            )}
                            expanded={expanded}
                        />
                    ),
                )}
            </div>

            {/* Bottom Menu */}
            <div className="shrink-0 space-y-1 border-t border-[#BD9655] px-3 py-3">
                {visibleBottomItems.map(
                    (item) => (
                        <SidebarItem
                            key={item.href}
                            item={item}
                            active={isActiveRoute(
                                pathname,
                                item.href,
                            )}
                            expanded={expanded}
                        />
                    ),
                )}

                <LogoutButton />
            </div>
        </nav>
    );
}

/*
 * ============================================================
 * ACTIVE ROUTE
 * ============================================================
 */

function isActiveRoute(
    pathname: string,
    href: string,
): boolean {
    /*
     * Dashboard must only be active on /management.
     */
    if (href === "/management") {
        return pathname === href;
    }

    return (
        pathname === href ||
        pathname.startsWith(`${href}/`)
    );
}

/*
 * ============================================================
 * SIDEBAR ITEM
 * ============================================================
 */

function SidebarItem({
    item,
    active,
    expanded,
}: SidebarItemProps) {
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            aria-current={
                active
                    ? "page"
                    : undefined
            }
            title={
                !expanded
                    ? item.name
                    : undefined
            }
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