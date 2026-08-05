import SuppliersClientPage from "./suppliers_client_page";

type SupplierStatus = "Activo" | "Inactivo" | "Em Análise";

type Supplier = {
  name: string;
  category: string;
  location: string;
  rating: number;
  projects: number;
  status: SupplierStatus;
};

export default async function SuppliersPage() {

  const suppliers : Supplier[] = [];
  return <SuppliersClientPage suppliers={suppliers}/>;
}