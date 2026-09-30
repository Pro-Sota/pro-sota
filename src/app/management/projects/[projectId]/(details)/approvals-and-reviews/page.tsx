import {
  getCurrentUserProjectSubmissions,
} from "@/services/submissions";

import ApprovalsAndReviews from "./approvals_and_reviews";
import { getCurrentUserProjectDocuments } from "@/services/documents";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export type UserProjectDocument = {
  document_id: string;
  project_id: string;
  name: string | null;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

export default async function Page({
  params,
}: Props) {
  const { projectId } =
    await params;

  const submissions =
    await getCurrentUserProjectSubmissions(
      projectId,
    );

  const userDocuments =
    await getCurrentUserProjectDocuments(
      projectId,
    );

  return (
    <ApprovalsAndReviews
      userDocuments={userDocuments}
      submissions={submissions}

    />
  );
}