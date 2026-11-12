import "server-only";

import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";
import { requirePermission } from "@/app/lib/permissions/server";
import { sniffFileType } from "@/app/project-briefing/brief_server";

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

export type AttachmentCategory = "land" | "reference";
export type AttachmentGroups = Record<AttachmentCategory, File[]>;

type PreparedAttachment = {
    file: File;
    category: AttachmentCategory;
    mime: string;
};

export type ProjectBriefAttachment = {
    id: string;
    brief_id: string;
    storage_path: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    category: AttachmentCategory;
    signed_url?: string | null;
    download_url?: string | null;
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
    budget_undisclosed: boolean;
    decision_makers: string | null;
    preferred_contact: string | null;

    location_address: string | null;
    location_neighborhood: string | null;
    location_municipality: string | null;
    location_reference: string | null;
    location_city: string | null;
    location_province: string | null;
    map_link: string | null;
    latitude: number | null;
    longitude: number | null;

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
    desired_spaces_other: string | null;
    cars_count: number | null;
    kitchen_layout: string | null;
    floor_count: string | null;
    floor_count_other: string | null;
    essential_space: string | null;

    architectural_style: string[];
    architectural_style_other: string | null;
    colour_material_preferences: string | null;
    natural_light_rating: number | null;
    privacy_rating: number | null;
    reference_links: string | null;
    other_information: string | null;

    service_scope: string;
    project_priorities: string[];
    construction_start: string;

    reviewed_by: string | null;
    reviewed_at: string | null;
    internal_notes: string | null;
    rejection_reason: string | null;
    converted_project_id: string | null;

    attachments: ProjectBriefAttachment[];
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

export type ProjectBriefing = {
    id: string;
    full_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    location_municipality: string | null;
    location_province: string | null;
    status: ProjectBriefStatus | null;
    created_at: string;
};

export type GetProjectBriefingsParams = {
    query?: string;
    status?: string;
};

export type ProjectBriefingAttachment = {
    id: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    category: AttachmentCategory;
    download_url: string | null;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STORAGE_BUCKET = "project-brief-attachments";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_PER_CATEGORY = 5;

const ALL_STATUSES: ProjectBriefStatus[] = [
    "pending",
    "in_review",
    "contacted",
    "approved",
    "rejected",
    "converted",
];

/* -------------------------------------------------------------------------- */
/* Supabase and Permissions                                                   */
/* -------------------------------------------------------------------------- */

async function getSupabase() {
    return createClient(await cookies());
}

/**
 * Public submission client.
 * Used only by the public briefing form.
 */
async function getPublicSupabase() {
    return getSupabase();
}

/**
 * Viewing permission.
 * Users must have project_briefing.view.
 */
async function getAuthorisedSupabase() {
    await requirePermission("project_briefing.view");

    return getSupabase();
}

/**
 * Management permission.
 * Preserves the original administrator-only restriction.
 */
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
> &
    Partial<
        Pick<
            CreateProjectBriefInput,
            | "budget"
            | "latitude"
            | "longitude"
            | "land_area"
            | "land_length"
            | "land_width"
        >
    >;

function validateBrief(input: BriefValidationInput): void {
    const name = input.full_name?.trim();

    if (!name) {
        throw new Error("O nome completo é obrigatório.");
    }

    if (name.length < 3) {
        throw new Error("O nome deve ter pelo menos 3 caracteres.");
    }

    if (!input.contact_phone?.trim()) {
        throw new Error("O número de telefone é obrigatório.");
    }

    const email = input.contact_email?.trim();

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error("Indique um endereço de email válido.");
        }
    }

    const budget = input.budget;

    if (budget != null) {
        if (
            typeof budget !== "number" ||
            !Number.isFinite(budget) ||
            budget < 0 ||
            budget > 9999999999999.99
        ) {
            throw new Error("Introduza um orçamento válido.");
        }
    }

    const { latitude, longitude } = input;

    if (
        (latitude == null && longitude != null) ||
        (latitude != null && longitude == null)
    ) {
        throw new Error(
            "A latitude e a longitude devem ser indicadas em conjunto.",
        );
    }

    if (
        latitude != null &&
        (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
    ) {
        throw new Error("A latitude indicada não é válida.");
    }

    if (
        longitude != null &&
        (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
    ) {
        throw new Error("A longitude indicada não é válida.");
    }

    const dimensions = [input.land_area, input.land_length, input.land_width];

    if (
        dimensions.some(
            (value) =>
                value != null && (!Number.isFinite(value) || value < 0),
        )
    ) {
        throw new Error("As dimensões do terreno não podem ser negativas.");
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
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        architectural_style_other:
            input.architectural_style_other?.trim() || null,
        infrastructure: [...new Set(input.infrastructure)],
        desired_spaces: [...new Set(input.desired_spaces)],
        project_priorities: [...new Set(input.project_priorities)],
        architectural_style: [...new Set(input.architectural_style)],
    };
}

/**
 * Validates every file and detects its real type from the file content.
 * Runs before anything is inserted, so a bad file never leaves a half-created brief.
 */
async function prepareAttachments(
    groups: AttachmentGroups,
): Promise<PreparedAttachment[]> {
    const prepared: PreparedAttachment[] = [];

    for (const category of ["land", "reference"] as const) {
        const files = groups[category] ?? [];

        if (files.length > MAX_PER_CATEGORY) {
            throw new Error(
                `Pode anexar no máximo ${MAX_PER_CATEGORY} ficheiros por secção.`,
            );
        }

        for (const file of files) {
            if (!file.size || file.size > MAX_FILE_SIZE) {
                throw new Error(
                    `O ficheiro "${file.name}" ultrapassa o limite de 8 MB.`,
                );
            }

            const mime = await sniffFileType(file);

            if (!mime) {
                throw new Error(
                    `O formato do ficheiro "${file.name}" não é permitido.`,
                );
            }

            prepared.push({ file, category, mime });
        }
    }

    return prepared;
}

/* -------------------------------------------------------------------------- */
/* Public Submission                                                          */
/* -------------------------------------------------------------------------- */

export async function createProjectBrief(
    input: CreateProjectBriefInput,
    files: AttachmentGroups = { land: [], reference: [] },
) {
    validateBrief(input);

    const prepared = await prepareAttachments(files);

    const supabase = await getPublicSupabase();

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

    if (prepared.length) {
        try {
            await uploadPrepared(brief.id, prepared);
        } catch (uploadError) {
            const { error: deleteError } = await supabase
                .from("project_briefs")
                .delete()
                .eq("id", brief.id);

            if (deleteError) {
                console.error("createProjectBrief rollback:", deleteError);
            }

            throw uploadError;
        }
    }

    return brief as ProjectBrief;
}

/* -------------------------------------------------------------------------- */
/* Attachments                                                                */
/* -------------------------------------------------------------------------- */

async function uploadPrepared(
    briefId: string,
    items: PreparedAttachment[],
) {
    const supabase = await getPublicSupabase();

    const uploadedPaths: string[] = [];
    const insertedIds: string[] = [];

    try {
        for (const { file, category, mime } of items) {
            const storagePath = `${briefId}/${category}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(storagePath, file, {
                    contentType: mime,
                    upsert: false,
                });

            if (uploadError) {
                console.error("Attachment upload:", uploadError);

                throw new Error(
                    "Não foi possível carregar os anexos. Tente novamente.",
                );
            }

            uploadedPaths.push(storagePath);

            const { data: attachment, error: insertError } = await supabase
                .from("project_brief_attachments")
                .insert({
                    brief_id: briefId,
                    storage_path: storagePath,
                    original_name: file.name,
                    mime_type: mime,
                    file_size: file.size,
                    category,
                })
                .select("id")
                .single();

            if (insertError || !attachment) {
                console.error("Attachment insert:", insertError);

                throw new Error(
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

export async function uploadProjectBriefAttachments(
    briefId: string,
    groups: AttachmentGroups,
) {
    const prepared = await prepareAttachments(groups);

    const supabase = await getPublicSupabase();

    const { data: brief, error: briefError } = await supabase
        .from("project_briefs")
        .select("id")
        .eq("id", briefId)
        .single();

    if (briefError || !brief) {
        throw new Error("Briefing não encontrado.");
    }

    return uploadPrepared(briefId, prepared);
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

    return Promise.all(
        (data ?? []).map(async (attachment) => {
            const { data: signed, error: signedError } =
                await supabase.storage
                    .from(STORAGE_BUCKET)
                    .createSignedUrl(attachment.storage_path, 300);

            return {
                ...attachment,
                signed_url: signedError ? null : (signed?.signedUrl ?? null),
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
/* Briefing List - Paginated                                                  */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefs(filters: ProjectBriefFilters = {}) {
    const supabase = await getAuthorisedSupabase();

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
            [
                `full_name.ilike.%${term}%`,
                `contact_email.ilike.%${term}%`,
                `contact_phone.ilike.%${term}%`,
                `location_municipality.ilike.%${term}%`,
            ].join(","),
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
/* Briefing List - Existing Page Compatibility                                */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefings({
    query = "",
    status = "",
}: GetProjectBriefingsParams = {}) {
    const supabase = await getAuthorisedSupabase();

    const search = query
        .replace(/[%_,()\\]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const selectedStatus = ALL_STATUSES.includes(status as ProjectBriefStatus)
        ? (status as ProjectBriefStatus)
        : "";

    let request = supabase
        .from("project_briefs")
        .select(`
            id,
            full_name,
            contact_email,
            contact_phone,
            location_municipality,
            location_province,
            status,
            created_at
        `)
        .order("created_at", { ascending: false });

    if (selectedStatus) {
        request = request.eq("status", selectedStatus);
    }

    if (search) {
        request = request.or(
            [
                `full_name.ilike.%${search}%`,
                `contact_email.ilike.%${search}%`,
                `contact_phone.ilike.%${search}%`,
            ].join(","),
        );
    }

    const [
        { data, error },
        { count: totalCount, error: totalError },
        { count: pendingCount, error: pendingError },
        { count: reviewCount, error: reviewError },
    ] = await Promise.all([
        request,

        supabase
            .from("project_briefs")
            .select("id", { count: "exact", head: true }),

        supabase
            .from("project_briefs")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),

        supabase
            .from("project_briefs")
            .select("id", { count: "exact", head: true })
            .eq("status", "in_review"),
    ]);

    const errors = [error, totalError, pendingError, reviewError].filter(
        Boolean,
    );

    if (errors.length) {
        console.error("Erro ao carregar dados dos briefings:", errors);

        throw new Error("Não foi possível carregar os briefings.");
    }

    return {
        briefings: (data ?? []) as ProjectBriefing[],
        totalCount: totalCount ?? 0,
        pendingCount: pendingCount ?? 0,
        reviewCount: reviewCount ?? 0,
    };
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefStats(): Promise<ProjectBriefStats> {
    const supabase = await getAuthorisedSupabase();

    const countFor = (status?: ProjectBriefStatus) => {
        const request = supabase
            .from("project_briefs")
            .select("id", { count: "exact", head: true });

        return status ? request.eq("status", status) : request;
    };

    const [total, ...byStatus] = await Promise.all([
        countFor(),
        ...ALL_STATUSES.map((status) => countFor(status)),
    ]);

    if (total.error || byStatus.some((result) => result.error)) {
        console.error("getProjectBriefStats:", [
            total.error,
            ...byStatus.map((result) => result.error),
        ]);

        throw new Error("Não foi possível carregar as estatísticas.");
    }

    const stats: ProjectBriefStats = {
        total: total.count ?? 0,
        pending: 0,
        in_review: 0,
        contacted: 0,
        approved: 0,
        rejected: 0,
        converted: 0,
    };

    ALL_STATUSES.forEach((status, index) => {
        stats[status] = byStatus[index].count ?? 0;
    });

    return stats;
}

/* -------------------------------------------------------------------------- */
/* Briefing Details                                                           */
/* -------------------------------------------------------------------------- */

export async function getProjectBrief(id: string) {
    const supabase = await getAuthorisedSupabase();

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
    } as ProjectBrief;
}

export async function getProjectBriefingDetails(briefingId: string) {
    if (!briefingId?.trim()) {
        notFound();
    }

    const supabase = await getAuthorisedSupabase();

    const { data: briefing, error: briefingError } = await supabase
        .from("project_briefs")
        .select("*")
        .eq("id", briefingId)
        .maybeSingle();

    if (briefingError) {
        console.error("Erro ao carregar briefing:", briefingError.message);

        throw new Error("Não foi possível carregar o briefing.");
    }

    if (!briefing) {
        notFound();
    }

    const { data: attachments, error: attachmentError } = await supabase
        .from("project_brief_attachments")
        .select(`
            id,
            original_name,
            mime_type,
            file_size,
            storage_path,
            category,
            created_at
        `)
        .eq("brief_id", briefingId)
        .order("created_at", { ascending: true });

    if (attachmentError) {
        console.error("Erro ao carregar anexos:", attachmentError.message);

        throw new Error("Não foi possível carregar os anexos do briefing.");
    }

    const safeAttachments: ProjectBriefingAttachment[] = await Promise.all(
        (attachments ?? []).map(async (attachment) => {
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .createSignedUrl(attachment.storage_path, 300);

            if (error) {
                console.error(
                    `Erro ao gerar link para o anexo ${attachment.id}:`,
                    error.message,
                );
            }

            return {
                id: attachment.id,
                original_name: attachment.original_name,
                mime_type: attachment.mime_type,
                file_size: attachment.file_size,
                created_at: attachment.created_at,
                category: attachment.category as AttachmentCategory,
                download_url: data?.signedUrl ?? null,
            };
        }),
    );

    return {
        briefing,
        attachments: safeAttachments,
    };
}

/* -------------------------------------------------------------------------- */
/* Update Briefing                                                            */
/* -------------------------------------------------------------------------- */

export async function updateProjectBrief(
    id: string,
    input: UpdateProjectBriefInput,
) {
    const { supabase } = await requireAdmin();

    const { data: current, error: currentError } = await supabase
        .from("project_briefs")
        .select(`
            full_name,
            contact_phone,
            contact_email,
            budget
        `)
        .eq("id", id)
        .single();

    if (currentError || !current) {
        throw new Error("Briefing não encontrado.");
    }

    validateBrief({
        ...current,
        ...input,
    });

    const payload: Record<string, unknown> = {
        ...input,
        updated_at: new Date().toISOString(),
    };

    if (input.full_name !== undefined) {
        payload.full_name = input.full_name.trim();
    }

    if (input.contact_phone !== undefined) {
        payload.contact_phone = input.contact_phone.trim();
    }

    if (input.contact_email !== undefined) {
        payload.contact_email = input.contact_email.trim().toLowerCase();
    }

    if (input.architectural_style !== undefined) {
        payload.architectural_style = [...new Set(input.architectural_style)];
    }

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

    if (!ALL_STATUSES.includes(status)) {
        throw new Error("Estado inválido.");
    }

    if (status === "rejected" && !rejectionReason?.trim()) {
        throw new Error("Indique o motivo da rejeição.");
    }

    const now = new Date().toISOString();

    const payload: Record<string, unknown> = {
        status,
        updated_at: now,
    };

    if (["in_review", "contacted", "approved", "rejected"].includes(status)) {
        payload.reviewed_by = user.id;
        payload.reviewed_at = now;
    }

    payload.rejection_reason =
        status === "rejected" ? rejectionReason?.trim() : null;

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

export async function updateProjectBriefNotes(id: string, notes: string) {
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

export async function convertProjectBrief(id: string, projectId: string) {
    const { supabase } = await requireAdmin();

    if (!projectId?.trim()) {
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

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("project_briefs")
        .update({
            status: "converted",
            converted_project_id: projectId,
            reviewed_at: now,
            updated_at: now,
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
/* Delete Briefing                                                            */
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