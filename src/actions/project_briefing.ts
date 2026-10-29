"use server";

import "server-only";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "project-brief-attachments";
const MAX_FILES = 5;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export type ProjectBriefActionResult = {
    success: boolean;
    error?: string;
};

function text(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

function values(formData: FormData, key: string): string[] {
    return formData.getAll(key).filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean);
}

function validEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function submitProjectBrief(formData: FormData): Promise<ProjectBriefActionResult> {
    try {
        // Honeypot: silently reject automated submissions.
        if (text(formData, "website")) {
            return { success: true };
        }

        const fullName = text(formData, "full_name");
        const phone = text(formData, "contact_phone");
        const email = text(formData, "contact_email");
        const consent = formData.get("privacy_consent") === "on";
        const requiredFields = [
            "decision_makers", "preferred_contact", "land_ownership", "land_type",
            "existing_buildings", "has_trees", "residents_count", "domestic_workers",
            "family_growth", "works_from_home", "visitors_frequency", "bedrooms_count",
            "suites_count", "kitchen_layout", "floor_count", "natural_light_rating", "privacy_rating",
        ];
        if (requiredFields.some((key) => !text(formData, key))) {
            return { success: false, error: "Preencha todos os campos obrigatórios antes de enviar." };
        }
        if (values(formData, "desired_spaces").length === 0) {
            return { success: false, error: "Seleccione pelo menos um espaço desejado." };
        }
        if (values(formData, "architectural_style").length === 0) {
            return { success: false, error: "Seleccione pelo menos um estilo arquitectónico." };
        }
        if (text(formData, "map_link") && text(formData, "map_link")) {
            return { success: false, error: "O link do mapa deve começar por http:// ou https://." };
        }
        if (fullName.length < 3 || fullName.length > 160) {
            return { success: false, error: "Indique o seu nome completo." };
        }
        if (phone.length < 6 || phone.length > 40) {
            return { success: false, error: "Indique um contacto telefónico válido." };
        }
        if (!validEmail(email) || email.length > 254) {
            return { success: false, error: "Indique um endereço de e-mail válido." };
        }
        if (!consent) {
            return { success: false, error: "É necessário autorizar a utilização dos dados para dar seguimento ao pedido." };
        }

        const files = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
        if (files.length > MAX_FILES) {
            return { success: false, error: "Pode anexar no máximo 5 ficheiros." };
        }
        if (files.some((file) => file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.has(file.type))) {
            return { success: false, error: "Os anexos devem ser imagens JPG, PNG, WEBP ou documentos PDF, até 8 MB cada." };
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
            console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
            return { success: false, error: "O serviço de submissão não está configurado. Contacte a equipa da PRO SOTA." };
        }
        // Service-role client is server-only. Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });

        const payload = {
            full_name: fullName,
            contact_phone: phone,
            contact_email: email,
            decision_makers: text(formData, "decision_makers") || null,
            preferred_contact: text(formData, "preferred_contact") || null,
            location_address: text(formData, "location_address") || null,
            location_neighborhood: text(formData, "location_neighborhood") || null,
            location_municipality: text(formData, "location_municipality") || null,
            location_reference: text(formData, "location_reference") || null,
            location_city: text(formData, "location_city") || null,
            location_province: text(formData, "location_province") || null,
            map_link: text(formData, "map_link") || null,
            land_ownership: text(formData, "land_ownership") || null,
            land_area: numberOrNull(text(formData, "land_area")),
            land_length: numberOrNull(text(formData, "land_length")),
            land_width: numberOrNull(text(formData, "land_width")),
            land_type: text(formData, "land_type") || null,
            existing_buildings: text(formData, "existing_buildings") || null,
            has_trees: text(formData, "has_trees") || null,
            infrastructure: values(formData, "infrastructure"),
            residents_count: numberOrNull(text(formData, "residents_count")),
            domestic_workers: text(formData, "domestic_workers") || null,
            domestic_workers_count: numberOrNull(text(formData, "domestic_workers_count")),
            resident_profiles: text(formData, "resident_profiles") || null,
            family_growth: text(formData, "family_growth") || null,
            works_from_home: text(formData, "works_from_home") || null,
            visitors_frequency: text(formData, "visitors_frequency") || null,
            pets: text(formData, "pets") || null,
            current_home_dislikes: text(formData, "current_home_dislikes") || null,
            current_home_likes: text(formData, "current_home_likes") || null,
            bedrooms_count: numberOrNull(text(formData, "bedrooms_count")),
            suites_count: numberOrNull(text(formData, "suites_count")),
            desired_spaces: values(formData, "desired_spaces"),
            cars_count: numberOrNull(text(formData, "cars_count")),
            kitchen_layout: text(formData, "kitchen_layout") || null,
            floor_count: text(formData, "floor_count") || null,
            essential_space: text(formData, "essential_space") || null,
            architectural_style: values(formData, "architectural_style"),
            colour_material_preferences: text(formData, "colour_material_preferences") || null,
            natural_light_rating: numberOrNull(text(formData, "natural_light_rating")),
            privacy_rating: numberOrNull(text(formData, "privacy_rating")),
            reference_links: text(formData, "reference_links") || null,
            other_information: text(formData, "other_information") || null,
            status: "pending",
            attachments: [] as Array<{ path: string; name: string; type: string; size: number }>,
        };

        const { data: inserted, error: insertError } = await supabase
            .from("project_briefs")
            .insert(payload)
            .select("id")
            .single();

        if (insertError || !inserted) {
            console.error("Project brief insert failed:", insertError?.message);
            return { success: false, error: "Não foi possível registar o brief neste momento. Tente novamente mais tarde." };
        }

        const uploaded: string[] = [];
        const metadata: Array<{ path: string; name: string; type: string; size: number }> = [];

        for (const file of files) {
            const safeName = file.name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "anexo";
            const path = `${inserted.id}/${crypto.randomUUID()}-${safeName}`;
            const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
                contentType: file.type,
                upsert: false,
            });

            if (uploadError) {
                await Promise.all(uploaded.map((uploadedPath) => supabase.storage.from(BUCKET).remove([uploadedPath])));
                await supabase.from("project_briefs").delete().eq("id", inserted.id);
                console.error("Project brief attachment upload failed:", uploadError.message);
                return { success: false, error: "Não foi possível carregar os anexos. Verifique os ficheiros e tente novamente." };
            }

            uploaded.push(path);
            metadata.push({ path, name: safeName, type: file.type, size: file.size });
        }

        if (metadata.length) {
            const { error: updateError } = await supabase.from("project_briefs")
                .update({ attachments: metadata }).eq("id", inserted.id);
            if (updateError) {
                await Promise.all(uploaded.map((uploadedPath) => supabase.storage.from(BUCKET).remove([uploadedPath])));
                await supabase.from("project_briefs").delete().eq("id", inserted.id);
                console.error("Project brief attachment metadata failed:", updateError.message);
                return { success: false, error: "Não foi possível finalizar o envio dos anexos. Tente novamente." };
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Project brief submission failed:", error);
        return { success: false, error: "Ocorreu um erro inesperado. Tente novamente mais tarde." };
    }

    function numberOrNull(value: string): number | null {
        if (!value) return null;
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    }
}
