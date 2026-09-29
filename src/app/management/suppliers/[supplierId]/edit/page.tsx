import { notFound } from "next/navigation";

import SupplierForm from "../../supplier_form";
import { updateSupplierAction } from "@/actions/suppliers";
import { getSupplierById } from "@/services/supplier";

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = await params;

  const supplier =
    await getSupplierById(supplierId);

  if (!supplier) {
    notFound();
  }

  return (
    <SupplierForm
      mode="edit"
      supplier={supplier}
      action={updateSupplierAction}
    />
  );
}