"use server";

import { submitContact } from "@/services/contact";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function submitContactAction(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  // The hidden field is a honeypot for basic automated spam.
  const honeypot = String(formData.get("website") ?? "").trim();

  if (honeypot) {
    // Do not reveal the honeypot check to automated submissions.
    return {
      status: "success",
      message:
        "O seu pedido foi recebido. Entraremos em contacto consigo.",
    };
  }

  try {
    const result = await submitContact(formData);

    if (!result.success) {
      return {
        status: "error",
        message: result.message,
      };
    }

    return {
      status: "success",
      message:
        "O seu pedido foi recebido com sucesso. A nossa equipa entrará em contacto consigo.",
    };
  } catch (error) {
    console.error("[contact-action] Failed to submit contact request:", error);

    return {
      status: "error",
      message:
        "Não foi possível enviar o pedido neste momento. Tente novamente mais tarde ou contacte-nos por telefone.",
    };
  }
}