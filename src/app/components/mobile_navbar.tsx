"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Folder,
  Handshake,
  HomeIcon,
  LucideIcon,
  MessageCircle,
  Settings,
  X,
  Menu,
  User,
  Users,
  UsersRound,
  WalletCards,
} from "lucide-react";
import LogoutButton from "../(auth)/logout/page";
import Image from "next/image";

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
  collapsed?: boolean;
  setCollapsedAction?: (value: boolean) => void;
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
  { name: "Meu perfil", href: "/management/profile", icon: User },
  { name: "Notificações", href: "/management/notifications", icon: Bell },
  { name: "Definições", href: "/management/settings", icon: Settings },
];

export default function MobileNavbar({ collapsed, setCollapsedAction }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActiveRoute = (href: string) =>
    href === "/management" ? pathname === href : pathname.startsWith(href);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navbar - Only visible on mobile */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-neutral-900 border-b border-neutral-800 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div
            className="flex items-center justify-between px-4"
          >
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={150}
              height={60}
              priority
            />
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="bg-neutral-800 border-t border-neutral-700 px-2 py-2 space-y-1">
            {/* Main Menu Items */}
            {menuItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isActiveRoute(item.href)}
                onClick={handleNavClick}
              />
            ))}

            <div className="border-t border-neutral-700 my-2 pt-2">
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
                <LogoutButton expanded={true} />
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
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 ${
        active
          ? "bg-neutral-700 text-white border-l-4 border-yellow-500"
          : "text-gray-300 hover:bg-neutral-700 hover:text-white"
      }`}
    >
      <Icon
        className={`h-5 w-5 flex-shrink-0 ${
          active ? "text-yellow-500" : "text-gray-400"
        }`}
      />
      <span className="whitespace-nowrap">{item.name}</span>
    </Link>
  );
}
