
"use client";

import { createClient } from "@/app/lib/supabase/client";

const BUCKET = "profile-pictures";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ProfilePictureUpload = {
  url: string;
  path: string;
};

export async function uploadProfilePicture(
  file: File,
  profileId: string
): Promise<ProfilePictureUpload> {
  const extension =
    ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];

  if (!extension) {
    throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("A imagem não pode ultrapassar 5 MB.");
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Sessão inválida. Inicie sessão novamente.");
  }

  // Storage policy should enforce this folder structure.
  const path = `${user.id}/${profileId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Erro ao carregar a fotografia: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
  };
}
