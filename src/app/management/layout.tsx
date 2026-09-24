import type { Metadata } from "next";
import DashboardLayoutClient from "./dashboard_layout";
import { requireUser } from "../lib/supabase/auth";

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


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRole, userDepartment } = await requireUser();
  const safeUserRole = userRole ?? null;
  const safeUserDepartment = userDepartment ?? null;

  return (
    <DashboardLayoutClient
      userRole={safeUserRole}
      userDepartment={safeUserDepartment}
    >
      {children}
    </DashboardLayoutClient>
  );
}