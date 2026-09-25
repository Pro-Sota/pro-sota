import { getAllUsers } from "@/services/auth_server";


import Dashboard from "./dashboard";
import { getDashboardData } from "@/services/dashboard";
import AdminDashboard from "./admin_dashboard";
import { Dancing_Script } from "next/font/google";


export default async function Page() {
  
  const dashboardData = await getDashboardData();

    if(dashboardData.currentUser?.role_id === 1){
      return (<AdminDashboard data={dashboardData} />)
    }else {
     return <Dashboard data={dashboardData}/>;

    }
  }

