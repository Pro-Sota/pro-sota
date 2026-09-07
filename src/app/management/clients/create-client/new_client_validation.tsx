import { EMAIL_REGEX } from "./client_form";
import type { ClientInsert } from "./client";

export const validateClient = (
    client: ClientInsert,
    isOrg: boolean
): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (isOrg && !client.organization_name?.trim()) {
        errors.organization_name = "O nome da empresa é obrigatório.";
    }

    if (!isOrg && !client.first_name?.trim()) {
        errors.first_name = "O primeiro nome é obrigatório.";
    }

    if (!isOrg && !client.last_name?.trim()) {
        errors.last_name = "O último nome é obrigatório.";
    }

    if (isOrg && !client.contact_person?.trim()) {
        errors.contact_person = "A pessoa de contacto é obrigatória.";
    }

    if (!client.email?.trim()) {
        errors.email = "O email é obrigatório.";
    } else if (!EMAIL_REGEX.test(client.email.trim())) {
        errors.email = "Introduza um endereço de email válido.";
    }

    return errors;
};

export const toNullable = (value?: string | null): string | null => {
    return value?.trim() || null;
};

export const buildClientPayload = (
    client: ClientInsert,
    isOrg: boolean
): ClientInsert =>{ return {
        ...client,
        name: isOrg
            ? client.organization_name?.trim() ?? ""
            : `${client.first_name?.trim() ?? ""} ${client.last_name?.trim() ?? ""}`.trim(),
        first_name: isOrg ? null : toNullable(client.first_name),
        last_name: isOrg ? null : toNullable(client.last_name),
        organization_name: isOrg ? toNullable(client.organization_name) : null,
        contact_person: isOrg ? toNullable(client.contact_person) : null,
        email: client.email?.trim().toLowerCase() || null,
        phone: toNullable(client.phone),
        address: toNullable(client.address),
        address_line_1: toNullable(client.address_line_1),      // Building number
        address_line_2: toNullable(client.address_line_2),      // Block/Apt
        city: toNullable(client.city),
        state_province: toNullable(client.state_province),      // Province
        country: "Angola",
        notes: toNullable(client.notes),
        status: "Prospective",
        // Don't include: building_number, apartment_number, neighborhood, postal_code, district, commune
        // They don't exist in your schema
    };
};