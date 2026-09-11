import { getClients } from "@/services/clients"
import ClientsPage from "./clients";

export default async function ClientPageInit() {

  const allClients = await getClients();
  
  return <ClientsPage allClients={allClients} />
}