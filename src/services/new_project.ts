import { createClient } from "@/app/lib/supabase/client";
import type { Database } from "@/app/lib/supabase/models";

type ProjectInsert =
    Database["public"]["Tables"]["projects"]["Insert"];

type ProjectRow =
    Database["public"]["Tables"]["projects"]["Row"];

export type ProvisioningResult = {
    project_id: string;
    conversation_id: string;
    task_columns_created: number;
    phases_created: number;
    phase_steps_created: number;
    tasks_created: number;
    deliverables_created: number;
    milestones_created: number;
};

export type CreateProjectResult = {
    project: ProjectRow;
    provisioning: ProvisioningResult;
};

export async function createProject(
    projectInput: ProjectInsert
): Promise<CreateProjectResult> {
    const supabase = createClient();

    /* ---------------------------------------------------------------------- */
    /* Auth                                                                   */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* Create project                                                         */
    /* ---------------------------------------------------------------------- */

    const {
        data: project,
        error: projectError,
    } = await supabase
        .from("projects")
        .insert(projectInput)
        .select()
        .single();

    if (projectError) {
        throw new Error(projectError.message);
    }

    if (!project) {
        throw new Error("O projecto não foi criado.");
    }

    /* ---------------------------------------------------------------------- */
    /* Provision project defaults                                             */
    /* ---------------------------------------------------------------------- */

    const {
        data: provisioning,
        error: provisioningError,
    } = await supabase.rpc("provision_project_defaults", {
        p_project_id: project.project_id,
        p_creator_profile_id: user.id,
    });

    if (provisioningError) {
        throw new Error(provisioningError.message);
    }

    if (!provisioning) {
        throw new Error(
            "O projecto foi criado, mas os dados iniciais não foram configurados."
        );
    }

    return {
        project,
        provisioning: provisioning as ProvisioningResult,
    };
}