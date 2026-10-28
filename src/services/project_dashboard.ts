
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
/* Constants and helpers                                                      */
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

const isNum = (value: number | null) =>
    value === null ||
    (typeof value === "number" && Number.isFinite(value));

function normalizeProjectType(value: string | null): string | null {
    if (value == null || value.trim() === "") {
        return null;
    }

    const type = value.trim();

    return LEGACY_PROJECT_TYPES[type] ?? type;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

function validate(i: UpdateProjectInput): string | null {
    if (!i.project_code?.trim()) {
        return "O código do projecto é obrigatório.";
    }

    if (!i.title?.trim()) {
        return "O título do projecto é obrigatório.";
    }

    if (!i.municipality?.trim()) {
        return "O município é obrigatório.";
    }

    const status = String(i.status ?? "").trim();
    const urgency = String(i.urgency ?? "").trim();
    const type = normalizeProjectType(i.type);

    if (
        !(PROJECT_STATUSES as readonly string[]).includes(status)
    ) {
        return `Estado inválido recebido: "${status}".`;
    }

    if (
        !(PROJECT_URGENCIES as readonly string[]).includes(urgency)
    ) {
        return `Urgência inválida recebida: "${urgency}".`;
    }

    if (
        type !== null &&
        !(VALID_PROJECT_TYPES as readonly string[]).includes(type)
    ) {
        return `Tipo de projecto inválido recebido: "${i.type}".`;
    }

    if (
        ![
            i.budget,
            i.estimated_cost,
            i.latitude,
            i.longitude,
        ].every(isNum)
    ) {
        return "Existem valores numéricos inválidos.";
    }

    if ((i.budget ?? 0) < 0 || (i.estimated_cost ?? 0) < 0) {
        return "O orçamento e o custo estimado não podem ser negativos.";
    }

    if (i.latitude !== null && Math.abs(i.latitude) > 90) {
        return "Latitude inválida.";
    }

    if (i.longitude !== null && Math.abs(i.longitude) > 180) {
        return "Longitude inválida.";
    }

    if (i.start_date && i.end_date && i.end_date < i.start_date) {
        return "A data de fim não pode ser anterior à data de início.";
    }

    if (
        i.actual_start_date &&
        i.actual_end_date &&
        i.actual_end_date < i.actual_start_date
    ) {
        return "A data real de fim não pode ser anterior à data real de início.";
    }

    if (
        !Number.isFinite(i.completion_percentage) ||
        i.completion_percentage < 0 ||
        i.completion_percentage > 100
    ) {
        return "A percentagem de conclusão deve estar entre 0 e 100.";
    }

    if (i.image && !/^https?:\/\//i.test(i.image)) {
        return "Endereço de imagem inválido.";
    }

    return null;
}

/* -------------------------------------------------------------------------- */
/* Update project                                                             */
/* -------------------------------------------------------------------------- */

export async function updateProjectDetails(
    projectId: string,
    input: UpdateProjectInput,
): Promise<ActionResult> {
    try {
        if (!projectId?.trim()) {
            return {
                success: false,
                error: "Projecto inválido.",
            };
        }

        const invalid = validate(input);

        if (invalid) {
            return {
                success: false,
                error: invalid,
            };
        }

        const supabase = createClient(await cookies());

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

        // Normaliza valores antigos em inglês antes de guardar.
        const type = normalizeProjectType(input.type);

        // Explicit allowlist of project columns.
        // Do not spread the entire form payload into the database query.
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

            image: input.image,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("projects")
            .update(updatePayload)
            .eq("project_id", projectId)
            .select("project_id")
            .maybeSingle();

        if (error) {
            console.error("updateProjectDetails failed:", {
                projectId,
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint,
            });

            if (error.code === "42501") {
                return {
                    success: false,
                    error: "Não tem permissão para editar este projecto.",
                };
            }

            if (error.code === "23505") {
                return {
                    success: false,
                    error: "Este código de projecto já está a ser utilizado.",
                };
            }

            if (
                error.code === "42703" ||
                error.code === "PGRST204"
            ) {
                return {
                    success: false,
                    error: "Uma das colunas do formulário não corresponde à estrutura actual da base de dados. Consulte o registo de erro do servidor.",
                };
            }

            return {
                success: false,
                error: `Não foi possível guardar as alterações. ${error.message}`,
            };
        }

        if (!data) {
            return {
                success: false,
                error: "O projecto não foi actualizado. Verifique se existe e se tem permissão para o editar.",
            };
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

        return {
            success: false,
            error: "Ocorreu um erro inesperado ao actualizar o projecto. Consulte o terminal do servidor.",
        };
    }
}
