import SuppliersClientPage from "./suppliers_client_page";

type SupplierStatus = "Activo" | "Inactivo" | "Em Análise";

import {Database} from "@/app/lib/supabase/models";

type Supplier = Database["public"]["Tables"]["Suppliers"]["Row"];

export default async function SuppliersPage() {

  const suppliers : Supplier[] = [];
  return <SuppliersClientPage suppliers={suppliers}/>;
}