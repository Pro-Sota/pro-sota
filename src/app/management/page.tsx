import { getAllUsers } from "@/services/auth_server";
import { Metadata } from 'next';


import Dashboard from "./dashboard";


export default async function Page() {

  const allUsers = await getAllUsers();
  
  return (<Dashboard allUsers={allUsers || []} />);
  }