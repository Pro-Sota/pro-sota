"use client";
import DashboardMenu from "@/components/dashboard_menu";
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
        <div className="flex flex-row items-start min-h-screen bg-gray-100">
            <DashboardMenu />
           <div className="flex-1 p-4">{children}</div>
        </div>
        </>
    )
}