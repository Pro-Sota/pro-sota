
import "server-only";

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const STORAGE_BUCKET = "contact-attachments";

const SERVICES = [
  "Arquitectura",
  "Engenharia",
  "Construção",
  "Fiscalização e consultoria",
  "Outro",
] as const;

const URGENCIES = ["Imediata", "Até 1 mês", "1 a 3 meses"] as const;

type ServiceName = (typeof SERVICES)[number];
type UrgencyName = (typeof URGENCIES)[number];

type ContactInput = {
  name: string;
  email: string | null;
  phone: string;
  service: ServiceName;
  urgency: UrgencyName | null;
  message: string;
  image: File | null;
};

export type ContactResult =
  | { success: true; leadId: string }
  | { success: false; message: string };

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateForm(
  formData: FormData,
): { input: ContactInput } | { error: string } {
  const name = getText(formData, "name");
  const emailValue = getText(formData, "email");
  const phone = getText(formData, "phone");
  const serviceValue = getText(formData, "service");
  const urgencyValue = getText(formData, "urgency");
  const message = getText(formData, "message");
  const imageValue = formData.get("image");

  if (name.length < 2 || name.length > 120) {
    return { error: "Introduza um nome válido." };
  }

  if (phone.length < 6 || phone.length > 30) {
    return { error: "Introduza um número de telefone válido." };
  }

  if (
    emailValue &&
    (emailValue.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue))
  ) {
    return { error: "Introduza um endereço de e-mail válido." };
  }

  if (!SERVICES.includes(serviceValue as ServiceName)) {
    return { error: "Seleccione um serviço válido." };
  }

  if (
    urgencyValue &&
    !URGENCIES.includes(urgencyValue as UrgencyName)
  ) {
    return { error: "Seleccione um prazo válido." };
  }

  if (message.length < 10 || message.length > 5000) {
    return {
      error: "A descrição deve ter entre 10 e 5000 caracteres.",
    };
  }

  let image: File | null = null;

  if (imageValue instanceof File && imageValue.size > 0) {
    if (imageValue.size > MAX_IMAGE_SIZE) {
      return { error: "A imagem não pode exceder 3 MB." };
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        imageValue.type,
      )
    ) {
      return {
        error: "A imagem deve estar no formato PNG, JPG ou WebP.",
      };
    }

    image = imageValue;
  }

  return {
    input: {
      name,
      email: emailValue || null,
      phone,
      service: serviceValue as ServiceName,
      urgency: (urgencyValue || null) as UrgencyName | null,
      message,
      image,
    },
  };
}

async function identifyImage(
  file: File,
): Promise<{
  extension: "jpg" | "png" | "webp";
  contentType: "image/jpeg" | "image/png" | "image/webp";
} | null> {
  const header = new Uint8Array(
    await file.slice(0, 12).arrayBuffer(),
  );

  if (
    header.length >= 8 &&
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47 &&
    header[4] === 0x0d &&
    header[5] === 0x0a &&
    header[6] === 0x1a &&
    header[7] === 0x0a
  ) {
    return { extension: "png", contentType: "image/png" };
  }

  if (
    header.length >= 3 &&
    header[0] === 0xff &&
    header[1] === 0xd8 &&
    header[2] === 0xff
  ) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }

  if (
    header.length >= 12 &&
    String.fromCharCode(...header.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...header.slice(8, 12)) === "WEBP"
  ) {
    return { extension: "webp", contentType: "image/webp" };
  }

  return null;
}

async function uploadImage(
  file: File,
): Promise<{ path: string } | { error: string }> {
  const imageInfo = await identifyImage(file);

  if (!imageInfo) {
    return {
      error: "O ficheiro enviado não é uma imagem válida.",
    };
  }

  const supabase = getAdminSupabase();
  const dateFolder = new Date().toISOString().slice(0, 10);
  const path = `${dateFolder}/${randomUUID()}.${imageInfo.extension}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: imageInfo.contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("[contact] Image upload failed:", error.message);

    return {
      error:
        "Não foi possível guardar a imagem. Tente novamente ou envie o pedido sem a imagem.",
    };
  }

  return { path };
}

export async function submitContact(
  formData: FormData,
): Promise<ContactResult> {
  const validation = validateForm(formData);

  if ("error" in validation) {
    return { success: false, message: validation.error };
  }

  const input = validation.input;
  let imagePath: string | null = null;

  if (input.image) {
    const uploadResult = await uploadImage(input.image);

    if ("error" in uploadResult) {
      return { success: false, message: uploadResult.error };
    }

    imagePath = uploadResult.path;
  }

  const supabase = getAdminSupabase();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      project_name: "Pedido de contacto pelo website",
      project_type: input.service,
      description: input.message,
      urgency: input.urgency,
      image_path: imagePath,
      source: "website",
      status: "new",
      created_by: null,
    })
    .select("lead_id")
    .single();

  if (error || !data) {
    console.error("[contact] Lead insert failed:", error?.message);

    if (imagePath) {
      const { error: cleanupError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([imagePath]);

      if (cleanupError) {
        console.error(
          "[contact] Image cleanup failed:",
          cleanupError.message,
        );
      }
    }

    return {
      success: false,
      message:
        "Não foi possível registar o seu pedido. Tente novamente mais tarde.",
    };
  }

  return {
    success: true,
    leadId: data.lead_id,
  };
}
