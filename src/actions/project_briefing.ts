
"use server";

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

import { revalidatePath } from "next/cache";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type ActionResult<T = void> = {
    success: boolean;
    error?: string;
    data?: T;
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PROJECT_PRIORITIES = [
    "Conforto e funcionalidade",
    "Controlo do orçamento",
    "Eficiência energética",
    "Privacidade e segurança",
    "Rapidez de execução",
    "Valorização do imóvel",
    "Sustentabilidade",
    "Integração com o exterior",
    "Flexibilidade para o futuro",
] as const;

const SERVICE_SCOPE_OPTIONS = [
    "Apenas arquitectura",
    "Arquitectura e engenharia",
    "Projecto completo (arquitectura, especialidades e fiscalização)",
    "Projecto e construção (solução chave-na-mão)",
    "Ainda não tenho a certeza",
] as const;

const CONSTRUCTION_START_OPTIONS = [
    "O mais breve possível",
    "Dentro de 1 a 3 meses",
    "Dentro de 3 a 6 meses",
    "Dentro de 6 a 12 meses",
    "Daqui a mais de 12 meses",
    "Ainda não definido",
] as const;

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

/* -------------------------------------------------------------------------- */
/* FormData Helpers                                                           */
/* -------------------------------------------------------------------------- */

function getString(formData: FormData, key: string): string {
    const value = formData.get(key);

    return typeof value === "string" ? value.trim() : "";
}

function getNullableString(
    formData: FormData,
    key: string,
): string | null {
    return getString(formData, key) || null;
}

function getNumber(
    formData: FormData,
    key: string,
): number | null {
    const value = getString(formData, key);

    if (!value) return null;

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        throw new Error(`O campo "${key}" contém um valor inválido.`);
    }

    return parsed;
}

function getCoordinate(
    formData: FormData,
    key: "latitude" | "longitude",
): number | null {
    const value = getString(formData, key);

    if (!value) return null;

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        throw new Error("As coordenadas seleccionadas não são válidas.");
    }

    const min = key === "latitude" ? -90 : -180;
    const max = key === "latitude" ? 90 : 180;

    if (parsed < min || parsed > max) {
        throw new Error("As coordenadas seleccionadas estão fora dos limites válidos.");
    }

    return parsed;
}

function getBudget(formData: FormData): number | null {
    const value = getString(formData, "budget");

    if (!value) return null;

    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
        throw new Error("Introduza um orçamento válido.");
    }

    const budget = Number(value);

    if (!Number.isFinite(budget) || budget < 0) {
        throw new Error("Introduza um orçamento válido.");
    }

    if (budget > 9999999999999.99) {
        throw new Error("O orçamento excede o limite permitido.");
    }

    return budget;
}

function getStringArray(
    formData: FormData,
    key: string,
): string[] {
    return [
        ...new Set(
            formData
                .getAll(key)
                .filter(
                    (value): value is string =>
                        typeof value === "string",
                )
                .map((value) => value.trim())
                .filter(Boolean),
        ),
    ];
}

function getArchitecturalStyles(formData: FormData): string[] {
    const styles = getStringArray(formData, "architectural_style");
    const otherStyle = getString(
        formData,
        "architectural_style_other",
    );

    return [
        ...new Set(
            styles
                .map((style) =>
                    style === "Outro" ? otherStyle : style,
                )
                .filter(Boolean),
        ),
    ];
}

function getAttachments(formData: FormData): File[] {
    return formData
        .getAll("attachments")
        .filter(
            (value): value is File =>
                typeof File !== "undefined" &&
                value instanceof File &&
                value.size > 0,
        );
}

/* -------------------------------------------------------------------------- */
/* Submission Validation                                                      */
/* -------------------------------------------------------------------------- */

function validatePublicSubmission(formData: FormData) {
    const consent = getString(formData, "privacy_consent");

    if (!["true", "on", "1"].includes(consent)) {
        throw new Error(
            "É necessário aceitar a política de privacidade para continuar.",
        );
    }

    // Honeypot: bots should not be able to submit the form.
    if (getString(formData, "website")) {
        throw new Error("Não foi possível submeter o formulário.");
    }
}

/* -------------------------------------------------------------------------- */
/* FormData Parser                                                            */
/* -------------------------------------------------------------------------- */

