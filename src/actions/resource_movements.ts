"use server";

import { createResourceMovement, ResourceMovementFormInput } from "@/services/resource_movements";
import { revalidatePath } from "next/cache";


export async function createResourceMovementAction(
  data: ResourceMovementFormInput,
) {
  try {
    const result = await createResourceMovement(data);

    revalidatePath("/management/work-resources");

    if (data.resource_id) {
      revalidatePath(
        `/management/work-resources/${data.resource_id}`,
      );
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(
      "createResourceMovementAction error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível registar a movimentação.",
    };
  }
}