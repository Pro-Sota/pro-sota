
"use server";

import { createClient } from "@/app/lib/supabase/server";
import type { Database } from "@/app/lib/supabase/models";
import { cookies } from "next/headers";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type UpdateProfileInput = {
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  dob: string;
  nationality: string;
  job_title: string;
  bio: string;
  profile_picture: string | null;
  department?: string;
  role_id?: number | null;
  status?: "Active" | "Inactive" | "Pending" | "Suspended";
};

export type ProfileActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<ProfileActionResult> {
  try {
    const supabase = await createClient(await cookies());

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Sessão inválida. Inicie sessão novamente.",
      };
    }

    const { data: currentProfile, error: currentProfileError } =
      await supabase
        .from("profiles")
        .select("role_id")
        .eq("profile_id", user.id)
        .maybeSingle();

    if (currentProfileError || !currentProfile) {
      return {
        success: false,
        error: "Não foi possível verificar as suas permissões.",
      };
    }

    const isAdmin = currentProfile.role_id === 1;
    const isOwnProfile = user.id === input.profile_id;

    if (!isOwnProfile && !isAdmin) {
      return {
        success: false,
        error: "Não tem autorização para editar este perfil.",
      };
    }

    if (!input.first_name.trim() || !input.last_name.trim()) {
      return {
        success: false,
        error: "O nome e o apelido são obrigatórios.",
      };
    }

    if (
      input.status !== undefined &&
      !["Active", "Inactive", "Pending", "Suspended"].includes(input.status)
    ) {
      return {
        success: false,
        error: "Estado da conta inválido.",
      };
    }

    if (
      input.role_id !== undefined &&
      input.role_id !== null &&
      (!Number.isSafeInteger(input.role_id) || input.role_id < 1)
    ) {
      return {
        success: false,
        error: "ID da função inválido.",
      };
    }

    const updates: ProfileUpdate = {
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      email: input.email.trim() || null,
      phone_number: input.phone_number.trim() || null,
      dob: input.dob || null,
      nationality: input.nationality.trim() || null,
      job_title: input.job_title.trim() || null,
      bio: input.bio.trim() || null,
      profile_picture: input.profile_picture,
      updated_at: new Date().toISOString(),
    };

    // Never trust the UI to enforce admin-only fields.
    if (isAdmin) {
      if (input.department !== undefined) {
        updates.department = input.department.trim() || null;
      }

      if (input.role_id !== undefined) {
        updates.role_id = input.role_id;
      }

      if (input.status !== undefined) {
        updates.status = input.status;
      }
    }

    const { data: updatedRows, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("profile_id", input.profile_id)
      .select("profile_id");

    if (updateError) {
      console.error("Erro ao atualizar perfil:", updateError);

      return {
        success: false,
        error: "Não foi possível guardar as alterações.",
      };
    }

    if (!updatedRows?.length) {
      return {
        success: false,
        error: "Perfil não atualizado. Verifique as permissões RLS.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro inesperado ao atualizar perfil:", error);

    return {
      success: false,
      error: "Ocorreu um erro inesperado ao guardar o perfil.",
    };
  }
}
