// src/app/management/resources/[resourceId]/ResourceDetailsClient.tsx

import { notFound } from "next/navigation";

import {
  getResourceById,
  getResourceStock,
  getResourceAssignments,
  getResourceMovements,
  getResourceMaintenance,
  getResourceDeliveryTerms,
  getResourceAttachments,
  getResourceLocations,
} from "@/services/resources";

import ResourceDetailsClient from "./resource_view";

type PageProps = {
  params: Promise<{
    resourceId: string;
  }>;
};

export default async function ResourceDetailsPage({
  params,
}: PageProps) {
  const { resourceId } = await params;

  const resource = await getResourceById(resourceId);

  if (!resource) {
    notFound();
  }

  const [
    stock,
    assignments,
    movements,
    maintenance,
    deliveryTerms,
    attachments,
    locations,
  ] = await Promise.all([
    getResourceStock(resourceId),
    getResourceAssignments(resourceId),
    getResourceMovements(resourceId),
    getResourceMaintenance(resourceId),
    getResourceDeliveryTerms(resourceId),
    getResourceAttachments(resourceId),
    getResourceLocations(),
  ]);

  return (
    <ResourceDetailsClient
      resource={resource}
      stock={stock}
      assignments={assignments}
      movements={movements}
      maintenance={maintenance}
      deliveryTerms={deliveryTerms}
      attachments={attachments}
      locations={locations}
    />
  );
}
