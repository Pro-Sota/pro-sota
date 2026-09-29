import { getClients } from "@/services/clients";
import ClientsPage from "./clients";

export default async function Page() {
  const clients = await getClients();

  return <ClientsPage allClients={clients} />;
}