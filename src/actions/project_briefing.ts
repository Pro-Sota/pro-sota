"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import {
    createProjectBrief,
    getProjectBriefs,
    getProjectBriefStats,
    getProjectBrief,
    getProjectBriefAttachments,
    deleteProjectBriefAttachment,
    updateProjectBrief,
    updateProjectBriefStatus,
    updateProjectBriefNotes,
    convertProjectBrief,
    deleteProjectBrief,
} from "@/services/project_briefing";

import type {
    CreateProjectBriefInput,
    ProjectBriefFilters,
    UpdateProjectBriefInput,
    ProjectBriefStatus,
} from "@/services/project_briefing";

import { checkBrief, rateLimited } from "@/app/project-briefing/brief_server";
import type { BriefValues } from "@/app/project-briefing/values";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ActionResult<T = void> = {
    success: boolean;
    error?: string;
    data?: T;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function execute<T>(
    operation: () => Promise<T>,
): Promise<ActionResult<T>> {
    try {
        const data = await operation();

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Project Brief Action:", error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Não foi possível concluir a operação.",
        };
    }
}

function revalidateBrief(id: string) {
    revalidatePath("/management/project-briefing");
    revalidatePath(`/management/project-briefing/${id}`);
}

const toNull = (value: string) => value.trim() || null;

const toNumber = (value: string) =>
    value.trim() === "" ? null : Number(value);

/** Human-friendly reference derived from the id (no extra column needed). */
function makeReference(brief: { id: string; created_at: string }) {
    const year = new Date(brief.created_at).getFullYear();

    return `PS-${year}-${brief.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/* -------------------------------------------------------------------------- */
/* Form values -> service input                                               */
/* -------------------------------------------------------------------------- */

function toInput(v: BriefValues): CreateProjectBriefInput {
    const latitude = toNumber(v.latitude);
    const longitude = toNumber(v.longitude);
    const undisclosed = v.budget_undisclosed === "yes";

    return {
        /* Personal information */

        full_name: v.full_name,
        contact_phone: v.contact_phone,
        contact_email: v.contact_email,
        budget: undisclosed ? null : toNumber(v.budget),
        budget_undisclosed: undisclosed,
        decision_makers: toNull(v.decision_makers),
        preferred_contact: toNull(v.preferred_contact),

        /* Location */

        location_address: toNull(v.location_address),
        location_neighborhood: toNull(v.location_neighborhood),
        location_municipality: toNull(v.location_municipality),
        location_reference: toNull(v.location_reference),
        location_city: toNull(v.location_city),
        location_province: toNull(v.location_province),
        latitude,
        longitude,
        map_link:
            latitude !== null && longitude !== null
                ? `https://www.google.com/maps?q=${latitude},${longitude}`
                : null,

        /* Land */

        land_ownership: toNull(v.land_ownership),
        land_area: toNumber(v.land_area),
        land_length: toNumber(v.land_length),
        land_width: toNumber(v.land_width),
        land_type: toNull(v.land_type),
        existing_buildings: toNull(v.existing_buildings),
        has_trees: toNull(v.has_trees),
        infrastructure: v.infrastructure,

        /* Household */

        residents_count: toNumber(v.residents_count),
        domestic_workers: toNull(v.domestic_workers),
        domestic_workers_count: toNumber(v.domestic_workers_count),
        resident_profiles: toNull(v.resident_profiles),
        family_growth: toNull(v.family_growth),
        works_from_home: toNull(v.works_from_home),
        visitors_frequency: toNull(v.visitors_frequency),
        pets: toNull(v.pets),
        current_home_dislikes: toNull(v.current_home_dislikes),
        current_home_likes: toNull(v.current_home_likes),

        /* Architectural programme */

        bedrooms_count: toNumber(v.bedrooms_count),
        suites_count: toNumber(v.suites_count),
        desired_spaces: v.desired_spaces,
        desired_spaces_other: toNull(v.desired_spaces_other),
        cars_count: toNumber(v.cars_count),
        kitchen_layout: toNull(v.kitchen_layout),
        floor_count: toNull(v.floor_count),
        floor_count_other: toNull(v.floor_count_other),
        essential_space: toNull(v.essential_space),

        /* Scope and planning */

        service_scope: v.service_scope,
        project_priorities: v.project_priorities,
        construction_start: v.construction_start,

        /* Aesthetic preferences */

        architectural_style: v.architectural_style,
        architectural_style_other: toNull(v.architectural_style_other),
        colour_material_preferences: toNull(v.colour_material_preferences),
        natural_light_rating: toNumber(v.natural_light_rating),
        privacy_rating: toNumber(v.privacy_rating),
        reference_links: toNull(v.reference_links),
        other_information: toNull(v.other_information),
    };
}

