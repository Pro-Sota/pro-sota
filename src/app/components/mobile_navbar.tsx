"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LogoutButton from "../(auth)/logout/page";
import { getVisibleNavigation } from "./management_menu";

type NavItemProps = {
  item: {
    name: string;
    href: string;
    icon: LucideIcon;
  };
  active: boolean;
  onClick?: () => void;
};

type Props = {
  userRole?: string | null;
  userDepartment?: string | null;
};

export default function MobileNavbar({
  userRole,
  userDepartment,
}: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { menuItems, bottomItems } = getVisibleNavigation(
    userRole,
    userDepartment
  );

  const isActiveRoute = (href: string) =>
    href === "/management"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navbar - Only visible on mobile */}
      <nav
        aria-label="Navegação principal no telefone"
        className="fixed inset-x-0 top-0 z-50 border-b border-[#BD9655] bg-[#F7F7F5] md:hidden"
      >
        <div className="flex items-center justify-between px-4 h-16">
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
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[#002950] transition hover:bg-[#BD9655]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            id="mobile-navigation"
            className="max-h-[calc(100dvh-4rem)] space-y-1 overflow-y-auto overscroll-contain border-t border-[#BD9655] bg-[#F7F7F5] px-3 py-3"
          >
            {/* Main Menu Items */}
            {menuItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isActiveRoute(item.href)}
                onClick={handleNavClick}
              />
            ))}

            <div className="my-2 space-y-1 border-t border-[#BD9655] pt-2">
              {/* Bottom Menu Items */}
              {bottomItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActiveRoute(item.href)}
                  onClick={handleNavClick}
                />
              ))}

              {/* Logout Button */}
              <div onClick={handleNavClick}>
                <LogoutButton />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under navbar */}
      <div className="md:hidden h-16" />
    </>
  );
}

function NavItem({ item, active, onClick }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] ${
        active
          ? "border-l-4 border-[#BD9655] bg-[#BD9655] text-[#002950]"
          : "text-gray-600 hover:bg-gray-100 hover:text-[#002950]"
      }`}
    >
      <Icon
        className={`h-5 w-5 flex-shrink-0 ${
          active ? "text-[#002950]" : "text-gray-600"
        }`}
      />
      <span className="whitespace-nowrap">{item.name}</span>
    </Link>
  );
}
