"use client";

import DashboardMenu from "@/app/components/management_menu";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <DashboardMenu />

      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}