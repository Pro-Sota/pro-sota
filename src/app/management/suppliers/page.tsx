import SuppliersClientPage from "./suppliers_client_page";
import { getSuppliers } from "@/services/supplier";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return <SuppliersClientPage suppliers={suppliers} />;
}