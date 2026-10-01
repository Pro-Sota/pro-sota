import { notFound } from "next/navigation";

import {
  getSupplierById,
  getSupplierEvaluations,
} from "@/services/supplier";

import { SupplierHeader } from "../supplier_header";
import { SupplierContact } from "../supplier_contact";
import { SupplierClassification } from "../supplier_classification";
import { SupplierPerformance } from "../supplier_performance";
import { SupplierProjects } from "../supplier_projects";
import { SupplierDocuments } from "../supplier_documents";
import { SupplierActivity } from "../supplier_activity";
import { SupplierRegistration } from "../supplier_registration";

type Props = {
  params: Promise<{
    supplierId: string;
  }>;
};

export default async function SupplierDetailsPage({
  params,
}: Props) {
  const { supplierId } = await params;

  const supplier = await getSupplierById(supplierId);

  if (!supplier) {
    notFound();
  }

  const evaluations = await getSupplierEvaluations(supplierId);

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <SupplierHeader supplier={supplier} />

        <div className="grid gap-6 lg:grid-cols-2">
          <SupplierContact supplier={supplier} />

          <SupplierClassification supplier={supplier} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SupplierPerformance
            supplierId={supplierId}
            evaluations={evaluations}
          />

          <SupplierRegistration supplier={supplier} />
        </div>

        <SupplierProjects supplierId={supplierId} />

        <SupplierDocuments supplierId={supplierId} />

        <SupplierActivity supplierId={supplierId} />
      </div>
    </main>
  );
}