function parseProjectBriefFormData(
    formData: FormData,
): CreateProjectBriefInput {
    const fullName = getString(formData, "full_name");
    const contactPhone = getString(formData, "contact_phone");

    if (!fullName) {
        throw new Error("Introduza o seu nome.");
    }

    if (!contactPhone) {
        throw new Error("Introduza o seu número de telefone.");
    }

    /* Service scope */

    const serviceScope = getString(formData, "service_scope");

    if (
        !SERVICE_SCOPE_OPTIONS.includes(
            serviceScope as (typeof SERVICE_SCOPE_OPTIONS)[number],
        )
    ) {
        throw new Error(
            "Seleccione o âmbito dos serviços pretendidos.",
        );
    }

    /* Construction start */

    const constructionStart = getString(
        formData,
        "construction_start",
    );

    if (
        !CONSTRUCTION_START_OPTIONS.includes(
            constructionStart as (typeof CONSTRUCTION_START_OPTIONS)[number],
        )
    ) {
        throw new Error(
            "Seleccione quando pretende iniciar a construção.",
        );
    }

    /* Project priorities */

    const projectPriorities = getStringArray(
        formData,
        "project_priorities",
    );

    const validPriorities = projectPriorities.every((priority) =>
        PROJECT_PRIORITIES.includes(
            priority as (typeof PROJECT_PRIORITIES)[number],
        ),
    );

    if (
        projectPriorities.length !== 3 ||
        !validPriorities
    ) {
        throw new Error(
            "Seleccione exactamente três prioridades para o projecto.",
        );
    }

    /* Coordinates */

    const latitude = getCoordinate(formData, "latitude");
    const longitude = getCoordinate(formData, "longitude");

    if (
        (latitude === null && longitude !== null) ||
        (latitude !== null && longitude === null)
    ) {
        throw new Error(
            "A latitude e a longitude devem ser indicadas em conjunto.",
        );
    }

    /* Budget */

    const budget = getBudget(formData);

    if (budget === null) {
        throw new Error("Indique o orçamento previsto para o projecto.");
    }

    /* Architectural styles */

    const architecturalStyles = getArchitecturalStyles(formData);

    return {
        /* Personal information */

        full_name: fullName,
        contact_phone: contactPhone,
        contact_email: getString(formData, "contact_email"),
        budget,
        decision_makers: getNullableString(
            formData,
            "decision_makers",
        ),
        preferred_contact: getNullableString(
            formData,
            "preferred_contact",
        ),

        /* Location */

        location_address: getNullableString(
            formData,
            "location_address",
        ),
        location_neighborhood: getNullableString(
            formData,
            "location_neighborhood",
        ),
        location_municipality: getNullableString(
            formData,
            "location_municipality",
        ),
        location_reference: getNullableString(
            formData,
            "location_reference",
        ),
        location_city: getNullableString(
            formData,
            "location_city",
        ),
        location_province: getNullableString(
            formData,
            "location_province",
        ),
        latitude,
        longitude,
        map_link: getNullableString(formData, "map_link"),

        /* Land */

        land_ownership: getNullableString(
            formData,
            "land_ownership",
        ),
        land_area: getNumber(formData, "land_area"),
        land_length: getNumber(formData, "land_length"),
        land_width: getNumber(formData, "land_width"),
        land_type: getNullableString(formData, "land_type"),
        existing_buildings: getNullableString(
            formData,
            "existing_buildings",
        ),
        has_trees: getNullableString(formData, "has_trees"),
        infrastructure: getStringArray(
            formData,
            "infrastructure",
        ),

        /* Household */

        residents_count: getNumber(
            formData,
            "residents_count",
        ),
        domestic_workers: getNullableString(
            formData,
            "domestic_workers",
        ),
        domestic_workers_count: getNumber(
            formData,
            "domestic_workers_count",
        ),
        resident_profiles: getNullableString(
            formData,
            "resident_profiles",
        ),
        family_growth: getNullableString(
            formData,
            "family_growth",
        ),
        works_from_home: getNullableString(
            formData,
            "works_from_home",
        ),
        visitors_frequency: getNullableString(
            formData,
            "visitors_frequency",
        ),
        pets: getNullableString(formData, "pets"),
        current_home_dislikes: getNullableString(
            formData,
            "current_home_dislikes",
        ),
        current_home_likes: getNullableString(
            formData,
            "current_home_likes",
        ),

        /* Architectural programme */

        bedrooms_count: getNumber(
            formData,
            "bedrooms_count",
        ),
        suites_count: getNumber(
            formData,
            "suites_count",
        ),
        desired_spaces: getStringArray(
            formData,
            "desired_spaces",
        ),
        cars_count: getNumber(formData, "cars_count"),
        kitchen_layout: getNullableString(
            formData,
            "kitchen_layout",
        ),
        floor_count: getNullableString(
            formData,
            "floor_count",
        ),
        essential_space: getNullableString(
            formData,
            "essential_space",
        ),

        /* Scope and planning */

        service_scope: serviceScope,
        project_priorities: projectPriorities,
        construction_start: constructionStart,

        /* Aesthetic preferences */

        architectural_style: architecturalStyles,
        architectural_style_other: getNullableString(
            formData,
            "architectural_style_other",
        ),
        colour_material_preferences: getNullableString(
            formData,
            "colour_material_preferences",
        ),
        natural_light_rating: getNumber(
            formData,
            "natural_light_rating",
        ),
        privacy_rating: getNumber(
            formData,
            "privacy_rating",
        ),
        reference_links: getNullableString(
            formData,
            "reference_links",
        ),
        other_information: getNullableString(
            formData,
            "other_information",
        ),
    };
}

/* -------------------------------------------------------------------------- */
/* Public Submission                                                          */
/* -------------------------------------------------------------------------- */

export async function submitProjectBrief(
    formData: FormData,
): Promise<ActionResult<{ id: string }>> {
    return execute(async () => {
        validatePublicSubmission(formData);

        const input = parseProjectBriefFormData(formData);
        const files = getAttachments(formData);

        const brief = await createProjectBrief(input, files);

        return { id: brief.id };
    });
}

/* -------------------------------------------------------------------------- */
/* Compatibility Submission                                                   */
/* -------------------------------------------------------------------------- */

export async function submitProjectBriefAction(
    formData: FormData,
): Promise<ActionResult<{ id: string }>> {
    return execute(async () => {
        validatePublicSubmission(formData);

        const input = parseProjectBriefFormData(formData);
        const files = getAttachments(formData);

        const brief = await createProjectBrief(input, files);

        return { id: brief.id };
    });
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
/* Detail                                                                      */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefAction(id: string) {
    return execute(() => getProjectBrief(id));
}

/* -------------------------------------------------------------------------- */
/* Attachments                                                                */
/* -------------------------------------------------------------------------- */

export async function getProjectBriefAttachmentsAction(
    briefId: string,
) {
    return execute(() => getProjectBriefAttachments(briefId));
}

export async function deleteProjectBriefAttachmentAction(
    id: string,
) {
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
