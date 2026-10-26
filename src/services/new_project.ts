
import { createClient } from "@/app/lib/supabase/client";
import type { Database } from "@/app/lib/supabase/models";

type ProjectInsert =
    Database["public"]["Tables"]["projects"]["Insert"];

type ProjectRow =
    Database["public"]["Tables"]["projects"]["Row"];

export const PROJECT_STATUSES = [
    "Em curso",
    "Em observação",
    "Concluído",
    "Em pausa",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type CreateProjectResult = {
    project: ProjectRow;
};

export async function createProject(
    projectInput: ProjectInsert
): Promise<CreateProjectResult> {
    const supabase = createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw new Error(userError.message);
    }

    if (!user) {
        throw new Error("Utilizador não autenticado.");
    }

    const projectData: ProjectInsert = {
        ...projectInput,
        status: projectInput.status ?? "Em observação",
    };

    const {
        data: project,
        error: projectError,
    } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

    if (projectError) {
        throw new Error(projectError.message);
    }

    if (!project) {
        throw new Error("O projecto não foi criado.");
    }

    return { project };
}
