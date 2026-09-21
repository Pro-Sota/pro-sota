import { createClient } from "@/app/lib/supabase/client";

export type LeadStatus =
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost";

export type Lead = {
    lead_id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    project_name: string;
    project_type: string;
    budget: number | null;
    location: string | null;
    status: LeadStatus;
    created_by: string | null;
    created_at: string;
    updated_at: string;
};

export type CreateLeadInput = {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    project_name: string;
    project_type: string;
    budget?: number | null;
    location?: string | null;
};

export type UpdateLeadInput = {
    name?: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    project_name?: string;
    project_type?: string;
    budget?: number | null;
    location?: string | null;
    status?: LeadStatus;
};

const leadSelect = `
    lead_id,
    name,
    company,
    email,
    phone,
    project_name,
    project_type,
    budget,
    location,
    status,
    created_by,
    created_at,
    updated_at
`;

export async function getLeads(): Promise<Lead[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("leads")
        .select(leadSelect)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch leads:", error);
        throw new Error("Não foi possível carregar os leads.");
    }

    return (data ?? []) as Lead[];
}

export async function getLeadById(
    leadId: string,
): Promise<Lead | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("leads")
        .select(leadSelect)
        .eq("lead_id", leadId)
        .maybeSingle();

    if (error) {
        console.error("Failed to fetch lead:", error);
        throw new Error("Não foi possível carregar o lead.");
    }

    return data as Lead | null;
}

export async function createLead(
    input: CreateLeadInput,
): Promise<Lead> {
    const supabase = createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        console.error(
            "Failed to get authenticated user:",
            userError,
        );

        throw new Error(
            "Não foi possível verificar o utilizador.",
        );
    }

    if (!user) {
        throw new Error(
            "Utilizador não autenticado.",
        );
    }

    const name = input.name.trim();
    const projectName = input.project_name.trim();
    const projectType = input.project_type.trim();

    if (!name) {
        throw new Error(
            "O nome do contacto é obrigatório.",
        );
    }

    if (!projectName) {
        throw new Error(
            "O nome do projecto é obrigatório.",
        );
    }

    if (!projectType) {
        throw new Error(
            "O tipo de projecto é obrigatório.",
        );
    }

    if (
        input.budget !== null &&
        input.budget !== undefined &&
        (!Number.isFinite(input.budget) || input.budget < 0)
    ) {
        throw new Error(
            "O orçamento introduzido não é válido.",
        );
    }

    const { data, error } = await supabase
        .from("leads")
        .insert({
            name,
            company: input.company?.trim() || null,
            email: input.email?.trim() || null,
            phone: input.phone?.trim() || null,
            project_name: projectName,
            project_type: projectType,
            budget: input.budget ?? null,
            location: input.location?.trim() || null,

            // New leads always start here.
            status: "new",

            // The authenticated user becomes the creator.
            created_by: user.id,
        })
        .select(leadSelect)
        .single();

    if (error) {
        console.error("Failed to create lead:", error);

        if (error.code === "42501") {
            throw new Error(
                "Não tem permissão para criar leads.",
            );
        }

        throw new Error(
            error.message ||
                "Não foi possível criar o lead.",
        );
    }

    return data as Lead;
}

export async function updateLead(
    leadId: string,
    input: UpdateLeadInput,
): Promise<Lead> {
    const supabase = createClient();

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) {
        updateData.name = input.name.trim();
    }

    if (input.company !== undefined) {
        updateData.company =
            input.company?.trim() || null;
    }

    if (input.email !== undefined) {
        updateData.email =
            input.email?.trim() || null;
    }

    if (input.phone !== undefined) {
        updateData.phone =
            input.phone?.trim() || null;
    }

    if (input.project_name !== undefined) {
        updateData.project_name =
            input.project_name.trim();
    }

    if (input.project_type !== undefined) {
        updateData.project_type =
            input.project_type.trim();
    }

    if (input.budget !== undefined) {
        updateData.budget = input.budget;
    }

    if (input.location !== undefined) {
        updateData.location =
            input.location?.trim() || null;
    }

    if (input.status !== undefined) {
        updateData.status = input.status;
    }

    if (Object.keys(updateData).length === 0) {
        throw new Error(
            "Nenhuma alteração foi fornecida.",
        );
    }

    const { data, error } = await supabase
        .from("leads")
        .update(updateData)
        .eq("lead_id", leadId)
        .select(leadSelect)
        .single();

    if (error) {
        console.error("Failed to update lead:", error);

        throw new Error(
            error.message ||
                "Não foi possível actualizar o lead.",
        );
    }

    return data as Lead;
}

export async function updateLeadStatus(
    leadId: string,
    status: LeadStatus,
): Promise<Lead> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("leads")
        .update({ status })
        .eq("lead_id", leadId)
        .select(leadSelect)
        .single();

    if (error) {
        console.error(
            "Failed to update lead status:",
            error,
        );

        throw new Error(
            error.message ||
                "Não foi possível actualizar o estado do lead.",
        );
    }

    return data as Lead;
}

export async function deleteLead(
    leadId: string,
): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
        .from("leads")
        .delete()
        .eq("lead_id", leadId);

    if (error) {
        console.error(
            "Failed to delete lead:",
            error,
        );

        throw new Error(
            error.message ||
                "Não foi possível eliminar o lead.",
        );
    }
}