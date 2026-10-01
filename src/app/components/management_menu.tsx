"use client";

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
  User,
  UserPlus,
  Users,
  UsersRound,
  WalletCards,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";

import { createClient } from "@/app/lib/supabase/client";
import { usePermissions } from "@/app/components/permission_provider";

import type { Permission } from "@/app/lib/permissions/types";

type SidebarItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  action?: "logout";
};

type SidebarItemProps = {
  item: SidebarItem;
  active: boolean;
  collapsed?: boolean;
  onLogout?: () => void;
  logoutLoading?: boolean;
};

type Props = {
  collapsed: boolean;
  setCollapsedAction: React.Dispatch<
    React.SetStateAction<boolean>
  >;
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
    permission: "dashboard.view",
  },
  {
    name: "Leads",
    href: "/management/leads",
    icon: UserPlus,
    permission: "leads.view",
  },
  {
    name: "Projectos",
    href: "/management/projects",
    icon: Folder,
    permission: "projects.view",
  },
  {
    name: "Tarefas",
    href: "/management/tasks",
    icon: ListTodo,
    permission: "tasks.view",
  },
  {
    name: "Calendário",
    href: "/management/calendar",
    icon: CalendarDays,
    permission: "calendar.view",
  },
  {
    name: "Mensagens",
    href: "/management/messages",
    icon: MessageCircle,
    permission: "messages.view",
  },
  {
    name: "Clientes",
    href: "/management/clients",
    icon: Users,
    permission: "clients.view",
  },
  {
    name: "Equipa",
    href: "/management/team",
    icon: UsersRound,
    permission: "team.view",
  },
  {
    name: "Presença",
    href: "/management/attendance",
    icon: Clock3,
    permission: "attendance.view",
  },
  {
    name: "Recursos de obra",
    href: "/management/work-resources",
    icon: WalletCards,
    permission: "work_resources.view",
  },
  {
    name: "Fornecedores",
    href: "/management/suppliers",
    icon: Handshake,
    permission: "suppliers.view",
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
    permission: "profile.view",
  },
  {
    name: "Notificações",
    href: "/management/notifications",
    icon: Bell,
    permission: "notifications.view",
  },
  {
    name: "Sair",
    href: "",
    icon: LogOut,
    action: "logout",
  },
];

/*
 * ============================================================
 * MANAGEMENT MENU
 * ============================================================
 */

