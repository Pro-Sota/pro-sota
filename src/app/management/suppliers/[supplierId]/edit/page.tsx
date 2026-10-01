import { notFound } from "next/navigation";

import { updateSupplierAction } from "@/actions/suppliers";
import { getSupplierById } from "@/services/supplier";

import SupplierForm from "../../supplier_form";

type Props = {
  params: Promise<{
    supplierId: string;
  }>;
};

export default async function EditSupplierPage({
  params,
}: Props) {
  const { supplierId } = await params;

  const supplier =
    await getSupplierById(supplierId);

  if (!supplier) {
    notFound();
  }

  return (
    <SupplierForm
      supplier={supplier}
      action={async (formData) =>
        updateSupplierAction(
          supplierId,
          Object.fromEntries(formData.entries()) as Parameters<
            typeof updateSupplierAction
          >[1],
        )
      }
      mode="edit"
    />
  );
}