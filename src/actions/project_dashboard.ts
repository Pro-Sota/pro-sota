"use server";

import { revalidatePath } from "next/cache";

import { updateProjectDetails } from "@/services/project_dashboard";
import type {
  ActionResult,
  UpdateProjectInput,
} from "@/app/management/projects/types";

export async function updateProjectDetailsAction(
  projectId: string,
  input: UpdateProjectInput,
): Promise<ActionResult> {
  const result = await updateProjectDetails(projectId, input);

  if (result.success) {
    revalidatePath("/management/projects");
    revalidatePath(`/management/projects/${projectId}`, "layout");
  }

  return result;
}