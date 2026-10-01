"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Clock3,
  Folder,
  Handshake,
  HomeIcon,
  ListTodo,
  LogOut,
  LucideIcon,
  MessageCircle,
  Sidebar,
  User,
  UserPlus,
  Users,
  UsersRound,
  WalletCards,
  Loader2,
} from "lucide-react";

import { createClient } from "@/app/lib/supabase/client";

type SystemRole = "Superadmin" | "Admin" | "Director" | "Utilizador";

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
  action?: "logout";
};

type SidebarItemProps = {
  item: SidebarItem;
  active: boolean;
  expanded: boolean;
  onLogout?: () => void;
  logoutLoading?: boolean;
};

type Props = {
  collapsed: boolean;
  setCollapsedAction: (value: boolean) => void;
  userRole?: string | null;
  userDepartment?: string | null;
  onHoverChange: (value: boolean) => void;
};

/*
 * ============================================================
 * MAIN NAVIGATION
 * ============================================================
 */

const menuItems: SidebarItem[] = [
  {
    name: "Visão geral",
    href: "/management",
    icon: HomeIcon,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
  },
  {
    name: "Leads",
    href: "/management/leads",
    icon: UserPlus,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
    departments: ["DC"],
  },
  {
    name: "Projectos",
    href: "/management/projects",
    icon: Folder,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
    departments: ["Administração", "DE", "DA"],
  },
  {
    name: "Tarefas",
    href: "/management/tasks",
    icon: ListTodo,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
  },
  {
    name: "Calendário",
    href: "/management/calendar",
    icon: CalendarDays,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
  },
  {
    name: "Mensagens",
    href: "/management/messages",
    icon: MessageCircle,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
  },
  {
    name: "Clientes",
    href: "/management/clients",
    icon: Users,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
    departments: ["DC"],
  },
  {
    name: "Equipa",
    href: "/management/team",
    icon: UsersRound,
    roles: ["Superadmin", "Admin", "Director"],
  },
  {
    name: "Presença",
    href: "/management/attendance",
    icon: Clock3,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
    departments: ["HR"],
  },
  {
    name: "Recursos de obra",
    href: "/management/work-resources",
    icon: WalletCards,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
    departments: ["HR", "DE"],
  },
  {
    name: "Fornecedores",
    href: "/management/suppliers",
    icon: Handshake,
    roles: ["Superadmin", "Admin", "Director"],
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
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
  },
  {
    name: "Notificações",
    href: "/management/notifications",
    icon: Bell,
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
  },
  {
    name: "Sair",
    href: "",
    icon: LogOut,
    action: "logout",
    roles: ["Superadmin", "Admin", "Director", "Utilizador"],
  },
];

/*
 * ============================================================
 * ROLE NORMALIZATION
 * ============================================================
 */

