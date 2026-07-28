"use client";

import { useState } from "react";
import DashboardMenu from "@/app/components/management_menu";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <DashboardMenu 
        collapsed={collapsed} 
        setCollapsedAction={setCollapsed}
      />

      <main
        className={`min-h-screen overflow-auto transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}