import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

import ProjectSubmissionReview from "./submission_page";
import {
  fetchAllProjectSubmissions,
  canReviewProjectSubmissions,
} from "@/services/submissions";

export default async function ApprovalsAndReviewsPage() {
  const supabase = await createClient(await cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Load submissions directly. No projects-table query.
  const submissions = await fetchAllProjectSubmissions();

  // Determine which projects the current user can review.
  const projectIds = [
    ...new Set(submissions.map((submission) => submission.project_id)),
  ];

  const reviewPermissions = await Promise.all(
    projectIds.map(async (projectId) => ({
      projectId,
      canReview: await canReviewProjectSubmissions(projectId),
    })),
  );

  const reviewableProjectIds = reviewPermissions
    .filter((permission) => permission.canReview)
    .map((permission) => permission.projectId);

  return (
    <ProjectSubmissionReview
      submissions={submissions}
      canReview={reviewableProjectIds.length > 0}
    />
  );
}