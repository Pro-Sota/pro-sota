"use client";
import DashboardMenu from "@/components/management_menu";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
        <div className="flex flex-row items-start min-h-screen bg-white">
            <DashboardMenu />
           <div className="flex-1 ml-[250px] ">{children}</div>
        </div>
        </>
    )
}