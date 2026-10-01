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
  const [collapsed, setCollapsed] =
    useState(false);


  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <DashboardMenu
        collapsed={collapsed}
        setCollapsedAction={setCollapsed}
      />

      <MobileNavbar />

      <main
        className={[
          "min-h-screen overflow-auto",
          "transition-[margin] duration-200 ease-in-out",
          collapsed
            ? "md:ml-20"
            : "md:ml-64",
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}