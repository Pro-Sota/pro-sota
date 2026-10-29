
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import {
    PROJECT_STATUSES,
    PROJECT_URGENCIES,
    type ActionResult,
    type UpdateProjectInput,
} from "@/app/management/projects/types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const VALID_PROJECT_TYPES = [
    "Residencial",
    "Comercial",
    "Industrial",
    "Institucional",
    "Uso misto",
    "Reabilitação",
    "Design de interiores",
    "Paisagismo",
    "Outro",
] as const;

const LEGACY_PROJECT_TYPES: Record<string, string> = {
    Residential: "Residencial",
    Commercial: "Comercial",
    Industrial: "Industrial",
    Institutional: "Institucional",
    "Mixed Use": "Uso misto",
    Renovation: "Reabilitação",
    "Interior Design": "Design de interiores",
    Landscape: "Paisagismo",
    Other: "Outro",
};

const IMAGE_BUCKET = "project-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};

type ExistingProject = {
    project_id: string;
    image: string | null;
};

function normalizeProjectType(value: string | null): string | null {
    if (!value?.trim()) return null;

    const type = value.trim();
    return LEGACY_PROJECT_TYPES[type] ?? type;
}

function isNum(value: number | null): boolean {
    return (
        value === null ||
        (typeof value === "number" && Number.isFinite(value))
    );
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validate(input: UpdateProjectInput): string | null {
    if (!input.project_code?.trim()) {
        return "O código do projecto é obrigatório.";
    }

    if (!input.title?.trim()) {
        return "O título do projecto é obrigatório.";
    }

    if (!input.municipality?.trim()) {
        return "O município é obrigatório.";
    }

    const status = String(input.status ?? "").trim();
    const urgency = String(input.urgency ?? "").trim();
    const type = normalizeProjectType(input.type);

    if (!(PROJECT_STATUSES as readonly string[]).includes(status)) {
        return `Estado inválido recebido: "${status}".`;
    }

    if (!(PROJECT_URGENCIES as readonly string[]).includes(urgency)) {
        return `Urgência inválida recebida: "${urgency}".`;
    }

    if (
        type !== null &&
        !(VALID_PROJECT_TYPES as readonly string[]).includes(type)
    ) {
        return `Tipo de projecto inválido recebido: "${input.type}".`;
    }

    if (
        ![
            input.budget,
            input.estimated_cost,
            input.latitude,
            input.longitude,
        ].every(isNum)
    ) {
        return "Existem valores numéricos inválidos.";
    }

    if (
        (input.budget ?? 0) < 0 ||
        (input.estimated_cost ?? 0) < 0
    ) {
        return "O orçamento e o custo estimado não podem ser negativos.";
    }

    if (
        input.latitude !== null &&
        Math.abs(input.latitude) > 90
    ) {
        return "Latitude inválida.";
    }

    if (
        input.longitude !== null &&
        Math.abs(input.longitude) > 180
    ) {
        return "Longitude inválida.";
    }

    if (
        input.start_date &&
        input.end_date &&
        input.end_date < input.start_date
    ) {
        return "A data de fim não pode ser anterior à data de início.";
    }

    if (
        input.actual_start_date &&
        input.actual_end_date &&
        input.actual_end_date < input.actual_start_date
    ) {
        return "A data real de fim não pode ser anterior à data real de início.";
    }

    if (
        !Number.isFinite(input.completion_percentage) ||
        input.completion_percentage < 0 ||
        input.completion_percentage > 100
    ) {
        return "A percentagem de conclusão deve estar entre 0 e 100.";
    }

    if (input.image && !/^https?:\/\//i.test(input.image)) {
        return "Endereço de imagem inválido.";
    }

    return null;
}

/* -------------------------------------------------------------------------- */
/* Image upload                                                               */
/* -------------------------------------------------------------------------- */

async function removeUploadedImage(
    supabase: Awaited<ReturnType<typeof createClient>>,
    filePath: string | null,
): Promise<void> {
    if (!filePath) return;

    const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .remove([filePath]);

    if (error) {
        console.error("Project image cleanup failed:", {
            filePath,
            message: error.message,
        });
    }
}

/* -------------------------------------------------------------------------- */
/* Update project details and upload image                                    */
/* -------------------------------------------------------------------------- */

export async function updateProjectDetails(
    projectId: string,
    input: UpdateProjectInput,
    imageFile?: File | null,
    removeImage = false,
): Promise<ActionResult> {
    let uploadedFilePath: string | null = null;
    let supabase: Awaited<ReturnType<typeof createClient>> | null = null;

    try {
        if (!projectId?.trim()) {
            return {
                success: false,
                error: "Projecto inválido.",
            };
        }

        if (!input || typeof input !== "object") {
            return {
                success: false,
                error: "Os dados do projecto são inválidos.",
            };
        }

        const invalid = validate(input);

        if (invalid) {
            return {
                success: false,
                error: invalid,
            };
        }

        /* Validate the file before uploading. */
        if (imageFile && imageFile.size > 0) {
            if (!EXTENSIONS[imageFile.type]) {
                return {
                    success: false,
                    error: "Formato não suportado. Utilize JPG, PNG ou WebP.",
                };
            }

            if (imageFile.size > MAX_IMAGE_SIZE) {
                return {
                    success: false,
                    error: "A imagem não pode ultrapassar 5 MB.",
                };
            }
        }

        supabase = await createClient(await cookies());

        /* Authenticate the current user. */
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                error: "A sessão expirou. Inicie sessão novamente.",
            };
        }

        /* Confirm that the project exists and is accessible through RLS. */
        const {
            data: existingProjectData,
            error: projectError,
        } = await supabase
            .from("projects")
            .select("project_id, image")
            .eq("project_id", projectId)
            .maybeSingle();

        if (projectError || !existingProjectData) {
            console.error("updateProjectDetails project lookup failed:", {
                projectId,
                message: projectError?.message,
            });

            return {
                success: false,
                error: projectError
                    ? "Não foi possível consultar o projecto. Verifique as permissões."
                    : "Projecto não encontrado ou sem acesso.",
            };
        }

        const existingProject =
            existingProjectData as ExistingProject;

        /*
         * Keep the current image by default.
         * A new upload replaces the URL saved in the database.
         */
        let imageUrl =
            input.image?.trim() ||
            existingProject.image ||
            null;

        /* Upload the new image to Supabase Storage. */
        if (imageFile && imageFile.size > 0) {
            const extension = EXTENSIONS[imageFile.type];

            uploadedFilePath =
                `${projectId}/${crypto.randomUUID()}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from(IMAGE_BUCKET)
                .upload(uploadedFilePath, imageFile, {
                    contentType: imageFile.type,
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                console.error("updateProjectDetails image upload failed:", {
                    projectId,
                    bucket: IMAGE_BUCKET,
                    message: uploadError.message,
                });

                return {
                    success: false,
                    error:
                        "Não foi possível carregar a imagem. Confirme se o bucket project-images existe, está configurado e permite o carregamento de ficheiros.",
                };
            }

            const { data: publicUrlData } = supabase.storage
                .from(IMAGE_BUCKET)
                .getPublicUrl(uploadedFilePath);

            if (!publicUrlData.publicUrl) {
                await removeUploadedImage(supabase, uploadedFilePath);
                uploadedFilePath = null;

                return {
                    success: false,
                    error: "Não foi possível obter o endereço público da imagem.",
                };
            }

            imageUrl = publicUrlData.publicUrl;
        }

        const type = normalizeProjectType(input.type);

        /* Match the actual columns in public.projects. */
        const updatePayload = {
            project_code: input.project_code.trim(),
            title: input.title.trim(),
            description: input.description,
            type,
            status: input.status,
            urgency: input.urgency,

            client_id: input.client_id,

            country: input.country,
            province: input.province,
            municipality: input.municipality.trim(),
            city: input.city,
            address_line_1: input.address_line_1,
            address_line_2: input.address_line_2,
            latitude: input.latitude,
            longitude: input.longitude,

            budget: input.budget,
            estimated_cost: input.estimated_cost,

            start_date: input.start_date,
            end_date: input.end_date,
            actual_start_date: input.actual_start_date,
            actual_end_date: input.actual_end_date,

            contract_number: input.contract_number,
            external_reference: input.external_reference,
            completion_percentage: input.completion_percentage,

            image: imageUrl,
            updated_at: new Date().toISOString(),
        };

        const {
            data: updatedProject,
            error: updateError,
        } = await supabase
            .from("projects")
            .update(updatePayload)
            .eq("project_id", projectId)
            .select("project_id")
            .maybeSingle();

        if (updateError || !updatedProject) {
            console.error("updateProjectDetails database update failed:", {
                projectId,
                code: updateError?.code,
                message: updateError?.message,
                details: updateError?.details,
                hint: updateError?.hint,
            });

            /* Remove the new file if the database update failed. */
            await removeUploadedImage(supabase, uploadedFilePath);
            uploadedFilePath = null;

            if (updateError?.code === "42501") {
                return {
                    success: false,
                    error: "Não tem permissão para editar este projecto.",
                };
            }

            if (updateError?.code === "23505") {
                return {
                    success: false,
                    error: "Este código de projecto já está a ser utilizado.",
                };
            }

            if (
                updateError?.code === "42703" ||
                updateError?.code === "PGRST204"
            ) {
                return {
                    success: false,
                    error:
                        "Uma das colunas não corresponde à estrutura actual da base de dados.",
                };
            }

            return {
                success: false,
                error: updateError
                    ? `Não foi possível guardar as alterações. ${updateError.message}`
                    : "O projecto não foi actualizado. Verifique as permissões.",
            };
        }

        /*
         * The database update succeeded.
         * Keep the newly uploaded image and clean up the previous Storage
         * image only when it belongs to this bucket and project folder.
         */
        if (
            uploadedFilePath &&
            existingProject.image &&
            existingProject.image !== imageUrl
        ) {
            try {
                const previousUrl = new URL(existingProject.image);
                const publicPathMarker =
                    `/storage/v1/object/public/${IMAGE_BUCKET}/`;

                const markerIndex =
                    previousUrl.pathname.indexOf(publicPathMarker);

                if (markerIndex !== -1) {
                    const previousFilePath = decodeURIComponent(
                        previousUrl.pathname.slice(
                            markerIndex + publicPathMarker.length,
                        ),
                    );

                    if (
                        previousFilePath.startsWith(`${projectId}/`) &&
                        previousFilePath !== uploadedFilePath
                    ) {
                        await removeUploadedImage(
                            supabase,
                            previousFilePath,
                        );
                    }
                }
            } catch (cleanupError) {
                /* Do not fail a successful save because old-file cleanup failed. */
                console.error("Previous project image cleanup failed:", cleanupError);
            }
        }

        revalidatePath("/management/projects");
        revalidatePath(`/management/projects/${projectId}`);
        revalidatePath(`/management/projects/${projectId}/overview`);
        revalidatePath(`/management/projects/${projectId}/edit`);

        return {
            success: true,
        };
    } catch (error) {
        console.error("updateProjectDetails unexpected error:", error);

        /* Best-effort cleanup if an exception occurred after the upload. */
        if (supabase && uploadedFilePath) {
            await removeUploadedImage(supabase, uploadedFilePath);
        }

        return {
            success: false,
            error:
                "Ocorreu um erro inesperado ao actualizar o projecto. Consulte o terminal do servidor.",
        };
    }
}
