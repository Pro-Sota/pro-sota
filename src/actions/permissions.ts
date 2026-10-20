"use server";

import { createClient } from "@/app/lib/supabase/server";

import type {
  PermissionDraft,
  Role,
  SaveResult,
} from "@/app/management/team/permissions/types";
import { cookies } from "next/headers";

const VALID_ROLES = new Set<Role>(["admin", "director", "user"]);

function roleKey(name: string): Role {
  switch (name.trim().toLowerCase()) {
    case "admin":
      return "admin";
    case "director":
      return "director";
    default:
      return "user";
  }
}

export async function saveMemberPermissions(
  draft: PermissionDraft,
): Promise<SaveResult> {
  try {
    if (
      !draft ||
      typeof draft.profileId !== "string" ||
      !draft.profileId.trim() ||
      !VALID_ROLES.has(draft.role) ||
      !draft.overrides ||
      typeof draft.overrides !== "object" ||
      Array.isArray(draft.overrides)
    ) {
      return { success: false, error: "Os dados enviados são inválidos." };
    }

    const supabase = await createClient(await cookies());

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "A sessão expirou. Inicia sessão novamente.",
      };
    }

    const { data: actor, error: actorError } = await supabase
      .from("profiles")
      .select("role_id")
      .eq("profile_id", user.id)
      .single();

    if (actorError || !actor) {
      return {
        success: false,
        error: "Não foi possível validar o teu perfil.",
      };
    }

    const { data: actorRole, error: actorRoleError } = await supabase
      .from("roles")
      .select("name")
      .eq("role_id", actor.role_id)
      .single();

    if (actorRoleError || actorRole?.name?.toLowerCase() !== "admin") {
      return {
        success: false,
        error: "Não tens autorização para gerir permissões.",
      };
    }

    const [
      { data: target, error: targetError },
      { data: roles, error: rolesError },
      { data: permissionRows, error: permissionsError },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("profile_id, role_id")
        .eq("profile_id", draft.profileId)
        .single(),

      supabase.from("roles").select("role_id, name"),

      supabase.from("permissions").select("permission_id, key"),
    ]);

    if (targetError || !target) {
      return {
        success: false,
        error: "O membro selecionado não foi encontrado.",
      };
    }

    if (rolesError || !roles) {
      return {
        success: false,
        error: "Não foi possível validar os cargos.",
      };
    }

    if (permissionsError || !permissionRows) {
      return {
        success: false,
        error: "Não foi possível validar as permissões.",
      };
    }

    const targetRole = roles.find(
      (role) => role.name.toLowerCase() === draft.role,
    );

    if (!targetRole) {
      return {
        success: false,
        error: `O cargo "${draft.role}" não existe na tabela roles.`,
      };
    }

    const permissionIdByKey = new Map(
      permissionRows.map((permission) => [
        permission.key,
        permission.permission_id,
      ]),
    );

    const validKeys = new Set(permissionIdByKey.keys());

    for (const [key, value] of Object.entries(draft.overrides)) {
      if (!validKeys.has(key) || typeof value !== "boolean") {
        return {
          success: false,
          error: `A permissão "${key}" é inválida.`,
        };
      }
    }

    // Atualiza o cargo do membro.
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ role_id: targetRole.role_id })
      .eq("profile_id", draft.profileId);

    if (updateProfileError) {
      return {
        success: false,
        error: "Não foi possível atualizar o cargo do membro.",
      };
    }

    const overrideRows = Object.entries(draft.overrides).map(
      ([key, allowed]) => ({
        profile_id: draft.profileId,
        permission_id: permissionIdByKey.get(key)!,
        allowed,
        updated_at: new Date().toISOString(),
      }),
    );

    // Primeiro grava as exceções fornecidas.
    if (overrideRows.length > 0) {
      const { error: upsertError } = await supabase
        .from("user_permission_overrides")
        .upsert(overrideRows, {
          onConflict: "profile_id,permission_id",
        });

      if (upsertError) {
        return {
          success: false,
          error: "O cargo foi atualizado, mas não foi possível guardar as exceções.",
        };
      }
    }

    // Remove exceções antigas que já não fazem parte do rascunho.
    const submittedIds = overrideRows.map((row) => row.permission_id);

    let deleteQuery = supabase
      .from("user_permission_overrides")
      .delete()
      .eq("profile_id", draft.profileId);

    if (submittedIds.length > 0) {
      deleteQuery = deleteQuery.not(
        "permission_id",
        "in",
        `(${submittedIds.join(",")})`,
      );
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      return {
        success: false,
        error: "As alterações foram parcialmente guardadas. Tenta novamente.",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Ocorreu um erro inesperado ao guardar as permissões.",
    };
  }
}