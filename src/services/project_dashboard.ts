"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import {
    PROJECT_STATUSES,
    PROJECT_TYPES,
    PROJECT_URGENCIES,
    type ActionResult,
    type UpdateProjectInput,
} from "@/app/management/projects/types";

const isNum = (v: number | null) => v === null || Number.isFinite(v);

function validate(i: UpdateProjectInput): string | null {
    if (!i.project_code.trim()) return "O código do projecto é obrigatório.";
    if (!i.title.trim()) return "O título do projecto é obrigatório.";
    if (!i.municipality.trim()) return "O município é obrigatório.";

    if (
        !PROJECT_STATUSES.includes(i.status) ||
        !PROJECT_URGENCIES.includes(i.urgency) ||
        (i.type !== null && !PROJECT_TYPES.includes(i.type as never))
    ) {
        return "Existem valores inválidos no formulário.";
    }

    if (![i.budget, i.estimated_cost, i.latitude, i.longitude].every(isNum)) {
        return "Existem valores numéricos inválidos.";
    }
    if ((i.budget ?? 0) < 0 || (i.estimated_cost ?? 0) < 0) {
        return "O orçamento e o custo estimado não podem ser negativos.";
    }
    if (i.latitude !== null && Math.abs(i.latitude) > 90) return "Latitude inválida.";
    if (i.longitude !== null && Math.abs(i.longitude) > 180) return "Longitude inválida.";

    if (i.start_date && i.end_date && i.end_date < i.start_date) {
        return "A data de fim não pode ser anterior à data de início.";
    }
    if (i.image && !/^https?:\/\//i.test(i.image)) return "Endereço de imagem inválido.";

    return null;
}

export async function updateProjectDetails(
    projectId: string,
    input: UpdateProjectInput,
): Promise<ActionResult> {
    try {
        if (!projectId?.trim()) return { success: false, error: "Projecto inválido." };

        const invalid = validate(input);
        if (invalid) return { success: false, error: invalid };

        const supabase = createClient(await cookies());

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: "A sessão expirou. Inicie sessão novamente." };
        }

        const { data, error } = await supabase
            .from("projects")
            .update({
                ...input,
                project_code: input.project_code.trim(),
                title: input.title.trim(),
                municipality: input.municipality.trim(),
                updated_at: new Date().toISOString(),
            })
            .eq("project_id", projectId)
            .select("project_id")
            .maybeSingle();

        if (error) {
            console.error("updateProjectDetails:", error.message);
            return {
                success: false,
                error:
                    error.code === "42501"
                        ? "Não tem permissão para editar este projecto."
                        : "Não foi possível guardar as alterações.",
            };
        }

        if (!data) {
            return { success: false, error: "Projecto não encontrado ou sem permissão para o editar." };
        }

        revalidatePath(`/management/projects/${projectId}`);
        revalidatePath(`/management/projects/${projectId}/overview`);
        return { success: true };
    } catch (error) {
        console.error("updateProjectDetails:", error);
        return { success: false, error: "Ocorreu um erro inesperado ao actualizar o projecto." };
    }
}

