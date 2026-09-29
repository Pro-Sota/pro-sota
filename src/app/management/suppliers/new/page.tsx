import SupplierForm from "../supplier_form";
import { createSupplierAction } from "@/actions/suppliers";

export default function NewSupplierPage() {
  return (
    <SupplierForm
      mode="create"
      action={createSupplierAction}
    />
  );
}