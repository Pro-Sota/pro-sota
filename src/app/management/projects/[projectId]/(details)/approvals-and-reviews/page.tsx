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
      submissions={submissions.map(
        (submission) => ({
          id: submission.id,
          project_id:
            submission.project_id,
          title: submission.title,
          description:
            submission.description ??
            undefined,
          type:
            submission.type ===
              "design" ||
              submission.type ===
              "technical" ||
              submission.type ===
              "client_approval"
              ? submission.type
              : "technical",
          status:
            submission.status ===
              "pending" ||
              submission.status ===
              "approved" ||
              submission.status ===
              "rejected" ||
              submission.status ===
              "changes_requested"
              ? submission.status
              : "pending",
          submitted_by:
            submission.submitted_by_name,
          submitted_date:
            submission.submitted_date,
          due_date:
            submission.due_date ?? "",
          notes:
            submission.notes ??
            undefined,
          created_at:
            submission.created_at,
          updated_at:
            submission.updated_at,
        }),
      )}

    />
  );
}