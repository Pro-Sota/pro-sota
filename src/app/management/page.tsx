import { getAllUsers } from "@/services/auth_server";


import Dashboard from "./dashboard";
import { getDashboardData } from "@/services/dashboard";
import { getSession } from "@/services/auth_server";
import { redirect } from "next/navigation";




export default async function Page() {

  const {session} = await getSession();

  if(!session?.user){
    redirect("/login")
  }

   await new Promise((resolve) => setTimeout(resolve, 3000));
  const dashboardData = await getDashboardData();

  return (<Dashboard data={dashboardData} />);
  }

