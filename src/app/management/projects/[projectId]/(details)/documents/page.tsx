import {redirect} from "next/navigation";

export default async function ProjectDocument(  {params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  redirect(`/management/projects/${projectId}/documents/all-files`);
}