function normalizeRole(role?: string | null): SystemRole {
  if (!role) {
    return "Utilizador";
  }

  const normalizedRole = role.trim().toLowerCase();

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
 */

function normalizeDepartment(department?: string | null): Department | null {
  if (!department) {
    return null;
  }

  const normalizedDepartment = department
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  switch (normalizedDepartment) {
    case "dc":
    case "d.c.":
    case "comercial":
    case "commercial":
    case "business development":
    case "desenvolvimento de negócio":
    case "desenvolvimento de negocio":
      return "DC";

    case "administração":
    case "administracao":
    case "administration":
    case "admin":
      return "Administração";

    case "de":
      return "DE";

    case "da":
      return "DA";

    case "dit":
      return "DIT";

    case "hr":
    case "rh":
      return "HR";

    case "design de interiores":
    case "interiores":
    case "interior design":
      return "Design de Interiores";

    case "paisagismo":
    case "landscape":
    case "landscape design":
      return "Paisagismo";

    case "finanças":
    case "financas":
    case "finance":
    case "finances":
      return "Finanças";

    case "recursos humanos":
    case "recursos humanos (dhr)":
    case "human resources":
      return "Recursos Humanos";

    case "procurement":
    case "compras":
      return "Procurement";

    case "marketing":
    case "marketing & comunicação":
    case "marketing and communication":
    case "marketing & communication":
    case "comunicação":
    case "comunicacao":
      return "Marketing & Comunicação";

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
  if (role === "Superadmin") {
    return true;
  }

  if (item.departments?.length) {
    if (role === "Admin" || role === "Director") {
      return true;
    }

    if (role === "Utilizador") {
      return department !== null && item.departments.includes(department);
    }

    return false;
  }

  if (item.roles?.length) {
    return item.roles.includes(role);
  }

  return true;
}

export function getVisibleNavigation(
  userRole?: string | null,
  userDepartment?: string | null,
) {
  const role = normalizeRole(userRole);
  const department = normalizeDepartment(userDepartment);

  return {
    menuItems: menuItems.filter((item) =>
      canAccessItem(item, role, department),
    ),

    bottomItems: bottomItems.filter((item) =>
      canAccessItem(item, role, department),
    ),
  };
}

/*
 * ============================================================
 * MANAGEMENT MENU
 * ============================================================
 */

export default function ManagementMenu({
  collapsed,
  setCollapsedAction,
  userRole,
  userDepartment,
  onHoverChange,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const role = normalizeRole(userRole);

  const department = normalizeDepartment(userDepartment);

  /*
   * ========================================================
   * LOGOUT
   * ========================================================
   */

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

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Unexpected logout error:", error);

      setLogoutLoading(false);
    }
  };

  /*
   * ========================================================
   * AUTO COLLAPSE
   * ========================================================
   */

  const isInsideProject =
    pathname.startsWith("/management/projects/") &&
    pathname !== "/management/projects/create-project";

  const isInsideChat = pathname.startsWith("/management/messages/");

  const shouldAutoCollapse = isInsideProject || isInsideChat;

  const expanded = !shouldAutoCollapse && (!collapsed || hovered);

  /*
   * ========================================================
   * FILTER NAVIGATION
   * ========================================================
   */

  const visibleMenuItems = menuItems.filter((item) =>
    canAccessItem(item, role, department),
  );

  const visibleBottomItems = bottomItems.filter((item) =>
    canAccessItem(item, role, department),
  );

  /*
   * ========================================================
   * MOBILE
   * ========================================================
   */

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

  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  if (isMobile) {
    return null;
  }

  return (
    <nav
      aria-label="Navegação principal"
      onMouseEnter={() => {
        if (collapsed && !shouldAutoCollapse) {
          setHovered(true);
          onHoverChange?.(true);
        }
      }}
      onMouseLeave={() => {
        setHovered(false);
        onHoverChange?.(false);
      }}
      className={[
        "fixed left-0 top-0 z-50 hidden h-screen",
        "flex-col border-r border-[#BD9655]",
        "bg-[#F7F7F5] md:flex",
        "transition-[width] duration-200 ease-out",
        expanded ? "w-64" : "w-20",
      ].join(" ")}
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className={[
          "flex h-20 shrink-0 items-center",
          "border-b border-[#BD9655]",
          expanded ? "justify-between px-4" : "justify-center px-2",
        ].join(" ")}
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
            if (shouldAutoCollapse) {
              return;
            }

            setHovered(false);

            setCollapsedAction(!collapsed);
          }}
          disabled={shouldAutoCollapse}
          aria-label={expanded ? "Recolher menu" : "Expandir menu"}
          aria-expanded={expanded}
          className={[
            "flex h-9 w-9 shrink-0",
            "items-center justify-center",
            "rounded-md text-gray-400",
            "transition-colors duration-150",
            "hover:bg-[#BD9655]",
            "hover:text-[#002950]",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[#002950]",
            "focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
          ].join(" ")}
        >
          <Sidebar
            aria-hidden="true"
            className="h-[18px] w-[18px]"
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* ================================================= */}
      {/* MAIN MENU */}
      {/* ================================================= */}

      <div
        className={[
          "sidebar-scroll min-h-0 flex-1",
          "overflow-x-hidden overflow-y-auto",
          "px-3 py-5",
        ].join(" ")}
      >
        <div className="space-y-1">
          {visibleMenuItems.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              active={isActiveRoute(pathname, item.href)}
              expanded={expanded}
            />
          ))}
        </div>
      </div>

      {/* ================================================= */}
      {/* BOTTOM MENU */}
      {/* ================================================= */}

      <div
        className={["shrink-0 border-t", "border-[#BD9655]", "px-3 py-3"].join(
          " ",
        )}
      >
        <div className="space-y-1">
          {visibleBottomItems.map((item) => (
            <SidebarItem
              key={item.action === "logout" ? "logout" : item.href}
              item={item}
              active={isActiveRoute(pathname, item.href)}
              expanded={expanded}
              onLogout={handleLogout}
              logoutLoading={logoutLoading}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

/*
 * ============================================================
 * ACTIVE ROUTE
 * ============================================================
 */

function isActiveRoute(pathname: string, href: string): boolean {
  if (!href) {
    return false;
  }

  if (href === "/management") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/*
 * ============================================================
 * ICON CONTAINER
 * ============================================================
 */

function SidebarIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
      {children}
    </span>
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
  onLogout,
  logoutLoading = false,
}: SidebarItemProps) {
  const Icon = item.icon;

  const label =
    item.action === "logout" && logoutLoading ? "A sair..." : item.name;

  const itemClasses = [
    "group relative flex w-full min-w-0",
    "items-center rounded-md",
    "text-sm font-medium",
    "transition-colors duration-150",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[#002950]",
    "focus-visible:ring-offset-2",
    expanded ? "h-10 gap-3 px-3" : "h-10 justify-center px-0",
  ].join(" ");

  const tooltip = !expanded ? (
    <span
      role="tooltip"
      className={[
        "pointer-events-none absolute left-full top-1/2 z-[100]",
        "ml-3 -translate-y-1/2",
        "whitespace-nowrap rounded-md",
        "bg-[#002950] px-3 py-2",
        "text-xs font-medium text-white",
        "shadow-lg",
        "opacity-0 invisible",
        "translate-x-[-4px]",
        "transition-[opacity,transform,visibility]",
        "duration-150",
        "group-hover:visible group-hover:translate-x-0",
        "group-hover:opacity-100",
        "group-focus-visible:visible",
        "group-focus-visible:translate-x-0",
        "group-focus-visible:opacity-100",
      ].join(" ")}
    >
      {label}

      <span
        aria-hidden="true"
        className={[
          "absolute right-full top-1/2",
          "-translate-y-1/2",
          "border-y-[5px] border-r-[5px]",
          "border-y-transparent",
          "border-r-[#002950]",
        ].join(" ")}
      />
    </span>
  ) : null;

  /*
   * ========================================================
   * LOGOUT
   * ========================================================
   */

  if (item.action === "logout") {
    return (
      <button
        type="button"
        onClick={onLogout}
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
        <SidebarIcon>
          {logoutLoading ? (
            <Loader2
              aria-hidden="true"
              className="h-[18px] w-[18px] animate-spin"
              strokeWidth={1.8}
            />
          ) : (
            <Icon
              aria-hidden="true"
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
            />
          )}
        </SidebarIcon>

        <span
          className={[
            "min-w-0 overflow-hidden",
            "whitespace-nowrap",
            "transition-[max-width,opacity]",
            "duration-150",
            expanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0",
          ].join(" ")}
        >
          {label}
        </span>

        {tooltip}
      </button>
    );
  }

  /*
   * ========================================================
   * NORMAL LINK
   * ========================================================
   */

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={[
        itemClasses,
        active
          ? [
              "border-l-[3px]",
              "border-[#BD9655]",
              "bg-[#BD9655]",
              "text-[#002950]",
              expanded ? "pl-[9px]" : "border-l-0",
            ].join(" ")
          : ["text-gray-600", "hover:bg-gray-100", "hover:text-[#BD9655]"].join(
              " ",
            ),
      ].join(" ")}
    >
      <SidebarIcon>
        <Icon
          aria-hidden="true"
          className="h-[18px] w-[18px]"
          strokeWidth={1.8}
        />
      </SidebarIcon>

      <span
        className={[
          "min-w-0 overflow-hidden",
          "whitespace-nowrap",
          "transition-[max-width,opacity]",
          "duration-150",
          expanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0",
        ].join(" ")}
      >
        {item.name}
      </span>

      {tooltip}
    </Link>
  );
}
