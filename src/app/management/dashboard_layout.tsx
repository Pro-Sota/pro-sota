"use client";

import { useState } from "react";
import DashboardMenu from "@/app/components/management_menu";
import MobileNavbar from "@/app/components/mobile_navbar";

type Props = {
  children: React.ReactNode;
  userRole: string | null;
  userDepartment: string | null;
};

export default function DashboardLayoutClient({
  children,
  userRole,
  userDepartment,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const sidebarExpanded = !collapsed || sidebarHovered;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Desktop Sidebar */}
      <DashboardMenu
        collapsed={collapsed}
        setCollapsedAction={setCollapsed}
        userRole={userRole}
        userDepartment={userDepartment}
        onHoverChange={setSidebarHovered}
      />

      {/* Mobile Navbar */}
      <MobileNavbar
        userRole={userRole}
        userDepartment={userDepartment}
      />

      {/* Main Content */}
      <main
        className={[
          "min-h-screen overflow-auto",
          "transition-[margin] duration-200 ease-out",
          sidebarExpanded
            ? "md:ml-64"
            : "md:ml-20",
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}