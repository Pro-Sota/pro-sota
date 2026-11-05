
import "server-only";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ProjectBriefStatus =
    | "pending"
    | "in_review"
    | "contacted"
    | "approved"
    | "rejected"
    | "converted";

export type ProjectBriefAttachment = {
    id: string;
    brief_id: string;
    storage_path: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    signed_url?: string | null;
};

export type ProjectBrief = {
    id: string;
    created_at: string;
    updated_at: string;
    status: ProjectBriefStatus;

    full_name: string;
    contact_phone: string;
    contact_email: string;
    budget: number | null;
    decision_makers: string | null;
    preferred_contact: string | null;

    location_address: string | null;
    location_neighborhood: string | null;
    location_municipality: string | null;
    location_reference: string | null;
    location_city: string | null;
    location_province: string | null;
    map_link: string | null;

    land_ownership: string | null;
    land_area: number | null;
    land_length: number | null;
    land_width: number | null;
    land_type: string | null;
    existing_buildings: string | null;
    has_trees: string | null;
    infrastructure: string[];

    residents_count: number | null;
    domestic_workers: string | null;
    domestic_workers_count: number | null;
    resident_profiles: string | null;
    family_growth: string | null;
    works_from_home: string | null;
    visitors_frequency: string | null;
    pets: string | null;

    current_home_dislikes: string | null;
    current_home_likes: string | null;

    bedrooms_count: number | null;
    suites_count: number | null;
    desired_spaces: string[];
    cars_count: number | null;
    kitchen_layout: string | null;
    floor_count: string | null;
    essential_space: string | null;

    architectural_style: string[];
    colour_material_preferences: string | null;
    natural_light_rating: number | null;
    privacy_rating: number | null;

    reference_links: string | null;
    other_information: string | null;
    architectural_style_other: string | null;
    service_scope: string;
    project_priorities: string[];
    construction_start: string;

    reviewed_by: string | null;
    reviewed_at: string | null;
    internal_notes: string | null;
    rejection_reason: string | null;
    converted_project_id: string | null;

    attachments: unknown[];
};

export type CreateProjectBriefInput = Omit<
    ProjectBrief,
    | "id"
    | "created_at"
    | "updated_at"
    | "status"
    | "reviewed_by"
    | "reviewed_at"
    | "internal_notes"
    | "rejection_reason"
    | "converted_project_id"
    | "attachments"
>;

export type UpdateProjectBriefInput = Partial<CreateProjectBriefInput>;

export type ProjectBriefFilters = {
    status?: ProjectBriefStatus | "all";
    search?: string;
    page?: number;
    pageSize?: number;
    sort?: "newest" | "oldest";
};

