"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Loader2,
  HomeIcon,
  UserPlus,
  Folder,
  ListTodo,
  CalendarDays,
  MessageCircle,
  Handshake,
  Users,
  Clock3,
  Boxes,
  User,
  Bell,
  LogOut,
  LucideIcon,
} from "lucide-react";

import { createClient } from "@/app/lib/supabase/client";
import { usePermissions } from "@/app/components/permission_provider";
import type { Permission } from "@/app/lib/permissions/types";

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  action?: "logout";
};

type NavItemProps = {
  item: NavigationItem;
  active: boolean;
  onClick?: () => void;
  logoutLoading?: boolean;
};

const menuItems: NavigationItem[] = [
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
    icon: Handshake,
    permission: "clients.view",
  },
  {
    name: "Equipa Sota",
    href: "/management/team",
    icon: Users,
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
    icon: Boxes,
    permission: "work_resources.view",
  },
  {
    name: "Fornecedores",
    href: "/management/suppliers",
    icon: Handshake,
    permission: "suppliers.view",
  },
];

const bottomItems: NavigationItem[] = [
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

export default function MobileNavbar() {
  const pathname = usePathname();
  const { can } = usePermissions();

  const [isOpen, setIsOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

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

  const isActiveRoute = (href: string) => {
    if (!href) return false;

    if (href === "/management") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout failed:", error);
        setLogoutLoading(false);
        return;
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Unexpected logout error:", error);
      setLogoutLoading(false);
    }
  };

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 top-0 z-50 border-b border-[#BD9655] bg-[#F7F7F5] md:hidden"
      >
        {/* Header */}
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

        {/* Mobile Menu */}
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
            {/* Main Menu */}
            <div className="space-y-1">
              {visibleMenuItems.map((item) => (
                <MobileNavItem
                  key={item.href}
                  item={item}
                  active={isActiveRoute(item.href)}
                  onClick={handleNavClick}
                />
              ))}
            </div>

            {/* Bottom Menu */}
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

      {/* Spacer */}
      <div className="h-20 md:hidden" />
    </>
  );
}

function MobileNavItem({
  item,
  active,
  onClick,
  logoutLoading = false,
}: NavItemProps) {
  const Icon = item.icon;

  const label =
    item.action === "logout" &&
    logoutLoading
      ? "A sair..."
      : item.name;

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
        </span>

        <span className="min-w-0 overflow-hidden whitespace-nowrap">
          {label}
        </span>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={
        active ? "page" : undefined
      }
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
          className="h-[18px] w-[18px]"
          strokeWidth={1.8}
        />
      </span>

      <span className="min-w-0 overflow-hidden whitespace-nowrap">
        {item.name}
      </span>
    </Link>
  );
}