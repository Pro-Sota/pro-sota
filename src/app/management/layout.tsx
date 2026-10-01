import DashboardLayoutClient from "./dashboard_layout";

import {
  getCurrentUserPermissions,
} from "@/app/lib/permissions/server";

import PermissionProvider from "@/app/components/permission_provider";

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentUserPermissions();


  const userRole = auth.role;
  const userDepartment = auth.department;;

  const permissions = Array.from(
    auth.permissions,
  );

  return (
    <PermissionProvider
      permissions={permissions}
    >
      <DashboardLayoutClient
        userRole={userRole}
        userDepartment={userDepartment}
      >
        {children}
      </DashboardLayoutClient>
    </PermissionProvider>
  );
}