export type ProjectBriefStats = {
    total: number;
    pending: number;
    in_review: number;
    contacted: number;
    approved: number;
    rejected: number;
    converted: number;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STORAGE_BUCKET = "project-brief-attachments";

const ALLOWED_STATUSES: ProjectBriefStatus[] = [
    "pending",
    "in_review",
    "contacted",
    "approved",
    "rejected",
    "converted",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ATTACHMENTS = 10;

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

const MIN_BUDGET = 1_000_000;
const MAX_BUDGET = 1_000_000_000;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
    return await createClient(await cookies());
}

async function requireAdmin() {
    const supabase = await getSupabase();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Não tem autorização para realizar esta operação.");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", user.id)
        .single();

    if (error || profile?.role_id !== 1) {
        throw new Error("Não tem permissões para gerir os briefings.");
    }

    return { supabase, user };
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

type BriefValidationInput = Pick<
    CreateProjectBriefInput,
    "full_name" | "contact_phone" | "contact_email"
> & Partial<Pick<CreateProjectBriefInput, "budget">>;

function validateBrief(input: BriefValidationInput) {
    if (!input.full_name?.trim()) {
        throw new Error("O nome completo é obrigatório.");
    }

    if (!input.contact_phone?.trim()) {
        throw new Error("O número de telefone é obrigatório.");
    }

    if (!input.contact_email?.trim()) {
        throw new Error("O endereço de email é obrigatório.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(input.contact_email.trim())) {
        throw new Error("Indique um endereço de email válido.");
    }

    const budget = input.budget;

    if (budget !== null && budget !== undefined) {
        if (
            typeof budget !== "number" ||
            !Number.isFinite(budget) ||
            budget < MIN_BUDGET ||
            budget > MAX_BUDGET
        ) {
            throw new Error(
                "O orçamento deve estar entre 1.000.000 Kz e 1.000.000.000 Kz.",
            );
        }
    }
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function sanitizeFileName(name: string) {
    return name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(-150);
}

function getBriefPayload(input: CreateProjectBriefInput) {
    return {
        ...input,
        full_name: input.full_name.trim(),
        contact_phone: input.contact_phone.trim(),
        contact_email: input.contact_email.trim().toLowerCase(),
        budget: input.budget ?? null,
    };
}

/* -------------------------------------------------------------------------- */
/* Public Submission                                                          */
/* -------------------------------------------------------------------------- */

export async function createProjectBrief(
    input: CreateProjectBriefInput,
    files: File[] = [],
) {
    validateBrief(input);

    if (files.length > MAX_ATTACHMENTS) {
        throw new Error(
            `Pode anexar no máximo ${MAX_ATTACHMENTS} ficheiros.`,
        );
    }

    for (const file of files) {
        if (!file.size || file.size > MAX_FILE_SIZE) {
            throw new Error(
                `O ficheiro "${file.name}" ultrapassa o limite de 10 MB.`,
            );
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            throw new Error(
                `O formato do ficheiro "${file.name}" não é permitido.`,
            );
        }
    }

    const supabase = await getSupabase();

    const { data: brief, error } = await supabase
        .from("project_briefs")
        .insert({
            ...getBriefPayload(input),
            status: "pending",
        })
        .select("*")
        .single();

    if (error || !brief) {
        console.error("createProjectBrief:", error);
        throw new Error("Não foi possível submeter o briefing.");
    }

    if (files.length) {
        try {
            await uploadProjectBriefAttachments(brief.id, files);
        } catch (uploadError) {
            // Do not leave an incomplete submission.
            const { error: deleteError } = await supabase
                .from("project_briefs")
                .delete()
                .eq("id", brief.id);

            if (deleteError) {
                console.error(
                    "createProjectBrief rollback:",
                    deleteError,
                );
            }

            throw uploadError;
        }
    }

    return brief as ProjectBrief;
}

/* -------------------------------------------------------------------------- */
/* Attachments                                                                */
/* -------------------------------------------------------------------------- */

export async function uploadProjectBriefAttachments(
    briefId: string,
    files: File[],
) {
    if (files.length > MAX_ATTACHMENTS) {
        throw new Error(
            `Pode anexar no máximo ${MAX_ATTACHMENTS} ficheiros.`,
        );
    }

    const supabase = await getSupabase();

    const { data: brief, error: briefError } = await supabase
        .from("project_briefs")
        .select("id")
        .eq("id", briefId)
        .single();

    if (briefError || !brief) {
        throw new Error("Briefing não encontrado.");
    }

    const uploadedPaths: string[] = [];
    const insertedIds: string[] = [];

    try {
        for (const file of files) {
            if (!file.size || file.size > MAX_FILE_SIZE) {
                throw new Error(
                    `O ficheiro "${file.name}" ultrapassa o limite de 10 MB.`,
                );
            }

            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                throw new Error(
                    `O formato do ficheiro "${file.name}" não é permitido.`,
                );
            }

            const storagePath =
                `${briefId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(storagePath, file, {
                    contentType: file.type,
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            uploadedPaths.push(storagePath);

            const { data: attachment, error: insertError } = await supabase
                .from("project_brief_attachments")
                .insert({
                    brief_id: briefId,
                    storage_path: storagePath,
                    original_name: file.name,
                    mime_type: file.type,
                    file_size: file.size,
                })
                .select("*")
                .single();

            if (insertError || !attachment) {
                throw insertError ?? new Error(
                    "Não foi possível guardar o registo do anexo.",
                );
            }

            insertedIds.push(attachment.id);
        }

        return insertedIds;
    } catch (error) {
        if (insertedIds.length) {
            const { error: deleteError } = await supabase
                .from("project_brief_attachments")
                .delete()
                .in("id", insertedIds);

            if (deleteError) {
                console.error("Attachment rollback:", deleteError);
            }
        }

        if (uploadedPaths.length) {
            const { error: storageError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove(uploadedPaths);

            if (storageError) {
                console.error("Storage rollback:", storageError);
            }
        }

        throw error;
    }
}

export async function getProjectBriefAttachments(briefId: string) {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from("project_brief_attachments")
        .select("*")
        .eq("brief_id", briefId)
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error("Não foi possível carregar os anexos.");
    }

    const attachments = data ?? [];

    return Promise.all(
        attachments.map(async (attachment) => {
            const { data: signed, error: signedError } =
                await supabase.storage
                    .from(STORAGE_BUCKET)
                    .createSignedUrl(attachment.storage_path, 300);

            return {
                ...attachment,
                signed_url: signedError
                    ? null
                    : signed?.signedUrl ?? null,
            };
        }),
    );
}

export async function deleteProjectBriefAttachment(id: string) {
    const { supabase } = await requireAdmin();

    const { data: attachment, error } = await supabase
        .from("project_brief_attachments")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !attachment) {
        throw new Error("Anexo não encontrado.");
    }

    const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([attachment.storage_path]);

    if (storageError) {
        throw new Error("Não foi possível remover o ficheiro.");
    }

    const { error: deleteError } = await supabase
        .from("project_brief_attachments")
        .delete()
        .eq("id", id);

    if (deleteError) {
        throw new Error("Não foi possível remover o registo do anexo.");
    }

    return true;
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefs(
    filters: ProjectBriefFilters = {},
) {
    const { supabase } = await requireAdmin();

    const {
        status = "all",
        search = "",
        page = 1,
        pageSize = 20,
        sort = "newest",
    } = filters;

    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

    const from = (safePage - 1) * safePageSize;
    const to = from + safePageSize - 1;

    let query = supabase
        .from("project_briefs")
        .select("*", { count: "exact" });

    if (status !== "all") {
        query = query.eq("status", status);
    }

    if (search.trim()) {
        const term = search.trim().replace(/[,%()]/g, " ");

        query = query.or(
            `full_name.ilike.%${term}%,contact_email.ilike.%${term}%,contact_phone.ilike.%${term}%,location_municipality.ilike.%${term}%`,
        );
    }

    const { data, error, count } = await query
        .order("created_at", { ascending: sort === "oldest" })
        .range(from, to);

    if (error) {
        console.error("getProjectBriefs:", error);
        throw new Error("Não foi possível carregar os briefings.");
    }

    return {
        data: (data ?? []) as ProjectBrief[],
        count: count ?? 0,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.ceil((count ?? 0) / safePageSize),
    };
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefStats(): Promise<ProjectBriefStats> {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from("project_briefs")
        .select("status");

    if (error) {
        throw new Error("Não foi possível carregar as estatísticas.");
    }

    const stats: ProjectBriefStats = {
        total: data.length,
        pending: 0,
        in_review: 0,
        contacted: 0,
        approved: 0,
        rejected: 0,
        converted: 0,
    };

    for (const brief of data) {
        if (brief.status in stats) {
            stats[brief.status as keyof Omit<ProjectBriefStats, "total">]++;
        }
    }

    return stats;
}

/* -------------------------------------------------------------------------- */
/* Detail                                                                     */
/* -------------------------------------------------------------------------- */

export async function getProjectBrief(id: string) {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from("project_briefs")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {
        throw new Error("Briefing não encontrado.");
    }

    const { data: attachments, error: attachmentError } = await supabase
        .from("project_brief_attachments")
        .select("*")
        .eq("brief_id", id)
        .order("created_at", { ascending: true });

    if (attachmentError) {
        throw new Error("Não foi possível carregar os anexos.");
    }

    const signedAttachments = await Promise.all(
        (attachments ?? []).map(async (attachment) => {
            const { data: signed } = await supabase.storage
                .from(STORAGE_BUCKET)
                .createSignedUrl(attachment.storage_path, 300);

            return {
                ...attachment,
                signed_url: signed?.signedUrl ?? null,
            };
        }),
    );

    return {
        ...data,
        attachments: signedAttachments,
    } as ProjectBrief & {
        attachments: ProjectBriefAttachment[];
    };
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateProjectBrief(
    id: string,
    input: UpdateProjectBriefInput,
) {
    const { supabase } = await requireAdmin();

    const { data: current, error: currentError } = await supabase
        .from("project_briefs")
        .select("full_name, contact_phone, contact_email, budget")
        .eq("id", id)
        .single();

    if (currentError || !current) {
        throw new Error("Briefing não encontrado.");
    }

    const merged = {
        ...current,
        ...input,
    };

    validateBrief(merged);

    const payload = {
        ...input,

        ...(input.full_name !== undefined
            ? { full_name: input.full_name.trim() }
            : {}),

        ...(input.contact_phone !== undefined
            ? { contact_phone: input.contact_phone.trim() }
            : {}),

        ...(input.contact_email !== undefined
            ? { contact_email: input.contact_email.trim().toLowerCase() }
            : {}),

        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("project_briefs")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        console.error("updateProjectBrief:", error);
        throw new Error("Não foi possível actualizar o briefing.");
    }

    return data as ProjectBrief;
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateProjectBriefStatus(
    id: string,
    status: ProjectBriefStatus,
    rejectionReason?: string,
) {
    const { supabase, user } = await requireAdmin();

    if (!ALLOWED_STATUSES.includes(status)) {
        throw new Error("Estado inválido.");
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
        throw new Error("Indique o motivo da rejeição.");
    }

    const payload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (["in_review", "contacted", "approved", "rejected"].includes(status)) {
        payload.reviewed_by = user.id;
        payload.reviewed_at = new Date().toISOString();
    }

    if (status === "rejected") {
        payload.rejection_reason = rejectionReason?.trim();
    } else {
        payload.rejection_reason = null;
    }

    const { data, error } = await supabase
        .from("project_briefs")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        console.error("updateProjectBriefStatus:", error);
        throw new Error("Não foi possível actualizar o estado.");
    }

    return data as ProjectBrief;
}

/* -------------------------------------------------------------------------- */
/* Internal Notes                                                             */
/* -------------------------------------------------------------------------- */

export async function updateProjectBriefNotes(
    id: string,
    notes: string,
) {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from("project_briefs")
        .update({
            internal_notes: notes.trim() || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        throw new Error("Não foi possível guardar as notas internas.");
    }

    return data as ProjectBrief;
}

/* -------------------------------------------------------------------------- */
/* Convert to Project                                                         */
/* -------------------------------------------------------------------------- */

export async function convertProjectBrief(
    id: string,
    projectId: string,
) {
    const { supabase } = await requireAdmin();

    if (!projectId) {
        throw new Error("O projecto é obrigatório.");
    }

    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("project_id")
        .eq("project_id", projectId)
        .single();

    if (projectError || !project) {
        throw new Error("Projecto não encontrado.");
    }

    const { data, error } = await supabase
        .from("project_briefs")
        .update({
            status: "converted",
            converted_project_id: projectId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        throw new Error("Não foi possível associar o briefing ao projecto.");
    }

    return data as ProjectBrief;
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function deleteProjectBrief(id: string) {
    const { supabase } = await requireAdmin();

    const { data: attachments, error: fetchError } = await supabase
        .from("project_brief_attachments")
        .select("storage_path")
        .eq("brief_id", id);

    if (fetchError) {
        throw new Error("Não foi possível consultar os anexos.");
    }

    if (attachments?.length) {
        const { error: storageError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(attachments.map((item) => item.storage_path));

        if (storageError) {
            throw new Error("Não foi possível remover os anexos.");
        }
    }

    const { error } = await supabase
        .from("project_briefs")
        .delete()
        .eq("id", id);

    if (error) {
        throw new Error("Não foi possível eliminar o briefing.");
    }

    return true;
}