export default function ManagementMenu({
  collapsed,
  setCollapsedAction,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [logoutLoading, setLogoutLoading] = useState(false);

  const { can } = usePermissions();

  /*
   * ========================================================
   * PERMISSION FILTERING
   * ========================================================
   *
   * The sidebar only controls visibility.
   *
   * Actual authorization must still be handled
   * server-side.
   */

  const visibleMenuItems = menuItems.filter(
    (item) =>
      !item.permission ||
      can(item.permission),
  );

  const visibleBottomItems = bottomItems.filter(
    (item) =>
      !item.permission ||
      can(item.permission),
  );

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

      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Logout failed:",
          error,
        );

        setLogoutLoading(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Unexpected logout error:",
        error,
      );

      setLogoutLoading(false);
    }
  };

  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (
    <nav
      aria-label="Navegação principal"
      className={[
        "fixed left-0 top-0 z-50 hidden h-screen",
        "flex-col border-r border-[#BD9655]",
        "bg-[#F7F7F5]",
        "transition-[width] duration-200 ease-in-out",
        "md:flex",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className={[
          "relative flex h-20 shrink-0 items-center",
          "border-b border-[#BD9655]",
          collapsed
            ? "justify-center px-2"
            : "justify-between px-4",
        ].join(" ")}
      >
        <Link
          href="/management"
          aria-label="Ir para a visão geral"
          className={[
            "min-w-0",
            collapsed
              ? "flex justify-center"
              : "",
          ].join(" ")}
        >
          {collapsed ? (
            <Image
              src="/images/logo.png"
              alt="Pro-Sota"
              width={42}
              height={42}
              priority
              className="h-9 w-9 object-contain object-left"
            />
          ) : (
            <Image
              src="/images/logo.png"
              alt="Pro-Sota"
              width={150}
              height={60}
              priority
              className="h-auto max-w-full object-contain"
            />
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={() =>
              setCollapsedAction(true)
            }
            aria-label="Recolher menu"
            aria-expanded={!collapsed}
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center",
              "rounded-md text-gray-600",
              "transition-colors",
              "hover:bg-gray-100 hover:text-[#BD9655]",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[#002950]",
              "focus-visible:ring-offset-2",
            ].join(" ")}
          >
            <PanelLeftClose
              aria-hidden="true"
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
            />
          </button>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={() =>
              setCollapsedAction(false)
            }
            aria-label="Expandir menu"
            aria-expanded={false}
            className={[
              "absolute right-[-14px] top-6",
              "flex h-7 w-7 items-center justify-center",
              "rounded-full border border-[#BD9655]",
              "bg-[#F7F7F5] text-gray-600",
              "shadow-sm",
              "transition-colors",
              "hover:bg-gray-100 hover:text-[#BD9655]",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[#002950]",
              "focus-visible:ring-offset-2",
            ].join(" ")}
          >
            <PanelLeftOpen
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>
        )}
      </div>

      {/* ================================================= */}
      {/* MAIN MENU */}
      {/* ================================================= */}

      <div
        className={[
          "sidebar-scroll min-h-0 flex-1",
          "overflow-x-hidden overflow-y-auto",
          collapsed
            ? "px-2 py-5"
            : "px-3 py-5",
        ].join(" ")}
      >
        <div className="space-y-1">
          {visibleMenuItems.map(
            (item) => (
              <SidebarItem
                key={item.href}
                item={item}
                active={isActiveRoute(
                  pathname,
                  item.href,
                )}
                collapsed={collapsed}
              />
            ),
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* BOTTOM MENU */}
      {/* ================================================= */}

      <div
        className={[
          "shrink-0 border-t",
          "border-[#BD9655]",
          collapsed
            ? "px-2 py-3"
            : "px-3 py-3",
        ].join(" ")}
      >
        <div className="space-y-1">
          {visibleBottomItems.map(
            (item) => (
              <SidebarItem
                key={
                  item.action === "logout"
                    ? "logout"
                    : item.href
                }
                item={item}
                active={isActiveRoute(
                  pathname,
                  item.href,
                )}
                collapsed={collapsed}
                onLogout={handleLogout}
                logoutLoading={
                  logoutLoading
                }
              />
            ),
          )}
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

function isActiveRoute(
  pathname: string,
  href: string,
): boolean {
  if (!href) {
    return false;
  }

  if (href === "/management") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`,
    )
  );
}

/*
 * ============================================================
 * ICON CONTAINER
 * ============================================================
 */

function SidebarIcon({
  children,
}: {
  children: React.ReactNode;
}) {
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
  collapsed = false,
  onLogout,
  logoutLoading = false,
}: SidebarItemProps) {
  const Icon = item.icon;

  const label =
    item.action === "logout" &&
    logoutLoading
      ? "A sair..."
      : item.name;

  const itemClasses = [
    "group relative flex w-full min-w-0",
    "h-10 items-center rounded-md",
    "text-sm font-medium",
    "transition-colors duration-150",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[#002950]",
    "focus-visible:ring-offset-2",
    collapsed
      ? "justify-center px-0"
      : "gap-3 px-3",
  ].join(" ");

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
        title={
          collapsed
            ? label
            : undefined
        }
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

        {!collapsed && (
          <span className="min-w-0 overflow-hidden whitespace-nowrap">
            {label}
          </span>
        )}
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
      aria-current={
        active
          ? "page"
          : undefined
      }
      title={
        collapsed
          ? item.name
          : undefined
      }
      className={[
        itemClasses,
        active
          ? [
              "border-l-[3px]",
              "border-[#BD9655]",
              "bg-[#BD9655]",
              "text-[#002950]",
              collapsed
                ? "pl-0"
                : "pl-[9px]",
            ].join(" ")
          : [
              "text-gray-600",
              "hover:bg-gray-100",
              "hover:text-[#BD9655]",
              collapsed
                ? "border-l-[3px] border-transparent"
                : "",
            ].join(" "),
      ].join(" ")}
    >
      <SidebarIcon>
        <Icon
          aria-hidden="true"
          className="h-[18px] w-[18px]"
          strokeWidth={1.8}
        />
      </SidebarIcon>

      {!collapsed && (
        <span className="min-w-0 overflow-hidden whitespace-nowrap">
          {item.name}
        </span>
      )}
    </Link>
  );
}