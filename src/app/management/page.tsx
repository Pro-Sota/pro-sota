// src/app/management/page.tsx

import AdminDashboard from "./admin_dashboard";
import Dashboard from "./dashboard";
import {
  getAdminDashboardData,
  getDashboardData,
} from "@/services/dashboard";

export default async function Page() {
  /*
   * Get the normal dashboard first.
   *
   * This query is already scoped to the authenticated user,
   * so it is safe to determine which dashboard should be shown.
   */
  const dashboardData = await getDashboardData();

  if (dashboardData.currentUser?.role_id === 1) {
    /*
     * Admin gets a separate company-wide dataset.
     */
    const adminData = await getAdminDashboardData();

    return <AdminDashboard data={adminData} />;
  }

  return <Dashboard data={dashboardData} />;
}