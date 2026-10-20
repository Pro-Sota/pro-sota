
"use server";

import { randomBytes } from "node:crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import type { Database } from "@/app/lib/supabase/models";

const BUCKET = "profile-pictures";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

type ActionResult =
    | {
          success: true;
          message: string;
          temporaryPassword: string;
      }
    | {
          success: false;
          message: string;
      };

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            "A configuração administrativa do Supabase está incompleta."
        );
    }

    return createSupabaseClient<Database>(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

function generateTemporaryPassword() {
    return `${randomBytes(18).toString("base64url")}Aa1!`;
}

function requiredText(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

export async function createMemberAction(
    formData: FormData
): Promise<ActionResult> {
    let authUserId: string | null = null;
    let uploadedPath: string | null = null;

    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);

        // Require an authenticated administrator.
        const {
            data: { user: currentUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !currentUser) {
            return {
                success: false,
                message: "A sua sessão expirou. Inicie sessão novamente.",
            };
        }

        const { data: currentProfile, error: profileError } =
            await supabase
                .from("profiles")
                .select("role_id")
                .eq("profile_id", currentUser.id)
                .single();

        if (profileError || !currentProfile) {
            return {
                success: false,
                message: "Não foi possível verificar as suas permissões.",
            };
        }

        const admin = getAdminClient();

        const { data: currentRole, error: currentRoleError } =
            await admin
                .from("roles")
                .select("name")
                .eq("role_id", currentProfile.role_id)
                .single();

        if (
            currentRoleError ||
            !currentRole ||
            !["Admin", "Utilizador"].includes(currentRole.name!)
        ) {
            return {
                success: false,
                message: "Não tem permissão para registar membros.",
            };
        }

        const firstName = requiredText(formData, "first_name");
        const lastName = requiredText(formData, "last_name");
        const email = requiredText(formData, "email").toLowerCase();
        const phone = requiredText(formData, "phone_number");
        const dob = requiredText(formData, "dob");
        const nationality = requiredText(formData, "nationality");
        const department = requiredText(formData, "department");
        const jobTitle = requiredText(formData, "job_title");
        const bio = requiredText(formData, "bio");
        const image = formData.get("profile_image");

        if (!firstName || !lastName) {
            return {
                success: false,
                message: "O primeiro nome e o último nome são obrigatórios.",
            };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return {
                success: false,
                message: "Introduza um endereço de email válido.",
            };
        }

        if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
            return {
                success: false,
                message: "A data de nascimento é inválida.",
            };
        }

        if (
            image instanceof File &&
            image.size > 0 &&
            (!ALLOWED_TYPES[image.type] || image.size > MAX_IMAGE_SIZE)
        ) {
            return {
                success: false,
                message: "A fotografia deve ser JPG, PNG ou WebP e não ultrapassar 5 MB.",
            };
        }

        // Resolve the default role using the existing roles table.
        const { data: memberRole, error: roleError } = await admin
            .from("roles")
            .select("role_id")
            .eq("name", "Utilizador")
            .single();

        if (roleError || !memberRole) {
            return {
                success: false,
                message: 'O perfil de acesso "Utilizador" não existe na tabela roles.',
            };
        }

        const temporaryPassword = generateTemporaryPassword();

        // 1. Create the Supabase Auth account.
        const { data: createdAuth, error: createAuthError } =
            await admin.auth.admin.createUser({
                email,
                password: temporaryPassword,
                email_confirm: true,
                user_metadata: {
                    first_name: firstName,
                    last_name: lastName,
                },
            });

        if (createAuthError || !createdAuth.user) {
            if (
                createAuthError?.message.toLowerCase().includes("already") ||
                createAuthError?.code === "email_exists"
            ) {
                return {
                    success: false,
                    message: "Já existe uma conta com este endereço de email.",
                };
            }

            throw new Error(
                createAuthError?.message ??
                    "Não foi possível criar a conta de autenticação."
            );
        }

        authUserId = createdAuth.user.id;

        // 2. Upload the optional image and retain only its URL.
        let profilePictureUrl: string | null = null;

        if (image instanceof File && image.size > 0) {
            const extension = ALLOWED_TYPES[image.type];

            uploadedPath = `${authUserId}/profile.${extension}`;

            const { error: uploadError } = await admin.storage
                .from(BUCKET)
                .upload(uploadedPath, image, {
                    contentType: image.type,
                    upsert: false,
                });

            if (uploadError) {
                throw new Error(
                    `Não foi possível carregar a fotografia: ${uploadError.message}`
                );
            }

            const { data: publicUrlData } = admin.storage
                .from(BUCKET)
                .getPublicUrl(uploadedPath);

            profilePictureUrl = publicUrlData.publicUrl;
        }

        // 3. Create the application profile linked to auth.users.id.
        const profilePayload = {
            profile_id: authUserId,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone || null,
            role_id: memberRole.role_id,
            profile_picture: profilePictureUrl,
            dob: dob || null,
            nationality: nationality || null,
            bio: bio || null,
            department: department || null,
            job_title: jobTitle || null,
        } as Database["public"]["Tables"]["profiles"]["Insert"];

        const { error: insertProfileError } = await admin
            .from("profiles")
            .insert(profilePayload);

        if (insertProfileError) {
            throw new Error(
                `Não foi possível criar o perfil: ${insertProfileError.message}`
            );
        }

        return {
            success: true,
            message: "Membro e perfil criados com sucesso.",
            temporaryPassword,
        };
    } catch (error) {
        // Roll back resources created by this request when possible.
        try {
            const admin = getAdminClient();

            if (uploadedPath) {
                await admin.storage.from(BUCKET).remove([uploadedPath]);
            }

            if (authUserId) {
                await admin.auth.admin.deleteUser(authUserId);
            }
        } catch {
            // Preserve the original error.
        }

        console.error("createMemberAction:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao criar o membro.",
        };
    }
}