/* -------------------------------------------------------------------------- */
/* Public Submission                                                          */
/* -------------------------------------------------------------------------- */

export async function submitProjectBrief(
    formData: FormData,
): Promise<ActionResult<{ id: string; reference: string }>> {
    return execute(async () => {
        const ip =
            (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
            "unknown";

        if (rateLimited(ip)) {
            throw new Error("Demasiados pedidos. Tente novamente mais tarde.");
        }

        const checked = await checkBrief(formData);

        if (!checked.ok) {
            throw new Error(checked.error);
        }

        const brief = await createProjectBrief(toInput(checked.values), {
            land: checked.land,
            reference: checked.reference,
        });

        revalidatePath("/management/project-briefing");

        return {
            id: brief.id,
            reference: makeReference(brief),
        };
    });
}

/* -------------------------------------------------------------------------- */
/* Compatibility Submission                                                   */
/* -------------------------------------------------------------------------- */

export async function submitProjectBriefAction(formData: FormData) {
    return submitProjectBrief(formData);
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefsAction(
    filters: ProjectBriefFilters = {},
) {
    return execute(() => getProjectBriefs(filters));
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefStatsAction() {
    return execute(() => getProjectBriefStats());
}

/* -------------------------------------------------------------------------- */
/* Detail                                                                     */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefAction(id: string) {
    return execute(() => getProjectBrief(id));
}

/* -------------------------------------------------------------------------- */
/* Attachments                                                                */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefAttachmentsAction(briefId: string) {
    return execute(() => getProjectBriefAttachments(briefId));
}

export async function deleteProjectBriefAttachmentAction(id: string) {
    return execute(async () => {
        const result = await deleteProjectBriefAttachment(id);

        revalidatePath("/management/project-briefing");

        return result;
    });
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateProjectBriefAction(
    id: string,
    input: UpdateProjectBriefInput,
) {
    return execute(async () => {
        const result = await updateProjectBrief(id, input);

        revalidateBrief(id);

        return result;
    });
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateProjectBriefStatusAction(
    id: string,
    status: ProjectBriefStatus,
    rejectionReason?: string,
) {
    return execute(async () => {
        const result = await updateProjectBriefStatus(
            id,
            status,
            rejectionReason,
        );

        revalidateBrief(id);

        return result;
    });
}

/* -------------------------------------------------------------------------- */
/* Internal Notes                                                             */
/* -------------------------------------------------------------------------- */

export async function updateProjectBriefNotesAction(
    id: string,
    notes: string,
) {
    return execute(async () => {
        const result = await updateProjectBriefNotes(id, notes);

        revalidateBrief(id);

        return result;
    });
}

/* -------------------------------------------------------------------------- */
/* Convert                                                                    */
/* -------------------------------------------------------------------------- */

export async function convertProjectBriefAction(
    id: string,
    projectId: string,
) {
    return execute(async () => {
        const result = await convertProjectBrief(id, projectId);

        revalidateBrief(id);
        revalidatePath(`/management/projects/${projectId}`);

        return result;
    });
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export async function deleteProjectBriefAction(id: string) {
    return execute(async () => {
        const result = await deleteProjectBrief(id);

        revalidatePath("/management/project-briefing");

        return result;
    });
}