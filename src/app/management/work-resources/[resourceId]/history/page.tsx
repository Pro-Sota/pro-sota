import { notFound } from "next/navigation";

import {
  getResourceById,
  getResourceMovements,
} from "@/services/resources";

import ResourceHistory from "./resource_history";

type Props = {
  params: Promise<{
    resourceId: string;
  }>;
};

export default async function ResourceHistoryPage({
  params,
}: Props) {
  const { resourceId } = await params;

  const [resource, movements] = await Promise.all([
    getResourceById(resourceId),
    getResourceMovements(resourceId),
  ]);

  if (!resource) {
    notFound();
  }

  return (
    <ResourceHistory
      resource={resource}
      movements={movements}
    />
  );
}