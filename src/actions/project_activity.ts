"use server";

import { getProjectActivity } from "@/services/project_activity";

export async function loadProjectActivityPage(
  projectId: string,
  page: number,
) {
  return getProjectActivity(projectId, page);
}