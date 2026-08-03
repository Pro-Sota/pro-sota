import type { Metadata } from "next";
import DashboardLayout from "./dashboard_layout";

export const metadata: Metadata = {
  title: {
    template: "%s | ProSota",
    default: "Dashboard | ProSota",
  },
  description: "ProSota Management Dashboard",
  openGraph: {
    title: "ProSota Management Dashboard", 
    description: "ProSota Management Dashboard",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}