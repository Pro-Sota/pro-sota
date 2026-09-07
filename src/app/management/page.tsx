import { getAllUsers } from "@/services/auth_server";


import Dashboard from "./dashboard";
import { getDashboardData } from "@/services/dashboard";




export default async function Page() {

  const dashboardData = await getDashboardData();

  return (<Dashboard data={dashboardData} />);
  }

