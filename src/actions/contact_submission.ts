
"use server";

import {
  createContactSubmission,
  type ContactResult,
} from "@/services/contact_submission";

export async function submitContact(
  formData: FormData
): Promise<ContactResult> {
  try {
    return await createContactSubmission(formData);
  } catch (error) {
    console.error("Submit contact action:", error);

    return {
      success: false,
      message: "",
      error: "Não foi possível enviar. Tente novamente.",
    };
  }
}
