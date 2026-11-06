
import "server-only";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

export type ContactResult = {
  success: boolean;
  message: string;
  error?: string;
};

const MAX_IMAGE_SIZE = 3_000_000;

const ALLOWED_SERVICES = [
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização e consultoria",
  "Outro",
];

const ALLOWED_URGENCIES = [
  "Imediata",
  "Até 1 mês",
  "1 a 3 meses",
];

const STORAGE_BUCKET = "contact-attachments";

const SUCCESS_MESSAGE =
  "Pedido recebido. Entraremos em contacto consigo em breve.";

/* -------------------------------------------------------------------------- */
/* Image Validation                                                           */
/* -------------------------------------------------------------------------- */

async function validateImage(
  file: File
): Promise<string | null> {
  if (file.size > MAX_IMAGE_SIZE) {
    return "A imagem deve ter até 3 MB.";
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    return "Formato inválido. Utilize PNG, JPEG ou WebP.";
  }

  const bytes = new Uint8Array(
    await file.slice(0, 12).arrayBuffer()
  );

  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;

  const isJpeg =
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;

  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  const validSignature =
    (file.type === "image/png" && isPng) ||
    (file.type === "image/jpeg" && isJpeg) ||
    (file.type === "image/webp" && isWebp);

  return validSignature
    ? null
    : "O conteúdo da imagem não corresponde ao formato indicado.";
}

/* -------------------------------------------------------------------------- */
/* Contact Submission                                                         */
/* -------------------------------------------------------------------------- */

export async function createContactSubmission(
  formData: FormData
): Promise<ContactResult> {
  let uploadedPath: string | null = null;

  try {
    const getValue = (key: string): string =>
      String(formData.get(key) ?? "").trim();

    // Honeypot protection.
    if (getValue("website")) {
      return {
        success: true,
        message: SUCCESS_MESSAGE,
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Form Fields                                                    */
    /* ---------------------------------------------------------------------- */

    const name = getValue("name");
    const email = getValue("email");
    const phone = getValue("phone");
    const service = getValue("service");
    const urgency = getValue("urgency");
    const message = getValue("message");

    if (name.length < 2 || name.length > 120) {
      throw new Error("Introduza um nome válido.");
    }

    if (phone.length < 6 || phone.length > 30) {
      throw new Error("Introduza um número de telefone válido.");
    }

    if (
      email &&
      (
        email.length > 200 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      )
    ) {
      throw new Error("Introduza um endereço de email válido.");
    }

    if (!ALLOWED_SERVICES.includes(service)) {
      throw new Error("Seleccione um tipo de serviço válido.");
    }

    if (
      urgency &&
      !ALLOWED_URGENCIES.includes(urgency)
    ) {
      throw new Error("Seleccione uma urgência válida.");
    }

    if (message.length > 4000) {
      throw new Error(
        "A mensagem não pode ultrapassar 4000 caracteres."
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Image                                                          */
    /* ---------------------------------------------------------------------- */

    const file = formData.get("image");

    if (file !== null && !(file instanceof File)) {
      throw new Error("Ficheiro inválido.");
    }

    if (file instanceof File && file.size > 0) {
      const imageError = await validateImage(file);

      if (imageError) {
        throw new Error(imageError);
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Authenticated Supabase Server Client                                    */
    /* ---------------------------------------------------------------------- */

    const supabase = await createClient(await cookies());

    /* ---------------------------------------------------------------------- */
    /* Upload Image                                                            */
    /* ---------------------------------------------------------------------- */

    if (file instanceof File && file.size > 0) {
      const extensions: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const extension = extensions[file.type];

      if (!extension) {
        throw new Error("Formato de imagem não suportado.");
      }

      uploadedPath =
        `contact/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(uploadedPath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("[CONTACT STORAGE UPLOAD ERROR]", {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          bucket: STORAGE_BUCKET,
          path: uploadedPath,
        });

        throw new Error(
          "Não foi possível guardar a imagem. Tente novamente."
        );
      }
    }

    return {
      success: true,
      message: SUCCESS_MESSAGE,
    };

  } catch (error) {
    /* ---------------------------------------------------------------------- */
    /* Rollback Uploaded Image                                                 */
    /* ---------------------------------------------------------------------- */

    if (uploadedPath) {
      try {
        const supabase = await createClient(await cookies());

        const { error: cleanupError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error(
            "[CONTACT IMAGE CLEANUP ERROR]",
            cleanupError
          );
        }
      } catch (cleanupError) {
        console.error(
          "[CONTACT IMAGE CLEANUP EXCEPTION]",
          cleanupError
        );
      }
    }

    console.error("[CREATE CONTACT SUBMISSION ERROR]", error);

    return {
      success: false,
      message: "",
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível enviar. Tente novamente.",
    };
  }
}
