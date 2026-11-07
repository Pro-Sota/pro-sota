import DashboardLayoutClient from "./dashboard_layout";

import { getCurrentUserPermissions } from "@/app/lib/permissions/server";

import PermissionProvider from "@/app/components/permission_provider";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Management | PRO SOTA",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentUserPermissions();

  const permissions = Array.from(auth.permissions);

  return (
    <PermissionProvider permissions={permissions}>
      <DashboardLayoutClient
        userRole={auth.role}
        userDepartment={auth.department}
      >
        {children}
      </DashboardLayoutClient>
    </PermissionProvider>
  );
}