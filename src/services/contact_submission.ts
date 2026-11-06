
import "server-only";

import { createClient } from "@supabase/supabase-js";

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

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Configuração do servidor incompleta.");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function validateImage(file: File): Promise<string | null> {
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

export async function createContactSubmission(
  formData: FormData
): Promise<ContactResult> {
  let uploadedPath: string | null = null;

  const supabase = getSupabaseAdmin();

  try {
    const getValue = (key: string) =>
      String(formData.get(key) ?? "").trim();

    // Honeypot protection.
    if (getValue("website")) {
      return {
        success: true,
        message:
          "Pedido recebido. Entraremos em contacto consigo em breve.",
      };
    }

    const name = getValue("name");
    const email = getValue("email");
    const phone = getValue("phone");
    const service = getValue("service");
    const urgency = getValue("urgency");
    const message = getValue("message");

    // Field validation.
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

    if (urgency && !ALLOWED_URGENCIES.includes(urgency)) {
      throw new Error("Seleccione uma urgência válida.");
    }

    if (message.length > 4000) {
      throw new Error(
        "A mensagem não pode ultrapassar 4000 caracteres."
      );
    }

    const file = formData.get("image");

    if (file !== null && !(file instanceof File)) {
      throw new Error("Ficheiro inválido.");
    }

    // Validate and upload optional image.
    if (file instanceof File && file.size > 0) {
      const imageError = await validateImage(file);

      if (imageError) {
        throw new Error(imageError);
      }

      const extension =
        file.type === "image/jpeg"
          ? "jpg"
          : file.type.split("/")[1];

      const fileName = `${crypto.randomUUID()}.${extension}`;

      uploadedPath = `contact/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(uploadedPath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error("Não foi possível guardar a imagem.");
      }
    }

    // Register the contact request as a new lead.
    const { error: insertError } = await supabase
      .from("leads")
      .insert({
        name,
        email: email || null,
        phone,
        project_type: service,
        description: message || null,
        urgency: urgency || null,
        image_path: uploadedPath,
        source: "website",
        status: "new",
        created_by: null,
      });

    if (insertError) {
      console.error("Contact submission error:", insertError);
      throw new Error(
        "Não foi possível registar o pedido. Tente novamente."
      );
    }

    return {
      success: true,
      message:
        "Pedido recebido. Entraremos em contacto consigo em breve.",
    };
  } catch (error) {
    // Roll back the uploaded image if database insertion fails.
    if (uploadedPath) {
      const { error: cleanupError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([uploadedPath]);

      if (cleanupError) {
        console.error("Contact image cleanup error:", cleanupError);
      }
    }

    console.error("Create contact submission:", error);

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
