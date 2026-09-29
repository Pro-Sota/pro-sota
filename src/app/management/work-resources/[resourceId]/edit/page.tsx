import { notFound } from "next/navigation";

import {
  getResourceDetailsById,
  getResourceLocations,
} from "@/services/resources";

import ResourceForm from "../../resource_form";

type EditResourcePageProps = {
  params: Promise<{
    resourceId: string;
  }>;
};

export default async function EditResourcePage({
  params,
}: EditResourcePageProps) {
  const { resourceId } = await params;

  const [details, locations] =
    await Promise.all([
      getResourceDetailsById(resourceId),
      getResourceLocations(),
    ]);

  if (!details) {
    notFound();
  }

  return (
    <ResourceForm
      mode="edit"
      resource={details}
      stock={details.stock}
      locations={locations}
    />
  );
}