import { fetchAllProjectSubmissions } from "@/services/submissions";
import type { Submission } from "./types";
import ApprovalsAndReviews from "./approvals_and_reviews";
import SubmissionsReviewPage from "./approvals_and_reviews_admin";


export default async function ApprovalsAndReviewsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const allSubmitions = await fetchAllProjectSubmissions(projectId);
  const submissions = allSubmitions as unknown as Submission[];

  // return <ApprovalsAndReviews submissions={submissions} />;

  return <SubmissionsReviewPage allSubmissions={allSubmitions}  />  

}