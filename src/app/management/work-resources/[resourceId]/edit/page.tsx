import { notFound } from "next/navigation";

import { getResourceById } from "@/services/resources";
import EditResourceForm from "../../resource_form"
type Props = {
  params: Promise<{
    resourceId: string;
  }>;
};

export default async function EditResourcePage({
  params,
}: Props) {
  const { resourceId } = await params;

  const resource =
    await getResourceById(resourceId);

  if (!resource) {
    notFound();
  }

  return (
    <EditResourceForm
      resource={resource}
    />
  );
}